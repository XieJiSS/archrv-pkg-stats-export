// @ts-check

//                     [epoch: \d+   :] version: 1 or more  \.[\w\+]+  [-    pkgrel: \d+ [\.\d+]* ]
const versionRegex = /^(?<epoch>\d+)?:?(?<version>[\w\+]+(?:\.[\w\+]+)*)-?(?<pkgrel>\d+(?:\.\d+)*)?$/;

/**
 * @param {string} a
 * @param {string} b
 * @returns {-1 | 0 | 1} a < b is -1, a == b is 0, a > b is 1
 */
function alpmVercmp(a, b) {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return -1;
  } else if (!b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }

  const epoch1 = a.includes(":") ? a.split(":")[0] : "";
  const epoch2 = b.includes(":") ? b.split(":")[0] : "";
  if (epoch1) {
    a = a.split(":")[1];
  }
  if (epoch2) {
    b = b.split(":")[1];
  }

  const ver1 = a.split("-")[0];
  const ver2 = b.split("-")[0];

  const rel1 = a.includes("-") ? a.split("-")[1] : "";
  const rel2 = b.includes("-") ? b.split("-")[1] : "";

  if (epoch1 && epoch2) {
    const epoch1Num = Number(epoch1);
    const epoch2Num = Number(epoch2);
    if (Number.isNaN(epoch1Num) || Number.isNaN(epoch2Num)) {
      throw new Error("Invalid epoch: not a number");
    }
    if (epoch1Num > epoch2Num) {
      return 1;
    } else if (epoch1Num < epoch2Num) {
      return -1;
    }
  }

  const vercmpResult = _vercmp(ver1, ver2);
  if (vercmpResult !== 0) {
    return vercmpResult;
  }

  if (rel1 === "" || rel2 === "") {
    return 0;
  }

  const rel1Num = Number(rel1);
  const rel2Num = Number(rel2);
  if (Number.isNaN(rel1Num) || Number.isNaN(rel2Num)) {
    throw new Error("Invalid pkgrel: not a number");
  }

  if (rel1Num > rel2Num) {
    return 1;
  } else if (rel1Num < rel2Num) {
    return -1;
  }
  return 0;
}

/**
 * @private
 * @description
 * 1.0a < 1.0b < 1.0beta < 1.0p < 1.0pre < 1.0rc < 1.0 < 1.0.a < 1.0.1
 *
 * 1 < 1.0 < 1.1 < 1.1.1 < 1.2 < 2.0 < 3.0.0
 *
 * @param {string} ver1
 * @param {string} ver2
 * @returns {-1 | 0 | 1} a < b is -1, a == b is 0, a > b is 1
 */
function _vercmp(ver1, ver2) {
  const ver1Fields = ver1.split(".");
  const ver2Fields = ver2.split(".");

  const longerFieldsLen = Math.max(ver1Fields.length, ver2Fields.length);
  for (let i = 0; i < longerFieldsLen; i++) {
    const field1 = ver1Fields[i] || "";
    const field2 = ver2Fields[i] || "";
    const num1 = parseInt(field1, 10);
    const num2 = parseInt(field2, 10);
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }

    // parseInt results are equal, so compare non-numeric suffixes, if any
    const rem1 = field1.replace(/^\d+/, "");
    const rem2 = field2.replace(/^\d+/, "");
    if (rem1 === "" && rem2 === "") {
      continue;
    } else if (rem1 === "") {
      return 1;
    } else if (rem2 === "") {
      return -1;
    }

    // here, both rem1 and rem2 are non-empty, i.e. part1 and part2 has non-numeric suffix
    if (rem1 > rem2) {
      return 1;
    } else if (rem1 < rem2) {
      return -1;
    }
  }
  return 0;
}

module.exports = {
  alpmVercmp,
  versionRegex,
};
