export class LambdaViewSigner {
  async publicKeyHash() {
    return "tz1fVQangAfb9J1hRRMP2bSB6LvASD6KpY8A";
  }

  async publicKey() {
    return "edpkvWbk81uh1DEvdWKR4g1bjyTGhdu1mDvznPUFE2zDwNsLXrEb9K";
  }

  async secretKey(): Promise<string> {
    throw new Error("Secret key cannot be exposed");
  }

  async sign(): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }> {
    throw new Error("Cannot sign");
  }
}
