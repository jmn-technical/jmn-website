const fs = require("fs");
const path = require("path");
const projectRoot = path.resolve(__dirname, "..");
const targets = [
  path.join(projectRoot, "node_modules", "npm"),
  path.join(projectRoot, "node_modules", "react-multi-carousel", "node_modules", "npm")
];
function remove(p) {
  if (!fs.existsSync(p)) return;
  try {
    if (fs.rmSync) fs.rmSync(p, { recursive: true, force: true });
    else {
      const { execSync } = require("child_process");
      execSync(process.platform === "win32" ? `rmdir /s /q "${p}"` : `rm -rf "${p}"`);
    }
    console.log("Removed local npm at", p);
  } catch (err) {
    console.error("Failed to remove", p, err);
    process.exitCode = 1;
  }
}
targets.forEach(remove);
