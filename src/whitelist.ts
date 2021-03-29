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
    contractAddress: "KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9",
    metadata: {
      decimals: 6,
      symbol: "USDtz",
      name: "USD Tez",
      thumbnailUri: "https://usdtz.com/lightlogo10USDtz.png",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv",
    metadata: {
      decimals: 0,
      symbol: "STKR",
      name: "Staker",
      thumbnailUri:
        "https://miro.medium.com/fit/c/160/160/1*LzmHCYryGmuN9ZR7JX951w.png",
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
