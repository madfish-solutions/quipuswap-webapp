import initContract from "@/taquito/tezos";

const CONTRACT = "KT1JmH73vJezDRur4WkDjHRbjiGorTAwHwhz";

// launchExchange: {0: "address", 1: "address"}
// tokenToExchangeLookup: {1: "address", 2: "address", 3: "nat"}

export async function getFactoryStorage() {
  const contract = await initContract(CONTRACT);
  const op = await contract.storage();
  return op;
}

export async function launchExchange(address1: string, address2: string) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.launchExchange(address1, address2).send();
  return op;
}

export async function tokenToExchangeLookup(token: string, token2: string, nat: number) {
  const contract = await initContract(CONTRACT);
  const op = await contract.methods.tokenToExchangeLookup(token, token2, nat).send();
  return op;
}
