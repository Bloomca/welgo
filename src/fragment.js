const createElement = require("./createElement");

const FRAGMENT_TAG_NAME = "$$__FRAGMENT__TAG";

function Fragment({ children, ...props }) {
  return createElement(FRAGMENT_TAG_NAME, props, children);
}

module.exports.FRAGMENT_TAG_NAME = FRAGMENT_TAG_NAME;
module.exports.Fragment = Fragment;
