import { Contract, WalletContract } from "@taquito/taquito";

export async function isFA2(contract: Contract | WalletContract) {
  try {
    await Promise.all(
      FA2_METHODS_ASSERTIONS.map(async ({ name, assertion }) => {
        if (typeof contract.methods[name] !== "function") {
          throw new Error("Not FA2");
        }
        assertion(contract);
      })
    );
    return true;
  } catch {
    return false;
  }
}

const FA2_METHODS_ASSERTIONS = [
  {
    name: "update_operators",
    assertion: signatureAssertionFactory("update_operators", ["list"]),
  },
  {
    name: "transfer",
    assertion: signatureAssertionFactory("transfer", ["list"]),
  },
];

function signatureAssertionFactory(name: string, args: string[]) {
  return (contract: Contract | WalletContract) => {
    const signatures = contract.parameterSchema.ExtractSignatures();
    const receivedSignature = signatures.find(
      signature => signature[0] === name
    );
    assert(receivedSignature);
    const receivedArgs = receivedSignature.slice(1);
    assert(receivedArgs.length === args.length);
    receivedArgs.forEach((receivedArg, index) =>
      assert(receivedArg === args[index])
    );
  };
}

export class AssertionError extends Error {
  constructor(message?: string, public actual?: any) {
    super(message);
  }
}

export default function assert(value: any): asserts value {
  if (!value) {
    throw new AssertionError(`The value ${value} is not truthy`, value);
  }
}
