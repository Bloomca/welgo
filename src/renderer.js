const escapeHTML = require("./escape");
const FRAGMENT_TAG_NAME = require("./fragment").FRAGMENT_TAG_NAME;

module.exports = renderStructure;

// so-called "void elements". can't have any "children"
// see more at https://developer.mozilla.org/en-US/docs/Glossary/empty_element
const SELF_CLOSING_TAGS = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

function renderStructure(structure) {
  if (!structure) {
    return "";
  }

  if (typeof structure === "string") {
    return escapeHTML(structure);
  }

  if (typeof structure === "number") {
    return escapeHTML(String(structure));
  }

  if (typeof structure === "boolean") {
    // just ignore boolean values as children
    return "";
  }

  if (Array.isArray(structure)) {
    return structure.map(renderStructure).join("");
  }

  if (structure.component) {
    return renderStructure(structure.tree);
  }

  const { tag, attrs, children, unsafe } = structure;
  const childrenHTML = children.map(renderStructure).join("");
  const unsafeHTML = unsafe ? unsafe.__html : "";
  if (tag === FRAGMENT_TAG_NAME) {
    return `${unsafeHTML}${childrenHTML}`;
  } else {
    if (SELF_CLOSING_TAGS[tag]) {
      // don't evem wprru about children and unsafe HTML
      // void elements can't have them
      return `<${tag}${attrs} />`;
    } else {
      return `<${tag}${attrs}>${unsafeHTML}${childrenHTML}</${tag}>`;
    }
  }
}
