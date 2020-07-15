import initContract from "@/taquito/tezos";

// Spec: https://github.com/madfish-solutions/quipuswap-core#dex

export async function initializeExchange(contractAddress: string, num: number) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.use(0, "initializeExchange", num).send({ amount: <any>"1" });
  await op.confirmation(1);
  return op;
}

export async function tezToTokenPayment(contractAddress: string, num: number, address: string) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.use(1, "tezToTokenPayment", num, address).send({ amount: num });
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
    .use(2, "tokenToTezPayment", inputAmount, outputAmount, address)
    .send({ amount: inputAmount });
  op.confirmation(1);
  return op;
}

export async function tezToTokenSwap(contractAddress: string, num: number, num2: number) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.use(1, "tezToTokenPayment", num, "<me>").send({ amount: num2 });
  op.confirmation(1);
  return op;
}

export async function tokenToTezSwap(contractAddress: string, num1: number, num2: number) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.use(2, "tokenToTezPayment", num1, num2, "<me>").send();
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
    .use(3, "tokenToTokenOut", inputAmount, outputAmount, tokenAddress, "<me>")
    .send();
  await op.confirmation(1);
  return op;
}

export async function investLiquidity(
  contractAddress: string,
  xtzAmount: string,
  tokenAmount: string,
  bakerPkh: string
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.use(4, "investLiquidity", tokenAmount).send({ amount: 1 });
  await op.confirmation(1);
  return op;
}

export async function divestLiquidity(
  contractAddress: string,
  sharesBurned: number,
  minTez: string,
  minTokens: string
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods
    .use(5, "divestLiquidity", sharesBurned, minTez, minTokens)
    .send();
  op.confirmation(1);
  return op;
}
