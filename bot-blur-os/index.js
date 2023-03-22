const { ethers } = require("ethers");
const fetch = require('node-fetch');

/**
 * 6041: Bot buyBlur-sellOs in 2 TXs, same block, via EOA.
 *
 * t0d0:
 * 		[ ] getOsBids()
 * 			 [x] get example from rapid
 * 	 	   [ ] get bids via API
 * 		...for each bid
 * 			 [x] getBuyPriceBlur ([ ] todo add filter blur only)
 * 					[x] if osBuyOrder.price > blurBuyOrder.price
 *              [x] getBuyOrderBlur
 * 							[x] getTxBuyBlur
 * 							[ ] getTxSellOs (few txs, cuz approvals)
 * 							[x] bundle & send via relay
 *
 * t0d0, future:
 *    [ ] Currently get bids for each id, in future add also for collection bids
 *    [ ] Add Node.js PID to exec blur api (& OS later)
 *    [ ] Add option to buy&sell multiple NFTs at once
 *    [ ] Add interval onBlock, to get current fee data
 *    [ ] Make every api interaction "apiCall({url, options})" format.
 *    [ ] Create bot template with design pattern
 *    [ ] Check if can send serialized tx in bundle (is serializedTx keccak256(signed)?
 *    [ ] Clean
 */

const provider = new ethers.AlchemyProvider("homestead", process.env.API_ALCHEMY);
const wallet = new ethers.Wallet(process.env.PK_0, provider);

const db = {
  blockBuilders: {
      flashbots: 'https://relay.flashbots.net',
      builder0x69: 'https://builder0x69.io',
      eden: 'https://api.edennetwork.io/v1/bundle'
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
    }
  }
}

const apiCall = async ({url, options}) => {
  let res;
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (res = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return res;
};

const setup = async () => {
  db.authTkn = (await apiCall(db.api.auth)).accessToken;
  db.blockNum = await provider.getBlockNumber();
  db.fee = await provider.getFeeData()

  //todo setup options for apiCalls based on authTkn
  // db.api.collections.options = {
  //   method: 'GET',
  //   headers: {
  //     authToken: db.authTkn,
  //     walletAddress: wallet.address,
  //   },
  // };

  provider.on('block', async blockNumber => { //for next
    console.log('🟢 New Block', blockNumber)
    db.blockNum = blockNumber
    db.fee = await provider.getFeeData();
  })
}

const getOsBids = async () => {
  //as for now using example from rapid

  const osBids = {
    "next": "LXBrPTg1NzQ3MTQwNzA=",
    "previous": null,
    "orders": [
      {
        "created_date": "2023-03-22T14:21:42.557630",
        "closing_date": "2023-03-22T16:41:40",
        "listing_time": 1679494900,
        "expiration_time": 1679503300,
        "order_hash": "0xdb507ef731d44a75a0ab4ac60e3373c11dfac1d87e1c03ebacce3062755478c8",
        "protocol_data": {
          "parameters": {
            "offerer": "0x2e03ff02a561d0ea4f85998a92cc9a2139cd4160",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "300200000000000000",
                "endAmount": "300200000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x8943C7bAC1914C9A7ABa750Bf2B6B09Fd21037E0",
                "identifierOrCriteria": "7739",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x2E03FF02A561d0eA4f85998A92cC9a2139cd4160"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "21014000000000000",
                "endAmount": "21014000000000000",
                "recipient": "0x4f195b55286652978bB97F10a6102C976B50e742"
              }
            ],
            "startTime": "1679494900",
            "endTime": "1679503300",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x467abcdbc240ef82",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "300200000000000000",
        "maker": {
          "user": 1019181,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/20.png",
          "address": "0x2e03ff02a561d0ea4f85998a92cc9a2139cd4160",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 40795196,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/19.png",
              "address": "0x4f195b55286652978bb97f10a6102c976b50e742",
              "config": ""
            },
            "basis_points": "700"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA5Ng",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 34996534,
              "token_id": "7739",
              "num_sales": 1,
              "background_color": null,
              "image_url": "https://i.seadn.io/gae/55eCXH8L3XICdDP0ItBEm9Ux-_58YGqYe4UHx7r8eqfLmypYZN2GUMGfsNUapw6z5bMh80HI1w47T3y0mFAtsz-JVs6mTD-iyoqg?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/55eCXH8L3XICdDP0ItBEm9Ux-_58YGqYe4UHx7r8eqfLmypYZN2GUMGfsNUapw6z5bMh80HI1w47T3y0mFAtsz-JVs6mTD-iyoqg?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/55eCXH8L3XICdDP0ItBEm9Ux-_58YGqYe4UHx7r8eqfLmypYZN2GUMGfsNUapw6z5bMh80HI1w47T3y0mFAtsz-JVs6mTD-iyoqg?w=500&auto=format",
              "image_original_url": "ipfs://QmTvwDkfHqMy4ygD6KiYBBpw97jVWf5LgjniC6wZsMQcTR",
              "animation_url": null,
              "animation_original_url": null,
              "name": "#7739",
              "description": "Lazy Lions",
              "external_link": "https://www.lazylionsnft.com/",
              "asset_contract": {
                "address": "0x8943c7bac1914c9a7aba750bf2b6b09fd21037e0",
                "asset_contract_type": "non-fungible",
                "created_date": "2021-08-06T03:39:40.774689",
                "name": "Lazy Lions",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 56284209,
                "schema_name": "ERC721",
                "symbol": "LION",
                "total_supply": "0",
                "description": "Lazy Lions is the NFT community for 👑s.\r\n\r\nWhy do they give us so many words for this description? We’re lazy.\r\n\r\nLinks: [Website](https://lazylionsnft.com) - [Lazy Cubs](https://opensea.io/collection/lazy-cubs-) - [Lazy Lions Bungalows](https://opensea.io/collection/lazy-lions-bungalows) - [Lazy Drinks](https://opensea.io/collection/lazy-drinks-)",
                "external_link": "http://lazylionsnft.com",
                "image_url": "https://i.seadn.io/gae/kFZpw-bkoyH03qFbfqkwkkhHVxT7qclK_tYFmhU1K2HegU3v2wSMmhL6TIgw7Stx1KIoKs1sdJQ4My71ktXV7GygPBjaQZCACERt?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 700,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 700,
                "payout_address": "0x4f195b55286652978bb97f10a6102c976b50e742"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x8943c7bac1914c9a7aba750bf2b6b09fd21037e0/7739",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/bOyDfDTQ9aMb2LGmuwV8h3fZuOLi9lQvy5NFG308NEwfjhrZAARYXYGucZ7qGIFCFYu6fSWCZb17kXblDQohw8nPd3QatR9_hBO39A?w=500&auto=format",
                "chat_url": null,
                "created_date": "2021-08-06T06:37:58.189522+00:00",
                "default_to_fiat": false,
                "description": "Lazy Lions is the NFT community for 👑s.\r\n\r\nWhy do they give us so many words for this description? We’re lazy.\r\n\r\nLinks: [Website](https://lazylionsnft.com) - [Lazy Cubs](https://opensea.io/collection/lazy-cubs-) - [Lazy Lions Bungalows](https://opensea.io/collection/lazy-lions-bungalows) - [Lazy Drinks](https://opensea.io/collection/lazy-drinks-)",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "700",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "http://lazylionsnft.com",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/kFZpw-bkoyH03qFbfqkwkkhHVxT7qclK_tYFmhU1K2HegU3v2wSMmhL6TIgw7Stx1KIoKs1sdJQ4My71ktXV7GygPBjaQZCACERt?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/kFZpw-bkoyH03qFbfqkwkkhHVxT7qclK_tYFmhU1K2HegU3v2wSMmhL6TIgw7Stx1KIoKs1sdJQ4My71ktXV7GygPBjaQZCACERt?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/kFZpw-bkoyH03qFbfqkwkkhHVxT7qclK_tYFmhU1K2HegU3v2wSMmhL6TIgw7Stx1KIoKs1sdJQ4My71ktXV7GygPBjaQZCACERt?w=500&auto=format",
                "medium_username": "lazylionsnft",
                "name": "Lazy Lions",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x4f195b55286652978bb97f10a6102c976b50e742",
                "require_email": false,
                "short_description": null,
                "slug": "lazy-lions",
                "telegram_url": null,
                "twitter_username": "LazyLionsNFT",
                "instagram_username": "lazylionsnft",
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x4f195b55286652978bb97f10a6102c976b50e742": 700
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "https://metadata.lazylionsnft.com/api/lazylions/7739",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.532365",
        "closing_date": "2023-03-22T15:21:21",
        "listing_time": 1679494889,
        "expiration_time": 1679498481,
        "order_hash": "0x7cccdc6e0ab94d06dfc049ead35b2526e2e84f8b8086889f2b50f3b3e5822878",
        "protocol_data": {
          "parameters": {
            "offerer": "0xca74ebb0c97b5b7f66d3a5dd96d64612b82efd0d",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "715600000000000000",
                "endAmount": "715600000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x34eEBEE6942d8Def3c125458D1a86e0A897fd6f9",
                "identifierOrCriteria": "99",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xca74EBB0c97b5b7F66D3a5Dd96D64612B82EfD0d"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "17890000000000000",
                "endAmount": "17890000000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "17890000000000000",
                "endAmount": "17890000000000000",
                "recipient": "0xc8f8e2F59Dd95fF67c3d39109ecA2e2A017D4c8a"
              }
            ],
            "startTime": "1679494889",
            "endTime": "1679498481",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0xc7eb11863214f417e6b74d209b6f10cb",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "715600000000000000",
        "maker": {
          "user": 37900467,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/30.png",
          "address": "0xca74ebb0c97b5b7f66d3a5dd96d64612b82efd0d",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 354159,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/23.png",
              "address": "0xc8f8e2f59dd95ff67c3d39109eca2e2a017d4c8a",
              "config": "verified"
            },
            "basis_points": "250"
          },
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA5NA",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 945617562,
              "token_id": "99",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/894be19e93628e7caa6a9d76c318ad83.svg",
              "image_preview_url": "https://openseauserdata.com/files/894be19e93628e7caa6a9d76c318ad83.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/894be19e93628e7caa6a9d76c318ad83.svg",
              "image_original_url": "ipfs://bafkreicjj7ksr3nau676datyren2kuiiiwpgbn4pwcbzia4sn7cbjrtkc4",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Checks 99",
              "description": "This artwork may or may not be notable.",
              "external_link": null,
              "asset_contract": {
                "address": "0x34eebee6942d8def3c125458d1a86e0a897fd6f9",
                "asset_contract_type": "non-fungible",
                "created_date": "2023-01-03T17:28:38.451285",
                "name": "Checks",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 22912644,
                "schema_name": "ERC721",
                "symbol": "CHECKS",
                "total_supply": "0",
                "description": "This artwork may or may not be notable.",
                "external_link": "https://checks.art",
                "image_url": "https://i.seadn.io/gcs/files/864dce41a43d14e0c083ad9434cb8261.png?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 250,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 250,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0x34eebee6942d8def3c125458d1a86e0a897fd6f9/99",
              "collection": {
                "banner_image_url": "https://openseauserdata.com/files/0703089115b28a94fbd44402ff1c162f.svg",
                "chat_url": null,
                "created_date": "2023-01-03T17:33:39.266693+00:00",
                "default_to_fiat": false,
                "description": "This artwork may or may not be notable.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "250",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "cover",
                  "images": null
                },
                "external_url": "https://checks.art",
                "featured": false,
                "featured_image_url": "https://openseauserdata.com/files/f69dc9b3f5b593e6e45934f5c0bf1b78.svg",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gcs/files/864dce41a43d14e0c083ad9434cb8261.png?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://openseauserdata.com/files/f69dc9b3f5b593e6e45934f5c0bf1b78.svg",
                "medium_username": null,
                "name": "Checks - VV Edition",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "vv-checks",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xc8f8e2f59dd95ff67c3d39109eca2e2a017d4c8a": 250
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "data:application/json;base64,eyJuYW1lIjogIkNoZWNrcyA5OSIsICJkZXNjcmlwdGlvbiI6ICJUaGlzIGFydHdvcmsgbWF5IG9yIG1heSBub3QgYmUgbm90YWJsZS4iLCAiaW1hZ2UiOiAiaXBmczovL2JhZmtyZWljamo3a3NyM25hdTY3NmRhdHlyZW4ya3VpaWl3cGdibjRwd2NiemlhNHNuN2NianJ0a2M0IiwgInByb3BlcnRpZXMiOiB7Im51bWJlciI6IDk5LCAibmFtZSI6ICJDaGVja3MifX0=",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.527784",
        "closing_date": "2023-03-22T15:01:41",
        "listing_time": 1679494901,
        "expiration_time": 1679497301,
        "order_hash": "0xc34b723a6e9b5c01d046e61c05dd640e53147f18c8d60cfaf2063779dd091a56",
        "protocol_data": {
          "parameters": {
            "offerer": "0x84648e50a33535c158ce24d11cdc9d4ee77143ac",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "650106501000000000",
                "endAmount": "650106501000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x6dc6001535e15b9def7b0f6A20a2111dFA9454E2",
                "identifierOrCriteria": "64",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x84648e50a33535c158cE24D11cdC9d4Ee77143AC"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3250532505000000",
                "endAmount": "3250532505000000",
                "recipient": "0xcf3bC13C0F19B9549364CC5F4b7EA807b737C062"
              }
            ],
            "startTime": "1679494901",
            "endTime": "1679497301",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0xfe52d9e038b7faa7",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "650106501000000000",
        "maker": {
          "user": 39809761,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/26.png",
          "address": "0x84648e50a33535c158ce24d11cdc9d4ee77143ac",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/14.png",
              "address": "0xcf3bc13c0f19b9549364cc5f4b7ea807b737c062",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA5Mw",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 45701250,
              "token_id": "64",
              "num_sales": 1,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/5cbe445fbc40d8225ca0972cc5c508f6.png?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/5cbe445fbc40d8225ca0972cc5c508f6.png?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/5cbe445fbc40d8225ca0972cc5c508f6.png?w=500&auto=format",
              "image_original_url": "https://punkscomic.com/metahero-gen/mints/female_earth_bionic_vertebrae_magma_spectre_argot_110060393948131378947659946799979891790682602951836962936201604543928392099571.png",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Identity #64",
              "description": "Identities are a collection of pulse-impacted people native to the Inhabitants Universe. Generative Identities (max supply of 9678) can be minted at any time by redeeming a MintPass #1.",
              "external_link": "inhabitantsuniverse.com",
              "asset_contract": {
                "address": "0x6dc6001535e15b9def7b0f6a20a2111dfa9454e2",
                "asset_contract_type": "non-fungible",
                "created_date": "2021-09-05T00:32:33.035163",
                "name": "MetaHero",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 466812203,
                "schema_name": "ERC721",
                "symbol": "HERO",
                "total_supply": "0",
                "description": "Identities are a collection of pulse-impacted people native to the Inhabitants Universe. Generative Identities (max supply of 9678) can be minted at any time by redeeming a MintPass #1.",
                "external_link": "https://inhabitantsuniverse.com/",
                "image_url": "https://i.seadn.io/gcs/files/273aea7e405f51fb0da17ab7fd568f18.png?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 750,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 750,
                "payout_address": "0xcf3bc13c0f19b9549364cc5f4b7ea807b737c062"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x6dc6001535e15b9def7b0f6a20a2111dfa9454e2/64",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/fDRCQTnsjSs_OI7Y8j9w4oMspHxrIvxJBT6AcFIQBabnE34IYy7TPvxQ7KhyQmIEG7dTkvTCibYOpPIY0I5uGkh0pSBCJVusMXXtEc4?w=500&auto=format",
                "chat_url": null,
                "created_date": "2021-09-05T01:21:18.467704+00:00",
                "default_to_fiat": false,
                "description": "Identities are a collection of pulse-impacted people native to the Inhabitants Universe. Generative Identities (max supply of 9678) can be minted at any time by redeeming a MintPass #1.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "750",
                "discord_url": "https://discord.gg/pixelvault",
                "display_data": {
                  "card_display_style": "cover",
                  "images": null
                },
                "external_url": "https://inhabitantsuniverse.com/",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/f5931e0318a61697998bddf5ed182d07.png?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gcs/files/273aea7e405f51fb0da17ab7fd568f18.png?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/f5931e0318a61697998bddf5ed182d07.png?w=500&auto=format",
                "medium_username": null,
                "name": "Inhabitants: Generative Identities",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0xcf3bc13c0f19b9549364cc5f4b7ea807b737c062",
                "require_email": false,
                "short_description": null,
                "slug": "inhabitants-generative",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xcf3bc13c0f19b9549364cc5f4b7ea807b737c062": 750
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": true,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "ipfs://QmVGdfmfpdzgwwkgN8QBDvJXvLFHZ2ncwGAb772EdSADgn/64",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.517311",
        "closing_date": "2023-03-22T18:21:41",
        "listing_time": 1679494901,
        "expiration_time": 1679509301,
        "order_hash": "0x4322adc8324728b3a5e343f6455f38e16d73025564423b1c8c3977a166939c03",
        "protocol_data": {
          "parameters": {
            "offerer": "0x7fc8146ce04fa16e2e11819b416a1b0425db4d8f",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "203700000000000000",
                "endAmount": "203700000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0xc101916Cd9DdeAc5A6f915EED033b1B6E4a637cB",
                "identifierOrCriteria": "4953",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x7fc8146cE04FA16E2e11819b416A1b0425DB4D8F"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "1018500000000000",
                "endAmount": "1018500000000000",
                "recipient": "0x5582c15cD96FA9515715D1623b8BDd8Be4F6ab82"
              }
            ],
            "startTime": "1679494901",
            "endTime": "1679509301",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x2e9f47eb73884038",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "203700000000000000",
        "maker": {
          "user": 38193760,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/30.png",
          "address": "0x7fc8146ce04fa16e2e11819b416a1b0425db4d8f",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/7.png",
              "address": "0x5582c15cd96fa9515715d1623b8bdd8be4f6ab82",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA5Mg",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 347820222,
              "token_id": "4953",
              "num_sales": 1,
              "background_color": null,
              "image_url": "https://i.seadn.io/gae/tVV3xwtCUuN09PA0RPYnkImBnHlwzPDuldk5csP8HjzU0NnGdbgG-TY13B8O3tUXIruXdYwGMzakqfDaVJXG2CRynl6qoNPb9yPm?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/tVV3xwtCUuN09PA0RPYnkImBnHlwzPDuldk5csP8HjzU0NnGdbgG-TY13B8O3tUXIruXdYwGMzakqfDaVJXG2CRynl6qoNPb9yPm?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/tVV3xwtCUuN09PA0RPYnkImBnHlwzPDuldk5csP8HjzU0NnGdbgG-TY13B8O3tUXIruXdYwGMzakqfDaVJXG2CRynl6qoNPb9yPm?w=500&auto=format",
              "image_original_url": "ipfs://QmQ3bmssUCp9ZwV9W3zkmL1zRNU5uj7u9v8ZXHw8mX7vkq/4953.png",
              "animation_url": "https://openseauserdata.com/files/1558425b91325bcd9d47f11881464810.mp4",
              "animation_original_url": "ipfs://QmXK4S2hUw8CThpKzbpQp7c473je4SSLCTaMFfEJxmPVsr/4953.mp4",
              "name": "ZMSS #4953",
              "description": "Zombie Mob Secret Society: 10,000 fully animated 3D versions of ZINU. Join our journey!",
              "external_link": "https://wearezinu.com/",
              "asset_contract": {
                "address": "0xc101916cd9ddeac5a6f915eed033b1b6e4a637cb",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-03-23T00:24:31.642079",
                "name": "Zombie Mob Secret Society",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 276489024,
                "schema_name": "ERC721",
                "symbol": "ZMSS",
                "total_supply": "0",
                "description": "Zombie Mob Secret Society is the industry’s first fully animated 3D NFT collection that features a protagonist that can walk, strut, run, flip, dance, and fly; following Zinu, the original Zombie, as he journeys across the Zombieverse. With a complex and compelling storyline for its character, the team aims to connect and empower the community to be part of a growing brand that can be used and commercialized from entertainment and gaming, to apparel, toys, and collectibles. Defiantly fearless, audacious to a fault, Zinu is continually haunted by something darker. What that is, currently, we don’t know, but partner we must, to help Zinu defeat it. For more information please visit [WeAreZinu.com](https://wearezinu.com).\n\nLinks: [Website](https://wearezinu.com) - [WhitePaper](https://app.pitch.com/app/public/player/1f5600fb-72bf-4d68-abaf-173a4b6c56aa) - [Merch](https://zinumerch.com)",
                "external_link": "http://www.wearezinu.com",
                "image_url": "https://i.seadn.io/gae/0rRqgbEAHfee51ZWv0Crstfq_o3cHB7JdOwMMG0QPKqncTtkTvtTrEaLUcUysJHeLrLQ6UgtXmJB2-8xP3p-Z2_fhgnl6MgQmOY2?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 1000,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 1000,
                "payout_address": "0x5582c15cd96fa9515715d1623b8bdd8be4f6ab82"
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc101916cd9ddeac5a6f915eed033b1b6e4a637cb/4953",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/546c3af3a131a1b1fadacb04e7100e44.jpg?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-03-23T11:56:07.320077+00:00",
                "default_to_fiat": false,
                "description": "Zombie Mob Secret Society is the industry’s first fully animated 3D NFT collection that features a protagonist that can walk, strut, run, flip, dance, and fly; following Zinu, the original Zombie, as he journeys across the Zombieverse. With a complex and compelling storyline for its character, the team aims to connect and empower the community to be part of a growing brand that can be used and commercialized from entertainment and gaming, to apparel, toys, and collectibles. Defiantly fearless, audacious to a fault, Zinu is continually haunted by something darker. What that is, currently, we don’t know, but partner we must, to help Zinu defeat it. For more information please visit [WeAreZinu.com](https://wearezinu.com).\n\nLinks: [Website](https://wearezinu.com) - [WhitePaper](https://app.pitch.com/app/public/player/1f5600fb-72bf-4d68-abaf-173a4b6c56aa) - [Merch](https://zinumerch.com)",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "1000",
                "discord_url": "https://discord.gg/wearezinu",
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "http://www.wearezinu.com",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/J1yHJvciaE1s8F5RJfRS4H-Xkfo_lstVtPncD6cqsi_C1oAQ8xNhYDIWihWF3Vg41_95UjerONLlJBpoPmqWBa9n2LcJueMp1youAWo?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/0rRqgbEAHfee51ZWv0Crstfq_o3cHB7JdOwMMG0QPKqncTtkTvtTrEaLUcUysJHeLrLQ6UgtXmJB2-8xP3p-Z2_fhgnl6MgQmOY2?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/J1yHJvciaE1s8F5RJfRS4H-Xkfo_lstVtPncD6cqsi_C1oAQ8xNhYDIWihWF3Vg41_95UjerONLlJBpoPmqWBa9n2LcJueMp1youAWo?w=500&auto=format",
                "medium_username": "ZombieInu",
                "name": "Zinu's Zombie Mob Secret Society",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x5582c15cd96fa9515715d1623b8bdd8be4f6ab82",
                "require_email": false,
                "short_description": null,
                "slug": "zombiemobsecretsociety",
                "telegram_url": "https://t.me/zombieinuofficial",
                "twitter_username": null,
                "instagram_username": "wearezinu",
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x5582c15cd96fa9515715d1623b8bdd8be4f6ab82": 1000
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": true,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "https://ipfs.io/ipfs/QmUmUS2o4SoBsNAbFhbvTw84Udre9VQtm22pa8ZxbTx2E2/4953.json",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.513546",
        "closing_date": "2023-03-22T16:42:38",
        "listing_time": 1679494899,
        "expiration_time": 1679503358,
        "order_hash": "0x288af92c98a3387f8609288bf066d297d4742b4df5d1cd400f150113b70f4744",
        "protocol_data": {
          "parameters": {
            "offerer": "0x7e2c2a0b7a26a9e91a8a9795ac23efbfb652977c",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "630000000000000000",
                "endAmount": "630000000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
                "identifierOrCriteria": "31232936554241144033705123137622138821255863189601835744461304326536090731660",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x7E2C2A0B7A26A9e91A8A9795aC23EFbFb652977C"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3150000000000000",
                "endAmount": "3150000000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              }
            ],
            "startTime": "1679494899",
            "endTime": "1679503358",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x9faa3f1a7d2bd4f9",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "630000000000000000",
        "maker": {
          "user": 36588765,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
          "address": "0x7e2c2a0b7a26a9e91a8a9795ac23efbfb652977c",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA5MQ",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 407410358,
              "token_id": "31232936554241144033705123137622138821255863189601835744461304326536090731660",
              "num_sales": 5,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/d62dcc4cde009045051effc9e41a5b56.svg",
              "image_preview_url": "https://openseauserdata.com/files/d62dcc4cde009045051effc9e41a5b56.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/d62dcc4cde009045051effc9e41a5b56.svg",
              "image_original_url": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x450d3733b5d07c46d6c45a8b64ccee35662f96d5b8a1bd08e694c01ac27dc48c/image",
              "animation_url": null,
              "animation_original_url": null,
              "name": "4918.eth",
              "description": "4918.eth, an ENS name.\n\nPlease check the expiration date. To keep your name beyond that date, you will need to pay to extend registration, currently set at $5/year for names 5 characters or longer, $160/year for names 4 characters in length, and $640/year for names 3 characters in length.",
              "external_link": "https://app.ens.domains/name/4918.eth",
              "asset_contract": {
                "address": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
                "asset_contract_type": "non-fungible",
                "created_date": "2019-05-08T21:59:29.327544",
                "name": "Unidentified contract",
                "nft_version": null,
                "opensea_version": null,
                "owner": 111982386,
                "schema_name": "ERC721",
                "symbol": "",
                "total_supply": "0",
                "description": "Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.",
                "external_link": "https://ens.domains",
                "image_url": "https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/31232936554241144033705123137622138821255863189601835744461304326536090731660",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-05-08T21:59:36.282454+00:00",
                "default_to_fiat": false,
                "description": "Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "cover"
                },
                "external_url": "https://ens.domains",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/BBj09xD7R4bBtg1lgnAAS9_TfoYXKwMtudlk-0fVljlURaK7BWcARCpkM-1LGNGTAcsGO6V1TgrtmQFvCo8uVYW_QEfASK-9j6Nr?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/BBj09xD7R4bBtg1lgnAAS9_TfoYXKwMtudlk-0fVljlURaK7BWcARCpkM-1LGNGTAcsGO6V1TgrtmQFvCo8uVYW_QEfASK-9j6Nr?w=500&auto=format",
                "medium_username": "the-ethereum-name-service",
                "name": "ENS: Ethereum Name Service",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "ens",
                "telegram_url": null,
                "twitter_username": "ensdomains",
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/31232936554241144033705123137622138821255863189601835744461304326536090731660",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.497187",
        "closing_date": "2023-03-22T15:00:35",
        "listing_time": 1679494852,
        "expiration_time": 1679497235,
        "order_hash": "0x2b1cccd17311e8865473b692f9369a1087ce0f1b556a61852f978a157312755e",
        "protocol_data": {
          "parameters": {
            "offerer": "0x9b78a3386b23f7b9989e0ff0a74ecdb2ce01cd9c",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "12900100000000000000",
                "endAmount": "12900100000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258",
                "identifierOrCriteria": "73468",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x9B78a3386b23f7B9989e0fF0a74ecdb2ce01cD9C"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "322502500000000000",
                "endAmount": "322502500000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "645005000000000000",
                "endAmount": "645005000000000000",
                "recipient": "0x37ceB4bA093D40234c6fB312d9791B67c04eF49A"
              }
            ],
            "startTime": "1679494852",
            "endTime": "1679497235",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x750fac0ce3931ae9aee59fa53b430302",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "12900100000000000000",
        "maker": {
          "user": 36465931,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/10.png",
          "address": "0x9b78a3386b23f7b9989e0ff0a74ecdb2ce01cd9c",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 25967257,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/7.png",
              "address": "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a",
              "config": "verified"
            },
            "basis_points": "500"
          },
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA5MA",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 412374257,
              "token_id": "73468",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gae/zRIpRBSsNsFF1PKzdj7ZXbWlfWjczJDkWVedTvtycoVKiGjxf-0vwa5pU4s9oZxpgVo-l-J4KMtfgALB_LyizdiBFY-DoA03DaFBsA?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/zRIpRBSsNsFF1PKzdj7ZXbWlfWjczJDkWVedTvtycoVKiGjxf-0vwa5pU4s9oZxpgVo-l-J4KMtfgALB_LyizdiBFY-DoA03DaFBsA?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/zRIpRBSsNsFF1PKzdj7ZXbWlfWjczJDkWVedTvtycoVKiGjxf-0vwa5pU4s9oZxpgVo-l-J4KMtfgALB_LyizdiBFY-DoA03DaFBsA?w=500&auto=format",
              "image_original_url": "https://assets.otherside.xyz/otherdeeds/078c4aefbcdf1494d56eef853dfab42e2e726a2dad147e02df95adbfe4a8f4f1.jpg",
              "animation_url": null,
              "animation_original_url": null,
              "name": null,
              "description": null,
              "external_link": "https://otherside.xyz/explore?id=73468",
              "asset_contract": {
                "address": "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-04-28T12:49:29.758360",
                "name": "Otherdeed",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 357627912,
                "schema_name": "ERC721",
                "symbol": "OTHR",
                "total_supply": "0",
                "description": "Otherdeed is the key to claiming land in Otherside. Each have a unique blend of environment and sediment — some with resources, some home to powerful artifacts. And on a very few, a Koda roams.",
                "external_link": "https://otherside.xyz",
                "image_url": "https://i.seadn.io/gae/yIm-M5-BpSDdTEIJRt5D6xphizhIdozXjqSITgK4phWq7MmAU3qE7Nw7POGCiPGyhtJ3ZFP8iJ29TFl-RLcGBWX5qI4-ZcnCPcsY4zI?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258/73468",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/E_XVuM8mX1RuqBym2JEX4RBg_sj9KbTFBAi0qU4eBr2E3VCC0bwpWrgHqBOaWsKGTf4-DBseuZJGvsCVBnzLjxqgq7rAb_93zkZ-?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-04-29T13:58:31.855081+00:00",
                "default_to_fiat": false,
                "description": "Otherdeed is the key to claiming land in Otherside. Each have a unique blend of environment and sediment — some with resources, some home to powerful artifacts. And on a very few, a Koda roams.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": "https://discord.gg/the-otherside",
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "https://otherside.xyz",
                "featured": false,
                "featured_image_url": null,
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/yIm-M5-BpSDdTEIJRt5D6xphizhIdozXjqSITgK4phWq7MmAU3qE7Nw7POGCiPGyhtJ3ZFP8iJ29TFl-RLcGBWX5qI4-ZcnCPcsY4zI?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Otherdeed for Otherside",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a",
                "require_email": false,
                "short_description": null,
                "slug": "otherdeed",
                "telegram_url": null,
                "twitter_username": "othersidemeta",
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "https://api.otherside.xyz/lands/73468",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.493171",
        "closing_date": "2023-03-22T15:36:41",
        "listing_time": 1679494901,
        "expiration_time": 1679499401,
        "order_hash": "0x03a459e3a66acfc340af0b7af713d38fa4bc071274fdb7e4ada264104fd2c90b",
        "protocol_data": {
          "parameters": {
            "offerer": "0xfc6ed5fa95aa44d585486d5682445f48e306a375",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "147400000000000000",
                "endAmount": "147400000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x466CFcD0525189b573E794F554b8A751279213Ac",
                "identifierOrCriteria": "3955",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xFC6Ed5FA95aa44d585486d5682445f48E306A375"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "737000000000000",
                "endAmount": "737000000000000",
                "recipient": "0xd1F124cc900624e1ff2d923180b3924147364380"
              }
            ],
            "startTime": "1679494901",
            "endTime": "1679499401",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0xfd8813e34832cd53",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "147400000000000000",
        "maker": {
          "user": 40656684,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/13.png",
          "address": "0xfc6ed5fa95aa44d585486d5682445f48e306a375",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 39428677,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/14.png",
              "address": "0xd1f124cc900624e1ff2d923180b3924147364380",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4OA",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 430063206,
              "token_id": "3955",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/0c97ae5f2192e06a596285ac96a7d499.gif?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/0c97ae5f2192e06a596285ac96a7d499.gif?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/0c97ae5f2192e06a596285ac96a7d499.gif?w=500&auto=format",
              "image_original_url": "ipfs://QmXHm5NBx9R6SGDA8mfcygqYhWqAWFxbiUSpGq8ZWbcCqQ",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Dooplicator #3955",
              "description": "The Doodle-y matter in the Dooplicator appears to be searching for new charges of utility for its owner.",
              "external_link": null,
              "asset_contract": {
                "address": "0x466cfcd0525189b573e794f554b8a751279213ac",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-05-12T16:28:08.928061",
                "name": "Dooplicator",
                "nft_version": null,
                "opensea_version": null,
                "owner": 2366843654,
                "schema_name": "ERC721",
                "symbol": "DOOPL",
                "total_supply": "9375",
                "description": "The Dooplicator is supercharged with endless utility.\n\nThe Dooplicator's 'charges', allows its Doodle-y matter to utilize other NFTs to create new content.\n\nPlanned upgrades to its firmware will allow Dooplicators, even used ones, to be utilized in new and different ways.\n\nRead more about the Dooplicator: https://doodles.app/dooplicator",
                "external_link": "https://doodles.app/dooplicator",
                "image_url": "https://i.seadn.io/gae/RrCR2EKxJnu_JoadezfSwRBFeiYexn54OwWyAtGdCfZpfvwmjlxiqrajlOrIJ1ri9SRnc6P-UxW9_saOFwp69vUDcxxr_Wr2S_YXjqc?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0xd1f124cc900624e1ff2d923180b3924147364380"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x466cfcd0525189b573e794f554b8a751279213ac/3955",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/nuG6aUfxE4im5NlYO5AFCidFDwPaeoSi18UcB12BOes4FJQAuMrQlKnMCSDFcEsfy3T88nhznPrlh5jejcSrm3PZB7KnXzL9OHOK7g?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-05-13T00:04:50.157546+00:00",
                "default_to_fiat": false,
                "description": "The Dooplicator is supercharged with endless utility.\n\nThe Dooplicator's 'charges', allows its Doodle-y matter to utilize other NFTs to create new content.\n\nPlanned upgrades to its firmware will allow Dooplicators, even used ones, to be utilized in new and different ways.\n\nRead more about the Dooplicator: https://doodles.app/dooplicator",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": "https://discord.gg/doodles",
                "display_data": {
                  "card_display_style": "cover",
                  "images": null
                },
                "external_url": "https://doodles.app/dooplicator",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/36823984427c30a359a2661c7ea54be8.png?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/RrCR2EKxJnu_JoadezfSwRBFeiYexn54OwWyAtGdCfZpfvwmjlxiqrajlOrIJ1ri9SRnc6P-UxW9_saOFwp69vUDcxxr_Wr2S_YXjqc?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/36823984427c30a359a2661c7ea54be8.png?w=500&auto=format",
                "medium_username": null,
                "name": "Dooplicator",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0xd1f124cc900624e1ff2d923180b3924147364380",
                "require_email": false,
                "short_description": null,
                "slug": "the-dooplicator",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": "welikethedoodles",
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xd1f124cc900624e1ff2d923180b3924147364380": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": true,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "https://metadata.artlab.xyz/0185fa75-ba04-8156-9fbe-bb39dc263392/3955",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.488330",
        "closing_date": "2023-03-22T15:06:35",
        "listing_time": 1679494900,
        "expiration_time": 1679497595,
        "order_hash": "0x0ba208469df4513650912f5f10863b9b4f8c84708fc6eab04b4c571f48b97f62",
        "protocol_data": {
          "parameters": {
            "offerer": "0x0699405e09bc6d93631b8e3e2dde607a87ebab2c",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "705810007002000000",
                "endAmount": "705810007002000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
                "identifierOrCriteria": "49431227334711045520375925903661392855400034303513817827952603373342515791807",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x0699405e09Bc6d93631b8E3e2dDE607A87ebAb2c"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3529050035010000",
                "endAmount": "3529050035010000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              }
            ],
            "startTime": "1679494900",
            "endTime": "1679497595",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x7b1ba5da163b260d",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "705810007002000000",
        "maker": {
          "user": 39032967,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/20.png",
          "address": "0x0699405e09bc6d93631b8e3e2dde607a87ebab2c",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4Nw",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 407372988,
              "token_id": "49431227334711045520375925903661392855400034303513817827952603373342515791807",
              "num_sales": 1,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/48d9bfa35f5fbbcea7830537f083fb86.svg",
              "image_preview_url": "https://openseauserdata.com/files/48d9bfa35f5fbbcea7830537f083fb86.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/48d9bfa35f5fbbcea7830537f083fb86.svg",
              "image_original_url": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x6d49154ca8cd6403c49111cf802cd541a73b30ec44e594e49d63c1a9d75807bf/image",
              "animation_url": null,
              "animation_original_url": null,
              "name": "0572.eth",
              "description": "0572.eth, an ENS name.\n\nPlease check the expiration date. To keep your name beyond that date, you will need to pay to extend registration, currently set at $5/year for names 5 characters or longer, $160/year for names 4 characters in length, and $640/year for names 3 characters in length.",
              "external_link": "https://app.ens.domains/name/0572.eth",
              "asset_contract": {
                "address": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
                "asset_contract_type": "non-fungible",
                "created_date": "2019-05-08T21:59:29.327544",
                "name": "Unidentified contract",
                "nft_version": null,
                "opensea_version": null,
                "owner": 111982386,
                "schema_name": "ERC721",
                "symbol": "",
                "total_supply": "0",
                "description": "Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.",
                "external_link": "https://ens.domains",
                "image_url": "https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/49431227334711045520375925903661392855400034303513817827952603373342515791807",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-05-08T21:59:36.282454+00:00",
                "default_to_fiat": false,
                "description": "Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "cover"
                },
                "external_url": "https://ens.domains",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/BBj09xD7R4bBtg1lgnAAS9_TfoYXKwMtudlk-0fVljlURaK7BWcARCpkM-1LGNGTAcsGO6V1TgrtmQFvCo8uVYW_QEfASK-9j6Nr?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/BBj09xD7R4bBtg1lgnAAS9_TfoYXKwMtudlk-0fVljlURaK7BWcARCpkM-1LGNGTAcsGO6V1TgrtmQFvCo8uVYW_QEfASK-9j6Nr?w=500&auto=format",
                "medium_username": "the-ethereum-name-service",
                "name": "ENS: Ethereum Name Service",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "ens",
                "telegram_url": null,
                "twitter_username": "ensdomains",
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/49431227334711045520375925903661392855400034303513817827952603373342515791807",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.485872",
        "closing_date": "2023-03-22T16:24:41",
        "listing_time": 1679494901,
        "expiration_time": 1679502281,
        "order_hash": "0xa9f1fd8a0154295f906c7504faed9d84741c4a2933b94499683e139ee46c1303",
        "protocol_data": {
          "parameters": {
            "offerer": "0x5613e211bc10c3a4288b486fb778b4b74b3fa564",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "516880000000000000",
                "endAmount": "516880000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x572E33FFa523865791aB1C26B42a86aC244Df784",
                "identifierOrCriteria": "77052049995884797100033",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x5613E211BC10C3a4288b486fB778b4B74B3fA564"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "2584400000000000",
                "endAmount": "2584400000000000",
                "recipient": "0x789E86ECb5C5f743EBA172E38df4FE560A374A3e"
              }
            ],
            "startTime": "1679494901",
            "endTime": "1679502281",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x9ef20183526f204d",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "516880000000000000",
        "maker": {
          "user": 40977088,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/6.png",
          "address": "0x5613e211bc10c3a4288b486fb778b4b74b3fa564",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/19.png",
              "address": "0x789e86ecb5c5f743eba172e38df4fe560a374a3e",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4NQ",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 340676619,
              "token_id": "77052049995884797100033",
              "num_sales": 1,
              "background_color": null,
              "image_url": "https://i.seadn.io/gae/MqYaz9mzvDvCY_fXGqi_HcitbiNRBHrePQakyNhM7GLPvbWy2qvYli24RAYCOb1A9hOcZAak5Qgtb9ZDNyc05tHWqwlUuhDw1r7S?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/MqYaz9mzvDvCY_fXGqi_HcitbiNRBHrePQakyNhM7GLPvbWy2qvYli24RAYCOb1A9hOcZAak5Qgtb9ZDNyc05tHWqwlUuhDw1r7S?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/MqYaz9mzvDvCY_fXGqi_HcitbiNRBHrePQakyNhM7GLPvbWy2qvYli24RAYCOb1A9hOcZAak5Qgtb9ZDNyc05tHWqwlUuhDw1r7S?w=500&auto=format",
              "image_original_url": "ipfs://QmZRT7YybaXd7R97gUbiZqR4qkvxMtTfhjk7asUvGScK66",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Gucci Grail Ape #4177",
              "description": "In constant pursuit of precious wonders that go beyond the confines of time and space, Creative Director Alessandro Michele takes a trip to New Tokyo – a floating city in a parallel universe. Within this metropolis, he meets the world-renowned digital artisan Wagmi-san, legendary for crafting coveted items in his 10KTF shop. As it so often happens when creativity encounters curiosity, something unimaginable becomes a reality, ushering in a new era of creativity across dimensions.",
              "external_link": null,
              "asset_contract": {
                "address": "0x572e33ffa523865791ab1c26b42a86ac244df784",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-03-16T11:48:04.807721",
                "name": "Gucci",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 80096597,
                "schema_name": "ERC721",
                "symbol": "GUCCI",
                "total_supply": null,
                "description": "In constant pursuit of precious wonders that go beyond the confines of time and space, Creative Director Alessandro Michele took a trip to New Tokyo – a floating city in a parallel universe. Within this metropolis, he met the world-renowned digital artisan Wagmi-san, legendary for crafting coveted items in his 10KTF shop. As it so often happens when creativity encounters curiosity, something unimaginable became a reality, ushering in a new era of creativity across dimensions.",
                "external_link": "https://10ktf.com/shop",
                "image_url": "https://i.seadn.io/gae/hs7wMR8OGBLG_MjvQFl-tei8U3CpYPgjysNFXttk8qGXjvFH_db-8aVKSbI3dDF6PBjD1CVdsz0qMAtmNs7eHNDhJU8oU9e2bTTuag?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0x789e86ecb5c5f743eba172e38df4fe560a374a3e"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x572e33ffa523865791ab1c26b42a86ac244df784/77052049995884797100033",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/x_4lABNgrwuONtNPfy3ErSRc_LC0m0Aq-3H6N3i6xagqitzcne1uDjkrjEhbC6s9Cp19xPbSQGxspyD-LbkQ6ftrjALmw1WyChDnFA?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-03-16T22:35:29.432840+00:00",
                "default_to_fiat": false,
                "description": "In constant pursuit of precious wonders that go beyond the confines of time and space, Creative Director Alessandro Michele took a trip to New Tokyo – a floating city in a parallel universe. Within this metropolis, he met the world-renowned digital artisan Wagmi-san, legendary for crafting coveted items in his 10KTF shop. As it so often happens when creativity encounters curiosity, something unimaginable became a reality, ushering in a new era of creativity across dimensions.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "contain",
                  "images": null
                },
                "external_url": "https://10ktf.com/shop",
                "featured": false,
                "featured_image_url": null,
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/hs7wMR8OGBLG_MjvQFl-tei8U3CpYPgjysNFXttk8qGXjvFH_db-8aVKSbI3dDF6PBjD1CVdsz0qMAtmNs7eHNDhJU8oU9e2bTTuag?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "10KTF Gucci Grail",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x789e86ecb5c5f743eba172e38df4fe560a374a3e",
                "require_email": false,
                "short_description": null,
                "slug": "10ktf-gucci-grail",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x789e86ecb5c5f743eba172e38df4fe560a374a3e": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": true,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "ipfs://QmY8aWFqQ3kwGG1vvHLf1xzuCsDifCranTBgLuQTZg844T/77052049995884797100033",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.461789",
        "closing_date": "2023-03-22T14:46:30",
        "listing_time": 1679494897,
        "expiration_time": 1679496390,
        "order_hash": "0x3f1a29fe7b0c3215fc2e9757163e5e16f04a3d667f3bb710819c737b2bef2998",
        "protocol_data": {
          "parameters": {
            "offerer": "0xf91207a95b68575d97b15b7a6a3f61c272a617ef",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "6000300000000000000",
                "endAmount": "6000300000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x4b15a9c28034dC83db40CD810001427d3BD7163D",
                "identifierOrCriteria": "570",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xF91207a95B68575D97b15B7a6A3F61C272A617eF"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "150007500000000000",
                "endAmount": "150007500000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "300015000000000000",
                "endAmount": "300015000000000000",
                "recipient": "0xA858DDc0445d8131daC4d1DE01f834ffcbA52Ef1"
              }
            ],
            "startTime": "1679494897",
            "endTime": "1679496390",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x7339baefa1c003b1ea907d2187c28532",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": "0x1e6b274a80985a110dc05baabaa1db308"
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "6000300000000000000",
        "maker": {
          "user": 17980249,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/1.png",
          "address": "0xf91207a95b68575d97b15b7a6a3f61c272a617ef",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 35330734,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/32.png",
              "address": "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1",
              "config": "verified"
            },
            "basis_points": "500"
          },
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4Mw",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 1117654123,
              "token_id": "570",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/a93fe258d4797e6573a4d1c6edcea6d8.jpg?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/a93fe258d4797e6573a4d1c6edcea6d8.jpg?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/a93fe258d4797e6573a4d1c6edcea6d8.jpg?w=500&auto=format",
              "image_original_url": "https://media.mdvmm.xyz/hvmtl/570.jpg",
              "animation_url": null,
              "animation_original_url": null,
              "name": null,
              "description": "HV-MTL is a dynamic NFT collection consisting of mechs summoned through a space-time rift that has opened up outside the Bored Ape Yacht Club. Every HV (pronounced: Heavy) starts as a Core. Once unlocked, each Core transforms into a one-of-a-kind mech designed to evolve in the right environment.",
              "external_link": null,
              "asset_contract": {
                "address": "0x4b15a9c28034dc83db40cd810001427d3bd7163d",
                "asset_contract_type": "non-fungible",
                "created_date": "2023-03-15T07:50:37.643953",
                "name": "HV-MTL",
                "nft_version": null,
                "opensea_version": null,
                "owner": 2264562856,
                "schema_name": "ERC721",
                "symbol": "HV-MTL",
                "total_supply": "16232",
                "description": "The HV-MTL (Heavy Metal) collection is made up of 30,000 Mechs derived from 8 different Power Source types. Beginning March 15, 2023, eligible Sewer Passes can be burned to summon a Power Source that will reveal an Evo 1 Mech. Evo 1 holders can participate in future minigame sets with their Evo 1s to unlock additional HV-MTL evolution stages.",
                "external_link": "https://mdvmm.xyz/",
                "image_url": "https://i.seadn.io/gcs/files/82a7f92df6d60e41327b69cdafea8831.jpg?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x4b15a9c28034dc83db40cd810001427d3bd7163d/570",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/c0a2753ba06416327a18b8a76d8c2afc.gif?w=500&auto=format",
                "chat_url": null,
                "created_date": "2023-03-15T21:30:46.143993+00:00",
                "default_to_fiat": false,
                "description": "The HV-MTL (Heavy Metal) collection is made up of 30,000 Mechs derived from 8 different Power Source types. Beginning March 15, 2023, eligible Sewer Passes can be burned to summon a Power Source that will reveal an Evo 1 Mech. Evo 1 holders can participate in future minigame sets with their Evo 1s to unlock additional HV-MTL evolution stages.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": "https://discord.gg/bayc",
                "display_data": {
                  "card_display_style": "cover",
                  "images": null
                },
                "external_url": "https://mdvmm.xyz/",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/c3e23f87e1f8cb30837ec3ac3d9db808.png?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gcs/files/82a7f92df6d60e41327b69cdafea8831.jpg?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/c3e23f87e1f8cb30837ec3ac3d9db808.png?w=500&auto=format",
                "medium_username": null,
                "name": "HV-MTL",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1",
                "require_email": false,
                "short_description": null,
                "slug": "hv-mtl",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": true
              },
              "decimals": null,
              "token_metadata": "https://api.mdvmm.xyz/hvmtl/570",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.460644",
        "closing_date": "2023-03-22T17:20:18",
        "listing_time": 1679494850,
        "expiration_time": 1679505618,
        "order_hash": "0xd1ba899ff9495a644a56a7e8fefaa5d71c2aa4f6ae5d42fbb1273c0946dfe51a",
        "protocol_data": {
          "parameters": {
            "offerer": "0x460cf84abc386a297c1c673b1581f8d9b8784a31",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "1500200000000000000",
                "endAmount": "1500200000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x364C828eE171616a39897688A831c2499aD972ec",
                "identifierOrCriteria": "2371",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x460CF84AbC386A297c1C673B1581f8d9b8784A31"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "37505000000000000",
                "endAmount": "37505000000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "67509000000000000",
                "endAmount": "67509000000000000",
                "recipient": "0x80D4397eF6036d6BC37d6fEbedf3A60c4Dc2cd27"
              }
            ],
            "startTime": "1679494850",
            "endTime": "1679505618",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x238c16d109a5e1782af67ce86ace0c46",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "1500200000000000000",
        "maker": {
          "user": 8674805,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/13.png",
          "address": "0x460cf84abc386a297c1c673b1581f8d9b8784a31",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 36558015,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/23.png",
              "address": "0x80d4397ef6036d6bc37d6febedf3a60c4dc2cd27",
              "config": ""
            },
            "basis_points": "450"
          },
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4Mg",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 43466158,
              "token_id": "2371",
              "num_sales": 2,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/72d2bde8feb499b601e643ee4dc0455f.png?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/72d2bde8feb499b601e643ee4dc0455f.png?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/72d2bde8feb499b601e643ee4dc0455f.png?w=500&auto=format",
              "image_original_url": "ipfs://QmUs4WQP47QKGwzPLjVMmhqTbspJfAC344abDEE2UT52HF/2371.png",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Sappy Seal #2371",
              "description": null,
              "external_link": null,
              "asset_contract": {
                "address": "0x364c828ee171616a39897688a831c2499ad972ec",
                "asset_contract_type": "non-fungible",
                "created_date": "2021-08-31T19:23:19.794455",
                "name": "Sappy Seals",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 431782442,
                "schema_name": "ERC721",
                "symbol": "SAPS",
                "total_supply": "0",
                "description": "Sappy Seals is community-led project focused on metaverse expansion and a growing ecosystem\n\nHolder count is not accurate due to staking. An up to date count can be found at our website: https://sappyseals.io/\n\nSappy Seals offers: \n\n- The open world cross-community Pixlverse & Pixl Pets\n\n- Marketplace for exclusive metaverse items\n\n- Rarity-based staking for the PIXL utility token\n\nJoin them on their cool conquest by joining the Discord http://discord.gg/zy2dfyMKwE",
                "external_link": "https://sappyseals.io",
                "image_url": "https://i.seadn.io/gcs/files/11570389cac190891fea96fe285cbf01.png?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 450,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 450,
                "payout_address": "0x80d4397ef6036d6bc37d6febedf3a60c4dc2cd27"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x364c828ee171616a39897688a831c2499ad972ec/2371",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/aa2671907dc4ef5f76a20e39ee0d8ef9.jpg?w=500&auto=format",
                "chat_url": null,
                "created_date": "2021-08-31T20:50:16.657151+00:00",
                "default_to_fiat": false,
                "description": "Sappy Seals is community-led project focused on metaverse expansion and a growing ecosystem\n\nHolder count is not accurate due to staking. An up to date count can be found at our website: https://sappyseals.io/\n\nSappy Seals offers: \n\n- The open world cross-community Pixlverse & Pixl Pets\n\n- Marketplace for exclusive metaverse items\n\n- Rarity-based staking for the PIXL utility token\n\nJoin them on their cool conquest by joining the Discord http://discord.gg/zy2dfyMKwE",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "450",
                "discord_url": "https://discord.gg/zy2dfyMKwE",
                "display_data": {
                  "card_display_style": "contain",
                  "images": null
                },
                "external_url": "https://sappyseals.io",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/5771cc1317558f66039ed8a6985a274d.png?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gcs/files/11570389cac190891fea96fe285cbf01.png?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/5771cc1317558f66039ed8a6985a274d.png?w=500&auto=format",
                "medium_username": null,
                "name": "Sappy Seals",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x80d4397ef6036d6bc37d6febedf3a60c4dc2cd27",
                "require_email": false,
                "short_description": null,
                "slug": "sappy-seals",
                "telegram_url": null,
                "twitter_username": "SappySealsNFT",
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x80d4397ef6036d6bc37d6febedf3a60c4dc2cd27": 450
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "ipfs://QmXUUXRSAJeb4u8p4yKHmXN1iAKtAV7jwLHjw35TNm5jN7/2371",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.457388",
        "closing_date": "2023-03-22T16:20:40",
        "listing_time": 1679494872,
        "expiration_time": 1679502040,
        "order_hash": "0x57a24f15ffa4472d59f2ac5b56cddf9d557319baeb239dd6bba2ce0ecfc9338d",
        "protocol_data": {
          "parameters": {
            "offerer": "0xe8697df4bdac272c94abb99104691670cbb66142",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "1273500100000000000",
                "endAmount": "1273500100000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x394E3d3044fC89fCDd966D3cb35Ac0B32B0Cda91",
                "identifierOrCriteria": "2656",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xe8697dF4BdAC272C94Abb99104691670CBb66142"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "31837502500000000",
                "endAmount": "31837502500000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "63675005000000000",
                "endAmount": "63675005000000000",
                "recipient": "0x60D190772500FaCa6a32e2b88fF0cFE5D9D75142"
              }
            ],
            "startTime": "1679494872",
            "endTime": "1679502040",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x3edd11b64c63153e04219b0ce6fb03ac",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "1273500100000000000",
        "maker": {
          "user": 25900862,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/20.png",
          "address": "0xe8697df4bdac272c94abb99104691670cbb66142",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 35753924,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/22.png",
              "address": "0x60d190772500faca6a32e2b88ff0cfe5d9d75142",
              "config": "verified"
            },
            "basis_points": "500"
          },
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4MQ",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 623692191,
              "token_id": "2656",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/833227d63aeeba7da471b6f4ac1d5617.jpg?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/833227d63aeeba7da471b6f4ac1d5617.jpg?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/833227d63aeeba7da471b6f4ac1d5617.jpg?w=500&auto=format",
              "image_original_url": "https://nfts.renga.app/nfts/public/images/2656.jpeg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "RENGA #2656",
              "description": "A handcrafted collection of 10,000 characters developed by artist DirtyRobot. Each with their own identity to be discovered within the wider stories of RENGA. In its purest form, RENGA is the art of storytelling. Visit our [website](https://renga.app/) for more details.",
              "external_link": null,
              "asset_contract": {
                "address": "0x394e3d3044fc89fcdd966d3cb35ac0b32b0cda91",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-09-01T23:54:15.458547",
                "name": "RENGA",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 491310701,
                "schema_name": "ERC721",
                "symbol": "RENGA",
                "total_supply": null,
                "description": "A handcrafted collection of 10,000 characters developed by artist DirtyRobot. Each with their own identity to be discovered within the wider stories of RENGA. In its purest form, RENGA is the art of storytelling.",
                "external_link": "https://renga.app/",
                "image_url": "https://i.seadn.io/gcs/files/f3b11e36be14a5d31c75b19d03996fed.gif?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0x60d190772500faca6a32e2b88ff0cfe5d9d75142"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x394e3d3044fc89fcdd966d3cb35ac0b32b0cda91/2656",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/45a3d8d422d07e8fe0256f432c872cf0.gif?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-09-01T23:54:21.714322+00:00",
                "default_to_fiat": false,
                "description": "A handcrafted collection of 10,000 characters developed by artist DirtyRobot. Each with their own identity to be discovered within the wider stories of RENGA. In its purest form, RENGA is the art of storytelling.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": "https://discord.gg/renga",
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "https://renga.app/",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/fce6357d8b12f5b3d0d7b41ba50459ef.jpg?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gcs/files/f3b11e36be14a5d31c75b19d03996fed.gif?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/fce6357d8b12f5b3d0d7b41ba50459ef.jpg?w=500&auto=format",
                "medium_username": null,
                "name": "RENGA",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x60d190772500faca6a32e2b88ff0cfe5d9d75142",
                "require_email": false,
                "short_description": null,
                "slug": "renga",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x60d190772500faca6a32e2b88ff0cfe5d9d75142": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "https://nfts.renga.app/nfts/public/erc-721/2656",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.456089",
        "closing_date": "2023-03-23T14:21:38",
        "listing_time": 1679494898,
        "expiration_time": 1679581298,
        "order_hash": "0xb24086619a98f566cb4cc1db486e16ec2faca9771ce57dd010f68c52252a50b5",
        "protocol_data": {
          "parameters": {
            "offerer": "0xdb1291c6cbb22fbc21d8ce6bce24153ce6e3bade",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "170000000000000000",
                "endAmount": "170000000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x4D232CD85294Acd53Ec03F4A57F57888c9Ea1946",
                "identifierOrCriteria": "1687",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xdb1291c6cBb22FBc21D8ce6Bce24153cE6E3BADE"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "850000000000000",
                "endAmount": "850000000000000",
                "recipient": "0xd9137B84f56D61Bb961082DD9Eb21bE3D7B14cB9"
              }
            ],
            "startTime": "1679494898",
            "endTime": "1679581298",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x6ff84b5769f25cc",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "170000000000000000",
        "maker": {
          "user": 36829484,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/4.png",
          "address": "0xdb1291c6cbb22fbc21d8ce6bce24153ce6e3bade",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/25.png",
              "address": "0xd9137b84f56d61bb961082dd9eb21be3d7b14cb9",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA4MA",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 360321910,
              "token_id": "1687",
              "num_sales": 4,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/cba15910ab1e263457bdad490561548a.png?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/cba15910ab1e263457bdad490561548a.png?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/cba15910ab1e263457bdad490561548a.png?w=500&auto=format",
              "image_original_url": "https://arweave.net/taxszu9uggGMgkvT56SwvRzYwY1g-Hbs758ChVWO26E",
              "animation_url": "https://openseauserdata.com/files/8cdcee7daa7e489377e24737eb07c2e2.mp4",
              "animation_original_url": "https://arweave.net/77UJ0gcKKS3_uyVk72KIunTC_zdXUdQLeLE4_c7QB4c",
              "name": "Wizard #187",
              "description": "Wizard is searching for DeeKayVerse",
              "external_link": null,
              "asset_contract": {
                "address": "0x4d232cd85294acd53ec03f4a57f57888c9ea1946",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-03-30T05:07:21.023857",
                "name": "Metamorphosis",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 277996923,
                "schema_name": "ERC721",
                "symbol": "MORPH",
                "total_supply": null,
                "description": "30.",
                "external_link": null,
                "image_url": "https://i.seadn.io/gae/RN6dDJ7Vskhyx2heZD9pmP2V4RXXChNOix5XP6P_abu6EY6DtrIR8KlBmK3X8QhAZSN1QiTO4tjm5unADS6CSAkvsi24qxWOWER23Gg?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 1000,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 1000,
                "payout_address": "0xd9137b84f56d61bb961082dd9eb21be3d7b14cb9"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x4d232cd85294acd53ec03f4a57f57888c9ea1946/1687",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/WI66GURhnyReVw5ggakIpYyDNbSEPBhXIoqPu7-YB6ljen9IyLwQlZaxIqpGOb5TFQJ3yjTwsvijSfdPm_UMI4G1PmyK9QtL9RITiQ?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-03-30T05:21:13.477661+00:00",
                "default_to_fiat": false,
                "description": "30.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "1000",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "cover"
                },
                "external_url": null,
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/WI66GURhnyReVw5ggakIpYyDNbSEPBhXIoqPu7-YB6ljen9IyLwQlZaxIqpGOb5TFQJ3yjTwsvijSfdPm_UMI4G1PmyK9QtL9RITiQ?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/RN6dDJ7Vskhyx2heZD9pmP2V4RXXChNOix5XP6P_abu6EY6DtrIR8KlBmK3X8QhAZSN1QiTO4tjm5unADS6CSAkvsi24qxWOWER23Gg?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/WI66GURhnyReVw5ggakIpYyDNbSEPBhXIoqPu7-YB6ljen9IyLwQlZaxIqpGOb5TFQJ3yjTwsvijSfdPm_UMI4G1PmyK9QtL9RITiQ?w=500&auto=format",
                "medium_username": null,
                "name": "Ash Chapter Two: Metamorphosis",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0xd9137b84f56d61bb961082dd9eb21be3d7b14cb9",
                "require_email": false,
                "short_description": null,
                "slug": "ashmetamorphosis",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xd9137b84f56d61bb961082dd9eb21be3d7b14cb9": 1000
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "data:application/json;utf8,{\"name\":\"Wizard #187\", \"description\":\"Wizard is searching for DeeKayVerse\", \"created_by\":\"DeeKay\", \"image\":\"https://arweave.net/taxszu9uggGMgkvT56SwvRzYwY1g-Hbs758ChVWO26E\", \"animation_url\":\"https://arweave.net/77UJ0gcKKS3_uyVk72KIunTC_zdXUdQLeLE4_c7QB4c\", \"attributes\":[{\"trait_type\":\"Creator\",\"value\":\"DeeKay\"},{\"trait_type\":\"Form\",\"value\":\"1\"}]}",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.453211",
        "closing_date": "2023-03-22T15:06:35",
        "listing_time": 1679494900,
        "expiration_time": 1679497595,
        "order_hash": "0x087118f3b491b7369002e5b0f3ad3790a6f149efc087a27781d2cf96a0719034",
        "protocol_data": {
          "parameters": {
            "offerer": "0x0699405e09bc6d93631b8e3e2dde607a87ebab2c",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "707419724816910000",
                "endAmount": "707419724816910000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
                "identifierOrCriteria": "91994291392295492260406412685362124208636474218098121290156115503225947588243",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x0699405e09Bc6d93631b8E3e2dDE607A87ebAb2c"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3537098624084550",
                "endAmount": "3537098624084550",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              }
            ],
            "startTime": "1679494900",
            "endTime": "1679497595",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x564fdc4e7a3c1cce",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "707419724816910000",
        "maker": {
          "user": 39032967,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/20.png",
          "address": "0x0699405e09bc6d93631b8e3e2dde607a87ebab2c",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3OQ",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 407253472,
              "token_id": "91994291392295492260406412685362124208636474218098121290156115503225947588243",
              "num_sales": 3,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/961da6160454a41114bf3b86fb8b66e3.svg",
              "image_preview_url": "https://openseauserdata.com/files/961da6160454a41114bf3b86fb8b66e3.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/961da6160454a41114bf3b86fb8b66e3.svg",
              "image_original_url": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0xcb62ec7a9ab598f509d7692016a5ce783cc3e4a0829818e6f7a8ca930c348693/image",
              "animation_url": null,
              "animation_original_url": null,
              "name": "0278.eth",
              "description": "0278.eth, an ENS name.\n\nPlease check the expiration date. To keep your name beyond that date, you will need to pay to extend registration, currently set at $5/year for names 5 characters or longer, $160/year for names 4 characters in length, and $640/year for names 3 characters in length.",
              "external_link": "https://app.ens.domains/name/0278.eth",
              "asset_contract": {
                "address": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
                "asset_contract_type": "non-fungible",
                "created_date": "2019-05-08T21:59:29.327544",
                "name": "Unidentified contract",
                "nft_version": null,
                "opensea_version": null,
                "owner": 111982386,
                "schema_name": "ERC721",
                "symbol": "",
                "total_supply": "0",
                "description": "Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.",
                "external_link": "https://ens.domains",
                "image_url": "https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/91994291392295492260406412685362124208636474218098121290156115503225947588243",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-05-08T21:59:36.282454+00:00",
                "default_to_fiat": false,
                "description": "Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "cover"
                },
                "external_url": "https://ens.domains",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/BBj09xD7R4bBtg1lgnAAS9_TfoYXKwMtudlk-0fVljlURaK7BWcARCpkM-1LGNGTAcsGO6V1TgrtmQFvCo8uVYW_QEfASK-9j6Nr?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/BBj09xD7R4bBtg1lgnAAS9_TfoYXKwMtudlk-0fVljlURaK7BWcARCpkM-1LGNGTAcsGO6V1TgrtmQFvCo8uVYW_QEfASK-9j6Nr?w=500&auto=format",
                "medium_username": "the-ethereum-name-service",
                "name": "ENS: Ethereum Name Service",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "ens",
                "telegram_url": null,
                "twitter_username": "ensdomains",
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/91994291392295492260406412685362124208636474218098121290156115503225947588243",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.447490",
        "closing_date": "2023-03-22T16:21:36",
        "listing_time": 1679494898,
        "expiration_time": 1679502096,
        "order_hash": "0xc0e13e90fd2da2cc30b382bc17d2ebcaaf7296e7658e7fd802e0067d996d387e",
        "protocol_data": {
          "parameters": {
            "offerer": "0xbb2b1a52ba9e6762dfed762aa90e1efdbdd10a4f",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "274600000000000010",
                "endAmount": "274600000000000010"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x21177C97Be40b52b002fbeE000a03212708BCf47",
                "identifierOrCriteria": "5213",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xbB2B1A52BA9e6762DFed762aA90E1eFdbdd10A4f"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "1373000000000000",
                "endAmount": "1373000000000000",
                "recipient": "0xDAbE94A1c1219a4Ae32773A3AB5b5C7a956eA13A"
              }
            ],
            "startTime": "1679494898",
            "endTime": "1679502096",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x360c6ebe000000000000000000000000000000000000000058f9b3b630aec90d",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "274600000000000010",
        "maker": {
          "user": 39557485,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/18.png",
          "address": "0xbb2b1a52ba9e6762dfed762aa90e1efdbdd10a4f",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 27478933,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/6.png",
              "address": "0xdabe94a1c1219a4ae32773a3ab5b5c7a956ea13a",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3OA",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 246620860,
              "token_id": "5213",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gae/3HHuwkr35qiAJuW0RGQ3XVbzUT3J20VyxIf8RJ9HGtfYA3ZTkhLkVz3ACCqzFiJrJ6OWMZAUlmrgSN1ieD1YTjhSLubYIUGRCpU7?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/3HHuwkr35qiAJuW0RGQ3XVbzUT3J20VyxIf8RJ9HGtfYA3ZTkhLkVz3ACCqzFiJrJ6OWMZAUlmrgSN1ieD1YTjhSLubYIUGRCpU7?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/3HHuwkr35qiAJuW0RGQ3XVbzUT3J20VyxIf8RJ9HGtfYA3ZTkhLkVz3ACCqzFiJrJ6OWMZAUlmrgSN1ieD1YTjhSLubYIUGRCpU7?w=500&auto=format",
              "image_original_url": "https://cdn.realshibadoge.com/images/5213.png",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Doge Army #5213",
              "description": "A series of 10,000 unique hand drawn NFTs, representing highly trained and specialized combat veterans who are working together on the frontlines to one day see cryptocurrency become the official currency of earth.",
              "external_link": null,
              "asset_contract": {
                "address": "0x21177c97be40b52b002fbee000a03212708bcf47",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-01-10T22:06:02.864498",
                "name": "DogeArmy",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 194707790,
                "schema_name": "ERC721",
                "symbol": "DA",
                "total_supply": "0",
                "description": "A series of 10,000 unique hand drawn NFTs, representing highly trained and specialized combat veterans who are working together on the frontlines to one day see cryptocurrency become the official currency of earth. Removing all borders and destroying government controlled monopolies.\n\nThe number of owners displayed on OpenSea does not account for the active Doge Army NFTs that are deployed in the ShibaDoge Warzone",
                "external_link": "https://www.realshibadoge.com/doge-army-nft",
                "image_url": "https://i.seadn.io/gae/Sf8IrqXvyCbs0kTt2J-OUhSaWjzZ864jFHnYCkzELZ0BQnJUd9d_l8Gs88fY9NqUaAFRnkTbtYNrkJKd2iIwbOdTzOlo7nQUCPrBBeI?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 750,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 750,
                "payout_address": "0xdabe94a1c1219a4ae32773a3ab5b5c7a956ea13a"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x21177c97be40b52b002fbee000a03212708bcf47/5213",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/dIFktZvnJYu82XL7n4h7azU0mr1gwLPVhWwR0RUJG-My7HhXeVx7vqalbIcWc9zhrmlnMoA4PnsHNSk6N9mPIRNW-w-kvdYOefAy?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-01-10T22:38:13.044659+00:00",
                "default_to_fiat": false,
                "description": "A series of 10,000 unique hand drawn NFTs, representing highly trained and specialized combat veterans who are working together on the frontlines to one day see cryptocurrency become the official currency of earth. Removing all borders and destroying government controlled monopolies.\n\nThe number of owners displayed on OpenSea does not account for the active Doge Army NFTs that are deployed in the ShibaDoge Warzone",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "750",
                "discord_url": "https://discord.gg/RXQZPcACMb",
                "display_data": {
                  "card_display_style": "contain",
                  "images": null
                },
                "external_url": "https://www.realshibadoge.com/doge-army-nft",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gae/jdvZw4UGAsrRUtazEplNuh1jA1kQuQQfaBT5OebLtozFD20oxns_uVlmFwX_JvnJ6nj_L3xKcc5Nwq6uIUn1I8p-DzhT6a1x3TuUOw?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/Sf8IrqXvyCbs0kTt2J-OUhSaWjzZ864jFHnYCkzELZ0BQnJUd9d_l8Gs88fY9NqUaAFRnkTbtYNrkJKd2iIwbOdTzOlo7nQUCPrBBeI?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gae/jdvZw4UGAsrRUtazEplNuh1jA1kQuQQfaBT5OebLtozFD20oxns_uVlmFwX_JvnJ6nj_L3xKcc5Nwq6uIUn1I8p-DzhT6a1x3TuUOw?w=500&auto=format",
                "medium_username": "realshibadoge",
                "name": "Doge Army by ShibaDoge",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0xdabe94a1c1219a4ae32773a3ab5b5c7a956ea13a",
                "require_email": false,
                "short_description": null,
                "slug": "doge-army-shibadoge",
                "telegram_url": "https://t.me/ShibaDoge_Labs",
                "twitter_username": null,
                "instagram_username": "realshibadoge",
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xdabe94a1c1219a4ae32773a3ab5b5c7a956ea13a": 750
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "https://dogemetadata.realshibadoge.com/5213",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.437702",
        "closing_date": "2023-03-22T20:21:32",
        "listing_time": 1679494892,
        "expiration_time": 1679516492,
        "order_hash": "0x64b92e31159fb614f15de7bf944c1929038ed8d6f4949e8e7f06a5bcb628d9bf",
        "protocol_data": {
          "parameters": {
            "offerer": "0xae51e514ab7983db1ceda8c473a08d5fe846f561",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "52010000000000000",
                "endAmount": "52010000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x314851f46BCbc85CC1F21ccDD652962317A25f83",
                "identifierOrCriteria": "800",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xAe51E514Ab7983dB1ceda8C473a08D5FE846F561"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "1300250000000000",
                "endAmount": "1300250000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3588690000000000",
                "endAmount": "3588690000000000",
                "recipient": "0xD5cA03b3a05A252D8e24fE9bD183A7DE6ff8469e"
              }
            ],
            "startTime": "1679494892",
            "endTime": "1679516492",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x554bb4d572dcf95fa3bd265be6b1e66e",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": "0xc09e4c180dc28170db668d769aa9ba70"
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "52010000000000000",
        "maker": {
          "user": 38054816,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/12.png",
          "address": "0xae51e514ab7983db1ceda8c473a08d5fe846f561",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          },
          {
            "account": {
              "user": 41452693,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/31.png",
              "address": "0xd5ca03b3a05a252d8e24fe9bd183a7de6ff8469e",
              "config": ""
            },
            "basis_points": "690"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3Ng",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 1122462260,
              "token_id": "800",
              "num_sales": 1,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/ac6ec7c5f9ff9690ebbd257ec2756190.png?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/ac6ec7c5f9ff9690ebbd257ec2756190.png?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/ac6ec7c5f9ff9690ebbd257ec2756190.png?w=500&auto=format",
              "image_original_url": "ipfs://bafybeig2i4rypj54khiiz5gdfqzmrtfrjnhpgn2z4gkd46ik6tpwspxmha",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Cube #800",
              "description": "CUBE is an ever-evolving art performance where every algorithm is key to creating value. \r\n\r\nMindwave Studio is a collective of engineers, coders, designers, and artists creating a computational algorithmic art project that explores new aesthetic frontiers and possibilities of what art can be, through machine learning and creativity. \r\n\r\nThe idea becomes the machine that makes the art.",
              "external_link": null,
              "asset_contract": {
                "address": "0x314851f46bcbc85cc1f21ccdd652962317a25f83",
                "asset_contract_type": "non-fungible",
                "created_date": "2023-03-21T17:49:48.826518",
                "name": "CUBE",
                "nft_version": null,
                "opensea_version": null,
                "owner": 3003786078,
                "schema_name": "ERC721",
                "symbol": "CB",
                "total_supply": "0",
                "description": "CUBE is an ever-evolving art performance where every algorithm is key to creating value. \n\nMindwave Studio is a collective of engineers, coders, designers, and artists creating a computational algorithmic art project that explores new aesthetic frontiers and possibilities of what art can be, through machine learning and creativity. \n\nThe idea becomes the machine that makes the art.",
                "external_link": "https://mindwavestudio.xyz/",
                "image_url": "https://i.seadn.io/gcs/files/488ccd0ec3610a84e1c75cd3cc917d53.png?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 690,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 740,
                "payout_address": "0xd5ca03b3a05a252d8e24fe9bd183a7de6ff8469e"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x314851f46bcbc85cc1f21ccdd652962317a25f83/800",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/ea22f3a9fb17d351a4e0cda2f1d1e626.png?w=500&auto=format",
                "chat_url": null,
                "created_date": "2023-03-21T19:00:30.422512+00:00",
                "default_to_fiat": false,
                "description": "CUBE is an ever-evolving art performance where every algorithm is key to creating value. \n\nMindwave Studio is a collective of engineers, coders, designers, and artists creating a computational algorithmic art project that explores new aesthetic frontiers and possibilities of what art can be, through machine learning and creativity. \n\nThe idea becomes the machine that makes the art.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "690",
                "discord_url": null,
                "display_data": {
                  "card_display_style": "contain",
                  "images": null
                },
                "external_url": "https://mindwavestudio.xyz/",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/a61fc427c2e6f39ee80f161823d42d82.png?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "not_requested",
                "image_url": "https://i.seadn.io/gcs/files/488ccd0ec3610a84e1c75cd3cc917d53.png?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/a61fc427c2e6f39ee80f161823d42d82.png?w=500&auto=format",
                "medium_username": null,
                "name": "CUBE",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": "0xd5ca03b3a05a252d8e24fe9bd183a7de6ff8469e",
                "require_email": false,
                "short_description": null,
                "slug": "cubemindwave",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xd5ca03b3a05a252d8e24fe9bd183a7de6ff8469e": 690
                  },
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": true,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "ipfs://bafybeihxx7gdidj3x3hj5k6gcw3vycvfqvqywx6vxrrdaz3wiuaztuhniq/800",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.413701",
        "closing_date": "2023-03-22T14:51:40",
        "listing_time": 1679494900,
        "expiration_time": 1679496700,
        "order_hash": "0xbfd681b7f5a812f5e78f725b16864d2896e57e40669df697bd0a121583a0222e",
        "protocol_data": {
          "parameters": {
            "offerer": "0x91e4510bba1e3776824a4f2b2f7c197a1bdc9119",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3265059126000000000",
                "endAmount": "3265059126000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258",
                "identifierOrCriteria": "1664",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x91e4510bBa1E3776824a4f2b2F7c197a1bDC9119"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "16325295630000000",
                "endAmount": "16325295630000000",
                "recipient": "0x37ceB4bA093D40234c6fB312d9791B67c04eF49A"
              }
            ],
            "startTime": "1679494900",
            "endTime": "1679496700",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0xda3cb4106271caa5",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "3265059126000000000",
        "maker": {
          "user": 40660572,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/17.png",
          "address": "0x91e4510bba1e3776824a4f2b2f7c197a1bdc9119",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 25967257,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/7.png",
              "address": "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a",
              "config": "verified"
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3Mw",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 412788254,
              "token_id": "1664",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/cae57afd8ba58a7bc9bb4aed5a8ff212.jpg?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/cae57afd8ba58a7bc9bb4aed5a8ff212.jpg?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/cae57afd8ba58a7bc9bb4aed5a8ff212.jpg?w=500&auto=format",
              "image_original_url": "https://assets.otherside.xyz/otherdeeds/1190baab899f76ad1add9851a94136cd6a4b0a423ea50b51d87552e149d060b0.jpg",
              "animation_url": null,
              "animation_original_url": null,
              "name": null,
              "description": null,
              "external_link": "https://otherside.xyz/explore?id=1664",
              "asset_contract": {
                "address": "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-04-28T12:49:29.758360",
                "name": "Otherdeed",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 357627912,
                "schema_name": "ERC721",
                "symbol": "OTHR",
                "total_supply": "0",
                "description": "Otherdeed is the key to claiming land in Otherside. Each have a unique blend of environment and sediment — some with resources, some home to powerful artifacts. And on a very few, a Koda roams.",
                "external_link": "https://otherside.xyz",
                "image_url": "https://i.seadn.io/gae/yIm-M5-BpSDdTEIJRt5D6xphizhIdozXjqSITgK4phWq7MmAU3qE7Nw7POGCiPGyhtJ3ZFP8iJ29TFl-RLcGBWX5qI4-ZcnCPcsY4zI?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258/1664",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/E_XVuM8mX1RuqBym2JEX4RBg_sj9KbTFBAi0qU4eBr2E3VCC0bwpWrgHqBOaWsKGTf4-DBseuZJGvsCVBnzLjxqgq7rAb_93zkZ-?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-04-29T13:58:31.855081+00:00",
                "default_to_fiat": false,
                "description": "Otherdeed is the key to claiming land in Otherside. Each have a unique blend of environment and sediment — some with resources, some home to powerful artifacts. And on a very few, a Koda roams.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": "https://discord.gg/the-otherside",
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "https://otherside.xyz",
                "featured": false,
                "featured_image_url": null,
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/yIm-M5-BpSDdTEIJRt5D6xphizhIdozXjqSITgK4phWq7MmAU3qE7Nw7POGCiPGyhtJ3ZFP8iJ29TFl-RLcGBWX5qI4-ZcnCPcsY4zI?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Otherdeed for Otherside",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a",
                "require_email": false,
                "short_description": null,
                "slug": "otherdeed",
                "telegram_url": null,
                "twitter_username": "othersidemeta",
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x37ceb4ba093d40234c6fb312d9791b67c04ef49a": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "https://api.otherside.xyz/lands/1664",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.409478",
        "closing_date": "2023-03-22T14:41:24",
        "listing_time": 1679494894,
        "expiration_time": 1679496084,
        "order_hash": "0x31ee2d27df9bb5f454bd240fbec7aa026631fb3f6ea5b155cc2e6e4fdaaf0c7d",
        "protocol_data": {
          "parameters": {
            "offerer": "0x07107458118e687f7f0b7fea86716d4b7cdb3dea",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "3659000000000000000",
                "endAmount": "3659000000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x4b15a9c28034dC83db40CD810001427d3BD7163D",
                "identifierOrCriteria": "25324",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x07107458118E687f7f0b7feA86716D4B7cDB3DEA"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "91475000000000000",
                "endAmount": "91475000000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "182950000000000000",
                "endAmount": "182950000000000000",
                "recipient": "0xA858DDc0445d8131daC4d1DE01f834ffcbA52Ef1"
              }
            ],
            "startTime": "1679494894",
            "endTime": "1679496084",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x35db61bdff3b8430c726f61a2f8ac463",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": "0x4266abdb5b9d7c7917e794b91699444e5"
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "3659000000000000000",
        "maker": {
          "user": 38861669,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/5.png",
          "address": "0x07107458118e687f7f0b7fea86716d4b7cdb3dea",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 35330734,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/32.png",
              "address": "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1",
              "config": "verified"
            },
            "basis_points": "500"
          },
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3Mg",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 1111064499,
              "token_id": "25324",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gcs/files/bc83bb00f35fa4b2dc97cdfa0b2c534e.jpg?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gcs/files/bc83bb00f35fa4b2dc97cdfa0b2c534e.jpg?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gcs/files/bc83bb00f35fa4b2dc97cdfa0b2c534e.jpg?w=500&auto=format",
              "image_original_url": "https://media.mdvmm.xyz/hvmtl/25324.jpg",
              "animation_url": null,
              "animation_original_url": null,
              "name": null,
              "description": "HV-MTL is a dynamic NFT collection consisting of mechs summoned through a space-time rift that has opened up outside the Bored Ape Yacht Club. Every HV (pronounced: Heavy) starts as a Core. Once unlocked, each Core transforms into a one-of-a-kind mech designed to evolve in the right environment.",
              "external_link": null,
              "asset_contract": {
                "address": "0x4b15a9c28034dc83db40cd810001427d3bd7163d",
                "asset_contract_type": "non-fungible",
                "created_date": "2023-03-15T07:50:37.643953",
                "name": "HV-MTL",
                "nft_version": null,
                "opensea_version": null,
                "owner": 2264562856,
                "schema_name": "ERC721",
                "symbol": "HV-MTL",
                "total_supply": "16232",
                "description": "The HV-MTL (Heavy Metal) collection is made up of 30,000 Mechs derived from 8 different Power Source types. Beginning March 15, 2023, eligible Sewer Passes can be burned to summon a Power Source that will reveal an Evo 1 Mech. Evo 1 holders can participate in future minigame sets with their Evo 1s to unlock additional HV-MTL evolution stages.",
                "external_link": "https://mdvmm.xyz/",
                "image_url": "https://i.seadn.io/gcs/files/82a7f92df6d60e41327b69cdafea8831.jpg?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 500,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 500,
                "payout_address": "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x4b15a9c28034dc83db40cd810001427d3bd7163d/25324",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/c0a2753ba06416327a18b8a76d8c2afc.gif?w=500&auto=format",
                "chat_url": null,
                "created_date": "2023-03-15T21:30:46.143993+00:00",
                "default_to_fiat": false,
                "description": "The HV-MTL (Heavy Metal) collection is made up of 30,000 Mechs derived from 8 different Power Source types. Beginning March 15, 2023, eligible Sewer Passes can be burned to summon a Power Source that will reveal an Evo 1 Mech. Evo 1 holders can participate in future minigame sets with their Evo 1s to unlock additional HV-MTL evolution stages.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "500",
                "discord_url": "https://discord.gg/bayc",
                "display_data": {
                  "card_display_style": "cover",
                  "images": null
                },
                "external_url": "https://mdvmm.xyz/",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/c3e23f87e1f8cb30837ec3ac3d9db808.png?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gcs/files/82a7f92df6d60e41327b69cdafea8831.jpg?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/c3e23f87e1f8cb30837ec3ac3d9db808.png?w=500&auto=format",
                "medium_username": null,
                "name": "HV-MTL",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1",
                "require_email": false,
                "short_description": null,
                "slug": "hv-mtl",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0xa858ddc0445d8131dac4d1de01f834ffcba52ef1": 500
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": true
              },
              "decimals": null,
              "token_metadata": "https://api.mdvmm.xyz/hvmtl/25324",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.397258",
        "closing_date": "2023-03-22T19:20:52",
        "listing_time": 1679494864,
        "expiration_time": 1679512852,
        "order_hash": "0x384c02a274264038ea2781f6f9d881537a31cc54beef9696c387c57b108bccf5",
        "protocol_data": {
          "parameters": {
            "offerer": "0xb8c62f517f40ee5dc682d533ead366b456789ffa",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "328000000000000000",
                "endAmount": "328000000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x932F97A8Fd6536d868f209B14E66d0d984fE1606",
                "identifierOrCriteria": "7467",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0xb8c62F517f40eE5dc682D533eAd366B456789FFa"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "8200000000000000",
                "endAmount": "8200000000000000",
                "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "24600000000000000",
                "endAmount": "24600000000000000",
                "recipient": "0x9841755Ce6fa2C179178eB0d4FA0fA2dCc063D93"
              }
            ],
            "startTime": "1679494864",
            "endTime": "1679512852",
            "orderType": 1,
            "zone": "0x0000000000000000000000000000000000000000",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0x749efe548b01f89a5b830c38987420f9",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 3,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "328000000000000000",
        "maker": {
          "user": 38607603,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/24.png",
          "address": "0xb8c62f517f40ee5dc682d533ead366b456789ffa",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": null,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/29.png",
              "address": "0x0000a26b00c1f0df003000390027140000faa719",
              "config": ""
            },
            "basis_points": "250"
          },
          {
            "account": {
              "user": 38449705,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/24.png",
              "address": "0x9841755ce6fa2c179178eb0d4fa0fa2dcc063d93",
              "config": ""
            },
            "basis_points": "750"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3MQ",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 721597457,
              "token_id": "7467",
              "num_sales": 0,
              "background_color": null,
              "image_url": "https://i.seadn.io/gae/yKG99vF_DYrR9o2j-d00clOxCcDHiBu4W8K9rdxGCjpZSZ4DXzIgu-O3wbVf0HJ178HAN4ozfkRR99VD78Zi0JwYy4DrNQ0GZRFLB3M?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/yKG99vF_DYrR9o2j-d00clOxCcDHiBu4W8K9rdxGCjpZSZ4DXzIgu-O3wbVf0HJ178HAN4ozfkRR99VD78Zi0JwYy4DrNQ0GZRFLB3M?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/yKG99vF_DYrR9o2j-d00clOxCcDHiBu4W8K9rdxGCjpZSZ4DXzIgu-O3wbVf0HJ178HAN4ozfkRR99VD78Zi0JwYy4DrNQ0GZRFLB3M?w=500&auto=format",
              "image_original_url": "https://xana-land.s3.eu-west-1.amazonaws.com/land-common-2main.mp4",
              "animation_url": "https://openseauserdata.com/files/e26c9cee9085837c9830fbe6ab957ad6.mp4",
              "animation_original_url": "https://xana-land.s3.eu-west-1.amazonaws.com/land-common-2main.mp4",
              "name": "XANA: LAND Common 2x2 (-81, 97)",
              "description": "LAND is the 3D Virtual space within the XANA metaverse.",
              "external_link": null,
              "asset_contract": {
                "address": "0x932f97a8fd6536d868f209b14e66d0d984fe1606",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-10-13T13:18:25.502511",
                "name": "XANA: LAND",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": 456143133,
                "schema_name": "ERC721",
                "symbol": "XLD",
                "total_supply": "0",
                "description": "XANA: LAND is the 3D Virtual space within the XANA metaverse. LAND is designed to be 75k LAND, divided into parcels identified by cartesian coordinates (x,y).LAND NFT Owner immutably owns these parcels. Valuable acquisitions by global top IPs and brands.Fully user-generated worlds. This will be one of the most epic lands of web 3.0.",
                "external_link": "https://land.xana.net",
                "image_url": "https://i.seadn.io/gcs/files/3c76c3cce9001bb1a6f8cae85f48b3b9.jpg?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 750,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 750,
                "payout_address": "0x9841755ce6fa2c179178eb0d4fa0fa2dcc063d93"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x932f97a8fd6536d868f209b14e66d0d984fe1606/7467",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gcs/files/951ad2581804c6b98f3f8ee3af3ca548.png?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-10-14T08:35:22.242291+00:00",
                "default_to_fiat": false,
                "description": "XANA: LAND is the 3D Virtual space within the XANA metaverse. LAND is designed to be 75k LAND, divided into parcels identified by cartesian coordinates (x,y).LAND NFT Owner immutably owns these parcels. Valuable acquisitions by global top IPs and brands.Fully user-generated worlds. This will be one of the most epic lands of web 3.0.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "750",
                "discord_url": "https://discord.gg/xana",
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "https://land.xana.net",
                "featured": false,
                "featured_image_url": "https://i.seadn.io/gcs/files/74d0e33257ca262c31f17c3c3c17d91c.jpg?w=500&auto=format",
                "hidden": false,
                "safelist_request_status": "approved",
                "image_url": "https://i.seadn.io/gcs/files/3c76c3cce9001bb1a6f8cae85f48b3b9.jpg?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": "https://i.seadn.io/gcs/files/74d0e33257ca262c31f17c3c3c17d91c.jpg?w=500&auto=format",
                "medium_username": null,
                "name": "XANA:  LAND",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x9841755ce6fa2c179178eb0d4fa0fa2dcc063d93",
                "require_email": false,
                "short_description": null,
                "slug": "xanaland",
                "telegram_url": "https://t.me/xana_english",
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x9841755ce6fa2c179178eb0d4fa0fa2dcc063d93": 750
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": null,
              "token_metadata": "https://prod-backend.xanalia.com/blind-box/get-nft-meta-info?chain=1&collection=0x932f97a8fd6536d868f209b14e66d0d984fe1606&tokenId=7467",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      },
      {
        "created_date": "2023-03-22T14:21:42.391265",
        "closing_date": "2023-03-22T20:21:41",
        "listing_time": 1679494901,
        "expiration_time": 1679516501,
        "order_hash": "0x00d74d20f81cf254fdffeae356d0092e42332fa65c0e4c4413375d0cf2d9284f",
        "protocol_data": {
          "parameters": {
            "offerer": "0x7fc8146ce04fa16e2e11819b416a1b0425db4d8f",
            "offer": [
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "206500000000000000",
                "endAmount": "206500000000000000"
              }
            ],
            "consideration": [
              {
                "itemType": 2,
                "token": "0x06911466341299D79E9E1368A016C73d009691cc",
                "identifierOrCriteria": "7270",
                "startAmount": "1",
                "endAmount": "1",
                "recipient": "0x7fc8146cE04FA16E2e11819b416A1b0425DB4D8F"
              },
              {
                "itemType": 1,
                "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "identifierOrCriteria": "0",
                "startAmount": "1032500000000000",
                "endAmount": "1032500000000000",
                "recipient": "0x295990aC057a3a4b786102A3B61C84eFF764c033"
              }
            ],
            "startTime": "1679494901",
            "endTime": "1679516501",
            "orderType": 0,
            "zone": "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "salt": "0xc6563f6034108271",
            "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            "totalOriginalConsiderationItems": 2,
            "counter": 0
          },
          "signature": null
        },
        "protocol_address": "0x00000000000001ad428e4906ae43d8f9852d0dd6",
        "current_price": "206500000000000000",
        "maker": {
          "user": 38193760,
          "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/30.png",
          "address": "0x7fc8146ce04fa16e2e11819b416a1b0425db4d8f",
          "config": ""
        },
        "taker": null,
        "maker_fees": [],
        "taker_fees": [
          {
            "account": {
              "user": 38427455,
              "profile_img_url": "https://storage.googleapis.com/opensea-static/opensea-profile/7.png",
              "address": "0x295990ac057a3a4b786102a3b61c84eff764c033",
              "config": ""
            },
            "basis_points": "50"
          }
        ],
        "side": "bid",
        "order_type": "basic",
        "cancelled": false,
        "finalized": false,
        "marked_invalid": false,
        "remaining_quantity": 1,
        "relay_id": "T3JkZXJWMlR5cGU6ODU3NDcxNDA3MA",
        "criteria_proof": null,
        "maker_asset_bundle": {
          "assets": [
            {
              "id": 4645681,
              "token_id": "0",
              "num_sales": 29,
              "background_color": null,
              "image_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_preview_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_thumbnail_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "image_original_url": "https://openseauserdata.com/files/accae6b6fb3888cbff27a013729c22dc.svg",
              "animation_url": null,
              "animation_original_url": null,
              "name": "Wrapped Ether",
              "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
              "external_link": null,
              "asset_contract": {
                "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "asset_contract_type": "fungible",
                "created_date": "2019-08-02T23:41:09.632649",
                "name": "Wrapped Ether",
                "nft_version": null,
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC20",
                "symbol": "",
                "total_supply": null,
                "description": "This is the collection of owners of Wrapped Ether",
                "external_link": null,
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 0,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 50,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 50,
                "payout_address": null
              },
              "permalink": "https://opensea.io/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0",
              "collection": {
                "banner_image_url": null,
                "chat_url": null,
                "created_date": "2019-08-02T23:41:09.630891+00:00",
                "default_to_fiat": false,
                "description": "This is the collection of owners of Wrapped Ether",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "0",
                "discord_url": null,
                "display_data": {},
                "external_url": null,
                "featured": false,
                "featured_image_url": null,
                "hidden": true,
                "safelist_request_status": "not_requested",
                "image_url": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "Wrapped Ether",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 50,
                "payout_address": null,
                "require_email": false,
                "short_description": null,
                "slug": "wrapped-ether",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": null,
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {},
                  "opensea_fees": {
                    "0x0000a26b00c1f0df003000390027140000faa719": 50
                  }
                },
                "is_rarity_enabled": false,
                "is_creator_fees_enforced": false
              },
              "decimals": 18,
              "token_metadata": "",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        },
        "taker_asset_bundle": {
          "assets": [
            {
              "id": 374945669,
              "token_id": "7270",
              "num_sales": 0,
              "background_color": "ffffff",
              "image_url": "https://i.seadn.io/gae/A05-HN7BZwK-H0JmddWUUjU-6pOG-EMZNtNXs4DKHmEJksOqf-RNsY-9vUPzvcbETq6AhfWeYMAIc8aU_Rzfw6IAAd5-geWaj0E67A?w=500&auto=format",
              "image_preview_url": "https://i.seadn.io/gae/A05-HN7BZwK-H0JmddWUUjU-6pOG-EMZNtNXs4DKHmEJksOqf-RNsY-9vUPzvcbETq6AhfWeYMAIc8aU_Rzfw6IAAd5-geWaj0E67A?w=500&auto=format",
              "image_thumbnail_url": "https://i.seadn.io/gae/A05-HN7BZwK-H0JmddWUUjU-6pOG-EMZNtNXs4DKHmEJksOqf-RNsY-9vUPzvcbETq6AhfWeYMAIc8aU_Rzfw6IAAd5-geWaj0E67A?w=500&auto=format",
              "image_original_url": "https://res.cloudinary.com/nifty-gateway/image/upload/v1649189956/Abigail/FEWO/Paint/Paintstill/007270_paint_t8cycu.png",
              "animation_url": "https://openseauserdata.com/files/d7f3195b911674e1b74651741c587e00.mp4",
              "animation_original_url": "https://res.cloudinary.com/nifty-gateway/video/upload/v1649190156/Abigail/FEWO/Paint/Paint/007270_paint_dxdiyk.mp4",
              "name": "Paint Drop #7270 (1 Paint)",
              "description": "PAINT is the building block to all of life in FewoWorld. \"Paint Drops\" are non-fungible, and every \"Paint Drop\" is a unique, generative piece of art, that holds a unique amount of “Paint”. The only Paint available is what will be minted in the initial \"Paint Drop\", what will be airdropped to past Paint Party attendees, and what will eventually be \"mined\" at future paint parties.  Holders of “Paint Drops” will be able to eventually unlock or redeem things in FewoWorld, including Canvas, Fewos, and Fewo Fashion wearables. The more Paint in your “Paint Drop”, the more you’ll be able to unlock in FewoWorld.",
              "external_link": "https://niftygateway.com/#/",
              "asset_contract": {
                "address": "0x06911466341299d79e9e1368a016c73d009691cc",
                "asset_contract_type": "non-fungible",
                "created_date": "2022-04-01T16:10:01.656012",
                "name": "FewoWorld Paint",
                "nft_version": "3.0",
                "opensea_version": null,
                "owner": null,
                "schema_name": "ERC721",
                "symbol": "Paint",
                "total_supply": null,
                "description": "Welcome to FewoWorld, a universe created by FEWOCiOUS and the Web3 community. FewoWorld is the first generative art project from the mind of FEWOCiOUS. Unlike anything he has created before.",
                "external_link": "http://fewoworld.io",
                "image_url": "https://i.seadn.io/gae/bfpxZRxKsuxzNPpjwjAzADl16wxQfjSzQbQ4PMCnuWnNL5CQ-yvKqXQrG4mZeB63yY4UH9KA_lvN-GFGRSN8oqqMy7LdG3R_XL_c?w=500&auto=format",
                "default_to_fiat": false,
                "dev_buyer_fee_basis_points": 0,
                "dev_seller_fee_basis_points": 1000,
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": 0,
                "opensea_seller_fee_basis_points": 0,
                "buyer_fee_basis_points": 0,
                "seller_fee_basis_points": 1000,
                "payout_address": "0x295990ac057a3a4b786102a3b61c84eff764c033"
              },
              "permalink": "https://opensea.io/assets/ethereum/0x06911466341299d79e9e1368a016c73d009691cc/7270",
              "collection": {
                "banner_image_url": "https://i.seadn.io/gae/fVR32nzwAs6gjmXT3W_Lq48QEjrNIz2ZeGPyEqnrUYr0-qHoED39f7yG8NWOh8MeTxBXm0dY_wcmoqYnFlgsQQgJa8Ie1BfjLpwe7w?w=500&auto=format",
                "chat_url": null,
                "created_date": "2022-04-06T00:39:55.422789+00:00",
                "default_to_fiat": false,
                "description": "Welcome to FewoWorld, a universe created by FEWOCiOUS and the Web3 community. FewoWorld is the first generative art project from the mind of FEWOCiOUS. Unlike anything he has created before.",
                "dev_buyer_fee_basis_points": "0",
                "dev_seller_fee_basis_points": "1000",
                "discord_url": "https://discord.gg/wfHtcz5Pm5",
                "display_data": {
                  "card_display_style": "contain"
                },
                "external_url": "http://fewoworld.io",
                "featured": false,
                "featured_image_url": null,
                "hidden": false,
                "safelist_request_status": "verified",
                "image_url": "https://i.seadn.io/gae/bfpxZRxKsuxzNPpjwjAzADl16wxQfjSzQbQ4PMCnuWnNL5CQ-yvKqXQrG4mZeB63yY4UH9KA_lvN-GFGRSN8oqqMy7LdG3R_XL_c?w=500&auto=format",
                "is_subject_to_whitelist": false,
                "large_image_url": null,
                "medium_username": null,
                "name": "FEWOCiOUS x FewoWorld: Paint",
                "only_proxied_transfers": false,
                "opensea_buyer_fee_basis_points": "0",
                "opensea_seller_fee_basis_points": 0,
                "payout_address": "0x295990ac057a3a4b786102a3b61c84eff764c033",
                "require_email": false,
                "short_description": null,
                "slug": "fewoworld-paint",
                "telegram_url": null,
                "twitter_username": null,
                "instagram_username": "fewocious",
                "wiki_url": null,
                "is_nsfw": false,
                "fees": {
                  "seller_fees": {
                    "0x295990ac057a3a4b786102a3b61c84eff764c033": 1000
                  },
                  "opensea_fees": {}
                },
                "is_rarity_enabled": true,
                "is_creator_fees_enforced": false
              },
              "decimals": 0,
              "token_metadata": "https://api.niftygateway.com/paint/7270",
              "is_nsfw": false,
              "owner": null
            }
          ],
          "maker": null,
          "slug": null,
          "name": null,
          "description": null,
          "external_link": null,
          "asset_contract": null,
          "permalink": null,
          "seaport_sell_orders": null
        }
      }
    ]
  }

  return osBids.orders
}

//////// might be used in the future
// const setNFTApprovalForAll = async (nftContractAddr, signer, conduitAddr) => {
// 	const nftContractABI = require("./abi/NFT.json");
// 	const nftContract = new ethers.Contract(nftContractAddr, nftContractABI, signer);
// 	const execData = {
// 			to: [],
// 			data: [],
// 			value: [],
// 	};
// 	const tx = await nftContract.populateTransaction.setApprovalForAll(conduitAddr, true);
// 	execData.to.push(nftContractAddr);
// 	execData.value.push(0);
// 	execData.data.push(tx.data);
// 	await execContract.exec(execData, {
// 			gasLimit: 100000,
// 	});
// };

// const conduit = async (signer, key) => {
// 	const conduitContractAddr = "0x00000000f9490004c11cef243f5400493c00ad63";
// 	const conduitContractABI = require("./abi/conduit.json");
// 	const conduitContract = new ethers.Contract(conduitContractAddr, conduitContractABI, signer);
// 	let r = await conduitContract.getConduit(key);
// 	return r?.conduit;
// };

// const getSellPayload = async (orderData, myAccount) => {
// 	const order = orderData.protocol_data;
// 	const price = orderData.current_price;

// 	const conduitAddr = await conduit(myAccount, order.parameters.conduitKey);

// 	// Set NFT transfer approval for conduit
// 	await setNFTApprovalForAll(openseaCollectionAddr, myAccount, conduitAddr);
// 	console.log(`getSellPayload: set all nft approval to conduit ${conduitAddr}`);

// 	await execContract.approveWETH(conduitAddr, price);
// 	console.log(
// 			`getSellPayload: Successfully approved ${price} WETH via Exec contract to conduit`
// 	);

// 	// fulfill order
// 	const seaportContract = new ethers.Contract(seaportContractAddr, seaportContractABI, myAccount);
// 	const tx = await seaportContract.populateTransaction.fulfillOrder(
// 			order,
// 			order.parameters.conduitKey,
// 			{
// 					value: price,
// 					gasLimit: 1100000,
// 			}
// 	);

// 	return tx;
// };

const getBuyBlurData = async (addr_nft, id_nft) => {
  var url = `http://127.0.0.1:3000/v1/collections/${addr_nft}/tokens/${id_nft}`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', db.authTkn);
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
  // return data;

	// console.log('data', data)
	if (data.statusCode == 400) return false;
	return data
}

const getBuyOrderBlur = async buyData => { //todo, format it to apiCall()
  var url = `http://127.0.0.1:3000/v1/buy/${buyData.contractAddress}?fulldata=true`;
  var myHeaders = new fetch.Headers();
  myHeaders.append('authToken', db.authTkn);
  myHeaders.append('content-type', 'application/json');
  myHeaders.append('walletAddress', wallet.address);


  //headers
  var raw = JSON.stringify({
    tokenPrices: [
      {
        isSuspicious: false,
        price: {
          amount: buyData.token.price.amount,
          unit: buyData.token.price.unit,
        },
        tokenId: buyData.token.tokenId,
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
}

const getTxBuyBlur = async buyOrderBlur => {
	const data = buyOrderBlur.buys[0]
  // console.log('buyOrderBlur', buyOrderBlur)

	return await wallet.signTransaction({
		type: 2,
		chainId: 1,
		to: data.txnData.to,
		data: data.txnData.data,
		value: data.txnData.value.hex,
		gasLimit: data.gasEstimate,
		maxFeePerGas: db.fee.maxFeePerGas,
		maxPriorityFeePerGas: db.fee.maxPriorityFeePerGas,
		nonce: (await provider.getTransactionCount(wallet.address))
	}) // return (await signer.signTransaction(unsignedTx).then(serializeTransaction(unsignedTx)));
}

const getTxSellOs = async sellOrderOs => {
  //todo
  const txApproveWETH = '0x'
  const txApproveNFT = '0x'
  const txSellOs = '0x'
  return [
    txApproveWETH,
    txApproveNFT,
    txSellOs
  ]
}

const __post = async (body, url) => {
  const signature = `${wallet.address}:${(await wallet.signMessage(utils.id(body)))}`
  const options = {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      "X-Flashbots-Signature": signature
    }
  };

  fetch(url, options)
    .then(response => response.json())
    .then(response => console.log(response)) //for testing callBundle
    // .then(response => response)
    .catch(err => console.error(err));
}

const _sendBundle = async (bundle, url) => {
  for(let i=1;i<bundle_max_block;i++){
    const blockToSend = db.var.blockNum+i
    const blockNumHash = '0x'+blockToSend.toString(16)

    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_sendBundle",
      params: [{
        txs: bundle,
        blockNumber: blockNumHash
      }]
    })

    await __post(body, url)
  }
}

const _callBundle = async (bundle, url) => { //test bundle execution
  const blockToSend = db.blockNum+1
  const blockNumHash = '0x'+blockToSend.toString(16)

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_callBundle",
    params: [{
      txs: bundle,
      blockNumber: blockNumHash,
      stateBlockNumber: "latest"
    }]
  })

  await __post(body, url) //todo await apiCall({body, url})
}

const send = async bundle => {
  console.log('\n\nSent.', bundle);
  return
  for (const [builder, url] of Object.entries(db.blockBuilders)) {
    console.log(`Sending bundle from block ${blockNum} to ${builder}`)

    if(builder=="flashbots") await _callBundle(bundle, url) //test
    return
    await _sendBundle(bundle, url)
  }
  console.log('Sent.'); return
}

;(async () => {
	await setup()

  const osBids = await getOsBids() //todo in interval

	for (const order of osBids) {
    //extract OS trade data
    const sellOrderOs = order.protocol_data
    const sellOsPrice = BigInt(order.current_price)
    var addr_nft = sellOrderOs.parameters.consideration[0].token
    var id_nft = sellOrderOs.parameters.consideration[0].identifierOrCriteria


    /// overwrite 4test ///
    var addr_nft = "0xe75512aa3bec8f00434bbd6ad8b0a3fbff100ad6"
    var id_nft = "5171"
    //////////////////////


		var buyBlurData = await getBuyBlurData(addr_nft, id_nft)
    if(!buyBlurData){
			console.log('NFT on !exist on Blur')
			continue
		}

		console.log('\nAsset exists on 2x DEXs')
		// console.log('buyBlurData', buyBlurData)
		// console.log('sellOsPrice', sellOsPrice)

		const buyBlurPrice = BigInt(buyBlurData.token.price.amount*10**18)
		if(buyBlurPrice > sellOsPrice) { //4test
			console.log('Price 2high')
			continue //no arb
		}

		console.log('\nFound Potential Arb')
    // sign txs
    const buyOrderBlur = await getBuyOrderBlur(buyBlurData)
		const txBuyBlur = await getTxBuyBlur(buyOrderBlur)
    const [txApproveNFT, txApproveWETH, txSellOs] = await getTxSellOs(sellOrderOs) //todo (need approvals so multiple txs)

    //pack into bundle & send to block builders
		const bundle = [
      txBuyBlur,
      txApproveWETH, //perhaps via contract from there to exec in single tx (2x tx in total)
      txApproveNFT,
      txSellOs,
    ]

    await send(bundle)
    process.exit(0)
  }
})();