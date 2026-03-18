import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm" : "npm";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

function runProcess(name, cwd) {
  const child = spawn(npmCommand, ["run", "dev"], {
    cwd: path.resolve(repoRoot, cwd),
    stdio: "inherit",
    shell: isWindows,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${name} exited with signal ${signal}`);
      if (!isShuttingDown) {
        shutdown(1);
      }
      return;
    }

    console.log(`${name} exited with code ${code}`);
    shutdown(code ?? 0);
  });

  child.on("error", (error) => {
    console.error(`Failed to start ${name}:`, error);
    shutdown(1);
  });

  return child;
}

const children = [
  runProcess("backend", "backend"),
  runProcess("frontend", "react"),
];

let isShuttingDown = false;

function shutdown(exitCode = 0) {
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

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
