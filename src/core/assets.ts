import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";
import { QSAsset, QSTokenType, QSTokenMetadata } from "./types";
import {
  Tezos,
  getContract,
  getNetwork,
  getContractForMetadata,
} from "./state";
import { mutezToTz } from "./helpers";
import {
  DEFAULT_TOKEN_LOGO_URL,
  TOKEN_WHITELIST,
  CHAIN_ID_MAPPING,
} from "./defaults";

const network = getNetwork();
const lambdaView = (() => {
  if (network.id === "florencenet")
    return "KT1BbTmNHmJp2NnQyw5qsAExEYmYuUpR2HdX";

  if (network.id === "granadanet")
    return "KT1VhtTGAyh7AVVwyH2ExNhaXvQq2rAJ6DNs";
})();

export async function getBalance(
  accountPkh: string,
  asset: Pick<QSAsset, "tokenType" | "id" | "decimals" | "fa2TokenId">
) {
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
        nat = await contract.views.getBalance(accountPkh).read(lambdaView);
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
          .read(lambdaView);
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

export async function getTokenMetadata(
  contractAddress: string,
  fa2TokenId?: number
): Promise<QSTokenMetadata> {
  const tokenId = fa2TokenId ?? 0;
  const { id: networkId } = getNetwork();
  const storageKey = `qs_tm_${networkId}_${contractAddress}_${tokenId}`;
  const tokenMetadataFromStorage = localStorage.getItem(storageKey);

  if (tokenMetadataFromStorage) {
    try {
      return JSON.parse(tokenMetadataFromStorage);
    } catch (_err) {
      localStorage.removeItem(storageKey);
    }
  }

  const contract = await getContractForMetadata(contractAddress);

  let tokenData: any;
  let latestErrMessage;

  /**
   * Try fetch token data with TZIP12
   */
  try {
    tokenData = await contract.tzip12().getTokenMetadata(tokenId);
  } catch (err) {
    latestErrMessage = err.message;
  }

  /**
   * Try fetch token data with TZIP16
   * Get them from plain tzip16 structure/scheme
   */
  if (!tokenData || Object.keys(tokenData).length === 0) {
    try {
      const { metadata } = await contract.tzip16().getMetadata();
      tokenData = metadata;
    } catch (err) {
      latestErrMessage = err.message;
    }
  }

  if (!tokenData) {
    // throw new MetadataParseError(latestErrMessage ?? "Unknown error");
    tokenData = {};
  }

  const result = {
    decimals: tokenData.decimals ? +tokenData.decimals : 0,
    symbol: tokenData.symbol || contractAddress,
    name: tokenData.name || tokenData.symbol || "Unknown Token",
    thumbnailUri:
      tokenData.thumbnailUri ??
      tokenData.logo ??
      tokenData.icon ??
      tokenData.iconUri ??
      tokenData.iconUrl ??
      DEFAULT_TOKEN_LOGO_URL,
  };
  localStorage.setItem(storageKey, JSON.stringify(result));
  return result;
}

export class MetadataParseError extends Error {}

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
        nat = await contract.views.getBalance(accountPkh).read(lambdaView);
      } catch {
        shouldTryGetMetadata = false;
      }

      if (!nat || nat.isNaN()) {
        nat = new BigNumber(0);
      }

      if (shouldTryGetMetadata) {
        decimals = (await getNewTokenMetadata(tokenAddress)).decimals;
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
          .read(lambdaView);
        nat = response[0].balance;
      } catch {
        shouldTryGetMetadata = false;
      }

      if (!nat || nat.isNaN()) {
        nat = new BigNumber(0);
      }

      if (shouldTryGetMetadata) {
        decimals = (await getNewTokenMetadata(tokenAddress, tokenId)).decimals;
      }

      return { bal: nat, decimals };

    default:
      throw new Error("Token type not supported");
  }
}

export const filteredWhitelist = (() => {
  const net = getNetwork();
  const chainId = CHAIN_ID_MAPPING.get(net.id);
  return TOKEN_WHITELIST.filter(t => t.network === chainId);
})();

export function isTokenWhitelisted(token: QSAsset) {
  if (token.type === "xtz") return true;
  return filteredWhitelist.some(wt =>
    token.tokenType === QSTokenType.FA2
      ? wt.contractAddress === token.id && wt.fa2TokenId === token.fa2TokenId
      : wt.contractAddress === token.id
  );
}

export async function getNewTokenMetadata(
  contractAddress: string,
  fa2TokenId?: number
) {
  const whitelisted = filteredWhitelist.find(wt =>
    typeof fa2TokenId === "number"
      ? wt.contractAddress === contractAddress && wt.fa2TokenId === fa2TokenId
      : wt.contractAddress === contractAddress
  );

  return whitelisted?.metadata ?? getTokenMetadata(contractAddress, fa2TokenId);
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
          new BigNumber(amount).times(10 ** asset.decimals).toFixed()
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
        const volume = new BigNumber(int).div(10 ** asset.decimals).toFixed();
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
  return new BigNumber(1).div(10 ** asset.decimals).toFixed();
}
