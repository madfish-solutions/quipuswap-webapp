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
  // Goodmans!
  {
    type: "fa2",
    dexAddress: "KT1SamzaXd2qMYa5aezqUye1VWBHr6dMjwGX",
    underlineTokenMetadata: {
      decimals: 0,
      symbol: "OBJKT",
      name: "Goodmans!",
      thumbnailUri:
        "https://cloudflare-ipfs.com/ipfs/QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc",
    },
  },
  // Beavers!
  {
    type: "fa2",
    dexAddress: "KT1Np7wGxpgmBjCuh9PFG27LzLiEx1f8sUtq",
    underlineTokenMetadata: {
      decimals: 0,
      symbol: "OBJKT",
      name: "Beavers!",
      thumbnailUri:
        "https://cloudflare-ipfs.com/ipfs/QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc",
    },
  },
  // Wrapped Taco
  {
    type: "fa2",
    dexAddress: "KT1G1ap6QA8GkVTRhzFEUrjakuaYmnczfhgt",
    underlineTokenMetadata: {
      decimals: 0,
      symbol: "wTaco",
      name: "Wrapped Taco",
      thumbnailUri:
        "https://cloudflare-ipfs.com/ipfs/QmXsbFanpa6rTYXCWMzvDsynqnqn33TpFxe4K7qmQFB7ez",
    },
  },
  // Token 42
  {
    type: "fa2",
    dexAddress: "KT1M5H8qkJEzhdC3ZxZ78bSxgmcddrcusbry",
    underlineTokenMetadata: {
      decimals: 0,
      symbol: "T42",
      name: "Token 42",
      thumbnailUri: "https://i.postimg.cc/PT1XQFGb/Icon.png",
    },
  },
];
