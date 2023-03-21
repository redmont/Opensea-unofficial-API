// https://openblur.p.rapidapi.com/collections?sortBy=bestCollectionBid&orderBy=desc';
const ethers = require('ethers');
const fetch = require('node-fetch');

const URL = 'http://127.0.0.1:3000/v1/collections/';
const wallet = new ethers.Wallet(process.env.PK_7);
const MIN_PROFIT = 0.02;

const results = {};
let afterFirst = false;
let authTkn;

const getAuthTkn = async () => {
  const URL = 'http://127.0.0.1:3000/auth/getToken';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress: wallet.address,
    }),
  };

  let data;
  await fetch(URL, options)
    .then(res => res.json())
    .then(json => (data = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));

  authTkn = data.accessToken;
  console.log('\nauthTkn: ', authTkn);
}

const getData = async url => {
  const options = {
    method: 'GET',
    headers: {
      authToken: authTkn,
      walletAddress: wallet.address,
    },
  };

  let data;
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (data = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return data;
};

const checkProfit = async data => {
  data.collections.forEach(element => {
    try {
      const profit_gross =
        Number(element.bestCollectionBid.amount) -
        Number(element.floorPrice.amount);
      const profit_net = profit_gross - MIN_PROFIT;
      if (element.contractAddress.toLowerCase()=='0x5b11fe58a893f8afea6e8b1640b2a4432827726c'.toLocaleLowerCase()){
        console.log('\n\n@@@element', element);
      }

      if (profit_net < 0) {
        return;
      } else if (results[element.contractAddress] == undefined) {
        element['profit'] = profit_gross;
        results[element.contractAddress] = element;
        if (afterFirst) {
          console.log('\nADD profit', profit_gross);
          console.log('Order', element);
        }
      } else if (profit_gross != results[element.contractAddress].profit) {
        console.log(
          `\nCollection: ${results[element.contractAddress].collectionAddress}, UPDATE profit ${
            results[element.contractAddress].profit
          } -> ${profit_gross}`,
        );
        element['profit'] = profit_gross;
        results[element.contractAddress] = element;
        // console.log('UPDATED Order', results[element.contractAddress]);
      }
    } catch (e) {
      // console.log('error', element)
    }
  });
};

const searchRest = async _data => {
  let data = _data;

  while ( //get all collections with that has floor price
    data.collections[data.collections.length - 1].floorPrice != null &&
    data.collections[data.collections.length - 1].floorPrice.amount > 0
  ) {
    try {
      filters = {
        cursor: {
          contractAddress:
            data.collections[data.collections.length - 1].contractAddress,
          floorPrice:
            data.collections[data.collections.length - 1].floorPrice.amount,
        },
        sort: 'FLOOR_PRICE',
        order: 'DESC',
      };

      filtersURLencoded = encodeURIComponent(JSON.stringify(filters));
      url = URL + '?filters=' + filtersURLencoded;
      // console.log('floor:', data.collections[data.collections.length - 1].floorPrice.amount)
      // console.log('lAddr:', data.collections[data.collections.length - 1].contractAddress)
      data = await getData(url);
      await checkProfit(data);
    } catch (e) {
      console.log('error', e);
      console.log('data', data.collections[data.collections.length - 1]);
    }
  }
}

async function exec() {
  try {
    if(!afterFirst) {
      await getAuthTkn()
    }

    //1
    var filters = {sort: 'FLOOR_PRICE', order: 'DESC'};
    var filtersURLencoded = encodeURIComponent(JSON.stringify(filters));
    var url = URL + '?filters=' + filtersURLencoded;
    var data = await getData(url);
    await checkProfit(data);
    await searchRest(data);

    if (!afterFirst) {
      console.log('\n------------------------------------\n');
      afterFirst = true;
    }
    exec();

  } catch (e) {
    console.log('error', e)
    afterFirst=false;
    exec();
  }
}

exec();