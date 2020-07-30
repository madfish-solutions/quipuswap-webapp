import { QSAsset, QSNetwork } from "@/core/types";

export const FACTORY_CONTRACT_CARTHAGENET =
  process.env.VUE_APP_FACTORY_CONTRACT_CARTHAGENET || null;

export const FACTORY_CONTRACT_MAINNET =
  process.env.VUE_APP_FACTORY_CONTRACT_MAINNET || null;

export const CARTHAGE_NETWORK: QSNetwork = {
  id: "carthagenet",
  name: "Carthage Testnet",
  type: "test",
  rpcBaseURL: "https://testnet-tezos.giganode.io",
  factoryContract: FACTORY_CONTRACT_CARTHAGENET,
  description: "Carthage testnet",
  color: "#0f4c81",
  disabled: false,
};

export const MAINNET_NETWORK: QSNetwork = {
  id: "mainnet",
  name: "Tezos Mainnet",
  type: "main",
  rpcBaseURL: "https://mainnet-tezos.giganode.io",
  factoryContract: FACTORY_CONTRACT_MAINNET,
  description: "Carthage mainnet",
  color: "#83b300",
  disabled: true,
};

export const ALL_NETWORKS = [MAINNET_NETWORK, CARTHAGE_NETWORK];
export const DEFAULT_NETWORK = CARTHAGE_NETWORK;

export const TEZOS_TOKEN: QSAsset = {
  id: "XTZ",
  name: "Tezos",
  type: "xtz",
  symbol: "XTZ",
  exchange: "",
  imgUrl: require("@/assets/xtz.png"),
};

export const DEFAULT_TOKEN_LOGO_URL = require("@/assets/token-logo.png");
