const defaultNames = {
  philomena: 'Philomena Booru',
  linuxOS: 'Linux OS',
  matrixClient: 'Matrix Client',
  mastodonSocialMedia: 'Mastodon Social Media',
  lensWeb3: 'Lens Web3 Application',
  cryptoExchange: 'Crypto Exchange',
  web3Registrar: 'Web3 Registrar',
  nftMarketplace: 'NFT Marketplace',
  defi: 'DeFi',
  blockchain: 'Blockchain',
  cryptocurrency: 'Cryptocurrency',
  cryptoCompany: 'Crypto Company',
  cryptoToken: 'Crypto Token',
  cryptoSelfCustody: 'Crypto Self-Custody',
};

const keywords = [];

// Booru
keywords.push({
  title: `Derpibooru - ${defaultNames.philomena}`,
  name: `derpibooru`,
  href: `https://derpibooru.org/`,
});

keywords.push({
  title: `Furbooru - ${defaultNames.philomena}`,
  name: `furbooru`,
  href: `https://furbooru.org/`,
});

// Dev
keywords.push({
  title: `Github`,
  name: `github`,
  href: `https://github.com/`,
});

keywords.push({
  title: `Gitlab`,
  name: `gitlab`,
  href: `https://gitlab.com/`,
});

keywords.push({
  title: `Ubuntu - ${defaultNames.linuxOS}`,
  name: `ubuntu`,
  href: `https://ubuntu.com/`,
});

if (__ENV_APP__.IPFS) {
  keywords.push({
    title: `IPFS - Inter Planetary File System`,
    name: `ipfs`,
    href: `https://ipfs.tech/`,
  });
}

// Games
keywords.push({
  title: `Steam`,
  name: [`steam`, `valve`],
  href: `https://store.steampowered.com/`,
});

keywords.push({
  title: `GOG Games`,
  name: `gog`,
  href: `https://www.gog.com/`,
});

keywords.push({
  title: `Electronic Arts`,
  name: [`eletronic arts`, `ea games`, `ea`],
  href: `https://www.ea.com/`,
});

// Art
keywords.push({
  title: `Fur Affinity`,
  name: `furaffinity`,
  href: `https://www.furaffinity.net/`,
});

keywords.push({
  title: `DeviantArt`,
  name: `deviantart`,
  href: `https://www.deviantart.com/`,
});

// Tiny me
keywords.push({
  title: `Puddy Club - JasminDreasond Website`,
  name: `puddy club`,
  href: `https://puddy.club/`,
});

// Social
keywords.push({
  title: `Google`,
  name: `google`,
  href: `https://google.com/`,
});

keywords.push({
  title: `Patreon`,
  name: `patreon`,
  href: `https://www.patreon.com/`,
});

keywords.push({
  title: `Keybase`,
  name: `keybase`,
  href: `https://keybase.io/`,
});

keywords.push({
  title: `Twitch`,
  name: `twitch`,
  href: `https://www.twitch.tv/`,
});

keywords.push({
  title: `SoundCloud`,
  name: `soundcloud`,
  href: `https://soundcloud.com/`,
});

keywords.push({
  title: `Matrix Protocol`,
  name: `matrix`,
  href: `https://matrix.org/`,
});

keywords.push({
  title: `Pony House - ${defaultNames.matrixClient}`,
  name: `pony house`,
  href: `https://pony.house/`,
});

keywords.push({
  title: `Telegram`,
  name: `telegram`,
  href: `https://telegram.org/`,
});

keywords.push({
  title: `Blue Sky - Social Media`,
  name: `bluesky`,
  href: `https://bsky.app/`,
});

keywords.push({
  title: `Discord`,
  name: `discord`,
  href: `https://discord.com/`,
});

keywords.push({
  title: `X.com`,
  name: [`twitter`, `x.com`],
  href: `https://x.com/`,
});

keywords.push({
  title: `Youtube`,
  name: `youtube`,
  href: `https://youtube.com/`,
});

keywords.push({
  title: `Mastodon`,
  name: `mastodon`,
  href: `https://joinmastodon.org/`,
});

keywords.push({
  title: `Equestria Social - ${defaultNames.mastodonSocialMedia}`,
  name: `equestria social`,
  href: `https://equestria.social/`,
});

if (__ENV_APP__.WEB3) {
  // Crypto Social
  keywords.push({
    title: `Lenster - ${defaultNames.lensWeb3}`,
    name: `lenster`,
    href: `https://lenster.xyz/`,
  });

  keywords.push({
    title: `Lens Protocol`,
    name: `lens`,
    href: `https://www.lens.xyz/`,
  });

  keywords.push({
    title: `Odysee`,
    name: `odysee`,
    href: `https://odysee.com/`,
  });

  // Crypto
  keywords.push({
    title: `Binance - ${defaultNames.cryptoExchange}`,
    name: `binance`,
    href: `https://binance.com/`,
  });

  keywords.push({
    title: `Coinbase - ${defaultNames.cryptoExchange}`,
    name: `coinbase`,
    href: `https://coinbase.com/`,
  });

  keywords.push({
    title: `Unstoppable Domains - ${defaultNames.web3Registrar}`,
    name: `unstoppable domains`,
    href: `https://unstoppabledomains.com/`,
  });

  keywords.push({
    title: `CoinMarketCap`,
    name: [`crypto prices`, `marketcap`, `market cap`, `market capital`],
    href: `https://coinmarketcap.com/`,
  });

  keywords.push({
    title: `OpenSea - ${defaultNames.nftMarketplace}`,
    name: `opensea`,
    href: `https://opensea.io/`,
  });

  keywords.push({
    title: `Rarible - ${defaultNames.nftMarketplace}`,
    name: `rarible`,
    href: `https://rarible.com/`,
  });

  // DEX
  keywords.push({
    title: `Uniswap Ecosystem - ${defaultNames.defi}`,
    name: `uniswap`,
    href: `https://uniswap.org/`,
  });

  keywords.push({
    title: `QuickSwap - ${defaultNames.defi}`,
    name: `quickswap`,
    href: `https://quickswap.exchange/`,
  });

  keywords.push({
    title: `PancakeSwap - ${defaultNames.defi}`,
    name: [`pancakeswap`, `pancake swap`],
    href: `https://pancakeswap.finance/`,
  });

  // Blockchain
  keywords.push({
    title: `Polygon - ${defaultNames.blockchain}`,
    name: [`polygon`, `matic`],
    href: `https://polygon.technology/`,
  });

  keywords.push({
    title: `Ethereum - ${defaultNames.blockchain}`,
    name: [`ethereum`, `eth`],
    href: `https://ethereum.org/`,
  });

  keywords.push({
    title: `Optimism - ${defaultNames.blockchain}`,
    name: [`optimism`, `$op`],
    href: `https://www.optimism.io/`,
  });

  keywords.push({
    title: `Arbitrum - ${defaultNames.blockchain}`,
    name: [`arbitrum`, `$arb`],
    href: `https://arbitrum.io/`,
  });

  keywords.push({
    title: `Arweave - ${defaultNames.blockchain}`,
    name: [`arweave`, `$arb`],
    href: `https://arbitrum.io/`,
  });

  keywords.push({
    title: `LBRY - ${defaultNames.blockchain}`,
    name: [`lbry`],
    href: `https://lbry.com/`,
  });

  keywords.push({
    title: `Dogecoin - ${defaultNames.cryptocurrency}`,
    name: [`dogecoin`, `doge`],
    href: `https://dogecoin.com/`,
  });

  keywords.push({
    title: `Bitcoin - ${defaultNames.cryptocurrency}`,
    name: [`bitcoin`, `btc`],
    href: `https://bitcoin.org/`,
  });

  keywords.push({
    title: `Monero - ${defaultNames.cryptocurrency}`,
    name: [`monero`, `xmr`],
    href: `https://www.getmonero.org/`,
  });

  // Tokens USD
  keywords.push({
    title: `Circle - ${defaultNames.cryptoCompany}`,
    name: `circle`,
    href: `https://www.circle.com/`,
  });

  keywords.push({
    title: `USD Coin - ${defaultNames.cryptoToken}`,
    name: [`usdc`, `usd coin`],
    href: `https://www.circle.com/en/usdc`,
  });

  keywords.push({
    title: `Dollar Tether - ${defaultNames.cryptoToken}`,
    name: [`usdt`, `tether`],
    href: `https://tether.to/`,
  });

  // Crypto Token
  keywords.push({
    title: `Shiba - ${defaultNames.cryptoToken}`,
    name: [`shiba token`, `$shib`],
    href: `https://www.shibatoken.com/`,
  });

  // Crypto Wallet
  keywords.push({
    title: `Metamask Wallet - ${defaultNames.cryptoSelfCustody}`,
    name: `metamask`,
    href: `https://metamask.io/`,
  });

  keywords.push({
    title: `Rabby Wallet - ${defaultNames.cryptoSelfCustody}`,
    name: `rabby`,
    href: `https://rabby.io/`,
  });

  keywords.push({
    title: `Frame Wallet - ${defaultNames.cryptoSelfCustody}`,
    name: `frame wallet`,
    href: `https://frame.sh/`,
  });

  keywords.push({
    title: `Trust Wallet - ${defaultNames.cryptoSelfCustody}`,
    name: `trust wallet`,
    href: `https://trustwallet.com/`,
  });
}

export default keywords;
