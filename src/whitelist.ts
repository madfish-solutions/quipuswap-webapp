export enum Network {
  Main = "NetXdQprcVkpaWU",
  Florence = "NetXxkAx4woPLyu",
  Edo2net = "NetXSgo1ZT2DRUG",
}

export interface WhitelistedToken {
  network: Network;
  type: "fa1.2" | "fa2";
  contractAddress: string;
  fa2TokenId?: number;
  metadata?: WhitelistedTokenMetadata;
}

export type WhitelistedTokenMetadata = {
  decimals: number;
  symbol: string;
  name: string;
  thumbnailUri: string;
};

export const TOKEN_WHITELIST: WhitelistedToken[] = [
  /**
   * Mainnet
   */
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV",
    metadata: {
      decimals: 18,
      symbol: "KUSD",
      name: "Kolibri",
      thumbnailUri: "https://kolibri-data.s3.amazonaws.com/logo.png",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH",
    metadata: {
      decimals: 6,
      symbol: "wXTZ",
      name: "Wrapped Tezos",
      thumbnailUri:
        "https://raw.githubusercontent.com/StakerDAO/wrapped-xtz/dev/assets/wXTZ-token-FullColor.png",
    },
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf",
    fa2TokenId: 0,
    metadata: {
      decimals: 6,
      symbol: "USDS",
      name: "Stably USD",
      thumbnailUri: "https://quipuswap.com/tokens/stably.png",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn",
    metadata: {
      decimals: 8,
      symbol: "tzBTC",
      name: "tzBTC",
      thumbnailUri:
        "https://tzbtc.io/wp-content/uploads/2020/03/tzbtc_logo_single.svg",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea",
    metadata: {
      decimals: 18,
      symbol: "STKR",
      name: "Staker Governance Token",
      thumbnailUri: "https://github.com/StakerDAO/resources/raw/main/stkr.png",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9",
    metadata: {
      decimals: 6,
      symbol: "USDtz",
      name: "USDtez",
      thumbnailUri: "https://usdtz.com/lightlogo10USDtz.png",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8",
    metadata: {
      decimals: 18,
      symbol: "ETHtz",
      name: "ETHtez",
      thumbnailUri: "https://ethtz.io/ETHtz_purple.png",
    },
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW",
    fa2TokenId: 0,
  },

  /**
   * Testnet
   */

  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1G8ELzdJ6iwLeWK6vHL4hZJL53fX7bGNij",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1H6gD5FndeANj3B8fnb6gywdGjryGTUfGv",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1KpZq1tN9hHTfntki5pJCXw2Q85gvxGnkU",
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1WwqpZTzZ37NRhafkLL2vGJkB2JtS6v9TP",
  },
  {
    network: Network.Edo2net,
    type: "fa2",
    contractAddress: "KT1SnUsFsP3zQJsuGzBowdzn2tqGk4xuUsWv",
    fa2TokenId: 0,
  },
];
