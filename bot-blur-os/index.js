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