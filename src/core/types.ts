export interface QSAsset {
  type: "xtz" | "token";
  tokenType: QSTokenType;
  id: string; // token contract address or "XTZ" for XTZ 🙈
  decimals: number;
  symbol: string;
  name: string;
  imgUrl: string;
  exchange: string;
  fa2TokenId?: number;
}

export enum QSTokenType {
  XTZ = "XTZ",
  TzBTC = "TzBTC",
  Staker = "STAKER",
  FA1_2 = "FA1.2",
  FA2 = "FA2",
}

export interface QSNetwork {
  id: "mainnet" | "delphinet" | "carthagenet";
  name: string;
  type: "main" | "test";
  rpcBaseURL: string;
  fa1_2FactoryContract: string | null;
  fa2FactoryContract: string | null;
  description: string;
  color: string;
  disabled: boolean;
}
