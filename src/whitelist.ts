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
    type: "fa2",
    contractAddress: "KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb",
    fa2TokenId: 0,
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
      thumbnailUri: "https://quipuswap.com/tokens/usdtz.png",
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
      thumbnailUri: "https://quipuswap.com/tokens/ethtz.png",
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
    contractAddress: "KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng",
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
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1XPFjZqCULSnqfKaaYy8hJjeY63UNSGwXg",
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X",
    metadata: {
      decimals: 3,
      symbol: "SMAK",
      name: "SmartLink",
      thumbnailUri: "https://quipuswap.com/tokens/smak.png",
    },
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 1,
    contractAddress: "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 2,
    contractAddress: "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW",
    metadata: {
      symbol: "uBTC",
      name: "youves uBTC",
      decimals: 12,
      thumbnailUri: "ipfs://Qmbev41h4axBqVzxsXP2NSaAF996bJjJBPb8FFZVqTvJTY",
    },
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1GUNKmkrgtMQjJp3XxcmCj6HZBhkUmMbge",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT19JYndHaesXpvUfiwgg8BtE41HKkjjGMRC",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1MuyJ7gVw74FNJpfb2mHR15aCREdyEbe2e",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1ErKVqEhG9jxXgUG2KGLW3bNM7zXHX8SDF",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1XTxpQvo7oRCqp85LikEZgAZ22uDxhbWJv",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1WapdVeFqhCfqwdHWwTzSTX7yXoHgiPRPU",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1QgAtLPu3SNq9c6DPLanwL5bvfX3rgh2CS",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT19y6R8x53uDKiM46ahgguS6Tjqhdj2rSzZ",
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1Rpviewjg82JgjGfAKFneSupjAR1kUhbza",
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4",
  },
  {
    network: Network.Main,
    type: "fa1.2",
    contractAddress: "KT19DUSZw7mfeEATrbWVPHRrWNVbNnmfFAE6",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1CS2xKGHNPTauSh5Re4qE3N9PCfG5u4dPx",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1PnUZCp3u2KzWr93pn4DD7HAJnm3rWVrgn",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1Wa8yqRBpFCusJWgcQyjhRz7hUQAmFxW7j",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1KPoyzkj82Sbnafm6pfesZKEhyCpXwQfMc",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1F1mn2jbqQCJcsNgYKVAQjvenecNMY2oPK",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 1,
    contractAddress: "KT19ovJhcsUn4YU8Q5L3BGovKSixfbWcecEA",
  },
  {
    network: Network.Main,
    type: "fa2",
    fa2TokenId: 0,
    contractAddress: "KT1KRvNVubq64ttPbQarxec5XdS6ZQU4DVD2",
  },

  /**
   * Florence
   */

  {
    network: Network.Florence,
    type: "fa2",
    contractAddress: "KT1DaKxkR1LdnXW1tr7yozdwEAiSQDpCLUBj",
    fa2TokenId: 0,
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT1P3RGEAa78XLTs3Hkpd1VWtryQRLDjiXqF",
  },
  {
    network: Network.Florence,
    type: "fa1.2",
    contractAddress: "KT198WVepFnjQtx9HUhuKc2x8gUt9z2fvyv6",
  },
  // Old
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
];
