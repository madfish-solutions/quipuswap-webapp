import initContract from "@/taquito/tezos";

const CONTRACT = "KT1CVjrhWnYqSxHdMV6qWrfXN6mEsmtejDvX";

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

export async function divestLiquidity(num1: string, num2: string, num3: string) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.divestLiquidity(num1, num2, num3).send();
  op.confirmation();
  return op;
}

export async function investLiquidity(
  amount: number,
  bakerPkh = "tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf"
) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.investLiquidity(amount, bakerPkh).send({ amount });
  await op.confirmation();
  return op;
}

export async function initializeExchange(num: number, hash: string) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.initializeExchange(num, hash).send();
  await op.confirmation();
  return op;
}

export async function tezToTokenPayment(num: number, address: string) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.tezToTokenPayment(num, address).send({ amount: num });
  op.confirmation();
  return op;
}

export async function tezToTokenSwap(num: number) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.tezToTokenSwap(num).send();
  op.confirmation();
  return op;
}
