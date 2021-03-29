import {
  TezosToolkit,
  WalletContract,
  ContractMethod,
  Wallet,
  compose,
} from "@taquito/taquito";
import { tzip16, Tzip16Module } from "@taquito/tzip16";
import { tzip12, Tzip12Module } from "@taquito/tzip12";
import BigNumber from "bignumber.js";
import mem from "mem";
import { QSAsset, QSNetwork, QSTokenType } from "./types";
import { snakeToCamelKeys } from "./helpers";
import { FastRpcClient } from "./taquito-fast-rpc";
import { LambdaViewSigner } from "./lambda-view";
import {
  ALL_NETWORKS,
  DEFAULT_NETWORK,
  TOKEN_WHITELIST,
  CHAIN_ID_MAPPING,
} from "./defaults";
import { getTokenMetadata } from "./assets";

export const Tezos = new TezosToolkit(
  new FastRpcClient(getNetwork().rpcBaseURL)
);
Tezos.addExtension(new Tzip16Module());
Tezos.addExtension(new Tzip12Module());
Tezos.setSignerProvider(new LambdaViewSigner());

export async function getTokens() {
  const { id, fa1_2FactoryContract, fa2FactoryContract } = getNetwork();
  if (!fa1_2FactoryContract && !fa2FactoryContract) {
    throw new Error("Contracts for this network not found");
  }

  const [fa1_2FacStorage, fa2FacStorage] = await Promise.all([
    fa1_2FactoryContract &&
      getStorage(fa1_2FactoryContract).then(s => snakeToCamelKeys(s)),
    fa2FactoryContract &&
      getStorage(fa2FactoryContract).then(s => snakeToCamelKeys(s)),
  ]);

  const chainId = CHAIN_ID_MAPPING.get(id);
  const whitelist = TOKEN_WHITELIST.filter(t => t.network === chainId);

  const allTokens: (QSAsset | null)[] = await Promise.all(
    whitelist.map(async token => {
      const fa2 = token.type === "fa2";
      const facStorage = fa2 ? fa2FacStorage : fa1_2FacStorage;
      if (!facStorage) return null;

      const exchange = await facStorage.tokenToExchange.get(
        fa2
          ? [token.contractAddress, token.fa2TokenId ?? 0]
          : token.contractAddress
      );
      if (!exchange) return null;

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
        exchange,
        decimals: metadata.decimals,
        symbol: metadata.symbol,
        name: metadata.name,
        imgUrl: sanitizeImgUri(metadata.thumbnailUri),
      };
    })
  );

  return [...allTokens, ...getCustomTokens()].filter(Boolean);
}

export function getCustomTokens() {
  try {
    const net = getNetwork();
    const val = localStorage.getItem(`custom_tokens_${net.id}`);
    if (!val) return [];
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export function sanitizeImgUri(origin: string) {
  if (origin.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${origin.substring(7)}/`;
  }

  return origin;
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

export async function getDexShares(
  address: string,
  exchange: string,
  decimals = 0
) {
  const storage = await getDexStorage(exchange);
  const ledger = storage.ledger || storage.accounts;
  const val = await ledger.get(address);
  if (!val) return null;

  const unfrozen = new BigNumber(val.balance).div(10 ** decimals);
  const frozen = new BigNumber(val.frozen_balance).div(10 ** decimals);

  return {
    unfrozen,
    frozen,
    total: unfrozen.plus(frozen),
  };
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
  location.reload();
}
