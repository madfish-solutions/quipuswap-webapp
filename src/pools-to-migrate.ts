export type TokenMetadata = {
  decimals: number;
  symbol: string;
  name: string;
  thumbnailUri: string;
};

export interface MainnetPoolToMigrate {
  type: "fa1.2" | "fa2";
  dexAddress: string;
  underlineTokenMetadata: TokenMetadata;
}

export const MAINNET_POOLS_TO_MIGRATE: MainnetPoolToMigrate[] = [
  // GUTS
  {
    type: "fa2",
    dexAddress: "KT1WYQj3HEt3sxdsV4dMLA8RKzUnYAzXgguS",
    underlineTokenMetadata: {
      decimals: 0,
      symbol: "GUTS",
      name: "Guts Gaming",
      thumbnailUri:
        "https://cloudflare-ipfs.com/ipfs/Qmd5PwBHVLAUN1kRWAebDVjrMogJ9oUnNn8sowwTC7HgEv",
    },
  },
];
