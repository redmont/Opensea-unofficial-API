
const ethers = require('ethers');
const fetch = require('node-fetch');
const wallet = new ethers.Wallet(process.env.PK_7);
let authTkn;

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
 * [ ] 4. ACC_7: Buy from Sell order (for 0.01 ETH)
 * 		[ ] send call to get Sell Order data
 *    [ ] send call to get buyOrder
 * [ ] 5. ACC_7: Sell to Buy Order (for 0.02 ETH) (need to make approvals, deposits etc.)
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
}

;(async () => {
	await getAuthTkn();
	const ADDR_NFT = '0x5b11fe58a893f8afea6e8b1640b2a4432827726c';

	//do arb for this
	const target_collection = {
		contractAddress: '0x5b11fe58a893f8afea6e8b1640b2a4432827726c',
		name: 'NeekolulDAO',
		collectionSlug: 'neekoluldao',
		imageUrl: 'https://images.blur.io/_blur-prod/0x5b11fe58a893f8afea6e8b1640b2a4432827726c/1289-7cd0c937ba7cb236',
		totalSupply: 2389,
		numberOwners: 310,
		floorPrice: { amount: '0.0025', unit: 'ETH' },
		floorPriceOneDay: { amount: '0.003', unit: 'ETH' },
		floorPriceOneWeek: { amount: '0.0001', unit: 'ETH' },
		volumeFifteenMinutes: null,
		volumeOneDay: { amount: '0', unit: 'ETH' },
		volumeOneWeek: { amount: '0.0001', unit: 'ETH' },
		bestCollectionBid: { amount: '0.01', unit: 'ETH' },
		totalCollectionBidValue: { amount: '0.01', unit: 'ETH' },
		traitFrequencies: null
	}

	//buy, then sell from 0x7..
})();