// @ts-check

/**
 * @param {import("../types").Message} msg
 */
function getAllTextFromMsg(msg) {
  let text = "";
  msg.text_entities.forEach((entity) => {
    text += entity.text;
  });
  return text;
}

/**
 * @param {import("../types").Message} msg
 * @param {string} type
 */
function getTextOfTypeFromMsg(msg, type) {
  let text = "";
  msg.text_entities.forEach((entity) => {
    if (entity.type === type) {
      text += entity.text;
    }
  });
  return text;
}

/**
 * @param {import("../types").Message} msg
 * @param {string} type
 */
function getTextNotOfTypeFromMsg(msg, type) {
  let text = "";
  msg.text_entities.forEach((entity) => {
    if (entity.type !== type) {
      text += entity.text;
    }
  });
  return text;
}

module.exports = {
  getAllTextFromMsg,
  getTextOfTypeFromMsg,
  getTextNotOfTypeFromMsg,
};
