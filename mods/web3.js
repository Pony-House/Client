export default {
  // EUR Tokens
  eur: {
    eurc: {
      ethereum: '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c',
      avax: '0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD',
    },
  },

  // USD Tokens
  usd: {
    dai: {
      base: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
      op: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      ethereum: '0x6b175474e89094c44da98b954eedeac495271d0f',
      polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      bsc: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    },

    usdt: {
      avax: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
      op: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      ethereum: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      polygon: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    },

    usdc: {
      base: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      avax: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      op: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      ethereum: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      polygon: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      bsc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    },

    usdbc: {
      base: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
    },
  },

  // Default Networks
  defaultNetworks: {
    // Ethereum
    ethereum: {
      chainId: '0x1',
      chainIdInt: 1,
      rpcUrls: ['https://cloudflare-eth.com/'],
      chainName: 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://etherscan.com/'],
      blockExplorerApis: ['https://api.etherscan.io/'],

      // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/factory
      factory: ['0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'],
    },

    // Polygon (MATIC)
    polygon: {
      chainId: '0x89',
      chainIdInt: 137,
      rpcUrls: ['https://polygon-rpc.com/'],
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      blockExplorerUrls: ['https://polygonscan.com/'],
      blockExplorerApis: ['https://api.polygonscan.com/'],

      // https://docs.quickswap.exchange/reference/smart-contracts/v3/01-factory
      factory: ['0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28'],
    },

    // Binsnace Smart Chain (BEP20)
    bsc: {
      chainId: '0x38',
      chainIdInt: 56,
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      chainName: 'Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      blockExplorerUrls: ['https://bscscan.com/'],
      blockExplorerApis: ['https://api.bscscan.com/'],

      // https://docs.pancakeswap.finance/code/smart-contracts/pancakeswap-exchange/v2/factory-v2
      factory: ['0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'],
    },

    // Gnosis Chain (USD)
    gnosis: {
      chainId: '0x64',
      chainIdInt: 100,
      rpcUrls: ['https://rpc.gnosischain.com/'],
      chainName: 'Gnosis',
      nativeCurrency: {
        name: 'xDai',
        symbol: 'xDAI',
        decimals: 18,
      },
      blockExplorerUrls: ['https://gnosisscan.io/'],
      blockExplorerApis: ['https://api.gnosisscan.io/'],

      factory: [],
    },

    // Avalanche Network
    avax: {
      chainId: '0xa86a',
      chainIdInt: 43114,
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      chainName: 'Avalanche Network',
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
      },
      blockExplorerUrls: ['https://snowtrace.io/'],
      blockExplorerApis: ['https://api.snowtrace.io/'],

      factory: [],
    },

    // Optimism Mainnet
    op: {
      chainId: '0xa',
      chainIdInt: 10,
      rpcUrls: ['https://mainnet.optimism.io/'],
      chainName: 'Optimism Mainnet',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://explorer.optimism.io/'],
      blockExplorerApis: ['https://api-optimistic.etherscan.io/'],

      factory: [],
    },

    // Base
    base: {
      chainId: '0x2105',
      chainIdInt: 8453,
      rpcUrls: ['https://mainnet.base.org/'],
      chainName: 'Base Mainnet',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://basescan.org/'],
      blockExplorerApis: ['https://api.basescan.org/'],

      factory: [],
    },
  },
};
