import {
  TezosToolkit,
  WalletContract,
  ContractMethod,
  Wallet,
  compose,
  MichelCodecPacker,
  WalletOperationBatch,
} from "@taquito/taquito";
import { tzip16, Tzip16Module } from "@taquito/tzip16";
import { tzip12, Tzip12Module } from "@taquito/tzip12";
import { Parser } from "@taquito/michel-codec";
import BigNumber from "bignumber.js";
import mem from "mem";
import { QSAsset, QSNetwork, QSTokenType } from "./types";
import { snakeToCamelKeys, toAssetSlug } from "./helpers";
import { FastRpcClient } from "./taquito-fast-rpc";
import { LambdaViewSigner } from "./lambda-view";
import {
  ALL_NETWORKS,
  DEFAULT_NETWORK,
  TOKEN_WHITELIST,
  CHAIN_ID_MAPPING,
  LP_TOKEN_DECIMALS,
} from "./defaults";
import { getTokenMetadata } from "./assets";
import { OldWhitelisted, OLD_WHITELIST } from "@/old-whitelist";

export const michelEncoder = new MichelCodecPacker();
export const michelParser = new Parser();

export const Tezos = new TezosToolkit(
  new FastRpcClient(getNetwork().rpcBaseURL)
);
Tezos.addExtension(new Tzip16Module());
Tezos.addExtension(new Tzip12Module());
Tezos.setSignerProvider(new LambdaViewSigner());
Tezos.setPackerProvider(michelEncoder);

export async function getTokens() {
  const { id } = getNetwork();

  const chainId = CHAIN_ID_MAPPING.get(id);
  const whitelist = TOKEN_WHITELIST.filter(t => t.network === chainId);
  const allTokens: QSAsset[] = await Promise.all(
    whitelist.map(async token => {
      const fa2 = token.type === "fa2";

      let metadata;
      if (token.metadata) {
        metadata = token.metadata;
      } else {
        metadata = await getTokenMetadata(
          token.contractAddress,
          token.fa2TokenId
        );
      }

      return {
        type: "token" as const,
        tokenType: fa2 ? QSTokenType.FA2 : QSTokenType.FA1_2,
        id: token.contractAddress,
        fa2TokenId: token.fa2TokenId,
        decimals: metadata.decimals,
        symbol: metadata.symbol,
        name: metadata.name,
        imgUrl: formatImgUri(metadata.thumbnailUri),
        exchange: "",
      };
    })
  );

  return sanitizeTokens([...allTokens, ...getCustomTokens()]);
}

export function getCustomTokens(): QSAsset[] {
  try {
    const net = getNetwork();
    const val = localStorage.getItem(`custom_tokens_v1.2_${net.id}`);
    if (!val) return [];
    return JSON.parse(val);
  } catch {
    return [];
  }
}

function sanitizeTokens(tokens: (QSAsset | null)[]): QSAsset[] {
  const uniques = new Set<string>();
  const finalTokens: QSAsset[] = [];
  for (const token of tokens) {
    if (token) {
      const slug = toAssetSlug(token);
      if (!uniques.has(slug)) {
        finalTokens.push(token);
        uniques.add(slug);
      }
    }
  }
  return finalTokens;
}

export function formatImgUri(origin: string) {
  if (origin.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${origin.substring(7)}/`;
  }
  return origin;
}

export function sanitizeImgUrl(url: string, x = 64, y = 64) {
  if (url.startsWith("http")) {
    return `https://img.templewallet.com/insecure/fit/${x}/${y}/ce/0/plain/${url}`;
  }
  return url;
}

export function approveToken(
  token: Pick<QSAsset, "tokenType" | "fa2TokenId">,
  tokenContract: WalletContract,
  from: string,
  to: string,
  amount: number | string
): ContractMethod<Wallet> {
  if (token.tokenType === QSTokenType.FA2) {
    return tokenContract.methods.update_operators([
      {
        add_operator: {
          owner: from,
          operator: to,
          token_id: token.fa2TokenId,
        },
      },
    ]);
  } else {
    return tokenContract.methods.approve(to, amount);
  }
}

export function deapproveFA2(
  batch: WalletOperationBatch,
  token: Pick<QSAsset, "tokenType" | "fa2TokenId">,
  tokenContract: WalletContract,
  from: string,
  to: string
) {
  if (token.tokenType === QSTokenType.FA2) {
    return batch.withTransfer(
      tokenContract.methods
        .update_operators([
          {
            remove_operator: {
              owner: from,
              operator: to,
              token_id: token.fa2TokenId,
            },
          },
        ])
        .toTransferParams()
    );
  } else {
    return batch;
  }
}

export async function getDexShares(address: string, exchange: string) {
  const storage = await getDexStorage(exchange);
  const ledger = storage.ledger || storage.accounts;
  const val = await ledger.get(address);
  if (!val) return null;

  const unfrozen = new BigNumber(val.balance);
  const frozen = new BigNumber(val.frozen_balance);

  return {
    unfrozen,
    frozen,
    total: unfrozen.plus(frozen),
  };
}

export function sharesFromNat(val: BigNumber.Value) {
  return new BigNumber(val).div(10 ** LP_TOKEN_DECIMALS);
}

export function sharesToNat(val: BigNumber.Value) {
  return new BigNumber(val)
    .times(10 ** LP_TOKEN_DECIMALS)
    .integerValue(BigNumber.ROUND_DOWN);
}

/**
 * Storage
 */

export function clearMem() {
  mem.clear(getStorage);
  mem.clear(getContract);
}

export const getDexStorage = (contractAddress: string) =>
  getStorage(contractAddress).then(s => snakeToCamelKeys(s.storage));

export const findTezDex = mem(findTezDexPure);

export async function findTezDexPure(token: QSAsset) {
  if (token.type === "xtz") return null;

  const tokenSlug = toAssetSlug(token);

  try {
    const {
      id: netId,
      fa1_2FactoryContract,
      fa2FactoryContract,
      fa1_2OldFactoryContract,
      fa2OldFactoryContract,
    } = getNetwork();

    const oldWhitelist = OLD_WHITELIST[netId] ?? [];
    let exchange;

    if (token.tokenType === QSTokenType.FA2) {
      const factory =
        fa2OldFactoryContract &&
        oldWhitelist.some(w => toOldWhitelistedSlug(w) === tokenSlug)
          ? fa2OldFactoryContract
          : fa2FactoryContract;

      if (factory) {
        const facStorage = await getFactoryStorage(factory);
        exchange = await facStorage.token_to_exchange.get([
          token.id,
          token.fa2TokenId,
        ]);
      }
    } else {
      const factory =
        fa1_2OldFactoryContract &&
        oldWhitelist.some(w => toOldWhitelistedSlug(w) === tokenSlug)
          ? fa1_2OldFactoryContract
          : fa1_2FactoryContract;

      if (factory) {
        const facStorage = await getFactoryStorage(factory);
        exchange = await facStorage.token_to_exchange.get(token.id);
      }
    }

    if (exchange) {
      return getContract(exchange);
    }

    return null;
  } catch (_err) {
    return null;
  }
}

export const getFactoryStorage = mem(getFactoryStoragePure);

export async function getFactoryStoragePure(address: string) {
  const contract = await getContract(address);
  return contract.storage<any>();
}

export const getStorage = mem(getStoragePure, { maxAge: 30000 });

export async function getStoragePure(contractAddress: string) {
  const contract = await getContract(contractAddress);
  return contract.storage<any>();
}

export const getContract = mem(getContractPure);

export const getContractForMetadata = mem((address: string) =>
  Tezos.contract.at(address, compose(tzip12, tzip16))
);

export function getContractPure(address: string) {
  return Tezos.contract.at(address);
}

/**
 * Network
 */

export function getNetwork() {
  const netId = localStorage.getItem("netid");
  if (!netId) return DEFAULT_NETWORK;
  const found = ALL_NETWORKS.find(n => n.id === netId);
  return found && !found.disabled ? found : DEFAULT_NETWORK;
}

export function setNetwork(net: QSNetwork) {
  localStorage.setItem("netid", net.id);
  localStorage.removeItem("accpkh");
  localStorage.removeItem("last-used-connect");
  location.reload();
}

function toOldWhitelistedSlug(w: OldWhitelisted) {
  return w.tokenId !== undefined ? `${w.contract}_${w.tokenId}` : w.contract;
}
