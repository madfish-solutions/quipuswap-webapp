import fs from "fs";
import path from "path";
import { TOKEN_WHITELIST } from "../src/whitelist";

fs.writeFileSync(
  path.join(__dirname, "../public/whitelist.json"),
  JSON.stringify(TOKEN_WHITELIST, null, 2)
);
