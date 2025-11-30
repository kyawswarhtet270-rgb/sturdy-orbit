const fs = require("fs-extra");
const path = require("path");
const base = path.join(__dirname);

async function read(file) {
  const p = path.join(base, file);
  await fs.ensureFile(p);
  const data = await fs.readFile(p, "utf8");
  return data ? JSON.parse(data) : [];
}

async function write(file, data) {
  const p = path.join(base, file);
  await fs.writeJson(p, data, { spaces: 2 });
}

module.exports = { read, write };

