export const calcTezToToken = (storage: any, tezAmount: any): any => {
  if (tezAmount) {
    const mutezAmount: number = parseFloat(tezAmount) * 1000000;
    const fee: number = parseFloat(`${mutezAmount / storage.feeRate}`);
    const newTezPool: any = parseFloat(`${+storage.tezPool + +mutezAmount}`);
    const tempTezPool: any = parseFloat(`${newTezPool - fee}`);
    const newTokenPool: any = parseFloat(`${storage.invariant / tempTezPool}`);
    const minTokens = parseFloat(`${storage.tokenPool - newTokenPool}`);
    return minTokens;
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
    return minTezos / 1000000;
  }
  return 0;
};
