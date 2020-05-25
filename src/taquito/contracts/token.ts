import initContract from "@/taquito/tezos";
import BigNumber from "bignumber.js";

const CONTRACT = "KT1R299cg7K94e3rFCGzpacTXJshQ43meffR";
// approve: { 0: "address", 1: "nat" }
// burn: "nat"
// getAllowance: { 2: "address", 3: "address", 4: "contract" }
// getBalance: { 3: "address", 4: "contract" }
// getTotalSupply: { 4: "unit", 5: "contract" }
// mint: "nat"
// transfer: { 6: "address", 7: "address", 8: "nat" }

export async function getStorage(contractAddress = CONTRACT) {
  const contract = await initContract(contractAddress);
  const storage = await contract.storage();
  return storage;
}

export async function getBalance(address: string) {
  const storage: any = await getStorage();
  const ledger = storage.ledger.valueMap.get(`"${address}"`);
  return new BigNumber(ledger.balance).toNumber();
}

export async function approve(address: string, coins: number) {
  const contract = await initContract(CONTRACT);
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
