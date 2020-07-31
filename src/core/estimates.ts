import BigNumber from "bignumber.js";
import { tzToMutez, mutezToTz } from "./helpers";

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

export function estimateShares(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  return tzToMutez(tezAmount)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(dexStorage.totalShares)
    .div(dexStorage.tezPool)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function estimateSharesInverse(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  return new BigNumber(tokenAmount)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(dexStorage.totalShares)
    .div(dexStorage.tokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function estimateInTezos(shares: any, dexStorage: any) {
  if (!shares) return new BigNumber(0);

  return mutezToTz(
    new BigNumber(shares)
      .times(dexStorage.tezPool)
      .div(dexStorage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN)
  );
}

export function estimateInTokens(shares: any, dexStorage: any) {
  if (!shares) return new BigNumber(0);

  return new BigNumber(shares)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(dexStorage.tokenPool)
    .div(dexStorage.totalShares)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function estimatePrice(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  const tezPerShare = new BigNumber(dexStorage.tezPool).div(
    dexStorage.totalShares
  );
  // .integerValue(BigNumber.ROUND_DOWN);
  const tokenPerShare = new BigNumber(dexStorage.tokenPool).div(
    dexStorage.totalShares
  );
  // .integerValue(BigNumber.ROUND_DOWN);
  const shares = tzToMutez(tezAmount).div(tezPerShare);
  // .integerValue(BigNumber.ROUND_DOWN);
  return shares.times(tokenPerShare).integerValue(BigNumber.ROUND_DOWN);
}

export function estimatePriceInverse(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const tezPerShare = new BigNumber(dexStorage.tezPool).div(
    dexStorage.totalShares
  );
  // .integerValue(BigNumber.ROUND_DOWN);
  const tokenPerShare = new BigNumber(dexStorage.tokenPool).div(
    dexStorage.totalShares
  );
  // .integerValue(BigNumber.ROUND_DOWN);
  const shares = new BigNumber(tokenAmount).div(tokenPerShare);
  // .integerValue(BigNumber.ROUND_DOWN);
  return mutezToTz(shares.times(tezPerShare)).integerValue(
    BigNumber.ROUND_DOWN
  );
}
