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
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd",
    fa2TokenId: 0,
  },

  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd",
    fa2TokenId: 0,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 0,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 1,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 2,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 3,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 4,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 5,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 6,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 7,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 8,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 9,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 10,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 11,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 12,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 13,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 14,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 15,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 16,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 17,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 18,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 19,
  },
  {
    network: Network.Main,
    type: "fa2",
    contractAddress: "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ",
    fa2TokenId: 20,
  },

  /**
   * Florence
   */

  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1VCczKAoRQJKco7NiSaB93PMkYCbL2z1K7",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1CdFLoqESYe3qBCgM7LZUVmqYZFEabzwyS",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1FXDTQb1o7Q7HecuxaWQ18XyHTsRrzuaZs",
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1CMbwrQodEYFpdJmk8pzN8SzieupG6ZrZE",
  },
  // Token2Token
  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1L7udNhU9mD85sSrME6mHmoqRGu3JtkQVJ",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1Pdj5m49kFsX6pQqSc1Ze1nNVrqkFH1Qmc",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1JoqpEcpiYkv5bt3b4SoZLTWZ2mhKWtC5h",
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1Xgw9dCKbsHeRXdoQ8YwjDHzyLbwddtRVM",
  },

  /**
   * Edonet
   */

  {
    network: Network.Edo2net,
    type: "fa2",
    contractAddress: "KT1RncEZB9bgYJCvqZKQCZFWhBpmfTDdcaeN",
    fa2TokenId: 0,
  },
  {
    network: Network.Edo2net,
    type: "fa2",
    contractAddress: "KT1KLj7ctxde78ksTkz9VBvu6UaowTE8UCiX",
    fa2TokenId: 0,
  },
  {
    network: Network.Edo2net,
    type: "fa1.2",
    contractAddress: "KT1WXUmY2kxVZwAJe3mrXCMmDZFTCYvpvLzz",
  },
  {
    network: Network.Edo2net,
    type: "fa1.2",
    contractAddress: "KT1QdiZFqQhnZs4B2inMekSrqCrEVtbPfuVV",
  },
];
