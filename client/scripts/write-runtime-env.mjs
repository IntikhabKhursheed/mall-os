import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const clientRoot = resolve(process.cwd());
const sourceRoot = join(clientRoot, "src");
const assetsDir = join(sourceRoot, "assets");
const outputFile = join(assetsDir, "runtime-env.js");

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, "window.__MALLOS_ENV = {};\n", "utf8");

console.log(`Wrote runtime env to ${outputFile}`);
