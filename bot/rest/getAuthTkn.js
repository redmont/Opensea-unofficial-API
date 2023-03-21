const ethers = require('ethers');
const fetch = require('node-fetch');

const URL = 'http://127.0.0.1:3000/auth/getToken';
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

const getData = async url => {
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
  await fetch(url, options)
    .then(res => res.json())
    .then(json => (data = JSON.parse(JSON.stringify(json))))
    .catch(err => console.error('error:' + err));
  return data;
};

(async () => {
  const data = await getData(URL);
  console.log(data);
})();
