export type TokenMetadata = {
  decimals: number;
  symbol: string;
  name: string;
  thumbnailUri: string;
};

export interface MainnetV10WhitelistedDex {
  type: "fa1.2" | "fa2";
  dexAddress: string;
  underlineTokenMetadata: TokenMetadata;
}

export const MAINNET_V1_0_DEX_WHITELIST: MainnetV10WhitelistedDex[] = [
  // KUSD
  {
    type: "fa1.2",
    dexAddress: "KT1CiSKXR68qYSxnbzjwvfeMCRburaSDonT2",
    underlineTokenMetadata: {
      decimals: 18,
      symbol: "KUSD",
      name: "Kolibri",
      thumbnailUri: "https://kolibri-data.s3.amazonaws.com/logo.png",
    },
  },
  // WXTZ
  {
    type: "fa1.2",
    dexAddress: "KT1NABnnQ4pUTJHUwFLiVM2uuEu1RXihAVmB",
    underlineTokenMetadata: {
      decimals: 6,
      symbol: "wXTZ",
      name: "Wrapped Tezos",
      thumbnailUri:
        "https://raw.githubusercontent.com/StakerDAO/wrapped-xtz/dev/assets/wXTZ-token-FullColor.png",
    },
  },
  // USDS
  {
    type: "fa2",
    dexAddress: "KT1T4wNjJtNqZ9XCKSZqR5BXsuGczTxhV9Vu",
    underlineTokenMetadata: {
      decimals: 6,
      symbol: "USDS",
      name: "Stably USD",
      thumbnailUri: "https://quipuswap.com/tokens/stably.png",
    },
  },
  // tzBTC
  {
    type: "fa1.2",
    dexAddress: "KT1N1wwNPqT5jGhM91GQ2ae5uY8UzFaXHMJS",
    underlineTokenMetadata: {
      decimals: 8,
      symbol: "tzBTC",
      name: "tzBTC",
      thumbnailUri:
        "https://tzbtc.io/wp-content/uploads/2020/03/tzbtc_logo_single.svg",
    },
  },
  // STKR
  {
    type: "fa1.2",
    dexAddress: "KT1R5Fp415CJxSxxXToUj6QvxP1LHaYXaxV6",
    underlineTokenMetadata: {
      decimals: 18,
      symbol: "STKR",
      name: "Staker Governance Token",
      thumbnailUri: "https://github.com/StakerDAO/resources/raw/main/stkr.png",
    },
  },
  // USDtez
  {
    type: "fa1.2",
    dexAddress: "KT1MWxucqexguPjhqEyk4XndE1M5tHnhNhH7",
    underlineTokenMetadata: {
      decimals: 6,
      symbol: "USDtz",
      name: "USDtez",
      thumbnailUri: "https://usdtz.com/lightlogo10USDtz.png",
    },
  },
  // ETHtz
  {
    type: "fa1.2",
    dexAddress: "KT1DX1kpCEfEg5nG3pXSSwvtkjTr6ZNYuxP4",
    underlineTokenMetadata: {
      decimals: 18,
      symbol: "ETHtz",
      name: "ETHtez",
      thumbnailUri: "https://ethtz.io/ETHtz_purple.png",
    },
  },
  // hDAO
  {
    type: "fa2",
    dexAddress: "KT1V41fGzkdTJki4d11T1Rp9yPkCmDhB7jph",
    underlineTokenMetadata: {
      decimals: 6,
      symbol: "hDAO",
      name: "hic et nunc DAO",
      thumbnailUri:
        "https://ipfs.io/ipfs/QmPfBrZiRsC39S2VvNbhuxH9HnNcSx8aef9uBCG51J5c4e/",
    },
  },
  // sDAO
  {
    type: "fa2",
    dexAddress: "KT1KKCGmRCy27137wN9WQUYyD14xUbZXyJBA",
    underlineTokenMetadata: {
      decimals: 0,
      symbol: "sDAO",
      name: "Salsa DAO",
      thumbnailUri:
        "https://ipfs.io/ipfs/QmPJ7dMS3T6McqPjjBioKhHqtEUEBhAXpcRf3aicaLNPtV/",
    },
  },
  // Tacos
  {
    type: "fa2",
    dexAddress: "KT1NNwvwvJVrw5Fuq4Nqu4upqqsktsUapzFK",
    underlineTokenMetadata: {
      decimals: 18,
      symbol: "TCZ",
      name: "Tacoz",
      thumbnailUri: "https://tacoz.cash/images/logo_small.png",
    },
  },
];
