// @ts-check

/**
 * @param {Message} msg
 */
function getAllTextFromMsg(msg) {
  let text = "";
  msg.text_entities.forEach((entity) => {
    text += entity.text;
  });
  return text;
}

/**
 * @param {Message} msg
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

module.exports = {
  getAllTextFromMsg,
  getTextOfTypeFromMsg,
};
