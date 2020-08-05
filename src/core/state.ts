import { Tezos } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import mem from "mem";
import { QSAsset, QSNetwork } from "./types";
import {
  ALL_NETWORKS,
  DEFAULT_NETWORK,
  DEFAULT_TOKEN_LOGO_URL,
} from "./defaults";
import { mutezToTz } from "./helpers";

Tezos.setProvider({ rpc: getNetwork().rpcBaseURL });

export async function getNewTokenBalance(
  accountPkh: string,
  tokenAddress: string
) {
  const storage = await getStoragePure(tokenAddress);
  const val = await storage.ledger.get(accountPkh);
  return new BigNumber(val && val.balance ? val.balance : val ? val : 0);
}

export async function getBalance(accountPkh: string, token: QSAsset) {
  if (token.type === "xtz") {
    return mutezToTz(await Tezos.tz.getBalance(accountPkh));
  } else {
    const storage = await getStoragePure(token.id);
    const val = await storage.ledger.get(accountPkh);
    return new BigNumber(val ? val.balance : 0);
  }
}

export async function getTokens() {
  const { factoryContract } = getNetwork();
  if (!factoryContract) {
    throw new Error("Contract for network not found");
  }
  const facStorage = await getFactoryStorage(factoryContract);

  return Promise.all(
    facStorage.tokenList.map(async (tAddress: string) => {
      const exchange = await facStorage.tokenToExchange.get(tAddress);
      return {
        id: tAddress,
        name: "Token",
        type: "token",
        symbol: tAddress,
        exchange,
        imgUrl: DEFAULT_TOKEN_LOGO_URL,
      };
    })
  );
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
