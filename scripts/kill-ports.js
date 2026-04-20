const { execSync } = require("child_process");

const ports = process.argv
  .slice(2)
  .map((value) => Number.parseInt(value, 10))
  .filter((value) => Number.isInteger(value) && value > 0);

if (ports.length === 0) {
  process.exit(0);
}

function getPidsForPortWindows(port) {
  try {
    const output = execSync("netstat -ano -p tcp", { stdio: ["ignore", "pipe", "pipe"] }).toString();
    const lines = output.split(/\r?\n/);
    const pids = new Set();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("TCP")) {
        continue;
      }

      const columns = trimmed.split(/\s+/);
      if (columns.length < 5) {
        continue;
      }

      const localAddress = columns[1] || "";
      const state = columns[3] || "";
      const pid = columns[4] || "";

      if (state !== "LISTENING") {
        continue;
      }

      if (localAddress.endsWith(`:${port}`) && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }

    return [...pids];
  } catch {
    return [];
  }
}

function getPidsForPortUnix(port) {
  try {
    const output = execSync(`lsof -ti tcp:${port}`, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
    if (!output) {
      return [];
    }

    return output
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter((value) => /^\d+$/.test(value));
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F`, { stdio: ["ignore", "pipe", "pipe"] });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: ["ignore", "pipe", "pipe"] });
    }
    return true;
  } catch {
    return false;
  }
}

const allPids = new Set();
for (const port of ports) {
  const pids = process.platform === "win32" ? getPidsForPortWindows(port) : getPidsForPortUnix(port);
  for (const pid of pids) {
    allPids.add(pid);
  }
}

let killed = 0;
for (const pid of allPids) {
  if (killPid(pid)) {
    killed += 1;
  }
}

if (killed > 0) {
  console.log(`Stopped ${killed} process(es) using dev ports.`);
} else {
  console.log("No stale dev-port processes found.");
}
