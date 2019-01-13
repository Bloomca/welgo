module.exports = {
  render,
  createElement
};

// this function will mount script code inside the rendered component
function render(tree, resolver) {
  return irender(tree, resolver);
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
    return `<${tag}${processedProps ? " " + processedProps : ""}>${children ||
      processedChildren}</${tag}>`;
  } else if (typeof tag === "function") {
    // we have just function
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
// - transforming all event listeners into code
// - stringifying all properties into attributes
function processProps(props = {}) {
  let propsArray = [];
  // we need to get actual element add add listeners to it
  if (props && props.onClick) {
    `document.addEventListener`;
  }

  Object.keys(props || {}).forEach(key => {
    if (key.startsWith("on")) {
      // handle event in the future
    } else {
      // add property to the list
      const value = props[key];

      // handle react's `className` convention
      if (key === "className") {
        propsArray.push(`class="${value}"`);
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
        return irender(child, resolver);
      } else if (typeof child === "string") {
        return Promise.resolve(child);
      }

      return Promise.resolve(null);
    })
  );

  return strings.filter(Boolean).reduce((acc, child) => acc + child, "");
}
