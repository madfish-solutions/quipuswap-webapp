import initContract from "@/taquito/tezos";

// divestLiquidity: {0: "nat", 1: "nat", 2: "nat"}
// initializeExchange: {1: "nat", 2: "key_hash"}
// investLiquidity: {2: "nat", 3: "key_hash"}
// tezToTokenPayment: {3: "nat", 4: "address"}
// tezToTokenSwap: "nat"
// tokenToTezPayment: {5: "nat", 6: "nat", 7: "address"}
// tokenToTezSwap: {6: "nat", 7: "nat"}
// tokenToTokenIn: {7: "nat", 8: "address"}
// tokenToTokenPayment: {8: "nat", 9: "nat", 10: "address", 11: "address"}
// tokenToTokenSwap: {9: "nat", 10: "nat", 11: "address"}

export async function divestLiquidity(
  contractAddress: string,
  sharesBurned: number,
  minTez: string,
  minTokens: string
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.divestLiquidity(sharesBurned, minTez, minTokens).send();
  op.confirmation(1);
  return op;
}

export async function investLiquidity(
  contractAddress: string,
  xtzAmount: string,
  tokenAmount: string,
  bakerPkh: string
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.investLiquidity(tokenAmount, bakerPkh).send({ amount: 1 });
  await op.confirmation(1);
  return op;
}

export async function initializeExchange(contractAddress: string, num: number, hash: string) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.initializeExchange(num, hash).send({ amount: <any>"1" });
  await op.confirmation(1);
  return op;
}

export async function tezToTokenPayment(contractAddress: string, num: number, address: string) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.tezToTokenPayment(num, address).send({ amount: num });
  op.confirmation(1);
  return op;
}
export async function tokenToTezPayment(
  contractAddress: string,
  inputAmount: number,
  outputAmount: number,
  address: string
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods
    .tokenToTezPayment(inputAmount, outputAmount, address)
    .send({ amount: inputAmount });
  op.confirmation(1);
  return op;
}

export async function tezToTokenSwap(contractAddress: string, num: number, num2: number) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.tezToTokenSwap(num).send({ amount: num2 });
  op.confirmation(1);
  return op;
}

export async function tokenToTezSwap(contractAddress: string, num1: number, num2: number) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.tokenToTezSwap(num1, num2).send();
  await op.confirmation(1);
  return op;
}
export async function tokenToTokenSwap(
  contractAddress: string,
  inputAmount: number,
  outputAmount: number,
  tokenAddress: string
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods
    .tokenToTokenSwap(inputAmount, outputAmount, tokenAddress)
    .send({ gasLimit: 1040000 });
  await op.confirmation(1);
  return op;
}

export async function tokenToTokenIn(contractAddress: string, amount: number, address: string) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.tokenToTokenIn(amount, address).send();
  await op.confirmation(1);
  return op;
}
