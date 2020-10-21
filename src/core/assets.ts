import BigNumber from "bignumber.js";
import { Tezos, TezosToolkit } from "@taquito/taquito";
import { Uint8ArrayConsumer } from "@taquito/local-forging/dist/lib/uint8array-consumer";
import { valueDecoder } from "@taquito/local-forging/dist/lib/michelson/codec";
import { QSAsset, QSTokenType } from "./types";
import { getContract } from "./state";
import { mutezToTz } from "./helpers";

export async function getBalance(accountPkh: string, asset: QSAsset) {
  let ledger, nat: BigNumber;
  switch (asset.tokenType) {
    case QSTokenType.XTZ:
      const amount = await Tezos.tz.getBalance(accountPkh);
      return mutezToTz(amount);

    case QSTokenType.Staker:
      const staker = await getContract(asset.id);
      ledger = (await staker.storage<any>())[7];
      nat = await ledger.get(accountPkh);
      return nat ?? new BigNumber(0);

    case QSTokenType.TzBTC:
      const tzBtc = await getContract(asset.id);
      ledger = (await tzBtc.storage<any>())[0];
      const { packed } = await Tezos.rpc.packData({
        type: { prim: "pair", args: [{ prim: "string" }, { prim: "address" }] },
        data: {
          prim: "Pair",
          args: [{ string: "ledger" }, { string: accountPkh }],
        },
      });
      const bytes = await ledger.get(packed);
      if (!bytes) {
        return new BigNumber(0);
      }
      const val = valueDecoder(
        Uint8ArrayConsumer.fromHexString(bytes.slice(2))
      );
      return new BigNumber(val.args[0].int).div(10 ** asset.decimals);

    case QSTokenType.FA1_2:
      const fa1_2 = await getContract(asset.id);
      const storage = await fa1_2.storage<any>();
      ledger = storage.ledger || storage.accounts;
      nat = (await ledger.get(accountPkh))?.balance;
      return nat ? nat.div(10 ** asset.decimals) : new BigNumber(0);

    default:
      throw new Error("Not Supported");
  }
}

export async function toTransferParams(
  tezos: TezosToolkit,
  asset: QSAsset,
  toPkh: string,
  amount: number
) {
  switch (asset.tokenType) {
    case QSTokenType.XTZ:
      return {
        to: toPkh,
        amount,
      };

    case QSTokenType.Staker:
    case QSTokenType.TzBTC:
    case QSTokenType.FA1_2:
      const contact = await getContract(asset.id);
      return contact.methods
        .transfer(
          await tezos.signer.publicKeyHash(),
          toPkh,
          new BigNumber(amount).times(10 ** asset.decimals).toString()
        )
        .toTransferParams();

    default:
      throw new Error("Not Supported");
  }
}

export function tryParseParameters(asset: QSAsset, parameters: any) {
  switch (asset.tokenType) {
    case QSTokenType.Staker:
    case QSTokenType.TzBTC:
    case QSTokenType.FA1_2:
      try {
        const [{ args }, { int }] = parameters.value.args;
        const sender: string = args[0].string;
        const receiver: string = args[1].string;
        const volume = new BigNumber(int).div(10 ** asset.decimals).toNumber();
        return {
          sender,
          receiver,
          volume,
        };
      } catch (_err) {
        return null;
      }

    default:
      return null;
  }
}

export function toPenny(asset: QSAsset) {
  return new BigNumber(1).div(10 ** asset.decimals).toNumber();
}
