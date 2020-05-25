import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const tezos = new TezosToolkit();
const secretKey =
  "edskRtmEwZxRzwd1obV9pJzAoLoxXFWTSHbgqpDBRHx1Ktzo5yVuJ37e2R4nzjLnNbxFU4UiBU1iHzAy52pK5YBRpaFwLbByca";

export default async function initContract(address: string) {
  try {
    const signer = await InMemorySigner.fromSecretKey(secretKey);
    tezos.setProvider({ rpc: "https://rpc.tzkt.io/carthagenet/", signer });
  } catch (e) {
    console.log(e, "init exception");
  }
  const contract = await tezos.contract.at(address);
  return contract;
}
