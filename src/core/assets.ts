import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";
import { QSAsset, QSTokenType } from "./types";
import { Tezos, getContract } from "./state";
import { mutezToTz } from "./helpers";

export async function getBalance(accountPkh: string, asset: QSAsset) {
  let nat: BigNumber | undefined;

  switch (asset.tokenType) {
    case QSTokenType.XTZ:
      const amount = await Tezos.tz.getBalance(accountPkh);
      return mutezToTz(amount);

    case QSTokenType.Staker:
    case QSTokenType.TzBTC:
    case QSTokenType.FA1_2:
      const contract = await getContract(asset.id);

      try {
        nat = await contract.views.getBalance(accountPkh).read();
      } catch {}

      if (!nat || nat.isNaN()) {
        nat = new BigNumber(0);
      }

      return nat.div(10 ** asset.decimals);

    case QSTokenType.FA2:
      const fa2Contract = await getContract(asset.id);

      try {
        const response = await fa2Contract.views
          .balance_of([{ owner: accountPkh, token_id: asset.fa2TokenId }])
          .read();
        nat = response[0].balance;
      } catch {}

      if (!nat || nat.isNaN()) {
        nat = new BigNumber(0);
      }

      return nat.div(10 ** asset.decimals);

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
