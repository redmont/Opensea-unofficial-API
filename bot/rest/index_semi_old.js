const {ethers, utils} = require('ethers');
const readline = require('readline');
const fetch = require('node-fetch');
const {exec} = require('child_process');
const provider = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.API_ALCHEMY}`,
);
const player = require('play-sound')();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const addr_to_approve_nft = '0x00000000000111abe46ff893f3b2fdf1f759a8a8'; //executionDelegate
const wallet = new ethers.Wallet(process.env.PK_BOT, provider);
const delay = 86400; // 24h
let authTkn;
let MIN_PROFIT = 0.01;
let profitTotal = 0;
let amtTotal = 0;
let amtAllData = 0;
let loop = 1;
let MIN_FLOOR_PRICE = 0.5;

let blackListed = []; //cuz in 1st profits existed
const option = {};

const db = {
  constant: {
    url_first_page: 'http://127.0.0.1:3000/v1/collections/?filters=%7B%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22DESC%22%7D',
  },
  api: {
    auth: {
      url: 'http://127.0.0.1:3000/auth/getToken',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
        }),
      }
    },
    collections: {
      url: 'http://127.0.0.1:3000/v1/collections/?filters=%7B%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22DESC%22%7D',
      options: {}
    }
  }
}

/**
 * @todo
 * [ ] Clean
 * [ ] Exec for real example with low risk or small
 * [ ] set interval to get min profits
 */

const setup = async () => {
  const authTkn = (await apiCall(db.api.auth)).accessToken;

  //setup options
  db.api.collections.options = {
    method: 'GET',
    headers: {
      authToken: authTkn,
      walletAddress: wallet.address,
    },
  };

  //log
  console.time('time');
  console.log('\n\x1b[32m',`↓↓↓ BOT & LOOP ${loop} START ↓↓↓`,'\x1b[0m', '\n');
}

const apiCall = async ({url, options}) => {
  let res;
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (res = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return res;
};

const getArbs = async data => {
  const arbs = [];

  data.collections.forEach((collection, index) => {
    try {
      const loop_percent = (amtAllData++ / collections.totalCount) * 100;
      process.stdout.write('\x1b[36m' + `\rloop ${loop} completed in: ${loop_percent.toFixed(2)}%` + '\x1b[0m');

      if (
        collection?.bestCollectionBid?.amount == null ||
        collection?.bestCollectionBid?.amount <= 0 ||
        collection?.floorPrice?.amount == null ||
        collection?.floorPrice?.amount <= 0 ||
        blackListed.includes(collection.contractAddress)
      )
        return false;

      const profit_gross = Number(collection.bestCollectionBid.amount) - Number(collection.floorPrice.amount);
      const profit_net = profit_gross - MIN_PROFIT;

      if (profit_net > 0) {
        arbs.push({
          profit_gross,
          profit_net,
          collection: collection
        });
      }
    } catch (e) {
      console.log('ERR, _getArbs(), collection', collection);
      console.log('error', e);
    }
  });

  return arbs;
};

const _continueLoop = last_collection => {
  const filters = {
    cursor: {
      contractAddress: last_collection.contractAddress,
      floorPrice: last_collection.floorPrice.amount,
    },
    sort: 'FLOOR_PRICE',
    order: 'DESC',
  };

  const filtersURLencoded = encodeURIComponent(JSON.stringify(filters));
  db.api.collections.url = 'http://127.0.0.1:3000/v1/collections/' + '?filters=' + filtersURLencoded
};

const _resetLoop = () => {
  amtTotal = 0;
  profitTotal = 0;
  amtAllData = 0;
  db.api.collections.url = db.constant.url_collection_first_page;
  console.log('\n\x1b[32m', `↓↓↓ LOOP ${++loop} START ↓↓↓`, '\x1b[0m', '\n');
  console.time('time');
};

const setNewPage = async last_collection => {
  switch (true) {
    case !last_collection.floorPrice ||
      last_collection.floorPrice.amount == null ||
      last_collection.floorPrice.amount <= MIN_FLOOR_PRICE:

      console.log('\n\nprofitTotal: ', profitTotal);
      console.log('amtTotal: ', amtTotal);
      console.timeEnd('time');
      console.log('\n\x1b[31m', ` ↑↑↑ LOOP ${loop} END ↑↑↑`, '\x1b[0m', '\n');

      const ans = await new Promise(resolve => {
        rl.question('Do you want to continue? ', resolve);
      });

      if (ans == 'y' || ans == 'Y' || ans == 'yes' || ans == 'Yes') {
        return _resetLoop();
      } else {
        process.exit(0);
      }

    case last_collection.floorPrice.amount > MIN_FLOOR_PRICE:
      return _continueLoop(last_collection);
  }
};

const _getPrices = async addr_collection => {
  var url = `http://127.0.0.1:3000/v1/collections/${addr_collection}/prices`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  const options = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  let data;
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (data = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return data;
};

const _getLowBuy = async arb => {
  const prices = await _getPrices(arb.collection.contractAddress);
  //todo get all low buy that < highestBid
  return prices.nftPrices[0];
};

const getHighestBid = async addr_collection => {
  //}/executable-bids`;
  var url = `http://127.0.0.1:3000/v1/collections/${addr_collection}/executable-bids`;
  // var url =
  // 'http://127.0.0.1:3000/v1/collection-bids/acceptable-bids?collectionId=0xa7f551feab03d1f34138c900e7c08821f3c3d1d0&traderAddress=0x174240aa4b903fe0e2ea964b32d2c229dff511f1';
  // var url = `https://core-api.prod.blur.io/v1/collection-bids/acceptable-bids?collectionId=${sellData.signatures[0].signData.value.collection}&traderAddress=${wallet.address}`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  const options = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  let data;
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (data = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return data;
};

const buyFromSellOrder = async (addr_collection, lowestSell) => {
  var url = `http://127.0.0.1:3000/v1/buy/${addr_collection}?fulldata=true`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  //headers
  var raw = JSON.stringify({
    tokenPrices: [
      {
        isSuspicious: false,
        price: {
          amount: lowestSell.price.amount,
          unit: 'ETH',
        },
        tokenId: lowestSell.tokenId,
      },
    ],
    userAddress: wallet.address,
  });

  const options = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  let data;
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (data = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return data;
};

const _exec = async arb => {
  /**
   * @todo
   * [ ] ensure exist
   *    [ ] Check sell exists
   *    [ ] Check Buy exists
   * [ ] buy
   * [ ] sell
   */

  console.log('Arb to ensure', arb);
  const lowBuy = await _getLowBuy(arb);

  console.log('\nlowestSell', lowestSell);
  const highestBid = await getHighestBid(arb.collection.contractAddress);
  console.log('\nhighestBid', highestBid);
  // ensure arb exist based on data

  // const buyData = await buyFromSellOrder(
  //   arb.collection.contractAddress,
  //   lowestSell,
  // );
  // console.log('\nbuyData', buyData);
};

const execArbs = async arbs => {
  for (const arb of arbs) {
    profitTotal += arb.profit_net;
    if (arb.profit_net > 0) {
      player.play('./bot/ding.mp3', err => {});

      console.log('\n\nDetected arb:', arb.profit_net);
      console.log('floor', Number(arb.collection.floorPrice.amount));
      console.log(
        `link: https://etherscan.io/address/${arb.collection.contractAddress}`,
      );

      const ans_exec = await new Promise(resolve => {
        rl.question('Do you want exec? ', resolve);
      });

      switch (true) {
        case ans_exec == 'y' ||
          ans_exec == 'Y' ||
          ans_exec == 'yes' ||
          ans_exec == 'Yes':
          console.log('exec...');
          // await _exec(arb);
          return;
        default:
          const ans_block = await new Promise(resolve => {
            rl.question('Do you want to add to blacklist? ', resolve);
          });

          if (
            ans_block == 'y' ||
            ans_block == 'Y' ||
            ans_block == 'yes' ||
            ans_block == 'Yes'
          ) {
            blackListed.push(arb.collection.contractAddress);
            console.log('☠️ Added to blacklist. ☠️\n');
          }

          console.log('not exec.');
          return;
      }
    }
  }
};

(async () => {
  await setup()

  while (true) {
    const collections = await apiCall(db.api.collections);
    const arbs = await getArbs(collections);

    if (arbs.length > 0) {
      await execArbs(arbs);
    }

    await setNewPage(collections.collections[collections.collections.length - 1]);
  }
})();
