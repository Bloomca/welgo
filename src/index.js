const escapeHTML = require("./escape");

module.exports = {
  render,
  createElement,
  Fragment
};

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

const FRAGMENT_TAG_NAME = "$$__FRAGMENT__TAG";

function Fragment({ children, ...props }) {
  return createElement(FRAGMENT_TAG_NAME, props, children);
}

async function render(tree, resolver) {
  const structure = await irender(tree, resolver);

  return renderStructure(structure);
}

function renderStructure(structure) {
  if (typeof structure === "string") {
    return escapeHTML(structure);
  }

  if (Array.isArray(structure)) {
    return structure.map(renderStructure).join("");
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

async function irender(tree, resolver) {
  if (!tree) {
    return "";
  }

  const tag = tree.nodeName;
  const props = tree.props || {};
  const processCurrentChildren = () => processChildren(tree.children, resolver);

  if (typeof tag === "string") {
    const { processedProps, children } = processProps(props);
    const processedChildren = await processCurrentChildren();

    if (tag === FRAGMENT_TAG_NAME) {
      return {
        tag: FRAGMENT_TAG_NAME,
        unsafe: props.dangerouslySetInnerHTML,
        children: children || processedChildren
      };
    } else {
      return {
        tag,
        unsafe: props.dangerouslySetInnerHTML,
        attrs: processedProps ? " " + processedProps : "",
        children: children || processedChildren
      };
    }
  } else if (typeof tag === "function") {
    const processedChildren = await processCurrentChildren();
    props.children = processedChildren;
    const childTree = await tag(props, resolver);
    return irender(childTree, resolver);
  }
}

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

// processing props does several things:
// - extracting children props
// - stringifying all properties into attributes
function processProps(props) {
  let propsArray = [];

  if (props) {
    Object.keys(props)
      .filter(key => key !== "children" && key !== "dangerouslySetInnerHTML")
      .forEach(key => {
        const value = props[key];

        if (key === "className") {
          // handle react's `className` convention
          // treat it like the "class"
          propsArray.push(`class="${value}"`);
        } else if (key === "style") {
          // we allow both objects and strings

          if (typeof value === "string") {
            propsArray.push(`${key}="${value}"`);
          } else if (value && typeof value === "object") {
            const resultStyle = Object.keys(value).reduce(
              (styleString, styleKey) => {
                const styleValue = value[styleKey];

                if (styleValue) {
                  const property = `${styleKey}:${styleValue};`;

                  return styleString + property;
                }

                return styleString;
              },
              ""
            );

            // no need to set an empty style string
            if (resultStyle) {
              propsArray.push(`${key}="${resultStyle}"`);
            }
          }
        } else {
          // falsy values can get `0` and empty strings, we don't want that
          if (value === false || value === undefined || value === null) {
            // we ignore properties which are explicitly set to `false`
          } else if (value === true) {
            // we don't set any value in case property is set to true
            // attribute name is enough
            propsArray.push(key);
          } else {
            propsArray.push(`${key}="${value}"`);
          }
        }
      });
  }

  return {
    processedProps: propsArray.join(" "),
    children: props && props.children
  };
}

async function processChildren(children, resolver) {
  const strings = await Promise.all(
    children.map(child => {
      if (Array.isArray(child)) {
        return processChildren(child, resolver);
      } else if (
        typeof child === "object" &&
        child !== null &&
        child.nodeName
      ) {
        return irender(child, resolver);
      } else if (typeof child === "string") {
        return Promise.resolve(child);
      }

      return Promise.resolve(child);
    })
  );

  return strings.filter(Boolean);
}
