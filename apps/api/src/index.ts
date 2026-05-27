import http from "node:http";
import fs from "fs";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

const logFile = fs.createWriteStream("api_debug.log", { flags: "a" });
const originalError = console.error;
console.error = function(...args) {
  logFile.write(args.map(a => typeof a === "object" ? JSON.stringify(a, Object.getOwnPropertyNames(a)) : a).join(" ") + "\n");
  originalError.apply(console, args);
};

import { env } from "./env";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
// trigger reload
