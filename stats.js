// @ts-check

const { get } = require("https");

const { getTextOfTypeFromMsg } = require("./utils/tmessage");
const { alpmVercmp, versionRegex } = require("./utils/alpm");

const highlightPkgs = require("./config.highlight");

/**
 * @param {Date} date
 */
const yyyymmdd = (date) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return yyyy + mm + dd;
};

/** @type {import("./types").ChatHistoryJSON} */
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
      // this indicates a new package that has never been built before
      const [pkgname, newVersion] = words;
      if (!packageUpdates[pkgname]) {
        packageUpdates[pkgname] = ["", newVersion];
        continue;
      }

      packageUpdates[pkgname][0] = "";
      const storedNewVersion = packageUpdates[pkgname][1];
      packageUpdates[pkgname][1] = alpmVercmp(newVersion, storedNewVersion) > 0 ? newVersion : storedNewVersion;
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

    const [storedOldVersion, storedNewVersion] = packageUpdates[pkgname];

    // this also handles the case where storedOldVersion is an empty string
    packageUpdates[pkgname][0] = alpmVercmp(oldVersion, storedOldVersion) < 0 ? oldVersion : storedOldVersion;
    packageUpdates[pkgname][1] = alpmVercmp(newVersion, storedNewVersion) > 0 ? newVersion : storedNewVersion;
  }
});

console.log("[ Arch Linux RISC-V Bi-Week Package Update Stats Report ]");

// 0. show date
console.log(`Report generated on: ${yyyymmdd(new Date())}`);

// 1. built package count
console.log("Package update count:", builtPkgCount);

// 2. built package count, distinct by package name
console.log("Distinct package update count:", Object.keys(packageUpdates).length);

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
  console.log("   ", pkgname, "-", oldVersion === "" ? "never been built" : oldVersion, "-->", newVersion);
});

// 4. show overall package repo build status
get("https://archriscv.felixc.at/.status/status.txt", (res) => {
  let data = Buffer.alloc(0);
  res.on("data", (chunk) => {
    data = Buffer.concat([data, chunk]);
  });
  res.once("end", () => {
    console.log(data.toString("utf-8").trim());
  });
});
