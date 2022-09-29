// @ts-check

const { getTextOfTypeFromMsg } = require("./utils/tmessage");
const { alpmVercmp, versionRegex } = require("./utils/alpm");

const highlightPkgs = require("./config.highlight");

const yyyymmdd = (date) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return yyyy + mm + dd;
};

/** @type {ChatHistoryJSON} */
const chatHistory = require(`./exports/export-${yyyymmdd(new Date())}.json`);

/** @type {Record<string, [string, string]>} */
const packageUpdates = {};
let builtPkgCount = 0;

chatHistory.messages.forEach((msg) => {
  const text = getTextOfTypeFromMsg(msg, "plain");
  if (!text.startsWith("\n")) {
    console.error("Unexpected message format:", msg.text);
    return;
  }
  const lines = text.trim().split("\n");
  for (const line of lines) {
    builtPkgCount++;
    const words = line.split(" ");
    if (words.length === 2 && versionRegex.test(words[1])) {
      const [pkgname, newVersion] = words;
      if (!packageUpdates[pkgname]) {
        packageUpdates[pkgname] = ["", newVersion];
        continue;
      }
      // note that this is a new package
      packageUpdates[pkgname][0] = "";
      const newVersion2 = packageUpdates[pkgname][1];
      packageUpdates[pkgname][1] = alpmVercmp(newVersion, newVersion2) > 0 ? newVersion : newVersion2;
      continue;
    } else if (words.length !== 4 || words[2] !== "->") {
      console.error("Unexpected line:", line);
      continue;
    }
    const [pkgname, oldVersion, , newVersion] = words;
    if (!versionRegex.test(oldVersion) || !versionRegex.test(newVersion)) {
      console.error("Unexpected version:", line, oldVersion, newVersion);
      continue;
    }
    if (!packageUpdates[pkgname]) {
      packageUpdates[pkgname] = [oldVersion, newVersion];
      continue;
    }
    const [oldVersion2, newVersion2] = packageUpdates[pkgname];
    packageUpdates[pkgname][0] = alpmVercmp(oldVersion, oldVersion2) < 0 ? oldVersion : oldVersion2;
    packageUpdates[pkgname][1] = alpmVercmp(newVersion, newVersion2) > 0 ? newVersion : newVersion2;
  }
});

console.log("[ Arch Linux RISC-V Bi-Week Package Update Stats Report ]");
// 1. built package count
console.log("Built package count:", builtPkgCount);
// 2. built package count, distinct by package name
console.log("Built distinct package count:", Object.keys(packageUpdates).length);
// 3. highlight packages
console.log("Highlight packages:");
highlightPkgs.forEach((pkgname) => {
  if (!packageUpdates[pkgname]) {
    return;
  }
  const [oldVersion, newVersion] = packageUpdates[pkgname];
  const { epoch: epoch1, version: version1 } = oldVersion.match(versionRegex)?.groups ?? {};
  const { epoch: epoch2, version: version2 } = newVersion.match(versionRegex)?.groups ?? {};
  if (epoch1 === epoch2 && version1 === version2) {
    // rebuild without update, ignore
    return;
  }
  console.log("   ", pkgname, "-", oldVersion === "" ? "never been built" : oldVersion, "->", newVersion);
});