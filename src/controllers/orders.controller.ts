import { inject } from "@loopback/core";
import {
  param,
  get,
  Request,
  response,
  ResponseObject,
  RestBindings,
} from "@loopback/rest";
const { XMLHttpRequest } = require("xmlhttprequest");
const { urls } = require("../customs/constants").default;

const RESPONSE: ResponseObject = {
  description: "Response",
  content: {
    "application/json": {
      schema: {
        type: "object",
        title: "Info",
        properties: {},
      },
    },
  },
};
export class OrdersController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  // Map to `GET /v1/{collection}/{tokenID}/sell`
  @get("/v1/{collection}/{tokenID}/sell")
  @response(200, RESPONSE)
  async getSellOrderPayload(
    @param.path.string("collection") collection: string,
    @param.path.string("tokenID") tokenID: string,
    @param.query.string("chain") chain: string
  ): Promise<any> {
    const { authtoken, walletaddress } = this.req.headers;
    console.log("walletaddress", walletaddress);
    console.log("authtoken", authtoken);

    chain = chain ? chain : "ETHEREUM";
    const data = await globalThis.page.evaluate(
      async (
        chain: string,
        tokenID: string,
        assetContractAddress: string,
        authtoken: string,
        walletaddress: string
      ) => {
        var data = JSON.stringify({
          id: "EventHistoryQuery",
          query:
            "query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $chains: [ChainScalar!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 16\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n  $stringTraits: [TraitInputType!]\n  $isRarityExpansionEnabled: Boolean!\n  $eventTimestamp_Gt: DateTime\n  $rarityFilter: RarityFilterType\n) {\n  ...EventHistory_data_2Weyxc\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  config\n  isCompromised\n  user {\n    publicUsername\n    id\n  }\n  displayName\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment CollectionCell_collection on CollectionType {\n  name\n  imageUrl\n  isVerified\n  ...collection_url\n}\n\nfragment CollectionCell_trait on TraitType {\n  traitType\n  value\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment EventHistory_data_2Weyxc on Query {\n  eventActivity(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true, stringTraits: $stringTraits, eventTimestamp_Gt: $eventTimestamp_Gt, rarityFilter: $rarityFilter) {\n    edges {\n      node {\n        collection {\n          ...CollectionCell_collection\n          id\n        }\n        traitCriteria {\n          ...CollectionCell_trait\n          id\n        }\n        itemQuantity\n        item @include(if: $showAll) {\n          __typename\n          relayId\n          verificationStatus\n          ...ItemCell_data\n          ...item_url\n          ...PortfolioTableItemCellTooltip_item\n          ... on AssetType {\n            defaultRarityData @include(if: $isRarityExpansionEnabled) {\n              rank\n              id\n            }\n            collection {\n              ...CollectionLink_collection\n              id\n            }\n            assetContract {\n              ...CollectionLink_assetContract\n              id\n            }\n          }\n          ... on AssetBundleType {\n            bundleCollection: collection {\n              ...CollectionLink_collection\n              id\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        relayId\n        eventTimestamp\n        eventType\n        orderStatus\n        customEventName\n        ...utilsAssetEventLabel\n        creatorFee {\n          unit\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        perUnitPrice {\n          unit\n          eth\n          usd\n        }\n        endingPriceType {\n          unit\n        }\n        priceType {\n          unit\n        }\n        payment {\n          ...TokenPricePayment\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        sellOrder {\n          taker {\n            __typename\n            id\n          }\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ItemCell_data on ItemType {\n  __isItemType: __typename\n  __typename\n  displayName\n  ...item_url\n  ...PortfolioTableItemCellTooltip_item\n  ... on AssetType {\n    ...AssetMedia_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            ...AssetMedia_asset\n            id\n          }\n          relayId\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment PortfolioTableItemCellTooltip_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ...AssetMedia_asset\n  ...PortfolioTableTraitTable_asset\n  ...asset_url\n}\n\nfragment PortfolioTableTraitTable_asset on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  isCurrentlyFungible\n  tokenId\n  ...asset_url\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment accounts_url on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment item_url on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    ...asset_url\n  }\n  ... on AssetBundleType {\n    ...bundle_url\n  }\n}\n\nfragment utilsAssetEventLabel on AssetEventType {\n  isMint\n  isAirdrop\n  eventType\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n}\n",
          variables: {
            archetype: {
              chain: chain,
              tokenId: tokenID,
              assetContractAddress: assetContractAddress,
            },
            bundle: null,
            collections: null,
            categories: null,
            chains: null,
            eventTypes: ["AUCTION_SUCCESSFUL", "ASSET_TRANSFER"],
            cursor: null,
            count: 16,
            showAll: true,
            identity: null,
            stringTraits: null,
            isRarityExpansionEnabled: true,
            eventTimestamp_Gt: null,
            rarityFilter: null,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", "JWT " + authtoken);
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "42ce9f695ddfae93905867a42c53ec4180c663ad"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "81f8a6c4bffe8301df2537b52126cc38309a2dd08b5b4460c84c4fc326293ba4"
        );
        xhr.setRequestHeader("x-viewer-address", walletaddress);

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      chain,
      tokenID,
      collection,
      authtoken,
      walletaddress
    );
    const assetID = data.data.eventActivity.edges[0].node.item.relayId;
    console.log("assetID: " + assetID);

    const acceptOfferQuery = await globalThis.page.evaluate(
      async (assetID: string, authtoken: string, walletaddress: string) => {
        var data = JSON.stringify({
          id: "BulkAcceptOffersModalContentQuery",
          query:
            "query BulkAcceptOffersModalContentQuery(\n  $assetIds: [AssetRelayID!]!\n  $bundleIds: [AssetBundleRelayID!]!\n) {\n  blockchain {\n    bulkAcceptOffers(offersToAccept: []) {\n      bestOffers(assets: $assetIds, bundles: $bundleIds, forTaker: {}) {\n        ...BulkAcceptOffersModalContent_bestOffers\n      }\n    }\n  }\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n  collection {\n    ...useIsRarityEnabled_collection\n    id\n  }\n}\n\nfragment AssetMediaContainer_asset_1bRsaP on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n  collection {\n    ...useIsRarityEnabled_collection\n    id\n  }\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_1bRsaP\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment BulkAcceptOffersModalContent_bestOffers on BulkAcceptOffersBestBidsType {\n  bestBid {\n    orderType\n    relayId\n    ...useTotalItems_orders\n    ...useTotalOfferPrice_orders\n    ...OfferList_orders\n    ...readOrderFees_order\n    ...ServiceFeeText_orders\n    id\n  }\n  item {\n    __typename\n    chain {\n      identifier\n    }\n    relayId\n    ... on AssetType {\n      acceptOfferDisabled {\n        reason\n      }\n    }\n    ...OfferList_items\n    ...readOptionalCreatorFees_item\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment OfferListItem_item on ItemType {\n  __isItemType: __typename\n  relayId\n  __typename\n  displayName\n  ... on AssetType {\n    acceptOfferDisabled {\n      ...useAcceptOfferDisabledReason_data\n    }\n    assetContract {\n      address\n      ...CollectionLink_assetContract\n      id\n    }\n    chain {\n      identifier\n    }\n    collection {\n      ...CollectionLink_collection\n      id\n    }\n    isCurrentlyFungible\n    tokenId\n    ...AssetMedia_asset\n    ...asset_url\n    ...useItemFees_item\n    ...useBulkAcceptOfferQuantityPicker_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            displayName\n            relayId\n            assetContract {\n              ...CollectionLink_assetContract\n              id\n            }\n            collection {\n              ...CollectionLink_collection\n              id\n            }\n            ...StackedAssetMedia_assets\n            ...AssetMedia_asset\n            ...asset_url\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n  ...readOptionalCreatorFees_item\n}\n\nfragment OfferListItem_order on OrderV2Type {\n  relayId\n  ...readOrderFees_order\n  ...useTotalOfferPrice_orders\n}\n\nfragment OfferList_items on ItemType {\n  __isItemType: __typename\n  relayId\n  ...OfferListItem_item\n}\n\nfragment OfferList_orders on OrderV2Type {\n  ...OfferListItem_order\n}\n\nfragment ServiceFeeText_orders on OrderV2Type {\n  ...readOrderFees_order\n}\n\nfragment StackedAssetMedia_assets on AssetType {\n  relayId\n  ...AssetMedia_asset\n  collection {\n    logo\n    id\n  }\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment readOptionalCreatorFees_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    collection {\n      isCreatorFeesEnforced\n      totalCreatorFeeBasisPoints\n      id\n    }\n  }\n}\n\nfragment readOrderFees_order on OrderV2Type {\n  makerFees(first: 10) {\n    edges {\n      node {\n        basisPoints\n        isOpenseaFee\n        id\n      }\n    }\n  }\n  takerFees(first: 10) {\n    edges {\n      node {\n        basisPoints\n        isOpenseaFee\n        id\n      }\n    }\n  }\n}\n\nfragment useAcceptOfferDisabledReason_data on AcceptOfferDisabledType {\n  until\n}\n\nfragment useBulkAcceptOfferQuantityPicker_asset on AssetType {\n  relayId\n  ownedQuantity(identity: {})\n}\n\nfragment useIsRarityEnabled_collection on CollectionType {\n  slug\n  enabledRarities\n}\n\nfragment useItemFees_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    totalCreatorFee\n    collection {\n      openseaSellerFeeBasisPoints\n      isCreatorFeesEnforced\n      id\n    }\n  }\n  ... on AssetBundleType {\n    bundleCollection: collection {\n      openseaSellerFeeBasisPoints\n      totalCreatorFeeBasisPoints\n      isCreatorFeesEnforced\n      id\n    }\n  }\n}\n\nfragment useTotalItems_orders on OrderV2Type {\n  item {\n    __typename\n    relayId\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment useTotalOfferPrice_orders on OrderV2Type {\n  relayId\n  perUnitPriceType {\n    usd\n    unit\n  }\n  payment {\n    symbol\n    ...TokenPricePayment\n    id\n  }\n  ...readOrderFees_order\n}\n",
          variables: {
            assetIds: [assetID],
            bundleIds: [],
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", "JWT " + authtoken);
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "3628e518a73d9a138760bf520fdcc1ec0e726539"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "6130ea49b36c42acd22319b78a8bc96ee8b97097f544adbb633d158ed7afde1e"
        );
        xhr.setRequestHeader("x-viewer-address", walletaddress);

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      assetID,
      authtoken,
      walletaddress
    );

    const orderID =
      acceptOfferQuery.data.blockchain.bulkAcceptOffers.bestOffers[0].bestBid
        .id;
    console.log("orderID: ", orderID);
    const totalCreatorFee =
      acceptOfferQuery?.data?.blockchain?.bulkAcceptOffers?.bestOffers[0]?.item
        ?.totalCreatorFee;

    const basisPoints =
      acceptOfferQuery?.data?.blockchain?.bulkAcceptOffers?.bestOffers[0]
        ?.bestBid?.takerFees?.edges[0]?.node?.basisPoints;

    let optionalCreatorFeeBasisPoints = 0;
    if (totalCreatorFee && basisPoints) {
      optionalCreatorFeeBasisPoints = totalCreatorFee - basisPoints;
    }

    const response = await globalThis.page.evaluate(
      async (
        orderID: string,
        assetID: string,
        optionalCreatorFeeBasisPoints: string,
        authtoken: string,
        walletaddress: string
      ) => {
        var data = JSON.stringify({
          id: "BulkAcceptOffersActionModalQuery",
          query:
            "query BulkAcceptOffersActionModalQuery(\n  $offersToAccept: [OfferToAcceptInputType!]!\n  $maxQuantityToFill: BigIntScalar\n) {\n  blockchain {\n    bulkAcceptOffers(offersToAccept: $offersToAccept, maxQuantityToFill: $maxQuantityToFill) {\n      actions {\n        __typename\n        ...BlockchainActionList_data\n      }\n    }\n  }\n}\n\nfragment AskForDepositAction_data on AskForDepositType {\n  asset {\n    chain {\n      identifier\n    }\n    decimals\n    symbol\n    usdSpotPrice\n    id\n  }\n  minQuantity\n}\n\nfragment AskForSwapAction_data on AskForSwapType {\n  __typename\n  fromAsset {\n    chain {\n      identifier\n    }\n    decimals\n    symbol\n    id\n  }\n  toAsset {\n    chain {\n      identifier\n    }\n    symbol\n    id\n  }\n  minQuantity\n  maxQuantity\n  ...useHandleBlockchainActions_ask_for_asset_swap\n}\n\nfragment AssetApprovalAction_data on AssetApprovalActionType {\n  __typename\n  asset {\n    chain {\n      identifier\n    }\n    ...StackedAssetMedia_assets\n    assetContract {\n      ...CollectionLink_assetContract\n      id\n    }\n    collection {\n      __typename\n      ...CollectionLink_collection\n      id\n    }\n    id\n  }\n  ...useHandleBlockchainActions_approve_asset\n}\n\nfragment AssetFreezeMetadataAction_data on AssetFreezeMetadataActionType {\n  __typename\n  ...useHandleBlockchainActions_freeze_asset_metadata\n}\n\nfragment AssetItem_asset on AssetType {\n  chain {\n    identifier\n  }\n  displayName\n  relayId\n  collection {\n    name\n    id\n  }\n  ...StackedAssetMedia_assets\n}\n\nfragment AssetItem_bundle_asset on AssetType {\n  chain {\n    identifier\n  }\n  relayId\n  ...StackedAssetMedia_assets\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n  collection {\n    ...useIsRarityEnabled_collection\n    id\n  }\n}\n\nfragment AssetMediaContainer_asset_1bRsaP on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n  collection {\n    ...useIsRarityEnabled_collection\n    id\n  }\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_1bRsaP\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment AssetSwapAction_data on AssetSwapActionType {\n  __typename\n  ...useHandleBlockchainActions_swap_asset\n}\n\nfragment AssetTransferAction_data on AssetTransferActionType {\n  __typename\n  ...useHandleBlockchainActions_transfer_asset\n}\n\nfragment BlockchainActionList_data on BlockchainActionType {\n  __isBlockchainActionType: __typename\n  __typename\n  ... on AssetApprovalActionType {\n    ...AssetApprovalAction_data\n  }\n  ... on AskForDepositType {\n    __typename\n    ...AskForDepositAction_data\n  }\n  ... on AskForSwapType {\n    __typename\n    ...AskForSwapAction_data\n  }\n  ... on AssetFreezeMetadataActionType {\n    __typename\n    ...AssetFreezeMetadataAction_data\n  }\n  ... on AssetSwapActionType {\n    __typename\n    ...AssetSwapAction_data\n  }\n  ... on AssetTransferActionType {\n    __typename\n    ...AssetTransferAction_data\n  }\n  ... on CreateOrderActionType {\n    __typename\n    ...CreateOrderAction_data\n  }\n  ... on CreateBulkOrderActionType {\n    __typename\n    ...CreateBulkOrderAction_data\n  }\n  ... on CancelOrderActionType {\n    __typename\n    ...CancelOrderAction_data\n  }\n  ... on FulfillOrderActionType {\n    __typename\n    ...FulfillOrderAction_data\n  }\n  ... on BulkAcceptOffersActionType {\n    __typename\n    ...BulkAcceptOffersAction_data\n  }\n  ... on BulkFulfillOrdersActionType {\n    __typename\n    ...BulkFulfillOrdersAction_data\n  }\n  ... on PaymentAssetApprovalActionType {\n    __typename\n    ...PaymentAssetApprovalAction_data\n  }\n  ... on WaitForBalanceActionType {\n    __typename\n    ...WaitForBalanceAction_data\n  }\n  ... on MintActionType {\n    __typename\n    ...MintAction_data\n  }\n  ... on DropContractDeployActionType {\n    __typename\n    ...DeployContractAction_data\n  }\n  ... on DropMechanicsUpdateActionType {\n    __typename\n    ...UpdateDropMechanicsAction_data\n  }\n  ... on SetCreatorFeesActionType {\n    __typename\n    ...SetCreatorFeesAction_data\n  }\n}\n\nfragment BulkAcceptOffersAction_data on BulkAcceptOffersActionType {\n  __typename\n  maxQuantityToFill\n  offersToAccept {\n    itemFillAmount\n    orderData {\n      chain {\n        identifier\n      }\n      item {\n        __typename\n        ... on AssetQuantityDataType {\n          asset {\n            ...StackedAssetMedia_assets\n            id\n          }\n        }\n        ... on AssetBundleType {\n          assetQuantities(first: 30) {\n            edges {\n              node {\n                asset {\n                  ...StackedAssetMedia_assets\n                  id\n                }\n                id\n              }\n            }\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n      ...useTotalItems_ordersData\n    }\n    criteriaAsset {\n      relayId\n      ...StackedAssetMedia_assets\n      id\n    }\n    ...useTotalPriceOfferDataToAccept_offersToAccept\n    ...readOfferDataToAcceptPrice_offerToAccept\n  }\n  ...useHandleBlockchainActions_bulk_accept_offers\n}\n\nfragment BulkFulfillOrdersAction_data on BulkFulfillOrdersActionType {\n  __typename\n  maxOrdersToFill\n  ordersToFill {\n    itemFillAmount\n    orderData {\n      chain {\n        identifier\n      }\n      item {\n        __typename\n        ... on AssetQuantityDataType {\n          asset {\n            ...StackedAssetMedia_assets\n            id\n          }\n        }\n        ... on AssetBundleType {\n          assetQuantities(first: 30) {\n            edges {\n              node {\n                asset {\n                  ...StackedAssetMedia_assets\n                  id\n                }\n                id\n              }\n            }\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n      ...useTotalItems_ordersData\n    }\n    ...useTotalPriceOrderDataToFill_ordersToFill\n    ...readOrderDataToFillPrices_orderDataToFill\n  }\n  ...useHandleBlockchainActions_bulk_fulfill_orders\n}\n\nfragment CancelOrderAction_data on CancelOrderActionType {\n  __typename\n  ordersData {\n    orderType\n    side\n    ...OrderDataHeader_order\n  }\n  ...useHandleBlockchainActions_cancel_orders\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment CollectionOfferDetails_collection on CollectionType {\n  representativeAsset {\n    assetContract {\n      ...CollectionLink_assetContract\n      id\n    }\n    ...StackedAssetMedia_assets\n    id\n  }\n  ...CollectionLink_collection\n}\n\nfragment ConfirmationItem_asset on AssetType {\n  chain {\n    displayName\n  }\n  ...AssetItem_asset\n}\n\nfragment ConfirmationItem_asset_item_payment_asset on PaymentAssetType {\n  ...ConfirmationItem_extra_payment_asset\n}\n\nfragment ConfirmationItem_assets on AssetType {\n  ...ConfirmationItem_asset\n  ...ConfirmationItem_bundle_asset\n}\n\nfragment ConfirmationItem_bundle_asset on AssetType {\n  ...AssetItem_bundle_asset\n}\n\nfragment ConfirmationItem_bundle_asset_payment_asset on PaymentAssetType {\n  ...ConfirmationItem_extra_payment_asset\n}\n\nfragment ConfirmationItem_extra_payment_asset on PaymentAssetType {\n  symbol\n  usdSpotPrice\n}\n\nfragment ConfirmationItem_payment_asset on PaymentAssetType {\n  ...ConfirmationItem_asset_item_payment_asset\n  ...ConfirmationItem_bundle_asset_payment_asset\n}\n\nfragment CreateBulkOrderAction_data on CreateBulkOrderActionType {\n  __typename\n  orderDatas {\n    item {\n      __typename\n      ... on AssetQuantityDataType {\n        asset {\n          ...StackedAssetMedia_assets\n          id\n        }\n      }\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n    ...useTotalItems_ordersData\n    ...useTotalPriceOrderData_orderData\n  }\n  ...useHandleBlockchainActions_create_bulk_order\n}\n\nfragment CreateOrderAction_data on CreateOrderActionType {\n  __typename\n  orderData {\n    item {\n      __typename\n      ... on AssetQuantityDataType {\n        quantity\n      }\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n    side\n    isCounterOrder\n    perUnitPrice {\n      unit\n      symbol\n    }\n    ...OrderDataHeader_order\n  }\n  ...useHandleBlockchainActions_create_order\n}\n\nfragment DeployContractAction_data on DropContractDeployActionType {\n  __typename\n  ...useHandleBlockchainActions_deploy_contract\n}\n\nfragment FulfillOrderAction_data on FulfillOrderActionType {\n  __typename\n  orderData {\n    side\n    ...OrderDataHeader_order\n  }\n  itemFillAmount\n  criteriaAsset {\n    ...OrderDataHeader_criteriaAsset\n    id\n  }\n  ...useHandleBlockchainActions_fulfill_order\n}\n\nfragment MintAction_data on MintActionType {\n  __typename\n  ...useHandleBlockchainActions_mint_asset\n}\n\nfragment OrderDataHeader_criteriaAsset on AssetType {\n  ...ConfirmationItem_assets\n}\n\nfragment OrderDataHeader_order on OrderDataType {\n  item {\n    __typename\n    ... on AssetQuantityDataType {\n      asset {\n        ...ConfirmationItem_assets\n        id\n      }\n      quantity\n    }\n    ... on AssetBundleType {\n      name\n      assetQuantities(first: 20) {\n        edges {\n          node {\n            asset {\n              ...ConfirmationItem_assets\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on AssetBundleToBeCreatedType {\n      createdName: name\n      assetQuantitiesToBeCreated: assetQuantities {\n        asset {\n          ...ConfirmationItem_assets\n          id\n        }\n        quantity\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  recipient {\n    address\n    id\n  }\n  side\n  openedAt\n  closedAt\n  perUnitPrice {\n    unit\n  }\n  price {\n    unit\n    symbol\n    usd\n  }\n  payment {\n    ...ConfirmationItem_payment_asset\n    id\n  }\n  dutchAuctionFinalPrice {\n    unit\n  }\n  englishAuctionReservePrice {\n    unit\n  }\n  isCounterOrder\n  orderCriteria {\n    collection {\n      ...CollectionOfferDetails_collection\n      id\n    }\n    trait {\n      traitType\n      value\n      id\n    }\n    quantity\n  }\n}\n\nfragment PaymentAssetApprovalAction_data on PaymentAssetApprovalActionType {\n  __typename\n  asset {\n    chain {\n      identifier\n    }\n    symbol\n    ...StackedAssetMedia_assets\n    id\n  }\n  ...useHandleBlockchainActions_approve_payment_asset\n}\n\nfragment SetCreatorFeesAction_data on SetCreatorFeesActionType {\n  __typename\n  ...useHandleBlockchainActions_set_creator_fees\n}\n\nfragment StackedAssetMedia_assets on AssetType {\n  relayId\n  ...AssetMedia_asset\n  collection {\n    logo\n    id\n  }\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment UpdateDropMechanicsAction_data on DropMechanicsUpdateActionType {\n  __typename\n  ...useHandleBlockchainActions_update_drop_mechanics\n}\n\nfragment WaitForBalanceAction_data on WaitForBalanceActionType {\n  __typename\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment readOfferDataToAcceptPerUnitPrice_offerToAccept on OfferToAcceptType {\n  orderData {\n    perUnitPrice {\n      usd\n      unit\n    }\n    payment {\n      ...TokenPricePayment\n      id\n    }\n  }\n}\n\nfragment readOfferDataToAcceptPrice_offerToAccept on OfferToAcceptType {\n  orderData {\n    perUnitPrice {\n      usd\n      unit\n    }\n    payment {\n      ...TokenPricePayment\n      id\n    }\n  }\n  itemFillAmount\n}\n\nfragment readOrderDataPrices on OrderDataType {\n  openedAt\n  closedAt\n  dutchAuctionFinalPrice {\n    usd\n    unit\n  }\n  perUnitPrice {\n    usd\n    unit\n  }\n  payment {\n    ...TokenPricePayment\n    id\n  }\n  item {\n    __typename\n    ... on AssetQuantityDataType {\n      quantity\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment readOrderDataToFillPrices_orderDataToFill on OrderToFillType {\n  orderData {\n    openedAt\n    closedAt\n    dutchAuctionFinalPrice {\n      usd\n      unit\n    }\n    perUnitPrice {\n      usd\n      unit\n    }\n    payment {\n      ...TokenPricePayment\n      id\n    }\n  }\n  itemFillAmount\n}\n\nfragment useHandleBlockchainActions_approve_asset on AssetApprovalActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_approve_payment_asset on PaymentAssetApprovalActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_ask_for_asset_swap on AskForSwapType {\n  fromAsset {\n    decimals\n    relayId\n    id\n  }\n  toAsset {\n    relayId\n    id\n  }\n}\n\nfragment useHandleBlockchainActions_bulk_accept_offers on BulkAcceptOffersActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  offersToAccept {\n    orderData {\n      openedAt\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_bulk_fulfill_orders on BulkFulfillOrdersActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  ordersToFill {\n    orderData {\n      openedAt\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_cancel_orders on CancelOrderActionType {\n  method {\n    __typename\n    ... on TransactionSubmissionDataType {\n      ...useHandleBlockchainActions_transaction\n    }\n    ... on SignAndPostOrderCancelType {\n      cancelOrderData: data {\n        payload\n        message\n      }\n      serverSignature\n      clientSignatureStandard\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_create_bulk_order on CreateBulkOrderActionType {\n  method {\n    clientMessage\n    clientSignatureStandard\n    serverSignature\n    orderDatas\n    chain {\n      identifier\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_create_order on CreateOrderActionType {\n  method {\n    clientMessage\n    clientSignatureStandard\n    serverSignature\n    orderData\n    chain {\n      identifier\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_deploy_contract on DropContractDeployActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_freeze_asset_metadata on AssetFreezeMetadataActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_fulfill_order on FulfillOrderActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  orderData {\n    openedAt\n  }\n}\n\nfragment useHandleBlockchainActions_mint_asset on MintActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  startTime\n}\n\nfragment useHandleBlockchainActions_set_creator_fees on SetCreatorFeesActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_swap_asset on AssetSwapActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_transaction on TransactionSubmissionDataType {\n  chainIdentifier\n  ...useTransaction_transaction\n}\n\nfragment useHandleBlockchainActions_transfer_asset on AssetTransferActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_update_drop_mechanics on DropMechanicsUpdateActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useIsRarityEnabled_collection on CollectionType {\n  slug\n  enabledRarities\n}\n\nfragment useTotalItems_ordersData on OrderDataType {\n  item {\n    __typename\n    ... on AssetQuantityDataType {\n      asset {\n        relayId\n        id\n      }\n    }\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment useTotalPriceOfferDataToAccept_offersToAccept on OfferToAcceptType {\n  itemFillAmount\n  ...readOfferDataToAcceptPerUnitPrice_offerToAccept\n}\n\nfragment useTotalPriceOrderDataToFill_ordersToFill on OrderToFillType {\n  ...readOrderDataToFillPrices_orderDataToFill\n}\n\nfragment useTotalPriceOrderData_orderData on OrderDataType {\n  ...readOrderDataPrices\n}\n\nfragment useTransaction_transaction on TransactionSubmissionDataType {\n  chainIdentifier\n  source {\n    value\n  }\n  destination {\n    value\n  }\n  value\n  data\n}\n",
          variables: {
            offersToAccept: [
              {
                itemFillAmount: "1",
                optionalCreatorFeeBasisPoints: optionalCreatorFeeBasisPoints,
                criteriaAsset: assetID,
                order: orderID,
              },
            ],
            maxQuantityToFill: null,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", "JWT " + authtoken);
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "3628e518a73d9a138760bf520fdcc1ec0e726539"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "36b3c0da61559694ff219a1602bc21049be85b1b12e2e54efc69d0e9f6257707"
        );
        xhr.setRequestHeader("x-viewer-address", walletaddress);

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      orderID,
      assetID,
      optionalCreatorFeeBasisPoints.toString(),
      authtoken,
      walletaddress
    );
    return response;
  }

  // Map to `GET /v1/{collection}/{tokenID}/buy`
  @get("/v1/{collection}/{tokenID}/buy")
  @response(200, RESPONSE)
  async getBuyOrderPayload(
    @param.path.string("collection") collection: string,
    @param.path.string("tokenID") tokenID: string,
    @param.query.string("chain") chain: string
  ): Promise<any> {
    const { authtoken, walletaddress } = this.req.headers;
    console.log("walletaddress", walletaddress);
    console.log("authtoken", authtoken);

    chain = chain ? chain : "ETHEREUM";
    const data = await globalThis.page.evaluate(
      async (
        chain: string,
        tokenID: string,
        assetContractAddress: string,
        authtoken: string,
        walletaddress: string
      ) => {
        var data = JSON.stringify({
          id: "EventHistoryQuery",
          query:
            "query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $chains: [ChainScalar!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 16\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n  $stringTraits: [TraitInputType!]\n  $isRarityExpansionEnabled: Boolean!\n  $eventTimestamp_Gt: DateTime\n  $rarityFilter: RarityFilterType\n) {\n  ...EventHistory_data_2Weyxc\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  config\n  isCompromised\n  user {\n    publicUsername\n    id\n  }\n  displayName\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment CollectionCell_collection on CollectionType {\n  name\n  imageUrl\n  isVerified\n  ...collection_url\n}\n\nfragment CollectionCell_trait on TraitType {\n  traitType\n  value\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment EventHistory_data_2Weyxc on Query {\n  eventActivity(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true, stringTraits: $stringTraits, eventTimestamp_Gt: $eventTimestamp_Gt, rarityFilter: $rarityFilter) {\n    edges {\n      node {\n        collection {\n          ...CollectionCell_collection\n          id\n        }\n        traitCriteria {\n          ...CollectionCell_trait\n          id\n        }\n        itemQuantity\n        item @include(if: $showAll) {\n          __typename\n          relayId\n          verificationStatus\n          ...ItemCell_data\n          ...item_url\n          ...PortfolioTableItemCellTooltip_item\n          ... on AssetType {\n            defaultRarityData @include(if: $isRarityExpansionEnabled) {\n              rank\n              id\n            }\n            collection {\n              ...CollectionLink_collection\n              id\n            }\n            assetContract {\n              ...CollectionLink_assetContract\n              id\n            }\n          }\n          ... on AssetBundleType {\n            bundleCollection: collection {\n              ...CollectionLink_collection\n              id\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        relayId\n        eventTimestamp\n        eventType\n        orderStatus\n        customEventName\n        ...utilsAssetEventLabel\n        creatorFee {\n          unit\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        perUnitPrice {\n          unit\n          eth\n          usd\n        }\n        endingPriceType {\n          unit\n        }\n        priceType {\n          unit\n        }\n        payment {\n          ...TokenPricePayment\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        sellOrder {\n          taker {\n            __typename\n            id\n          }\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ItemCell_data on ItemType {\n  __isItemType: __typename\n  __typename\n  displayName\n  ...item_url\n  ...PortfolioTableItemCellTooltip_item\n  ... on AssetType {\n    ...AssetMedia_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            ...AssetMedia_asset\n            id\n          }\n          relayId\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment PortfolioTableItemCellTooltip_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ...AssetMedia_asset\n  ...PortfolioTableTraitTable_asset\n  ...asset_url\n}\n\nfragment PortfolioTableTraitTable_asset on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  isCurrentlyFungible\n  tokenId\n  ...asset_url\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment accounts_url on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment item_url on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    ...asset_url\n  }\n  ... on AssetBundleType {\n    ...bundle_url\n  }\n}\n\nfragment utilsAssetEventLabel on AssetEventType {\n  isMint\n  isAirdrop\n  eventType\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n}\n",
          variables: {
            archetype: {
              chain: chain,
              tokenId: tokenID,
              assetContractAddress: assetContractAddress,
            },
            bundle: null,
            collections: null,
            categories: null,
            chains: null,
            eventTypes: ["AUCTION_SUCCESSFUL", "ASSET_TRANSFER"],
            cursor: null,
            count: 16,
            showAll: true,
            identity: null,
            stringTraits: null,
            isRarityExpansionEnabled: true,
            eventTimestamp_Gt: null,
            rarityFilter: null,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", "JWT " + authtoken);
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "42ce9f695ddfae93905867a42c53ec4180c663ad"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "81f8a6c4bffe8301df2537b52126cc38309a2dd08b5b4460c84c4fc326293ba4"
        );
        xhr.setRequestHeader("x-viewer-address", walletaddress);

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      chain,
      tokenID,
      collection,
      authtoken,
      walletaddress
    );
    const relayID = data.data.eventActivity.edges[0].node.item.relayId;

    const makeOffer = await globalThis.page.evaluate(
      async (
        chain: string,
        relayID: string,
        assetContractAddress: string,
        authtoken: string,
        walletaddress: string
      ) => {
        var data = JSON.stringify({
          id: "AssetOfferModalQuery",
          query:
            "query AssetOfferModalQuery(\n  $address: AddressScalar!\n  $asset: AssetRelayID!\n  $chain: ChainScalar!\n) {\n  asset(asset: $asset) {\n    ...OfferModal_asset\n    tradeSummary {\n      ...OfferModal_tradeSummary\n    }\n    id\n  }\n  getAccount(address: $address) {\n    ...OfferModal_account\n    id\n  }\n  tradeLimits(chain: $chain) {\n    ...OfferModal_tradeLimits\n  }\n}\n\nfragment AboveListingPriceWarningModal_pricing on PriceType {\n  usd\n  unit\n  symbol\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment ContextualPriceListBestOfferItem_tradeSummary on TradeSummaryType {\n  bestBid {\n    perUnitPriceType {\n      unit\n      symbol\n      usd\n    }\n    id\n  }\n}\n\nfragment ContextualPriceList_collection on CollectionType {\n  slug\n  statsV2 {\n    floorPrice {\n      unit\n      symbol\n    }\n  }\n}\n\nfragment ContextualPriceList_tradeSummary on TradeSummaryType {\n  ...ContextualPriceListBestOfferItem_tradeSummary\n}\n\nfragment ItemOfferDetails_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    displayName\n    collection {\n      ...CollectionLink_collection\n      id\n    }\n    ...StackedAssetMedia_assets\n  }\n  ... on AssetBundleType {\n    displayName\n    bundleCollection: collection {\n      ...CollectionLink_collection\n      id\n    }\n    assetQuantities(first: 18) {\n      edges {\n        node {\n          asset {\n            ...StackedAssetMedia_assets\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment OfferModal_account on AccountType {\n  offerProtectionEnabled\n}\n\nfragment OfferModal_asset on AssetType {\n  relayId\n  collection {\n    ...ContextualPriceList_collection\n    id\n  }\n  tradeSummary {\n    bestAsk {\n      taker {\n        address\n        id\n      }\n      perUnitPriceType {\n        usd\n        ...AboveListingPriceWarningModal_pricing\n      }\n      id\n    }\n  }\n  ...useOfferModalAdapter_asset_3Pg2VN\n  ...ItemOfferDetails_item\n}\n\nfragment OfferModal_tradeLimits on TradeLimitsType {\n  minimumBidUsdPrice\n  ...useOfferModalAdapter_tradeLimits\n}\n\nfragment OfferModal_tradeSummary on TradeSummaryType {\n  bestAsk {\n    relayId\n    closedAt\n    payment {\n      relayId\n      id\n    }\n    id\n  }\n  ...useOfferModalAdapter_tradeData\n  ...ContextualPriceList_tradeSummary\n}\n\nfragment StackedAssetMedia_assets on AssetType {\n  relayId\n  ...AssetMedia_asset\n  collection {\n    logo\n    id\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment price on OrderV2Type {\n  priceType {\n    unit\n  }\n}\n\nfragment useOfferModalAdapter_asset_3Pg2VN on AssetType {\n  relayId\n  tokenId\n  verificationStatus\n  chain {\n    identifier\n  }\n  assetContract {\n    address\n    id\n  }\n  totalQuantity\n  collection {\n    paymentAssets {\n      relayId\n      symbol\n      chain {\n        identifier\n      }\n      asset {\n        usdSpotPrice\n        decimals\n        id\n      }\n      isNative\n      ...utils_PaymentAssetOption\n      id\n    }\n    id\n  }\n}\n\nfragment useOfferModalAdapter_tradeData on TradeSummaryType {\n  bestAsk {\n    oldOrder\n    orderType\n    relayId\n    item {\n      __typename\n      verificationStatus\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n    payment {\n      relayId\n      id\n    }\n    perUnitPriceType {\n      unit\n    }\n    id\n  }\n  bestBid {\n    relayId\n    payment {\n      relayId\n      id\n    }\n    ...price\n    id\n  }\n}\n\nfragment useOfferModalAdapter_tradeLimits on TradeLimitsType {\n  minimumBidUsdPrice\n}\n\nfragment utils_PaymentAssetOption on PaymentAssetType {\n  relayId\n  symbol\n  displayImageUrl\n  usdSpotPrice\n  decimals\n}\n",
          variables: {
            address: assetContractAddress,
            asset: relayID,
            chain: chain,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", "JWT " + authtoken);
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "42ce9f695ddfae93905867a42c53ec4180c663ad"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "1d02cb4d18e3adc101e7d8b65269940c0e8654834388d4d98578d2900bc2df92"
        );
        xhr.setRequestHeader("x-viewer-address", walletaddress);

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      chain,
      relayID,
      collection,
      authtoken,
      walletaddress
    );

    const orderID = makeOffer.data.asset.tradeSummary.bestAsk.id;

    const response = await globalThis.page.evaluate(
      async (orderID: string, authtoken: string, walletaddress: string) => {
        var data = JSON.stringify({
          id: "QuickBuyModalContentQuery",
          query:
            'query QuickBuyModalContentQuery(\n  $orderId: OrderRelayID!\n) {\n  order(order: $orderId) {\n    isOpen\n    ...QuickBuyModalContentAction_order\n    id\n  }\n  moonpay {\n    ...QuickBuyModalContentAction_moonpay_ZqgzG\n  }\n}\n\nfragment AskForDepositAction_data on AskForDepositType {\n  asset {\n    chain {\n      identifier\n    }\n    decimals\n    symbol\n    usdSpotPrice\n    id\n  }\n  minQuantity\n}\n\nfragment AskForSwapAction_data on AskForSwapType {\n  __typename\n  fromAsset {\n    chain {\n      identifier\n    }\n    decimals\n    symbol\n    id\n  }\n  toAsset {\n    chain {\n      identifier\n    }\n    symbol\n    id\n  }\n  minQuantity\n  maxQuantity\n  ...useHandleBlockchainActions_ask_for_asset_swap\n}\n\nfragment AssetApprovalAction_data on AssetApprovalActionType {\n  __typename\n  asset {\n    chain {\n      identifier\n    }\n    ...StackedAssetMedia_assets\n    assetContract {\n      ...CollectionLink_assetContract\n      id\n    }\n    collection {\n      __typename\n      ...CollectionLink_collection\n      id\n    }\n    id\n  }\n  ...useHandleBlockchainActions_approve_asset\n}\n\nfragment AssetFreezeMetadataAction_data on AssetFreezeMetadataActionType {\n  __typename\n  ...useHandleBlockchainActions_freeze_asset_metadata\n}\n\nfragment AssetItem_asset on AssetType {\n  chain {\n    identifier\n  }\n  displayName\n  relayId\n  collection {\n    name\n    id\n  }\n  ...StackedAssetMedia_assets\n}\n\nfragment AssetItem_bundle_asset on AssetType {\n  chain {\n    identifier\n  }\n  relayId\n  ...StackedAssetMedia_assets\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment AssetSwapAction_data on AssetSwapActionType {\n  __typename\n  ...useHandleBlockchainActions_swap_asset\n}\n\nfragment AssetTransferAction_data on AssetTransferActionType {\n  __typename\n  ...useHandleBlockchainActions_transfer_asset\n}\n\nfragment BlockchainActionList_data on BlockchainActionType {\n  __isBlockchainActionType: __typename\n  __typename\n  ... on AssetApprovalActionType {\n    ...AssetApprovalAction_data\n  }\n  ... on AskForDepositType {\n    __typename\n    ...AskForDepositAction_data\n  }\n  ... on AskForSwapType {\n    __typename\n    ...AskForSwapAction_data\n  }\n  ... on AssetFreezeMetadataActionType {\n    __typename\n    ...AssetFreezeMetadataAction_data\n  }\n  ... on AssetSwapActionType {\n    __typename\n    ...AssetSwapAction_data\n  }\n  ... on AssetTransferActionType {\n    __typename\n    ...AssetTransferAction_data\n  }\n  ... on CreateOrderActionType {\n    __typename\n    ...CreateOrderAction_data\n  }\n  ... on CreateBulkOrderActionType {\n    __typename\n    ...CreateBulkOrderAction_data\n  }\n  ... on CancelOrderActionType {\n    __typename\n    ...CancelOrderAction_data\n  }\n  ... on FulfillOrderActionType {\n    __typename\n    ...FulfillOrderAction_data\n  }\n  ... on BulkAcceptOffersActionType {\n    __typename\n    ...BulkAcceptOffersAction_data\n  }\n  ... on BulkFulfillOrdersActionType {\n    __typename\n    ...BulkFulfillOrdersAction_data\n  }\n  ... on PaymentAssetApprovalActionType {\n    __typename\n    ...PaymentAssetApprovalAction_data\n  }\n  ... on WaitForBalanceActionType {\n    __typename\n    ...WaitForBalanceAction_data\n  }\n  ... on MintActionType {\n    __typename\n    ...MintAction_data\n  }\n  ... on DropContractDeployActionType {\n    __typename\n    ...DeployContractAction_data\n  }\n  ... on DropMechanicsUpdateActionType {\n    __typename\n    ...UpdateDropMechanicsAction_data\n  }\n  ... on SetCreatorFeesActionType {\n    __typename\n    ...SetCreatorFeesAction_data\n  }\n}\n\nfragment BulkAcceptOffersAction_data on BulkAcceptOffersActionType {\n  __typename\n  maxQuantityToFill\n  offersToAccept {\n    itemFillAmount\n    orderData {\n      chain {\n        identifier\n      }\n      item {\n        __typename\n        ... on AssetQuantityDataType {\n          asset {\n            ...StackedAssetMedia_assets\n            id\n          }\n        }\n        ... on AssetBundleType {\n          assetQuantities(first: 30) {\n            edges {\n              node {\n                asset {\n                  ...StackedAssetMedia_assets\n                  id\n                }\n                id\n              }\n            }\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n      ...useTotalItems_ordersData\n    }\n    criteriaAsset {\n      relayId\n      ...StackedAssetMedia_assets\n      id\n    }\n    ...useTotalPriceOfferDataToAccept_offersToAccept\n    ...readOfferDataToAcceptPrice_offerToAccept\n  }\n  ...useHandleBlockchainActions_bulk_accept_offers\n}\n\nfragment BulkFulfillOrdersAction_data on BulkFulfillOrdersActionType {\n  __typename\n  maxOrdersToFill\n  ordersToFill {\n    itemFillAmount\n    orderData {\n      chain {\n        identifier\n      }\n      item {\n        __typename\n        ... on AssetQuantityDataType {\n          asset {\n            ...StackedAssetMedia_assets\n            id\n          }\n        }\n        ... on AssetBundleType {\n          assetQuantities(first: 30) {\n            edges {\n              node {\n                asset {\n                  ...StackedAssetMedia_assets\n                  id\n                }\n                id\n              }\n            }\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n      ...useTotalItems_ordersData\n    }\n    ...useTotalPriceOrderDataToFill_ordersToFill\n    ...readOrderDataToFillPrices_orderDataToFill\n  }\n  ...useHandleBlockchainActions_bulk_fulfill_orders\n}\n\nfragment CancelOrderAction_data on CancelOrderActionType {\n  __typename\n  ordersData {\n    orderType\n    side\n    ...OrderDataHeader_order\n  }\n  ...useHandleBlockchainActions_cancel_orders\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment CollectionOfferDetails_collection on CollectionType {\n  representativeAsset {\n    assetContract {\n      ...CollectionLink_assetContract\n      id\n    }\n    ...StackedAssetMedia_assets\n    id\n  }\n  ...CollectionLink_collection\n}\n\nfragment ConfirmationItem_asset on AssetType {\n  chain {\n    displayName\n  }\n  ...AssetItem_asset\n}\n\nfragment ConfirmationItem_asset_item_payment_asset on PaymentAssetType {\n  ...ConfirmationItem_extra_payment_asset\n}\n\nfragment ConfirmationItem_assets on AssetType {\n  ...ConfirmationItem_asset\n  ...ConfirmationItem_bundle_asset\n}\n\nfragment ConfirmationItem_bundle_asset on AssetType {\n  ...AssetItem_bundle_asset\n}\n\nfragment ConfirmationItem_bundle_asset_payment_asset on PaymentAssetType {\n  ...ConfirmationItem_extra_payment_asset\n}\n\nfragment ConfirmationItem_extra_payment_asset on PaymentAssetType {\n  symbol\n  usdSpotPrice\n}\n\nfragment ConfirmationItem_payment_asset on PaymentAssetType {\n  ...ConfirmationItem_asset_item_payment_asset\n  ...ConfirmationItem_bundle_asset_payment_asset\n}\n\nfragment CreateBulkOrderAction_data on CreateBulkOrderActionType {\n  __typename\n  orderDatas {\n    item {\n      __typename\n      ... on AssetQuantityDataType {\n        asset {\n          ...StackedAssetMedia_assets\n          id\n        }\n      }\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n    ...useTotalItems_ordersData\n    ...useTotalPriceOrderData_orderData\n  }\n  ...useHandleBlockchainActions_create_bulk_order\n}\n\nfragment CreateOrderAction_data on CreateOrderActionType {\n  __typename\n  orderData {\n    item {\n      __typename\n      ... on AssetQuantityDataType {\n        quantity\n      }\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n    side\n    isCounterOrder\n    perUnitPrice {\n      unit\n      symbol\n    }\n    ...OrderDataHeader_order\n  }\n  ...useHandleBlockchainActions_create_order\n}\n\nfragment DeployContractAction_data on DropContractDeployActionType {\n  __typename\n  ...useHandleBlockchainActions_deploy_contract\n}\n\nfragment FulfillActionModal_order_14X15i on OrderV2Type {\n  side\n  relayId\n  fulfill(itemFillAmount: "1") {\n    actions {\n      __typename\n      ...BlockchainActionList_data\n      ... on FulfillOrderActionType {\n        giftRecipientAddress\n      }\n    }\n  }\n}\n\nfragment FulfillOrderAction_data on FulfillOrderActionType {\n  __typename\n  orderData {\n    side\n    ...OrderDataHeader_order\n  }\n  itemFillAmount\n  criteriaAsset {\n    ...OrderDataHeader_criteriaAsset\n    id\n  }\n  ...useHandleBlockchainActions_fulfill_order\n}\n\nfragment MintAction_data on MintActionType {\n  __typename\n  ...useHandleBlockchainActions_mint_asset\n}\n\nfragment OrderDataHeader_criteriaAsset on AssetType {\n  ...ConfirmationItem_assets\n}\n\nfragment OrderDataHeader_order on OrderDataType {\n  item {\n    __typename\n    ... on AssetQuantityDataType {\n      asset {\n        ...ConfirmationItem_assets\n        id\n      }\n      quantity\n    }\n    ... on AssetBundleType {\n      name\n      assetQuantities(first: 20) {\n        edges {\n          node {\n            asset {\n              ...ConfirmationItem_assets\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on AssetBundleToBeCreatedType {\n      createdName: name\n      assetQuantitiesToBeCreated: assetQuantities {\n        asset {\n          ...ConfirmationItem_assets\n          id\n        }\n        quantity\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  recipient {\n    address\n    id\n  }\n  side\n  openedAt\n  closedAt\n  perUnitPrice {\n    unit\n  }\n  price {\n    unit\n    symbol\n    usd\n  }\n  payment {\n    ...ConfirmationItem_payment_asset\n    id\n  }\n  dutchAuctionFinalPrice {\n    unit\n  }\n  englishAuctionReservePrice {\n    unit\n  }\n  isCounterOrder\n  orderCriteria {\n    collection {\n      ...CollectionOfferDetails_collection\n      id\n    }\n    trait {\n      traitType\n      value\n      id\n    }\n    quantity\n  }\n}\n\nfragment PaymentAssetApprovalAction_data on PaymentAssetApprovalActionType {\n  __typename\n  asset {\n    chain {\n      identifier\n    }\n    symbol\n    ...StackedAssetMedia_assets\n    id\n  }\n  ...useHandleBlockchainActions_approve_payment_asset\n}\n\nfragment QuickBuyModalContentAction_moonpay_ZqgzG on MoonpayType {\n  ...usePaymentMethod_moonpay_43XUCC\n}\n\nfragment QuickBuyModalContentAction_order on OrderV2Type {\n  item {\n    __typename\n    chain {\n      identifier\n    }\n    displayName\n    relayId\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ...useIsItemSafelisted_item\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  relayId\n  perUnitPriceType {\n    unit\n    symbol\n    usd\n  }\n  payment {\n    relayId\n    id\n  }\n  ...usePaymentMethod_order\n  ...FulfillActionModal_order_14X15i\n}\n\nfragment SetCreatorFeesAction_data on SetCreatorFeesActionType {\n  __typename\n  ...useHandleBlockchainActions_set_creator_fees\n}\n\nfragment StackedAssetMedia_assets on AssetType {\n  relayId\n  ...AssetMedia_asset\n  collection {\n    logo\n    id\n  }\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment UpdateDropMechanicsAction_data on DropMechanicsUpdateActionType {\n  __typename\n  ...useHandleBlockchainActions_update_drop_mechanics\n}\n\nfragment WaitForBalanceAction_data on WaitForBalanceActionType {\n  __typename\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment readOfferDataToAcceptPerUnitPrice_offerToAccept on OfferToAcceptType {\n  orderData {\n    perUnitPrice {\n      usd\n      unit\n    }\n    payment {\n      ...TokenPricePayment\n      id\n    }\n  }\n}\n\nfragment readOfferDataToAcceptPrice_offerToAccept on OfferToAcceptType {\n  orderData {\n    perUnitPrice {\n      usd\n      unit\n    }\n    payment {\n      ...TokenPricePayment\n      id\n    }\n  }\n  itemFillAmount\n}\n\nfragment readOrderDataPrices on OrderDataType {\n  openedAt\n  closedAt\n  dutchAuctionFinalPrice {\n    usd\n    unit\n  }\n  perUnitPrice {\n    usd\n    unit\n  }\n  payment {\n    ...TokenPricePayment\n    id\n  }\n  item {\n    __typename\n    ... on AssetQuantityDataType {\n      quantity\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment readOrderDataToFillPrices_orderDataToFill on OrderToFillType {\n  orderData {\n    openedAt\n    closedAt\n    dutchAuctionFinalPrice {\n      usd\n      unit\n    }\n    perUnitPrice {\n      usd\n      unit\n    }\n    payment {\n      ...TokenPricePayment\n      id\n    }\n  }\n  itemFillAmount\n}\n\nfragment useHandleBlockchainActions_approve_asset on AssetApprovalActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_approve_payment_asset on PaymentAssetApprovalActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_ask_for_asset_swap on AskForSwapType {\n  fromAsset {\n    decimals\n    relayId\n    id\n  }\n  toAsset {\n    relayId\n    id\n  }\n}\n\nfragment useHandleBlockchainActions_bulk_accept_offers on BulkAcceptOffersActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  offersToAccept {\n    orderData {\n      openedAt\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_bulk_fulfill_orders on BulkFulfillOrdersActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  ordersToFill {\n    orderData {\n      openedAt\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_cancel_orders on CancelOrderActionType {\n  method {\n    __typename\n    ... on TransactionSubmissionDataType {\n      ...useHandleBlockchainActions_transaction\n    }\n    ... on SignAndPostOrderCancelType {\n      cancelOrderData: data {\n        payload\n        message\n      }\n      serverSignature\n      clientSignatureStandard\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_create_bulk_order on CreateBulkOrderActionType {\n  method {\n    clientMessage\n    clientSignatureStandard\n    serverSignature\n    orderDatas\n    chain {\n      identifier\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_create_order on CreateOrderActionType {\n  method {\n    clientMessage\n    clientSignatureStandard\n    serverSignature\n    orderData\n    chain {\n      identifier\n    }\n  }\n}\n\nfragment useHandleBlockchainActions_deploy_contract on DropContractDeployActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_freeze_asset_metadata on AssetFreezeMetadataActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_fulfill_order on FulfillOrderActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  orderData {\n    openedAt\n  }\n}\n\nfragment useHandleBlockchainActions_mint_asset on MintActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n  startTime\n}\n\nfragment useHandleBlockchainActions_set_creator_fees on SetCreatorFeesActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_swap_asset on AssetSwapActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_transaction on TransactionSubmissionDataType {\n  chainIdentifier\n  ...useTransaction_transaction\n}\n\nfragment useHandleBlockchainActions_transfer_asset on AssetTransferActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useHandleBlockchainActions_update_drop_mechanics on DropMechanicsUpdateActionType {\n  method {\n    ...useHandleBlockchainActions_transaction\n  }\n}\n\nfragment useIsAvailableForBuyWithCard_data_43XUCC on MoonpayType {\n  fiatCheckoutAvailability(listingId: $orderId)\n}\n\nfragment useIsItemSafelisted_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    collection {\n      slug\n      verificationStatus\n      id\n    }\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            collection {\n              slug\n              verificationStatus\n              id\n            }\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment usePaymentMethod_moonpay_43XUCC on MoonpayType {\n  ...useIsAvailableForBuyWithCard_data_43XUCC\n}\n\nfragment usePaymentMethod_order on OrderV2Type {\n  relayId\n  orderType\n  item {\n    __typename\n    relayId\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  itemQuantityType\n}\n\nfragment useTotalItems_ordersData on OrderDataType {\n  item {\n    __typename\n    ... on AssetQuantityDataType {\n      asset {\n        relayId\n        id\n      }\n    }\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment useTotalPriceOfferDataToAccept_offersToAccept on OfferToAcceptType {\n  itemFillAmount\n  ...readOfferDataToAcceptPerUnitPrice_offerToAccept\n}\n\nfragment useTotalPriceOrderDataToFill_ordersToFill on OrderToFillType {\n  ...readOrderDataToFillPrices_orderDataToFill\n}\n\nfragment useTotalPriceOrderData_orderData on OrderDataType {\n  ...readOrderDataPrices\n}\n\nfragment useTransaction_transaction on TransactionSubmissionDataType {\n  chainIdentifier\n  source {\n    value\n  }\n  destination {\n    value\n  }\n  value\n  data\n}\n',
          variables: { orderId: orderID },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("authorization", "JWT " + authtoken);
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "42ce9f695ddfae93905867a42c53ec4180c663ad"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "0d0aaa68baa1d0768cff53e476a0af96ec7aafbac1d740e672dc9fda6511e744"
        );
        xhr.setRequestHeader("x-viewer-address", walletaddress);

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      orderID,
      authtoken,
      walletaddress
    );
    return response;
  }

  // Map to `GET /v1/{collection}/orders`
  @get("/v1/{collection}/orders")
  @response(200, RESPONSE)
  async getCollectionOrders(
    @param.query.string("chain") chain: string,
    @param.path.string("collection") collection: string,
    @param.query.string("count") count: string,
    @param.query.string("event_types") event_types: string
  ): Promise<any> {
    chain = chain ? chain : "";
    count = count ? count : "16";
    const events = event_types ? event_types.split(",") : ["OFFER_ENTERED"];

    const response = await globalThis.page.evaluate(
      async (count: string, collection: string, chain: string, events: any) => {
        var data = JSON.stringify({
          id: "EventHistoryQuery",
          query:
            "query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $chains: [ChainScalar!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 16\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n  $stringTraits: [TraitInputType!]\n  $isRarityExpansionEnabled: Boolean!\n  $eventTimestamp_Gt: DateTime\n  $rarityFilter: RarityFilterType\n) {\n  ...EventHistory_data_2Weyxc\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  config\n  isCompromised\n  user {\n    publicUsername\n    id\n  }\n  displayName\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment CollectionCell_collection on CollectionType {\n  name\n  imageUrl\n  isVerified\n  ...collection_url\n}\n\nfragment CollectionCell_trait on TraitType {\n  traitType\n  value\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment EventHistory_data_2Weyxc on Query {\n  eventActivity(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true, stringTraits: $stringTraits, eventTimestamp_Gt: $eventTimestamp_Gt, rarityFilter: $rarityFilter) {\n    edges {\n      node {\n        collection {\n          ...CollectionCell_collection\n          id\n        }\n        traitCriteria {\n          ...CollectionCell_trait\n          id\n        }\n        itemQuantity\n        item @include(if: $showAll) {\n          __typename\n          relayId\n          verificationStatus\n          ...ItemCell_data\n          ...item_url\n          ...PortfolioTableItemCellTooltip_item\n          ... on AssetType {\n            defaultRarityData @include(if: $isRarityExpansionEnabled) {\n              rank\n              id\n            }\n            collection {\n              ...CollectionLink_collection\n              id\n            }\n            assetContract {\n              ...CollectionLink_assetContract\n              id\n            }\n          }\n          ... on AssetBundleType {\n            bundleCollection: collection {\n              ...CollectionLink_collection\n              id\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        relayId\n        eventTimestamp\n        eventType\n        orderStatus\n        customEventName\n        ...utilsAssetEventLabel\n        creatorFee {\n          unit\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        perUnitPrice {\n          unit\n          eth\n          usd\n        }\n        endingPriceType {\n          unit\n        }\n        priceType {\n          unit\n        }\n        payment {\n          ...TokenPricePayment\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        sellOrder {\n          taker {\n            __typename\n            id\n          }\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ItemCell_data on ItemType {\n  __isItemType: __typename\n  __typename\n  displayName\n  ...item_url\n  ...PortfolioTableItemCellTooltip_item\n  ... on AssetType {\n    ...AssetMedia_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            ...AssetMedia_asset\n            id\n          }\n          relayId\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment PortfolioTableItemCellTooltip_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ...AssetMedia_asset\n  ...PortfolioTableTraitTable_asset\n  ...asset_url\n}\n\nfragment PortfolioTableTraitTable_asset on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  isCurrentlyFungible\n  tokenId\n  ...asset_url\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment accounts_url on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment item_url on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    ...asset_url\n  }\n  ... on AssetBundleType {\n    ...bundle_url\n  }\n}\n\nfragment utilsAssetEventLabel on AssetEventType {\n  isMint\n  isAirdrop\n  eventType\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n}\n",
          variables: {
            archetype: null,
            bundle: null,
            collections: [collection],
            categories: null,
            chains: chain ? [chain] : null,
            eventTypes: events,
            cursor: null,
            count: parseInt(count),
            showAll: true,
            identity: null,
            stringTraits: [],
            isRarityExpansionEnabled: true,
            eventTimestamp_Gt: "2021-12-07T04:25:04.327Z",
            rarityFilter: null,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "4b967afcba976a7ff38b15601253adc57f5e6141"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "81f8a6c4bffe8301df2537b52126cc38309a2dd08b5b4460c84c4fc326293ba4"
        );

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      count,
      collection,
      chain,
      events
    );
    return response;
  }

  // Map to `GET /v1/{collection}/{tokenID}/orders`
  @get("/v1/{collection}/{tokenID}/orders")
  @response(200, RESPONSE)
  async getAssetOrders(
    @param.query.string("chain") chain: string,
    @param.path.string("tokenID") tokenID: string,
    @param.path.string("collection") collection: string
  ): Promise<any> {
    chain = chain ? chain : "";
    const relayID = await this.getRelayID(chain, tokenID, collection, []);
    console.log(relayID);

    const orders = await this.getNFTOrders(chain, tokenID, collection, relayID);
    return orders;
  }

  // Map to `GET /v1/allorders`
  @get("/v1/allorders")
  @response(200, RESPONSE)
  async allOrders(
    @param.query.string("chain") chain: string,
    @param.query.string("count") count: string,
    @param.query.string("event_types") event_types: string
  ): Promise<any> {
    chain = chain ? chain : "";
    count = count ? count : "16";
    const events = event_types ? event_types.split(",") : ["OFFER_ENTERED"];
    console.log(events);
    const orders = await this.getAllOrders(count, chain, events);
    return orders;
  }

  getNFTOrders = async (
    chain: string,
    tokenId: string,
    assetContractAddress: string,
    relayID: string
  ) => {
    const response = await globalThis.page.evaluate(
      async (
        chain: string,
        tokenId: string,
        assetContractAddress: string,
        relayID: string
      ) => {
        var data = JSON.stringify({
          id: "OrdersQuery",
          query:
            'query OrdersQuery(\n  $cursor: String\n  $count: Int = 10\n  $excludeMaker: IdentityInputType\n  $isExpired: Boolean\n  $isValid: Boolean\n  $isInactive: Boolean\n  $maker: IdentityInputType\n  $makerArchetype: ArchetypeInputType\n  $makerAssetIsPayment: Boolean\n  $takerArchetype: ArchetypeInputType\n  $takerAssetCollections: [CollectionSlug!]\n  $takerAssetIsOwnedBy: IdentityInputType\n  $takerAssetIsPayment: Boolean\n  $sortAscending: Boolean\n  $sortBy: OrderSortOption\n  $makerAssetBundle: BundleSlug\n  $takerAssetBundle: BundleSlug\n  $expandedMode: Boolean = false\n  $isBid: Boolean = false\n  $filterByOrderRules: Boolean = false\n  $includeCriteriaOrders: Boolean = false\n  $criteriaTakerAssetId: AssetRelayID = "QXNzZXRUeXBlOi0x"\n  $includeCriteriaTakerAsset: Boolean = false\n  $isSingleAsset: Boolean = false\n) {\n  ...Orders_data_58dvw\n}\n\nfragment AcceptOfferButton_asset on AssetType {\n  relayId\n  acceptOfferDisabled {\n    __typename\n  }\n  ownedQuantity(identity: {})\n  ...AcceptOfferModalContent_criteriaAsset_3z4lq0\n  ...itemEvents_dataV2\n}\n\nfragment AcceptOfferButton_order_4jlDA1 on OrderV2Type {\n  relayId\n  side\n  orderType\n  item {\n    __typename\n    ... on AssetType {\n      acceptOfferDisabled {\n        __typename\n      }\n      collection {\n        statsV2 {\n          floorPrice {\n            eth\n          }\n        }\n        id\n      }\n      chain {\n        identifier\n      }\n      ownedQuantity(identity: {}) @skip(if: $isSingleAsset)\n      ...itemEvents_dataV2\n    }\n    ... on AssetBundleType {\n      bundleCollection: collection {\n        statsV2 {\n          floorPrice {\n            eth\n          }\n        }\n        id\n      }\n      chain {\n        identifier\n      }\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              ownedQuantity(identity: {})\n              id\n            }\n            id\n          }\n        }\n      }\n      ...itemEvents_dataV2\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  maker {\n    address\n    id\n  }\n  perUnitPriceType {\n    eth\n  }\n}\n\nfragment AcceptOfferDisabledWarningIcon_asset on AssetType {\n  acceptOfferDisabled {\n    ...useAcceptOfferDisabledReason_data\n  }\n}\n\nfragment AcceptOfferModalContent_criteriaAsset_3z4lq0 on AssetType {\n  __typename\n  assetContract {\n    address\n    id\n  }\n  chain {\n    identifier\n  }\n  tokenId\n  relayId\n  ownedQuantity(identity: {})\n  isCurrentlyFungible\n  defaultRarityData {\n    rank\n    id\n  }\n  ...useItemFees_item\n  ...ItemOfferDetails_item\n  ...FloorPriceDifference_item\n  ...readOptionalCreatorFees_item\n}\n\nfragment AcceptOffersButton_orders on OrderV2Type {\n  relayId\n  ...readOrderFees_order\n  ...CreatorFeeInputModalContent_orders\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  config\n  isCompromised\n  user {\n    publicUsername\n    id\n  }\n  displayName\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment BulkPurchaseModal_orders on OrderV2Type {\n  relayId\n  item {\n    __typename\n    relayId\n    chain {\n      identifier\n    }\n    ... on AssetType {\n      collection {\n        slug\n        isSafelisted\n        id\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  payment {\n    relayId\n    symbol\n    id\n  }\n  ...useTotalPrice_orders\n  ...useFulfillingListingsWillReactivateOrders_orders\n}\n\nfragment BuyNowButton_orders on OrderV2Type {\n  ...BulkPurchaseModal_orders\n}\n\nfragment CancelOrderButton_data on OrderV2Type {\n  id\n  item {\n    __typename\n    ... on AssetType {\n      chain {\n        identifier\n      }\n    }\n    ... on AssetBundleType {\n      chain {\n        identifier\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  oldOrder\n  orderType\n  side\n}\n\nfragment CollectionCell_collection on CollectionType {\n  name\n  imageUrl\n  isVerified\n  ...collection_url\n}\n\nfragment CollectionCell_trait on TraitType {\n  traitType\n  value\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment CreatorFeeInputModalContent_orders on OrderV2Type {\n  ...readOrderFees_order\n  ...ServiceFeeText_orders\n}\n\nfragment ExpirationDate_data on OrderV2Type {\n  closedAt\n}\n\nfragment FloorPriceDifference_item on ItemType {\n  __isItemType: __typename\n  ... on AssetType {\n    collection {\n      statsV2 {\n        floorPrice {\n          eth\n        }\n      }\n      id\n    }\n  }\n  ... on AssetBundleType {\n    bundleCollection: collection {\n      statsV2 {\n        floorPrice {\n          eth\n        }\n      }\n      id\n    }\n  }\n}\n\nfragment ItemAddToCartButton_order on OrderV2Type {\n  maker {\n    address\n    id\n  }\n  item {\n    __typename\n    ... on AssetType {\n      isCurrentlyFungible\n    }\n    ...itemEvents_dataV2\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  openedAt\n  ...ShoppingCartContextProvider_inline_order\n}\n\nfragment ItemCell_data on ItemType {\n  __isItemType: __typename\n  __typename\n  displayName\n  ...item_url\n  ... on AssetType {\n    ...AssetMedia_asset\n    ...PortfolioTableItemCellTooltip_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            ...AssetMedia_asset\n            id\n          }\n          relayId\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment ItemOfferDetails_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    displayName\n    collection {\n      ...CollectionLink_collection\n      id\n    }\n    ...StackedAssetMedia_assets\n  }\n  ... on AssetBundleType {\n    displayName\n    bundleCollection: collection {\n      ...CollectionLink_collection\n      id\n    }\n    assetQuantities(first: 18) {\n      edges {\n        node {\n          asset {\n            ...StackedAssetMedia_assets\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment OrderListItem_order on OrderV2Type {\n  relayId\n  item {\n    __typename\n    displayName\n    ... on AssetType {\n      assetContract {\n        ...CollectionLink_assetContract\n        id\n      }\n      collection {\n        ...CollectionLink_collection\n        id\n      }\n      ...AssetMedia_asset\n      ...asset_url\n      ...useItemFees_item\n    }\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              displayName\n              relayId\n              assetContract {\n                ...CollectionLink_assetContract\n                id\n              }\n              collection {\n                ...CollectionLink_collection\n                id\n              }\n              ...StackedAssetMedia_assets\n              ...AssetMedia_asset\n              ...asset_url\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ...itemEvents_dataV2\n    ...useIsItemSafelisted_item\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  remainingQuantityType\n  ...OrderPrice\n}\n\nfragment OrderList_orders on OrderV2Type {\n  item {\n    __typename\n    ... on AssetType {\n      __typename\n      relayId\n    }\n    ... on AssetBundleType {\n      __typename\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  relayId\n  ...OrderListItem_order\n  ...useFulfillingListingsWillReactivateOrders_orders\n}\n\nfragment OrderPrice on OrderV2Type {\n  priceType {\n    unit\n  }\n  perUnitPriceType {\n    unit\n  }\n  dutchAuctionFinalPriceType {\n    unit\n  }\n  openedAt\n  closedAt\n  payment {\n    ...TokenPricePayment\n    id\n  }\n}\n\nfragment OrderUsdPrice on OrderV2Type {\n  priceType {\n    usd\n  }\n  perUnitPriceType {\n    usd\n  }\n  dutchAuctionFinalPriceType {\n    usd\n  }\n  openedAt\n  closedAt\n}\n\nfragment Orders_data_58dvw on Query {\n  criteriaTakerAsset: asset(asset: $criteriaTakerAssetId) @include(if: $includeCriteriaTakerAsset) {\n    ownedQuantity(identity: {})\n    decimals\n    isDelisted\n    relayId\n    ...asset_url\n    ...AcceptOfferButton_asset\n    ...AcceptOfferDisabledWarningIcon_asset\n    id\n  }\n  orders(after: $cursor, excludeMaker: $excludeMaker, first: $count, isExpired: $isExpired, isInactive: $isInactive, isValid: $isValid, maker: $maker, makerArchetype: $makerArchetype, makerAssetIsPayment: $makerAssetIsPayment, takerArchetype: $takerArchetype, takerAssetCollections: $takerAssetCollections, takerAssetIsOwnedBy: $takerAssetIsOwnedBy, takerAssetIsPayment: $takerAssetIsPayment, sortAscending: $sortAscending, sortBy: $sortBy, makerAssetBundle: $makerAssetBundle, takerAssetBundle: $takerAssetBundle, filterByOrderRules: $filterByOrderRules, includeCriteriaOrders: $includeCriteriaOrders) {\n    edges {\n      node {\n        ...Orders_orders_2QKkZK\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment Orders_orders_2QKkZK on OrderV2Type {\n  isValid\n  openedAt\n  orderType\n  hasPendingTransactions\n  remainingQuantityType\n  maker {\n    address\n    ...AccountLink_data\n    ...wallet_accountKey\n    id\n  }\n  payment {\n    relayId\n    id\n  }\n  item {\n    __typename\n    relayId\n    chain {\n      identifier\n    }\n    ... on AssetType {\n      ...asset_url\n      decimals\n      ownedQuantity(identity: {}) @skip(if: $isSingleAsset)\n      isDelisted\n      acceptOfferDisabled {\n        __typename\n        ...useAcceptOfferDisabledReason_data @skip(if: $includeCriteriaTakerAsset)\n      }\n      ...AcceptOfferDisabledWarningIcon_asset @skip(if: $includeCriteriaTakerAsset)\n    }\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              isDelisted\n              ownedQuantity(identity: {})\n              decimals\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  relayId\n  side\n  taker {\n    address\n    ...AccountLink_data\n    ...wallet_accountKey\n    id\n  }\n  perUnitPriceType {\n    eth\n    usd\n  }\n  ...OrderPrice\n  ...OrderUsdPrice\n  item @include(if: $isBid) {\n    __typename\n    ... on AssetType {\n      collection {\n        statsV2 {\n          floorPrice {\n            eth\n          }\n        }\n        id\n      }\n    }\n    ... on AssetBundleType {\n      bundleCollection: collection {\n        statsV2 {\n          floorPrice {\n            eth\n          }\n        }\n        id\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  criteria @include(if: $isBid) {\n    collection {\n      ...CollectionCell_collection\n      id\n    }\n    trait {\n      ...CollectionCell_trait\n      id\n    }\n  }\n  item @include(if: $expandedMode) {\n    __typename\n    ...ItemCell_data\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  ...CancelOrderButton_data\n  ...ExpirationDate_data\n  ...ItemAddToCartButton_order\n  ...QuickBuyButton_order\n  ...useIsQuickBuyEnabled_order\n  ...AcceptOfferButton_order_4jlDA1\n  ...useFulfillSemiFungibleOrders_orders\n  ...BuyNowButton_orders\n}\n\nfragment PortfolioTableItemCellTooltip_asset on AssetType {\n  __typename\n  ...AssetMedia_asset\n  ...PortfolioTableTraitTable_asset\n  ...asset_url\n}\n\nfragment PortfolioTableTraitTable_asset on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  isCurrentlyFungible\n  tokenId\n  ...asset_url\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n}\n\nfragment QuickBuyButton_order on OrderV2Type {\n  maker {\n    address\n    id\n  }\n  item {\n    __typename\n    chain {\n      identifier\n    }\n    ...itemEvents_dataV2\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  openedAt\n  relayId\n}\n\nfragment ServiceFeeText_orders on OrderV2Type {\n  ...readOrderFees_order\n}\n\nfragment ShoppingCartContextProvider_inline_order on OrderV2Type {\n  relayId\n  item {\n    __typename\n    chain {\n      identifier\n    }\n    relayId\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  payment {\n    relayId\n    id\n  }\n  remainingQuantityType\n  ...useTotalItems_orders\n  ...ShoppingCart_orders\n}\n\nfragment ShoppingCartDetailedView_orders on OrderV2Type {\n  relayId\n  item {\n    __typename\n    chain {\n      identifier\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  supportsGiftingOnPurchase\n  ...useTotalPrice_orders\n  ...OrderList_orders\n}\n\nfragment ShoppingCart_orders on OrderV2Type {\n  ...ShoppingCartDetailedView_orders\n  ...BulkPurchaseModal_orders\n}\n\nfragment StackedAssetMedia_assets on AssetType {\n  relayId\n  ...AssetMedia_asset\n  collection {\n    logo\n    id\n  }\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment accounts_url on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment itemEvents_dataV2 on ItemType {\n  __isItemType: __typename\n  relayId\n  chain {\n    identifier\n  }\n  ... on AssetType {\n    tokenId\n    assetContract {\n      address\n      id\n    }\n  }\n}\n\nfragment item_url on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    ...asset_url\n  }\n  ... on AssetBundleType {\n    ...bundle_url\n  }\n}\n\nfragment readOptionalCreatorFees_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    collection {\n      isCreatorFeesEnforced\n      totalCreatorFeeBasisPoints\n      id\n    }\n  }\n}\n\nfragment readOrderFees_order on OrderV2Type {\n  makerFees(first: 10) {\n    edges {\n      node {\n        basisPoints\n        isOpenseaFee\n        id\n      }\n    }\n  }\n  takerFees(first: 10) {\n    edges {\n      node {\n        basisPoints\n        isOpenseaFee\n        id\n      }\n    }\n  }\n}\n\nfragment useAcceptOfferDisabledReason_data on AcceptOfferDisabledType {\n  until\n}\n\nfragment useFulfillSemiFungibleOrders_orders on OrderV2Type {\n  relayId\n  payment {\n    symbol\n    id\n  }\n  perUnitPriceType {\n    unit\n  }\n  remainingQuantityType\n  ...useTotalPrice_orders\n  ...BuyNowButton_orders\n  ...AcceptOffersButton_orders\n}\n\nfragment useFulfillingListingsWillReactivateOrders_orders on OrderV2Type {\n  ...useTotalItems_orders\n}\n\nfragment useIsItemSafelisted_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    collection {\n      slug\n      verificationStatus\n      id\n    }\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            collection {\n              slug\n              verificationStatus\n              id\n            }\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment useIsQuickBuyEnabled_order on OrderV2Type {\n  orderType\n  item {\n    __typename\n    ... on AssetType {\n      isCurrentlyFungible\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment useItemFees_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    totalCreatorFee\n    collection {\n      openseaSellerFeeBasisPoints\n      isCreatorFeesEnforced\n      id\n    }\n  }\n  ... on AssetBundleType {\n    bundleCollection: collection {\n      openseaSellerFeeBasisPoints\n      totalCreatorFeeBasisPoints\n      isCreatorFeesEnforced\n      id\n    }\n  }\n}\n\nfragment useTotalItems_orders on OrderV2Type {\n  item {\n    __typename\n    relayId\n    ... on AssetBundleType {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment useTotalPrice_orders on OrderV2Type {\n  relayId\n  perUnitPriceType {\n    usd\n    unit\n  }\n  dutchAuctionFinalPriceType {\n    usd\n    unit\n  }\n  openedAt\n  closedAt\n  payment {\n    symbol\n    ...TokenPricePayment\n    id\n  }\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n}\n',
          variables: {
            cursor: null,
            count: 10,
            excludeMaker: null,
            isExpired: false,
            isValid: true,
            isInactive: null,
            maker: null,
            makerArchetype: null,
            makerAssetIsPayment: true,
            takerArchetype: {
              assetContractAddress: assetContractAddress,
              tokenId: tokenId,
              chain: chain,
            },
            takerAssetCollections: null,
            takerAssetIsOwnedBy: null,
            takerAssetIsPayment: null,
            sortAscending: null,
            sortBy: "PRICE",
            makerAssetBundle: null,
            takerAssetBundle: null,
            expandedMode: false,
            isBid: true,
            filterByOrderRules: true,
            includeCriteriaOrders: true,
            criteriaTakerAssetId: relayID,
            includeCriteriaTakerAsset: true,
            isSingleAsset: true,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "0f7727298ad9b160b694509c1acb864ea2d7984e"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "12d555a02dca895ca23280b214436ac34cc04e3e8c548470511f7c5d56326c82"
        );

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      chain,
      tokenId,
      assetContractAddress,
      relayID
    );
    return response;
  };

  getAllOrders = async (count: string, chain: string, events: any) => {
    const response = await globalThis.page.evaluate(
      async (count: string, chain: string, events: any) => {
        var data = JSON.stringify({
          id: "EventHistoryQuery",
          query:
            "query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $chains: [ChainScalar!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 16\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n  $stringTraits: [TraitInputType!]\n  $isRarityExpansionEnabled: Boolean!\n  $eventTimestamp_Gt: DateTime\n  $rarityFilter: RarityFilterType\n) {\n  ...EventHistory_data_2Weyxc\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  config\n  isCompromised\n  user {\n    publicUsername\n    id\n  }\n  displayName\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment CollectionCell_collection on CollectionType {\n  name\n  imageUrl\n  isVerified\n  ...collection_url\n}\n\nfragment CollectionCell_trait on TraitType {\n  traitType\n  value\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment EventHistory_data_2Weyxc on Query {\n  eventActivity(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true, stringTraits: $stringTraits, eventTimestamp_Gt: $eventTimestamp_Gt, rarityFilter: $rarityFilter) {\n    edges {\n      node {\n        collection {\n          ...CollectionCell_collection\n          id\n        }\n        traitCriteria {\n          ...CollectionCell_trait\n          id\n        }\n        itemQuantity\n        item @include(if: $showAll) {\n          __typename\n          relayId\n          verificationStatus\n          ...ItemCell_data\n          ...item_url\n          ...PortfolioTableItemCellTooltip_item\n          ... on AssetType {\n            defaultRarityData @include(if: $isRarityExpansionEnabled) {\n              rank\n              id\n            }\n            collection {\n              ...CollectionLink_collection\n              id\n            }\n            assetContract {\n              ...CollectionLink_assetContract\n              id\n            }\n          }\n          ... on AssetBundleType {\n            bundleCollection: collection {\n              ...CollectionLink_collection\n              id\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        relayId\n        eventTimestamp\n        eventType\n        orderStatus\n        customEventName\n        ...utilsAssetEventLabel\n        creatorFee {\n          unit\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        perUnitPrice {\n          unit\n          eth\n          usd\n        }\n        endingPriceType {\n          unit\n        }\n        priceType {\n          unit\n        }\n        payment {\n          ...TokenPricePayment\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        sellOrder {\n          taker {\n            __typename\n            id\n          }\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ItemCell_data on ItemType {\n  __isItemType: __typename\n  __typename\n  displayName\n  ...item_url\n  ...PortfolioTableItemCellTooltip_item\n  ... on AssetType {\n    ...AssetMedia_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            ...AssetMedia_asset\n            id\n          }\n          relayId\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment PortfolioTableItemCellTooltip_item on ItemType {\n  __isItemType: __typename\n  __typename\n  ...AssetMedia_asset\n  ...PortfolioTableTraitTable_asset\n  ...asset_url\n}\n\nfragment PortfolioTableTraitTable_asset on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  isCurrentlyFungible\n  tokenId\n  ...asset_url\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment accounts_url on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment item_url on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    ...asset_url\n  }\n  ... on AssetBundleType {\n    ...bundle_url\n  }\n}\n\nfragment utilsAssetEventLabel on AssetEventType {\n  isMint\n  isAirdrop\n  eventType\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n}\n",
          variables: {
            archetype: null,
            bundle: null,
            collections: [],
            categories: null,
            chains: chain ? [chain] : null,
            eventTypes: events,
            cursor: null,
            count: parseInt(count),
            showAll: true,
            identity: null,
            stringTraits: [],
            isRarityExpansionEnabled: false,
            eventTimestamp_Gt: null,
            rarityFilter: null,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "4b967afcba976a7ff38b15601253adc57f5e6141"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "81f8a6c4bffe8301df2537b52126cc38309a2dd08b5b4460c84c4fc326293ba4"
        );

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      count,
      chain,
      events
    );
    return response;
  };

  getRelayID = async (
    chain: string,
    tokenId: string,
    assetContractAddress: string,
    eventTypes: any
  ) => {
    const response = await globalThis.page.evaluate(
      async (
        chain: string,
        tokenId: string,
        assetContractAddress: string,
        eventTypes: any
      ) => {
        var data = JSON.stringify({
          id: "EventHistoryQuery",
          query:
            "query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $chains: [ChainScalar!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 16\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n  $stringTraits: [TraitInputType!]\n  $isRarityExpansionEnabled: Boolean!\n  $eventTimestamp_Gt: DateTime\n  $rarityFilter: RarityFilterType\n) {\n  ...EventHistory_data_2Weyxc\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  config\n  isCompromised\n  user {\n    publicUsername\n    id\n  }\n  displayName\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AssetMediaAnimation_asset on AssetType {\n  ...AssetMediaImage_asset\n  ...AssetMediaContainer_asset\n  ...AssetMediaPlaceholderImage_asset\n}\n\nfragment AssetMediaAudio_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaContainer_asset on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\n  backgroundColor\n  ...AssetMediaEditions_asset_2V84VL\n}\n\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\n  decimals\n}\n\nfragment AssetMediaImage_asset on AssetType {\n  backgroundColor\n  imageUrl\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaPlaceholderImage_asset on AssetType {\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n}\n\nfragment AssetMediaVideo_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMediaWebgl_asset on AssetType {\n  backgroundColor\n  ...AssetMediaImage_asset\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  displayImageUrl\n  imageUrl\n  isDelisted\n  ...AssetMediaAnimation_asset\n  ...AssetMediaAudio_asset\n  ...AssetMediaContainer_asset_2V84VL\n  ...AssetMediaImage_asset\n  ...AssetMediaPlaceholderImage_asset\n  ...AssetMediaVideo_asset\n  ...AssetMediaWebgl_asset\n}\n\nfragment CollectionCell_collection on CollectionType {\n  name\n  imageUrl\n  isVerified\n  ...collection_url\n}\n\nfragment CollectionCell_trait on TraitType {\n  traitType\n  value\n}\n\nfragment CollectionLink_assetContract on AssetContractType {\n  address\n  blockExplorerLink\n}\n\nfragment CollectionLink_collection on CollectionType {\n  name\n  slug\n  verificationStatus\n  ...collection_url\n}\n\nfragment EventHistory_data_2Weyxc on Query {\n  eventActivity(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true, stringTraits: $stringTraits, eventTimestamp_Gt: $eventTimestamp_Gt, rarityFilter: $rarityFilter) {\n    edges {\n      node {\n        collection {\n          ...CollectionCell_collection\n          id\n        }\n        traitCriteria {\n          ...CollectionCell_trait\n          id\n        }\n        itemQuantity\n        item @include(if: $showAll) {\n          __typename\n          relayId\n          verificationStatus\n          ...ItemCell_data\n          ...item_url\n          ... on AssetType {\n            defaultRarityData @include(if: $isRarityExpansionEnabled) {\n              rank\n              id\n            }\n            collection {\n              ...CollectionLink_collection\n              id\n            }\n            assetContract {\n              ...CollectionLink_assetContract\n              id\n            }\n            ...PortfolioTableItemCellTooltip_asset\n          }\n          ... on AssetBundleType {\n            bundleCollection: collection {\n              ...CollectionLink_collection\n              id\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        relayId\n        eventTimestamp\n        eventType\n        orderStatus\n        customEventName\n        ...utilsAssetEventLabel\n        creatorFee {\n          unit\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        perUnitPrice {\n          unit\n          eth\n          usd\n        }\n        endingPriceType {\n          unit\n        }\n        priceType {\n          unit\n        }\n        payment {\n          ...TokenPricePayment\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        sellOrder {\n          taker {\n            __typename\n            id\n          }\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ItemCell_data on ItemType {\n  __isItemType: __typename\n  __typename\n  displayName\n  ...item_url\n  ... on AssetType {\n    ...AssetMedia_asset\n    ...PortfolioTableItemCellTooltip_asset\n  }\n  ... on AssetBundleType {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            ...AssetMedia_asset\n            id\n          }\n          relayId\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment PortfolioTableItemCellTooltip_asset on AssetType {\n  __typename\n  ...AssetMedia_asset\n  ...PortfolioTableTraitTable_asset\n  ...asset_url\n}\n\nfragment PortfolioTableTraitTable_asset on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  isCurrentlyFungible\n  tokenId\n  ...asset_url\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n}\n\nfragment TokenPricePayment on PaymentAssetType {\n  symbol\n}\n\nfragment accounts_url on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    id\n  }\n  tokenId\n  chain {\n    identifier\n  }\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n  chain {\n    identifier\n  }\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment item_url on ItemType {\n  __isItemType: __typename\n  __typename\n  ... on AssetType {\n    ...asset_url\n  }\n  ... on AssetBundleType {\n    ...bundle_url\n  }\n}\n\nfragment utilsAssetEventLabel on AssetEventType {\n  isMint\n  isAirdrop\n  eventType\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n}\n",
          variables: {
            archetype: {
              chain: chain,
              tokenId: tokenId,
              assetContractAddress: assetContractAddress,
            },
            bundle: null,
            collections: null,
            categories: null,
            chains: null,
            eventTypes: eventTypes ? eventTypes : [],
            cursor: null,
            count: 16,
            showAll: true,
            identity: null,
            stringTraits: null,
            isRarityExpansionEnabled: true,
            eventTimestamp_Gt: null,
            rarityFilter: null,
          },
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        // xhr.addEventListener("readystatechange", function () {
        //   if (this.readyState === 4) {
        //     console.log(this.responseText);
        //   }
        // });

        xhr.open("POST", "https://opensea.io/__api/graphql/");
        xhr.setRequestHeader("accept", "*/*");
        xhr.setRequestHeader("accept-language", "en-US,en;q=0.9");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("x-app-id", "opensea-web");
        xhr.setRequestHeader(
          "x-build-id",
          "0f7727298ad9b160b694509c1acb864ea2d7984e"
        );
        xhr.setRequestHeader(
          "x-signed-query",
          "6f956dd376bf2091367a20180d06383d8e6802732938f2894f80ff847a254eaf"
        );

        xhr.send(data);
        return new Promise((resolve) => {
          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText));
          };
        });
      },
      chain,
      tokenId,
      assetContractAddress,
      eventTypes
    );
    console.log(response);
    return response?.data?.eventActivity?.edges[0]?.node?.item?.relayId;
  };
}
