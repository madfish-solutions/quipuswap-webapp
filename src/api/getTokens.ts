export interface ITokenItem {
  id: string;
  symbol: string;
  name: string;
  imgUrl: string;
}

const tokens: ITokenItem[] = [
  {
    id: "1",
    symbol: "0xBTC",
    name: "0xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "2",
    symbol: "2xBTC",
    name: "2xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "3",
    symbol: "0xBTC",
    name: "0xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "4",
    symbol: "2xBTC",
    name: "2xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "5",
    symbol: "0xBTC",
    name: "0xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "6",
    symbol: "2xBTC",
    name: "2xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "7",
    symbol: "0xBTC",
    name: "0xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
  {
    id: "8",
    symbol: "2xBTC",
    name: "2xBitcoin Token",
    imgUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB6eD7644C69416d67B522e20bC294A9a9B405B31/logo.png",
  },
];

export default function getTokens(): Promise<ITokenItem[]> {
  return new Promise(res => res(tokens));
}
