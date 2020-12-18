import { QSAsset, QSTokenType, QSNetwork } from "@/core/types";

export const FA1_2_FACTORY_CONTRACT_DELPHINET =
  process.env.VUE_APP_FA1_2_FACTORY_CONTRACT_DELPHINET || null;
export const FA2_FACTORY_CONTRACT_DELPHINET =
  process.env.VUE_APP_FA2_FACTORY_CONTRACT_DELPHINET || null;

export const FA1_2_FACTORY_CONTRACT_MAINNET =
  process.env.VUE_APP_FA1_2_FACTORY_CONTRACT_MAINNET || null;
export const FA2_FACTORY_CONTRACT_MAINNET =
  process.env.VUE_APP_FA2_FACTORY_CONTRACT_MAINNET || null;

export const FEE_RATE = parseInt(process.env.VUE_APP_FEE_RATE!);
export const VETO_PERIOD = parseInt(process.env.VUE_APP_VETO_PERIOD!);
export const ACCURANCY_MULTIPLIER = parseInt(
  process.env.VUE_APP_ACCURANCY_MULTIPLIER!
);

export const LOGO_URL = process.env.VUE_APP_LOGO_URL;

export const DEPLHINET_NETWORK: QSNetwork = {
  id: "delphinet",
  name: "Delphi Testnet",
  type: "test",
  rpcBaseURL: "https://testnet-tezos.giganode.io",
  fa1_2FactoryContract: FA1_2_FACTORY_CONTRACT_DELPHINET,
  fa2FactoryContract: FA2_FACTORY_CONTRACT_DELPHINET,
  description: "Delphi testnet",
  color: "#0f4c81",
  disabled: false,
};

export const MAINNET_NETWORK: QSNetwork = {
  id: "mainnet",
  name: "Tezos Mainnet",
  type: "main",
  rpcBaseURL: "https://mainnet-tezos.giganode.io",
  fa1_2FactoryContract: FA1_2_FACTORY_CONTRACT_MAINNET,
  fa2FactoryContract: FA2_FACTORY_CONTRACT_MAINNET,
  description: "Carthage mainnet",
  color: "#83b300",
  disabled: true,
};

export const ALL_NETWORKS = [MAINNET_NETWORK, DEPLHINET_NETWORK];
export const DEFAULT_NETWORK = DEPLHINET_NETWORK;

export const XTZ_TOKEN: QSAsset = {
  type: "xtz",
  tokenType: QSTokenType.XTZ,
  id: "XTZ",
  decimals: 6,
  symbol: "XTZ",
  name: "Tezos",
  imgUrl: require("@/assets/xtz.png"),
  exchange: "",
};

export const DEFAULT_TOKEN_LOGO_URL = require("@/assets/token-logo.png");

export const MAINNET_TOKENS: QSAsset[] = [
  {
    type: "token",
    tokenType: QSTokenType.FA1_2,
    id: "KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9",
    decimals: 6,
    symbol: "USDtz",
    name: "USD Tez",
    imgUrl: "https://usdtz.com/lightlogo10USDtz.png",
    exchange: "",
  },
  {
    type: "token",
    tokenType: QSTokenType.Staker,
    id: "KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv",
    decimals: 0,
    symbol: "STKR",
    name: "Staker",
    imgUrl:
      "https://miro.medium.com/fit/c/160/160/1*LzmHCYryGmuN9ZR7JX951w.png",
    exchange: "",
  },
  {
    type: "token",
    tokenType: QSTokenType.TzBTC,
    id: "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn",
    decimals: 8,
    symbol: "tzBTC",
    name: "tzBTC",
    imgUrl: "https://tzbtc.io/wp-content/uploads/2020/03/tzbtc_logo_single.svg",
    exchange: "",
  },
];
