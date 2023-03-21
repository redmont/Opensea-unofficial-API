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
const wallet = new ethers.Wallet(process.env.PK_0, provider);
const delay = 86400; // 24h
let authTkn;
let MIN_PROFIT = 0.0001;
let profitTotal = 0;
let amtTotal = 0;
let amtAllData = 0;
let loop = 1;
let MIN_FLOOR_PRICE = 0.5;

let blackListed = []; //cuz in 1st profits existed
const option = {};

const db = {
  constant: {
    MAX_FLOOR_PRICE: 1,
    // url_collection_first_page: 'http://127.0.0.1:3000/v1/collections/?filters=%7B%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22ASC%22%7D',
    url_collection_first_page: "http://127.0.0.1:3000/v1/collections/?filters=%7B%22cursor%22%3A%7B%22contractAddress%22%3A%220xf2cc04b182dd7f9b6a2661a9b3e798c5c8932889%22%2C%22floorPrice%22%3A%220.005%22%7D%2C%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22ASC%22%7D"
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
      // url: 'http://127.0.0.1:3000/v1/collections/?filters=%7B%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22ASC%22%7D',
      url: "http://127.0.0.1:3000/v1/collections/?filters=%7B%22cursor%22%3A%7B%22contractAddress%22%3A%220xf2cc04b182dd7f9b6a2661a9b3e798c5c8932889%22%2C%22floorPrice%22%3A%220.005%22%7D%2C%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22ASC%22%7D",
      options: {}
    }
  }
}

const setup = async () => {
  authTkn = (await apiCall(db.api.auth)).accessToken;

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
      const loop_percent = (amtAllData++ / data.totalCount) * 100;
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
    order: 'ASC',
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


const setNewPage = async data => {
  const last_collection = data.collections[data.collections.length - 1];

  console.log(' curr fprice: ', Number(last_collection.floorPrice.amount));

  switch (true) {
    case !last_collection.floorPrice || last_collection.floorPrice.amount == null:
      console.log('detected false')
      break;
    case last_collection.floorPrice.amount > db.constant.MAX_FLOOR_PRICE:

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

    case last_collection.floorPrice.amount <= db.constant.MAX_FLOOR_PRICE:
      return _continueLoop(last_collection);
  }
};

const __getPrices = async addr_collection => {
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
  const prices = await __getPrices(arb.collection.contractAddress);
  //todo get all low buy that < highestBid
  return prices.nftPrices[0];
};

const _getHighestBid = async addr_collection => {
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

const _buyFromSellOrder = async (addr_collection, low_buy) => {
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
          amount: low_buy.price.amount,
          unit: low_buy.price.unit,
        },
        tokenId: low_buy.tokenId,
      },
    ],
    userAddress: wallet.address,
  });

  console.log('raw: ', JSON.parse(raw));


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

const getListData = async (addr_collection, nft_id, nft_price) => {
  var url = `http://127.0.0.1:3000//v1/orders/format`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  var raw = JSON.stringify({
    marketplace: 'BLUR',
    orders: [
      {
        contractAddress: addr_collection,
        // "expirationTime": "2023-03-18T14:19:49.139Z",
        expirationTime: new Date(Date.now() + delay * 1000)
          .toISOString()
          .toString(), //1 day
        feeRate: 50,
        price: {
          amount: nft_price,
          unit: 'ETH',
        },
        tokenId: nft_id,
      },
    ],
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

const getListingSignature = async sellData => {
  const domain = sellData.signatures[0].signData.domain;
  const types = sellData.signatures[0].signData.types;
  const value = sellData.signatures[0].signData.value;

  const message = {
    domain,
    types,
    value,
  };

  const signature = await wallet.signTypedData(
    message.domain,
    message.types,
    message.value,
  );

  return signature;
};

const listAsset = async (sellData, sig) => {
  // console.log('\nsellData', sellData)
  // console.log('\nsig', sig)
  var url = `http://127.0.0.1:3000/v1/orders/submit`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  //headers
  var raw = JSON.stringify({
    marketplace: sellData.signatures[0].marketplace,
    marketplaceData: sellData.signatures[0].marketplaceData,
    signature: sig,
  });
  // console.log('\nraw', JSON.parse(raw));

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

const getSellData = async (listData, price) => {
  var url = `http://127.0.0.1:3000/v1/collection-bids/accept`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  //headers
  var raw = JSON.stringify({
    // "contractAddress": "0xd601c171851c460082ace709f665a9566586f14b",
    "contractAddress": listData.signatures[0].signData.value.collection,
    "feeRate": 50,
    "tokenPrices": [
      {
        "price": {
          "amount": price,
          "unit": "BETH"
        },
        // "tokenId": "5159"
        "tokenId": listData.signatures[0].signData.value.tokenId
      }
    ]
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
}

const _exec = async arb => {
  console.log('Executing arb for', arb);

  const lowBuy = await _getLowBuy(arb);
  console.log('\nlowBuy', lowBuy);

  const highestBid = (await _getHighestBid(arb.collection.contractAddress)).priceLevels[0].price;
  console.log('\nhighestBid', highestBid);

  const buyData = (await _buyFromSellOrder(arb.collection.contractAddress, lowBuy)).buys[0];
  // const buyData = (await _buyFromSellOrder(arb.collection.contractAddress, lowBuy))[0].decodedResponse[0];
  // const buyData = await _buyFromSellOrder(arb.collection.contractAddress, lowBuy)
  console.log('\nbuyData', buyData);

  //ask question
  const ans_exec = await new Promise(resolve => {
    rl.question('Do you want to continue? ', resolve);
  });

  //buy
  // const amt_eth = Number(buyData.txnData.value.hex/10**18).toString()
  // console.log('\namt_eth', amt_eth)
  // return
  console.log('\nPurchasing the NFT...')
  const txBuy = await wallet.sendTransaction({
    to: buyData.txnData.to,
    data: buyData.txnData.data,
    value: buyData.txnData.value.hex.toString()
    // gasLimit: 7500000
  });

  await txBuy.wait();
  console.log('purchased.\n')

  //selling
  const listData = await getListData(
    arb.collection.contractAddress,
    lowBuy.tokenId,
    highestBid
  );

  console.log('\nlistData', listData);

  if (listData.approvals.length > 0) {
    console.log('will need to approve', listData.approvals[0]);
    console.log('to: listData.approvals[0].transactionRequest.to', listData.approvals[0].transactionRequest.to)
    console.log('data: listData.approvals[0].transactionRequest.data', listData.approvals[0].transactionRequest.data)
    const txApprove = await wallet.sendTransaction({
      //for longer than 1x tx, do in loop
      to: listData.approvals[0].transactionRequest.to,
      data: listData.approvals[0].transactionRequest.data
    });

    console.log('\napproving the NFT...');
    await txApprove.wait();
    console.log('approved.\n');
  }

  const sig = await getListingSignature(listData)
  console.log('\nlisting the NFT...')
  const listed = await listAsset(listData, sig)
  console.log('\nIs listed?', listed)

  //////////////// SELL (1h delay here) ////////////////////
  const sellData = await getSellData(listData, highestBid)
  console.log('\nsellData', sellData)

  if(sellData.approvals.length>0) {
    console.log('\nwill need to approve', sellData.approvals[0]);
    const tx = await wallet.sendTransaction({
      to: sellData.approvals[0].transactionRequest.to,
      data: sellData.approvals[0].transactionRequest.data,
    });

    console.log('\napproving the NFT...');
    await tx.wait();
  }

  console.log('\nselling the NFT...')
  const txSell = await wallet.sendTransaction({
    to: sellData.txnData.to,
    data: sellData.txnData.data
    // value: sellData.txnData.value
  });

  const response = await txSell.wait();
  console.log('Response:', response);
}

const execArbs = async arbs => {
  for (const arb of arbs) {
    profitTotal += arb.profit_net;
    if (arb.profit_net > 0) {
      // player.play('./bot/ding.mp3', err => {});

      console.log('\n\nDetected arb:', arb.profit_net);
      console.log('floor', Number(arb.collection.floorPrice.amount));
      console.log('curr url', db.api.collections.url)
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
          await _exec(arb);
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
    const data = await apiCall(db.api.collections);
    const arbs = await getArbs(data);

    if (arbs.length > 0) {
      await execArbs(arbs);
    }

    await setNewPage(data);
  }
})();
