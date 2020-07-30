export interface QSAsset {
  id: string;
  symbol: string;
  name: string;
  imgUrl: string;
  type?: string;
  exchange: string;
}

export interface QSNetwork {
  id: "mainnet" | "carthagenet";
  name: string;
  type: "main" | "test";
  rpcBaseURL: string;
  factoryContract: string | null;
  description: string;
  color: string;
  disabled: boolean;
}
