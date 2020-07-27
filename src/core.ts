import { Tezos } from "@taquito/taquito";
import { validateAddress, ValidationResult } from "@taquito/utils";
import BigNumber from "bignumber.js";
import mem from "mem";

export interface QSAsset {
  id: string;
  symbol: string;
  name: string;
  imgUrl: string;
  type?: string;
  exchange: string;
}

Tezos.setProvider({ rpc: "https://testnet-tezos.giganode.io" });

let prevHash = "";
Tezos.stream.subscribe("head").on("data", hash => {
  if (prevHash && hash !== prevHash) {
    mem.clear(getStorage);
  }
  prevHash = hash;
});

export function toValidAmount(amount?: BigNumber) {
  return amount && amount.isFinite() && amount.isGreaterThan(0)
    ? amount.toString()
    : "";
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

export function clearMem() {
  mem.clear(getStorage);
  mem.clear(getContract);
}

export const getDexStorage = (contractAddress: string) =>
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

export function estimateTezToToken(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  const mutezAmount = tzToMutez(tezAmount);
  const fee = mutezAmount
    .div(dexStorage.feeRate)
    .integerValue(BigNumber.ROUND_DOWN);
  const newTezPool = mutezAmount.plus(dexStorage.tezPool);
  const tempTezPool = newTezPool.minus(fee);
  const newTokenPool = new BigNumber(dexStorage.invariant)
    .div(tempTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  return new BigNumber(dexStorage.tokenPool).minus(newTokenPool);
}

export function estimateTezToTokenInverse(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const newTokenPool = new BigNumber(dexStorage.tokenPool).minus(tokenAmount);
  const tempTezPool = new BigNumber(dexStorage.invariant)
    .div(newTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTezPool
    .minus(dexStorage.tezPool)
    .div(new BigNumber(dexStorage.feeRate).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  return mutezToTz(fee.times(dexStorage.feeRate));
}

export function estimateTokenToTez(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const fee = new BigNumber(tokenAmount)
    .div(dexStorage.feeRate)
    .integerValue(BigNumber.ROUND_DOWN);
  const newTokenPool = new BigNumber(dexStorage.tokenPool).plus(tokenAmount);
  const tempTokenPool = newTokenPool.minus(fee);
  const newTezPool = new BigNumber(dexStorage.invariant)
    .div(tempTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const minTezOut = new BigNumber(dexStorage.tezPool).minus(newTezPool);
  return mutezToTz(minTezOut);
}

export function estimateTokenToTezInverse(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  const mutezAmount = tzToMutez(tezAmount);
  const newTezPool = new BigNumber(dexStorage.tezPool).minus(mutezAmount);
  const tempTokenPool = new BigNumber(dexStorage.invariant)
    .div(newTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTokenPool
    .minus(dexStorage.tokenPool)
    .div(new BigNumber(dexStorage.feeRate).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  return fee.times(dexStorage.feeRate);
}

export function estimatePrice(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  const tezPerShare = new BigNumber(dexStorage.tezPool)
    .div(dexStorage.totalShares)
    .integerValue(BigNumber.ROUND_DOWN);
  const tokenPerShare = new BigNumber(dexStorage.tokenPool)
    .div(dexStorage.totalShares)
    .integerValue(BigNumber.ROUND_DOWN);
  const shares = tzToMutez(tezAmount)
    .div(tezPerShare)
    .integerValue(BigNumber.ROUND_DOWN);
  return shares.times(tokenPerShare);
}

export function estimatePriceInverse(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const tezPerShare = new BigNumber(dexStorage.tezPool)
    .div(dexStorage.totalShares)
    .integerValue(BigNumber.ROUND_DOWN);
  const tokenPerShare = new BigNumber(dexStorage.tokenPool)
    .div(dexStorage.totalShares)
    .integerValue(BigNumber.ROUND_DOWN);
  const shares = new BigNumber(tokenAmount)
    .div(tokenPerShare)
    .integerValue(BigNumber.ROUND_DOWN);
  return mutezToTz(shares.times(tezPerShare));
}

export function tzToMutez(tz: any) {
  return Tezos.format("tz", "mutez", tz) as BigNumber;
}

export function mutezToTz(mutez: any) {
  return Tezos.format("mutez", "tz", mutez) as BigNumber;
}

export function isAddressValid(address: any) {
  return validateAddress(address) === ValidationResult.VALID;
}
