const renderHTML = require("./renderer");
const createElement = require("./createElement");
const Fragment = require("./fragment").Fragment;
const irender = require("./irender");

module.exports = {
  render,
  createElement,
  Fragment,
  irender,
  renderer: renderHTML
};

async function render(tree, resolver) {
  const structure = await irender(tree, resolver);

  return renderHTML(structure);
}
