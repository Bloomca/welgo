// main building block.
// as usual, accepts tag or another element, and
// children in any form (both array and just arguments)
function createElement(tag, props, ...children) {
  return {
    nodeName: tag,
    props,
    children
  };
}

module.exports = createElement;
