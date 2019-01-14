module.exports = {
  render,
  createElement,
  Fragment
};

const FRAGMENT_TAG_NAME = "$$__FRAGMENT__TAG";

function Fragment({ children }) {
  return createElement(FRAGMENT_TAG_NAME, {}, ...children);
}

async function render(tree, resolver) {
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
      return children || processedChildren;
    } else {
      return `<${tag}${processedProps ? " " + processedProps : ""}>${children ||
        processedChildren}</${tag}>`;
    }
  } else if (typeof tag === "function") {
    const processedChildren = await processCurrentChildren();
    props.children = processedChildren;
    const childTree = await tag(props, resolver);
    return render(childTree, resolver);
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
function processProps(props = {}) {
  let propsArray = [];

  Object.keys(props || {})
    .filter(key => key !== "children")
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
        return render(child, resolver);
      } else if (typeof child === "string") {
        return Promise.resolve(child);
      }

      return Promise.resolve(null);
    })
  );

  return strings.filter(Boolean).reduce((acc, child) => acc + child, "");
}
