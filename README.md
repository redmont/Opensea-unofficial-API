# api-OS-unofficial

I built these rest api's to expand the limitations & restrictions of OpenSea APIs

Restrictions/Limitations in official API

- We can not get Sell order data of a NFT if we are not already the owner of NFT. We need this info without being the owner of NFT in our arbitrage bot since we will bundle the buy &sell tx in one. This means we can't impact or interact off chain data in between.

- We have API concurrency threshold. This limits the no. of times and no. of concurrent calls we can make. In this custom API, i am bypassing the cloudlfare protections and proxy rotating IPs to have no limit.

- Opensea APIs needs reauthentication after a certain time. This API will automatically re-authenticate.

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
yarn install
```

## Run the application

```sh
PRIVATE_KEY="..." npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3001 in your browser.

## Rebuild the project

To incrementally build the project:

```sh
yarn run build
```

To force a full build by cleaning up cached artifacts:

```sh
yarn run rebuild
```

## Fix code style and formatting issues

```sh
yarn run lint
```

To automatically fix such issues:

```sh
yarn run lint:fix
```

## Other useful commands

- `yarn run migrate`: Migrate database schemas for models
- `yarn run openapi-spec`: Generate OpenAPI spec into a file
- `yarn run docker:build`: Build a Docker image for this application
- `yarn run docker:run`: Run this application inside a Docker container

## Tests

```sh
yarn test
```

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
