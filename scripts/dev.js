import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm" : "npm";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

function LogStartupHelp() {
  console.log("Starting the frontend and backend dev servers...");
  console.log(
    "Frontend: Vite will print the exact URL below (usually http://localhost:5173)."
  );
  console.log("Backend: http://localhost:3000");
  console.log("This command stays open while the dev servers are running.");
  console.log("Press Ctrl+C to stop both servers.");
}

function RunProcess(name, cwd) {
  const child = spawn(npmCommand, ["run", "dev"], {
    cwd: path.resolve(repoRoot, cwd),
    stdio: "inherit",
    shell: isWindows,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${name} exited with signal ${signal}`);
      if (!isShuttingDown) {
        Shutdown(1);
      }
      return;
    }

    console.log(`${name} exited with code ${code}`);
    Shutdown(code ?? 0);
  });

  child.on("error", (error) => {
    console.error(`Failed to start ${name}:`, error);
    Shutdown(1);
  });

  return child;
}

LogStartupHelp();

const children = [
  RunProcess("backend", "backend"),
  RunProcess("frontend", "react"),
];

let isShuttingDown = false;

function Shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => process.exit(exitCode), 100);
}

process.on("SIGINT", () => Shutdown(0));
process.on("SIGTERM", () => Shutdown(0));
