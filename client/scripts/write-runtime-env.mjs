import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const clientRoot = resolve(process.cwd());
const sourceRoot = join(clientRoot, "src");
const assetsDir = join(sourceRoot, "assets");
const outputFile = join(assetsDir, "runtime-env.js");

const envFiles = [join(clientRoot, ".env"), join(clientRoot, ".env.local"), join(resolve(clientRoot, ".."), ".env"), join(resolve(clientRoot, ".."), ".env.local")];

function parseEnv(content) {
  const env = {};
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const cleanLine = line.startsWith("export ") ? line.slice(7) : line;
      const eqIndex = cleanLine.indexOf("=");
      if (eqIndex === -1) {
        return;
      }
      const key = cleanLine.slice(0, eqIndex).trim();
      let value = cleanLine.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    });
  return env;
}

const fileEnv = envFiles.reduce((acc, filePath) => {
  if (!existsSync(filePath)) {
    return acc;
  }
  try {
    return { ...acc, ...parseEnv(readFileSync(filePath, "utf8")) };
  } catch {
    return acc;
  }
}, {});

const runtimeEnv = {
  XAI_API_KEY: process.env.XAI_API_KEY || fileEnv.XAI_API_KEY || ""
};

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `window.__MALLOS_ENV = ${JSON.stringify(runtimeEnv, null, 2)};\n`, "utf8");

console.log(`Wrote runtime env to ${outputFile}`);
