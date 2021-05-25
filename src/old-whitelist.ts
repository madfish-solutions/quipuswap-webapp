export interface OldWhitelisted {
  contract: string;
  tokenId?: number;
}

export const OLD_WHITELIST: Record<string, OldWhitelisted[]> = {
  mainnet: [],
  florencenet: [
    {
      contract: "KT1FXDTQb1o7Q7HecuxaWQ18XyHTsRrzuaZs",
    },
    {
      contract: "KT1CMbwrQodEYFpdJmk8pzN8SzieupG6ZrZE",
    },
    {
      contract: "KT1VCczKAoRQJKco7NiSaB93PMkYCbL2z1K7",
      tokenId: 0,
    },
    {
      contract: "KT1CdFLoqESYe3qBCgM7LZUVmqYZFEabzwyS",
      tokenId: 0,
    },
  ],
};
