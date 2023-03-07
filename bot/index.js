// https://openblur.p.rapidapi.com/collections?sortBy=bestCollectionBid&orderBy=desc';
const ethers = require('ethers');
const fetch = require('node-fetch');

const URL = 'http://127.0.0.1:3000/v1/collections/';
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const MIN_PROFIT = 0.02;

const results = {};
let afterFirst = false;

const getData = async url => {
  const options = {
    method: 'GET',
    headers: {
      authToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHgwMDAwMGU4Yzc4ZTQ2MTY3OGU0NTViMWY2ODc4YmIwY2U1MGNlNTg3Iiwic2lnbmF0dXJlIjoiMHg0Y2YzNDNiYWRlNzhmM2MwMWY0MTI0OWU3ZWQwMGNiNzQ0MGU4YWNjMWFlMDhiYWJjM2VkNjRjODdjZDU4NTI0NzJmYjBiNjU5NmEzYmU3NDU5NWVmOWMxZGEwYjJhZjVjYjNkN2JjNjAxYjI3OWFkMmI0OGNkNzVjMDBjMWMxZjFjIiwiaWF0IjoxNjc3OTQ4MTA4LCJleHAiOjE2ODA1NDAxMDh9.Ta9QN878GV9QaX63TxZUy4cRUh6YPDPI7KefopcTOow',
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
        // console.log(
        //   `\nUPDATE profit ${
        //     results[element.contractAddress].profit
        //   } -> ${profit_gross}`,
        // );
        element['profit'] = profit_gross;
        results[element.contractAddress] = element;
        // console.log('UPDATED Order', results[element.contractAddress]);
      }
    } catch (e) {
      // console.log('error', element)
    }
  });
};

async function exec() {
  // console.log('START')
  //1
  var filters = {sort: 'FLOOR_PRICE', order: 'DESC'};
  var filtersURLencoded = encodeURIComponent(JSON.stringify(filters));
  var url = URL + '?filters=' + filtersURLencoded;
  var data = await getData(url);
  await checkProfit(data);

  while (
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
      data = await getData(url);
      await checkProfit(data);
    } catch (e) {
      console.log('error', e);
      console.log('data', data.collections[data.collections.length - 1]);
    }
  }
  if (!afterFirst) {
    console.log('\n------------------------------------\n');
    afterFirst = true;
  }
  exec();
}

exec();
