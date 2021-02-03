import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";
import { View } from "@taquito/tzip16";
import { QSAsset, QSTokenType } from "./types";
import {
  Tezos,
  getContract,
  getTzip16Contract,
  getTzip12Contract,
} from "./state";
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

export async function getNewTokenData(
  accountPkh: string,
  tokenType: QSTokenType,
  tokenAddress: string,
  tokenId?: number
) {
  let nat: BigNumber | undefined;
  let shouldTryGetMetadata = true;
  let decimals = 0;

  switch (tokenType) {
    case QSTokenType.FA1_2:
      const contract = await getContract(tokenAddress);

      try {
        nat = await contract.views.getBalance(accountPkh).read();
      } catch {
        shouldTryGetMetadata = false;
      }

      if (!nat || nat.isNaN()) {
        nat = new BigNumber(0);
      }

      if (shouldTryGetMetadata) {
        try {
          const tzipFetchableContract = await getTzip16Contract(tokenAddress);
          const {
            metadata,
          } = await tzipFetchableContract.tzip16().getMetadata();
          const views = await tzipFetchableContract.tzip16().metadataViews();
          const decimalsFromView = await views
            .decimals?.()
            .executeView()
            .catch(() => undefined);
          const onetokenFromView = await views
            .onetoken?.()
            .executeView()
            .catch(() => undefined);
          const decimalsFromViews =
            decimalsFromView ||
            (onetokenFromView && Math.log10(onetokenFromView));
          // @ts-ignore
          decimals = metadata.decimals || decimalsFromViews || 0;
        } catch {}
      }

      return { bal: nat, decimals };

    case QSTokenType.FA2:
      const fa2Contract = await getContract(tokenAddress);

      if (typeof tokenId !== "number") {
        throw new Error("FA2 token type requires token ID");
      }

      try {
        const response = await fa2Contract.views
          .balance_of([{ owner: accountPkh, token_id: tokenId }])
          .read();
        nat = response[0].balance;
      } catch {
        shouldTryGetMetadata = false;
      }

      if (!nat || nat.isNaN()) {
        nat = new BigNumber(0);
      }

      if (shouldTryGetMetadata) {
        try {
          let views: Record<string, () => View> = {};
          try {
            const tzip16FetchableContract = await getTzip16Contract(
              tokenAddress
            );
            views = await tzip16FetchableContract.tzip16().metadataViews();
          } catch (e) {}

          const tzipFetchableContract = await getTzip12Contract(tokenAddress);
          const tokenMetadata = await tzipFetchableContract
            // @ts-ignore
            .tzip12()
            .getTokenMetadata(tokenId!);
          const { decimals: decimalsFromMetadata } = tokenMetadata;
          if (typeof decimalsFromMetadata === "number") {
            decimals = decimalsFromMetadata;
          } else {
            decimals =
              (await views
                .token_metadata?.()
                .executeView(tokenId!)
                .then(data => data.decimals)
                .catch(() => undefined)) || 0;
          }
        } catch (e) {
          console.error(e);
        }
      }

      return { bal: nat, decimals };

    default:
      throw new Error("Token type not supported");
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
