#!/usr/bin/env node
/**
 * Local setup: writes .env DATABASE_URL for this OS user, creates DB, runs migrations.
 * Requires Postgres on localhost:5432 (e.g. brew services start postgresql@16)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

const brewPgBins = [
  "/opt/homebrew/opt/postgresql@16/bin",
  "/usr/local/opt/postgresql@16/bin",
];
for (const bin of brewPgBins) {
  if (fs.existsSync(bin)) {
    process.env.PATH = `${bin}${path.delimiter}${process.env.PATH}`;
    break;
  }
}

const user = os.userInfo().username;
const dbUrl = `postgresql://${user}@localhost:5432/ethara?schema=public`;

let jwtLine = 'JWT_SECRET="change-this-to-a-long-random-string-in-production"';
if (fs.existsSync(envPath)) {
  const existing = fs.readFileSync(envPath, "utf8");
  const jwtMatch = existing.match(/^JWT_SECRET=(.*)$/m);
  if (jwtMatch) jwtLine = `JWT_SECRET=${jwtMatch[1].trim()}`;
}

const envContents = `# Local Postgres — npm run setup:local (${new Date().toISOString().slice(0, 10)})
DATABASE_URL="${dbUrl}"
${jwtLine}
`;

fs.writeFileSync(envPath, envContents);
console.log(`Wrote DATABASE_URL for user "${user}" → ethara`);

try {
  execSync("createdb ethara", { stdio: "pipe", env: process.env });
  console.log("Created database ethara.");
} catch {
  console.log("(createdb skipped — DB may already exist)");
}

execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root, env: process.env });
console.log("\nOK — run: npm run dev");
