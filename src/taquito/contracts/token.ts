import initContract from "@/taquito/tezos";
import BigNumber from "bignumber.js";

// approve: { 0: "address", 1: "nat" }
// burn: "nat"
// getAllowance: { 2: "address", 3: "address", 4: "contract" }
// getBalance: { 3: "address", 4: "contract" }
// getTotalSupply: { 4: "unit", 5: "contract" }
// mint: "nat"
// transfer: { 6: "address", 7: "address", 8: "nat" }

export async function getStorage(contractAddress: string) {
  const contract = await initContract(contractAddress);
  const storage = await contract.storage().catch(e => console.error(e));
  return storage;
}

export async function getBalance(contractAddress: string, address: string) {
  const storage: any = await getStorage(contractAddress);
  const ledger = storage.ledger.valueMap.get(`"${address}"`);
  return new BigNumber(ledger.balance).toNumber();
}

export async function approve(contractAddress: string, address: string, coins: number) {
  const contract = await initContract(contractAddress);
  const op = await contract.methods.approve(address, coins).send();
  await op.confirmation(1);
  return op;
}

export async function burn(num: number) {
  return [];
}

export async function getAllowance(addressIn: string, addressOut: string, contractAddress: string) {
  return [];
}

export async function getTotalSupply(unit: string, contractAddress: string) {
  return [];
}

export async function mint(num: number) {
  return [];
}

export async function transfer(addressIn: string, addressOut: string, num: number) {
  return [];
}
