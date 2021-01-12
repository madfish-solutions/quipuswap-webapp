import BigNumber from "bignumber.js";
import { tzToMutez, mutezToTz } from "./helpers";
import { FEE_RATE } from "./defaults";
import { QSAsset } from "./types";

const PENNY = 0.000001;

export function estimateTezToToken(
  tezAmount: any,
  dexStorage: any,
  token: QSAsset
) {
  if (!tezAmount) return new BigNumber(0);

  const mutezAmount = tzToMutez(tezAmount);
  const fee = mutezAmount.div(FEE_RATE).integerValue(BigNumber.ROUND_DOWN);
  const newTezPool = mutezAmount.plus(dexStorage.tezPool);
  const tempTezPool = newTezPool.minus(fee);
  const newTokenPool = new BigNumber(dexStorage.invariant)
    .div(tempTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  return fromNat(
    new BigNumber(dexStorage.tokenPool).minus(newTokenPool),
    token
  );
}

export function estimateTezToTokenInverse(
  tokenAmount: any,
  dexStorage: any,
  token: QSAsset
) {
  if (!tokenAmount) return new BigNumber(0);

  const newTokenPool = new BigNumber(dexStorage.tokenPool).minus(
    toNat(tokenAmount, token)
  );
  const tempTezPool = new BigNumber(dexStorage.invariant)
    .div(newTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTezPool
    .minus(dexStorage.tezPool)
    .div(new BigNumber(FEE_RATE).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  return mutezToTz(fee.times(FEE_RATE));
}

export function estimateTokenToTez(
  tokenAmount: any,
  dexStorage: any,
  token: QSAsset
) {
  if (!tokenAmount) return new BigNumber(0);

  const tokenAmountNat = toNat(tokenAmount, token);
  const fee = tokenAmountNat.div(FEE_RATE).integerValue(BigNumber.ROUND_DOWN);
  const newTokenPool = new BigNumber(dexStorage.tokenPool).plus(tokenAmountNat);
  const tempTokenPool = newTokenPool.minus(fee);
  const newTezPool = new BigNumber(dexStorage.invariant)
    .div(tempTokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const minTezOut = new BigNumber(dexStorage.tezPool).minus(newTezPool);
  return mutezToTz(minTezOut);
}

export function estimateTokenToTezInverse(
  tezAmount: any,
  dexStorage: any,
  token: QSAsset
) {
  if (!tezAmount) return new BigNumber(0);

  const mutezAmount = tzToMutez(tezAmount);
  const newTezPool = new BigNumber(dexStorage.tezPool).minus(mutezAmount);
  const tempTokenPool = new BigNumber(dexStorage.invariant)
    .div(newTezPool)
    .integerValue(BigNumber.ROUND_DOWN);
  const fee = tempTokenPool
    .minus(dexStorage.tokenPool)
    .div(new BigNumber(FEE_RATE).minus(1))
    .integerValue(BigNumber.ROUND_DOWN);
  return fromNat(fee.times(FEE_RATE), token);
}

export function estimateShares(tezAmount: any, dexStorage: any) {
  if (!tezAmount) return new BigNumber(0);

  return tzToMutez(tezAmount)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(dexStorage.totalSupply)
    .div(dexStorage.tezPool)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function estimateSharesInverse(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  return new BigNumber(tokenAmount)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(dexStorage.totalSupply)
    .div(dexStorage.tokenPool)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function estimateInTezos(shares: any, dexStorage: any) {
  if (!shares) return new BigNumber(0);

  return mutezToTz(
    new BigNumber(shares)
      .times(dexStorage.tezPool)
      .div(dexStorage.totalSupply)
      .integerValue(BigNumber.ROUND_DOWN)
  );
}

export function estimateInTokens(shares: any, dexStorage: any) {
  if (!shares) return new BigNumber(0);

  return new BigNumber(shares)
    .times(dexStorage.tokenPool)
    .div(dexStorage.totalSupply)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function estimateToTezos(tokenAmount: any, dexStorage: any) {
  if (!tokenAmount) return new BigNumber(0);

  const shares = estimateSharesInverse(tokenAmount, dexStorage);
  let tezAmount = estimateInTezos(shares, dexStorage);

  while (!toTokens(tezAmount, dexStorage).isEqualTo(tokenAmount)) {
    tezAmount = tezAmount.plus(PENNY);
  }
  return tezAmount;
}

export function fromNat(amount: any, token: QSAsset) {
  return new BigNumber(amount).div(10 ** token.decimals);
}

export function toNat(amount: any, token: QSAsset) {
  return new BigNumber(amount)
    .times(10 ** token.decimals)
    .integerValue(BigNumber.ROUND_DOWN);
}

function toTokens(tezAmount: any, dexStorage: any) {
  const shares = estimateShares(tezAmount, dexStorage);
  return estimateInTokens(shares, dexStorage);
}
