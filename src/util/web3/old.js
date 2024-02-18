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