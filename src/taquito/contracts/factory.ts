import initContract from "@/taquito/tezos";

// launchExchange: {0: "address", 1: "address"}
// tokenToExchangeLookup: {1: "address", 2: "address", 3: "nat"}

export async function getStorage(contractAddress: string = "KT1FyLRcRpBXWfBzjPPvjHic4nqnWyqhiGje") {
  const contract = await initContract(contractAddress);
  const op = await contract
    .storage()
    .then((s: any) => s.storage)
    .catch(e => console.error(e));
  return op;
}

export async function launchExchange(contractAddress: string, address1: string, address2: string) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.launchExchange(address1, address2).send();
  await op.confirmation(1);
  return op;
}

export async function tokenToExchangeLookup(
  contractAddress: string,
  tokenOutAddress: string,
  recipient: string,
  minTokensOut: number
) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods
    .tokenToExchangeLookup(tokenOutAddress, recipient)
    .send({ amount: minTokensOut });
  return op;
}
