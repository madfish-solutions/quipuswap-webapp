export interface QSAsset {
  type: "xtz" | "token";
  tokenType: QSTokenType;
  id: string; // token contract address or "XTZ" for XTZ 🙈
  decimals: number;
  symbol: string;
  name: string;
  imgUrl: string;
  fa2TokenId?: number;
  default?: boolean;
  exchange: string;
}

export enum QSTokenType {
  XTZ = "XTZ",
  TzBTC = "TzBTC",
  Staker = "STAKER",
  FA1_2 = "FA1.2",
  FA2 = "FA2",
}

export interface QST2TPair {
  storage: any;
  id: string;
}

export interface QSNetwork {
  id:
    | "mainnet"
    | "florencenet"
    | "edo2net"
    | "edonet"
    | "delphinet"
    | "carthagenet";
  name: string;
  type: "main" | "test";
  rpcBaseURL: string;
  fa1_2FactoryContract: string | null;
  fa2FactoryContract: string | null;
  fa1_2T2TDexContract: string | null;
  fa2T2TDexContract: string | null;
  description: string;
  color: string;
  disabled: boolean;
}

export type QSTokenMetadata = {
  decimals: number;
  symbol: string;
  name: string;
  thumbnailUri: string;
};
