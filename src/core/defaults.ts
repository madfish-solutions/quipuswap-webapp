import { QSAsset, QSTokenType, QSNetwork } from "@/core/types";

export { TOKEN_WHITELIST } from "../whitelist";

export const FA1_2_FACTORY_CONTRACT_EDONET =
  process.env.VUE_APP_FA1_2_FACTORY_CONTRACT_EDONET || null;
export const FA2_FACTORY_CONTRACT_EDONET =
  process.env.VUE_APP_FA2_FACTORY_CONTRACT_EDONET || null;

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

export const EDONET_NETWORK: QSNetwork = {
  id: "edo2net",
  name: "Edo Testnet",
  type: "test",
  rpcBaseURL: "https://edonet.smartpy.io/",
  fa1_2FactoryContract: FA1_2_FACTORY_CONTRACT_EDONET,
  fa2FactoryContract: FA2_FACTORY_CONTRACT_EDONET,
  description: "Edo testnet",
  color: "#0f4c81",
  disabled: false,
};

export const MAINNET_NETWORK: QSNetwork = {
  id: "mainnet",
  name: "Tezos Mainnet",
  type: "main",
  rpcBaseURL: "https://mainnet.smartpy.io/",
  fa1_2FactoryContract: FA1_2_FACTORY_CONTRACT_MAINNET,
  fa2FactoryContract: FA2_FACTORY_CONTRACT_MAINNET,
  description: "Tezos mainnet",
  color: "#83b300",
  disabled: true,
};

export const ALL_NETWORKS = [MAINNET_NETWORK, EDONET_NETWORK];
export const DEFAULT_NETWORK = EDONET_NETWORK;

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
    default: true,
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
    default: true,
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
    default: true,
  },
];

export const TESTNET_TOKENS: QSAsset[] = [
  // {
  //   type: "token",
  //   tokenType: QSTokenType.FA1_2,
  //   id: "KT1RXpLtz22YgX24QQhxKVyKvtKZFaAVtTB9",
  //   decimals: 18,
  //   symbol: "kUSD",
  //   name: "Kolibri",
  //   imgUrl: "https://kolibri-data.s3.amazonaws.com/logo.png",
  //   exchange: "",
  //   default: true,
  // },
  // {
  //   type: "token",
  //   tokenType: QSTokenType.FA2,
  //   id: "KT1WnjpKriR4yweiFdkTiMofoV9hvz7vMSXJ",
  //   fa2TokenId: 0,
  //   decimals: 6,
  //   symbol: "USDS",
  //   name: "Stably USD",
  //   imgUrl: require("../assets/dollar-mark.svg"),
  //   exchange: "",
  //   default: true,
  // },
];
