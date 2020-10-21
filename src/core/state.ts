import { Tezos } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import mem from "mem";
import { QSAsset, QSNetwork, QSTokenType } from "./types";
import {
  ALL_NETWORKS,
  DEFAULT_NETWORK,
  DEFAULT_TOKEN_LOGO_URL,
  MAINNET_TOKENS,
} from "./defaults";

Tezos.setProvider({ rpc: getNetwork().rpcBaseURL });

export async function getNewTokenBalance(
  accountPkh: string,
  tokenAddress: string
) {
  const storage = await getStoragePure(tokenAddress);
  const val = await storage.ledger.get(accountPkh);
  return new BigNumber(val && val.balance ? val.balance : val ? val : 0);
}

export async function getTokens() {
  const { type, factoryContract } = getNetwork();
  if (!factoryContract) {
    throw new Error("Contract for network not found");
  }
  const facStorage = await getFactoryStorage(factoryContract);

  return Promise.all(
    facStorage.tokenList.map(async (tAddress: string) => {
      const exchange = await facStorage.tokenToExchange.get(tAddress);

      if (type === "main") {
        const knownToken = MAINNET_TOKENS.find(({ id }) => tAddress === id);
        if (knownToken) {
          return knownToken;
        }
      }

      return toUnknownToken(tAddress, exchange);
    })
  );
}

function toUnknownToken(address: string, exchange: string): QSAsset {
  return {
    type: "token",
    tokenType: QSTokenType.FA1_2,
    id: address,
    decimals: 0,
    symbol: address,
    name: "Token",
    imgUrl: DEFAULT_TOKEN_LOGO_URL,
    exchange,
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
  getStorage(contractAddress).then(s => s.storage);

export const getFactoryStorage = (contractAddress: string) =>
  getStorage(contractAddress).then(s => s.storage);

export const getStorage = mem(getStoragePure, { maxAge: 30000 });

export async function getStoragePure(contractAddress: string) {
  const contract = await getContract(contractAddress);
  return contract.storage<any>();
}

export const getContract = mem(getContractPure);

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
