const tinyCrypto = {};

// Extend
tinyCrypto.provider.extend({
  property: 'eth',
  methods: [
    {
      name: 'switchEthereumChain',
      call: 'wallet_switchEthereumChain',
      params: 1,
      inputFormatter: [{ chainId: tinyCrypto.provider.utils.numberToHex }],
    },
  ],
});

// Request Account
tinyCrypto.call.requestAccounts = () =>
  new Promise((resolve, reject) => {
    web3
      .listAccounts()
      .then((accounts) => {
        // Address
        if (Array.isArray(accounts) && accounts.length > 0) {
          for (const item in accounts) {
            accounts[item] = accounts[item].toLowerCase();
          }
        }

        tinyCrypto.connected = true;
        resolve(accounts);

        if (firstTime) {
          firstTime = false;
          tcall();
        }
      })
      .catch((err) => {
        tinyCrypto.connected = false;
        reject(err);
      });
  });
