import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm" : "npm";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

function RunInstall(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["install"], {
      cwd: path.resolve(repoRoot, cwd),
      stdio: "inherit",
      shell: isWindows,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`npm install failed in ${cwd} with code ${code}`));
    });

    child.on("error", reject);
  });
}

try {
  console.log("Installing backend dependencies...");
  await RunInstall("backend");
  console.log("Installing frontend dependencies...");
  await RunInstall("react");

  const envPath = path.resolve(repoRoot, "backend/.env");
  if (!fs.existsSync(envPath)) {
    console.log("Create backend/.env from backend/.env.example before using the API.");
  }

  console.log("Setup complete. Run `npm run dev` from the repo root.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
