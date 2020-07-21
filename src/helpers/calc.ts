import BigNumber from "bignumber.js";
import { Tezos } from "@taquito/taquito";

export function round(value: number) {
  if (value > 0 && value < 1) {
    return value.toPrecision(3);
  }
  return Math.floor(value);
}

export const calcTezToToken = (storage: any, tezAmount: any): any => {
  if (tezAmount) {
    const mutezAmount: number = parseFloat(tezAmount) * 1000000;
    const fee: number = parseFloat(`${mutezAmount / storage.feeRate}`);
    const newTezPool: any = parseFloat(`${+storage.tezPool + +mutezAmount}`);
    const tempTezPool: any = parseFloat(`${newTezPool - fee}`);
    const newTokenPool: any = parseFloat(`${storage.invariant / tempTezPool}`);
    const minTokens = `${storage.tokenPool - newTokenPool}`;
    return parseInt(minTokens, 10);
  }
  return 0;
};

export const calcTokenToTez = (storage: any, tokenAmount: any): any => {
  if (tokenAmount) {
    const fee: number = parseFloat(`${tokenAmount / storage.feeRate}`);
    const newTokenPool: any = parseFloat(`${+storage.tokenPool + +tokenAmount}`);
    const tempTokenPool: any = parseFloat(`${newTokenPool - fee}`);
    const newTesosPool: any = parseFloat(`${storage.invariant / tempTokenPool}`);
    const minTezos = parseFloat(`${storage.tezPool - newTesosPool}`);
    return round(minTezos / 1000000);
  }
  return 0;
};

export function estimateTezosToToken(storage: any, tezAmount: any): any {
  if (tezAmount) {
    const tezPerShare = new BigNumber(storage.tezPool)
      .div(storage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN);
    const tokenPerShare = new BigNumber(storage.tokenPool)
      .div(storage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN);
    const shares = tzToMutez(tezAmount)
      .div(tezPerShare)
      .integerValue(BigNumber.ROUND_DOWN);
    return shares.times(tokenPerShare).toNumber();
  }
  return 0;
}

export function estimateTokenToTezos(storage: any, tokenAmount: any): any {
  if (tokenAmount) {
    const tezPerShare = new BigNumber(storage.tezPool)
      .div(storage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN);
    const tokenPerShare = new BigNumber(storage.tokenPool)
      .div(storage.totalShares)
      .integerValue(BigNumber.ROUND_DOWN);
    const shares = new BigNumber(tokenAmount).div(tokenPerShare).integerValue(BigNumber.ROUND_DOWN);
    return mutezToTz(shares.times(tezPerShare)).toNumber();
  }
  return 0;
}

export function tzToMutez(tz: any) {
  return Tezos.format("tz", "mutez", tz) as BigNumber;
}

export function mutezToTz(mutez: any) {
  return Tezos.format("mutez", "tz", mutez) as BigNumber;
}
