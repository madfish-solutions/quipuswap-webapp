import { TezosToolkit } from "@taquito/taquito";
import accountWithTokens from "./accounts/nastya.json";

const TEZOS_CONTRACT = "KT1R299cg7K94e3rFCGzpacTXJshQ43meffR";
const tezos = new TezosToolkit();

tezos.setProvider({ rpc: "https://api.tez.ie/rpc/carthagenet" });
tezos.importKey(
  accountWithTokens.email,
  accountWithTokens.password,
  accountWithTokens.mnemonic.join(" "),
  accountWithTokens.secret
);

export async function getAccountBalance(pkh: string) {
  const balance = await tezos.tz.getBalance(pkh);
  return balance;
}

export default async function useSmartContract() {
  const pkhSrc = "tz1bwsEWCwSEXdRvnJxvegQZKeX5dj6oKEys";
  const pkhDst = "tz1PirboZKFVqkfE45hVLpkpXaZtLk3mqC17";
  const contract = await tezos.contract.at(TEZOS_CONTRACT);
  const op = await contract.methods.transfer(pkhSrc, pkhDst, "10").send();
  await op.confirmation();
}
