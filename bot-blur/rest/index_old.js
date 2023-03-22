const {ethers, utils} = require('ethers');
const fetch = require('node-fetch');
const provider = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.API_ALCHEMY}`,
);

const wallet = new ethers.Wallet(process.env.PK_BOT, provider);
let authTkn;
const delay = 86400; // 24h

const addr_to_approve_nft = '0x00000000000111abe46ff893f3b2fdf1f759a8a8'; //executionDelegate

/**
 * @todo: create & exec arb (you can do 1st via Blur app to understand each step)
 *
 * [ ] fix proxy, so that it does not crash after 10x calls
 *
 * //preparation:
 * [x] 1. ACC_0: Create Sell Order (for 0.01 ETH)
 * 		[x] ACC_0: get NFT
 * 		[x] ACC_0: SetApprovalForAll NFT to Blur ()
 *    [x] ACC_0: create sell NFT order (v1/orders/format, receive data, v1/orders/submit)
 * [x] 2. ACC_F: Create Buy Order (for 0.02 ETH)
 *    [x] Deposit into Blur Pool
 * 		[x] Create Bid (v1/collection-bids/format, receive data, v1/collection-bids/submit)
 *
 * //execution (in a single script, as fast as possible, this needs to emit target bot behavior):
 * [x] 3. Get data from API about above Buy & Sell orders (using our endpoints)
 * [ ] 4. ACC_7: Do arb
 *    [x] Find collection with: "floorPrice > bestCollectionBid"
 *    [x] get bids prices & tknIds
 *
 *
 *    [ ] experiment
 *        [x] check if can accept bid without selling NFT (what result?) --- CAN'T
 *        [x] check if can sell bid without approving NFT (what result?) --- CAN'T (not highlight on fronted to accept bid)
 *        [x] check if can list NFT without having it --- CAN'T (You need to own this NFT in order to list it for sale)
 *
 * 		[ ] (TX)  buy for floorPrice (same tx can approve NFT all)
 *    [ ] (TX)  approve NFT
 *    [ ] (SIG) create sale order
 *       [ ] try sell without having NFT
 *       [ ] try accept bid without having NFT
 *       [x] try accept bid without approving NFT
 *       [ ] create sale with approved NFT
 *    [ ] (SIG) accept bid
 */

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
};

const getPrices = async addr_collection => {
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

const getLowestSellOrder = async prices => {
  return prices.nftPrices[0];
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

const getListingData = async (addr_collection, nft_id, nft_price) => {
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
  // console.log('sellData', sellData.signatures[0])
  const domain = sellData.signatures[0].signData.domain;
  const types = sellData.signatures[0].signData.types;
  const value = sellData.signatures[0].signData.value;

  // console.log('_domain', _domain)
  // console.log('_types', _types)
  // console.log('_value', _value)

  // const domain = {
  //   name: 'Blur Exchange',
  //   version: '1.0',
  //   chainId: 1,
  //   verifyingContract: '0x000000000000ad05ccc4f10045630fb830b95127',
  // };

  // const types = {
  //   Order: [
  //     { name: 'trader', type: 'address' },
  //     { name: 'side', type: 'uint8' },
  //     { name: 'matchingPolicy', type: 'address' },
  //     { name: 'collection', type: 'address' },
  //     { name: 'tokenId', type: 'uint256' },
  //     { name: 'amount', type: 'uint256' },
  //     { name: 'paymentToken', type: 'address' },
  //     { name: 'price', type: 'uint256' },
  //     { name: 'listingTime', type: 'uint256' },
  //     { name: 'expirationTime', type: 'uint256' },
  //     { name: 'fees', type: 'Fee[]' },
  //     { name: 'salt', type: 'uint256' },
  //     { name: 'extraParams', type: 'bytes' },
  //     { name: 'nonce', type: 'uint256' },
  //   ],
  //   Fee: [
  //     { name: 'rate', type: 'uint16' },
  //     { name: 'recipient', type: 'address' },
  //   ],
  // };

  // const value = {
  //   trader: '0x174240aa4b903fe0e2ea964b32d2c229dff511f1',
  //   side: 1,
  //   matchingPolicy: '0x0000000000dab4a563819e8fd93dba3b25bc3495',
  //   collection: '0x8f0a704e24fcea2572d201a22979a98363656c55',
  //   tokenId: '4425',
  //   amount: '1',
  //   paymentToken: '0x0000000000000000000000000000000000000000',
  //   price: '10000000000000000',
  //   listingTime: 1678618450,
  //   expirationTime: 1678704849,
  //   fees: [{ recipient: '0x81ee7d80a1206a950c9e7847025627fa4ecf233d', rate: 50 }],
  //   salt: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e42ee119090e17e5d2a9f19fa7feadfd',
  //   extraParams: '0x01',
  //   nonce: '0',
  // };

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
  console.log('\nraw', JSON.parse(raw));

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

const getExecutableBids = async sellData => {
  //}/executable-bids`;
  var url = `http://127.0.0.1:3000/v1/collections/${sellData.signatures[0].signData.value.collection}/executable-bids`;
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

const getAcceptBidData = async (sellData, price) => {
  var url = `http://127.0.0.1:3000/v1/collection-bids/accept`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);

  //headers
  var raw = JSON.stringify({
    "contractAddress": sellData.signatures[0].signData.value.collection,
    "feeRate": 50,
    "tokenPrices": [
      {
        "price": {
          "amount": price,
          "unit": "BETH"
        },
        "tokenId": sellData.signatures[0].signData.value.tokenId
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

const _assignNextPageUrl = async data => {
  const last_collection = data.collections[data.collections.length - 1];

  switch(true){
    case last_collection.floorPrice.amount == null || last_collection.floorPrice.amount <= 0:
      return url_first_page
    case last_collection.floorPrice.amount > 0:

      filters = {
        cursor: {
          contractAddress:
            last_collection.contractAddress,
          floorPrice:
            last_collection.floorPrice.amount,
        },
        sort: 'FLOOR_PRICE',
        order: 'DESC',
      };

      return  'http://127.0.0.1:3000/v1/collections/?filters=%7B%22cursor%22%3A%7B%22contractAddress%22%3A%22' + last_collection.contractAddress + '%22%2C%22floorPrice%22%3A%' + last_collection.floorPrice.amount + '%22%7D%2C%22sort%22%3A%22FLOOR_PRICE%22%2C%22order%22%3A%22DESC%22%7D'
      // filtersURLencoded = encodeURIComponent(JSON.stringify(filters));
      // return 'http://127.0.0.1:3000/v1/collections/' + '?filters=' + filtersURLencoded;
  }
}

(async () => {
  await getAuthTkn();

  //after getData found arb opp...
  const target_collection = {
    contractAddress: '0x5b11fe58a893f8afea6e8b1640b2a4432827726c',
    name: 'NeekolulDAO',
    collectionSlug: 'neekoluldao',
    imageUrl:
      'https://images.blur.io/_blur-prod/0x5b11fe58a893f8afea6e8b1640b2a4432827726c/1289-7cd0c937ba7cb236',
    totalSupply: 2389,
    numberOwners: 311,
    floorPrice: {amount: '0.0022', unit: 'ETH'},
    floorPriceOneDay: {amount: '0.0025', unit: 'ETH'},
    floorPriceOneWeek: {amount: '0.003', unit: 'ETH'},
    volumeFifteenMinutes: null,
    volumeOneDay: {amount: '0', unit: 'ETH'},
    volumeOneWeek: {amount: '0.0101', unit: 'ETH'},
    bestCollectionBid: {amount: '0.01', unit: 'ETH'},
    totalCollectionBidValue: {amount: '0.01', unit: 'ETH'},
    traitFrequencies: null,
  };

  // const prices = await getPrices(target_collection.contractAddress);
  // const lowestSell = await getLowestSellOrder(prices);
  // const buyData = await buyFromSellOrder(target_collection.contractAddress, lowestSell);

  // const txBuy = await wallet.sendTransaction({
  //   to: buyData[0].decodedResponse[0].to,
  //   data: buyData[0].decodedResponse[0].txData.data,
  //   value: buyData[0].decodedResponse[0].txData.value
  // });

  // await txBuy.wait();

  //without previous approve
  const addr_example = '0xa7f551feab03d1f34138c900e7c08821f3c3d1d0';
  const id_example = '877';
  const price_example = '0.01';

  // const addr_example = "0x8f0a704e24fcea2572d201a22979a98363656c55"
  // const id_example = "4425"
  // const price_example = "0.01"

  const sellData = await getListingData(
    addr_example,
    id_example,
    price_example,
  );
  // console.log('sellData', sellData)

  if (sellData.approvals.length > 0) {
    console.log('will need to approve', sellData.approvals[0]);
    // console.log('to: sellData.approvals[0].transactionRequest.to', sellData.approvals[0].transactionRequest.to)
    // console.log('data: sellData.approvals[0].transactionRequest.data', sellData.approvals[0].transactionRequest.data)
    // const tx = await wallet.sendTransaction({
    //   //for longer than 1x tx, do in loop
    //   to: sellData.approvals[0].transactionRequest.to,
    //   data: sellData.approvals[0].transactionRequest.data,
    // });

    // console.log('\napproving the NFT...');
    // await tx.wait();
  }

  // const sig = await getListingSignature(sellData)
  // console.log('\nlisting...')
  // const listed = await listAsset(sellData, sig)
  // console.log('\nIs listed?', listed)

  const executableBids = await getExecutableBids(sellData);
  console.log('\nexecutableBids', executableBids);
  console.log('...', executableBids.priceLevels[0].price);

  const acceptBidData = await getAcceptBidData(sellData, executableBids.priceLevels[0].price);

  if(acceptBidData.approvals.length>0) {
    console.log('\nwill need to approve', acceptBidData.approvals[0]);
    // console.log('to: acceptBidData.approvals[0].transactionRequest.to', acceptBidData.approvals[0].transactionRequest.to)
    // console.log('data: acceptBidData.approvals[0].transactionRequest.data', acceptBidData.approvals[0].transactionRequest.data)
    const tx = await wallet.sendTransaction({
      //for longer than 1x tx, do in loop
      to: acceptBidData.approvals[0].transactionRequest.to,
      data: acceptBidData.approvals[0].transactionRequest.data,
    });

    console.log('\napproving the NFT...');
    await tx.wait();
  }

  // accept bid
  const txSell = await wallet.sendTransaction({
    to: acceptBidData.txnData.to,
    data: acceptBidData.txnData.data
    // value: acceptBidData.txnData.value
  });

  console.log('\nselling...')
  const response = await txSell.wait();
  console.log('response', response);
})();
