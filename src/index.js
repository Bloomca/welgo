// 1. no classes – confusing
// 2. only functions – but async by nature
// 3. context – no idea. we have only 1 prop, so maybe we can pass it as a second param.

// constant to detect if class was defined by welgo
const IS_WELGO_CLASS = "$$__WELGO_CLASS_DEFINITION";

class Component {
  constructor(props) {
    this.props = props;
  }
}
Component[IS_WELGO_CLASS] = true;

module.exports = {
  render,
  createElement,
  createWelgoClass,
  Component
};

// this function will mount script code inside the rendered component
function render(tree, resolver) {
  return irender(tree, {}, resolver);
}

async function irender(tree, context, resolver) {
  if (!tree) {
    return "";
  }

  const tag = tree.nodeName;
  const props = tree.props || {};
  const processCurrentChildren = () =>
    processChildren(tree.children, context, resolver);

  if (typeof tag === "string") {
    const { processedProps, children } = processProps(props);
    const processedChildren = await processCurrentChildren();
    return `<${tag}${processedProps ? " " + processedProps : ""}>${children ||
      processedChildren}</${tag}>`;
  } else if (typeof tag === "function") {
    // we have class definition
    if (tag[IS_WELGO_CLASS] === true) {
      const component = new tag(props, context);
      if (component && component.resolveData) {
        const newProps = await component.resolveData(resolver);
        component.props = { ...component.props, ...newProps };
      }
      let newContext = context;
      if (component.getChildContext) {
        newContext = {
          ...context,
          ...component.getChildContext()
        };
      }
      const processedChildren = await processCurrentChildren();
      component.props.children = processedChildren;
      const childTree = await component.render(); // tree
      return irender(childTree, context, resolver);
    } else {
      // we have just function
      const processedChildren = await processCurrentChildren();
      props.children = processedChildren;
      const childTree = await tag(props, context);
      return irender(childTree, context, resolver);
    }
  } else if (typeof tag === "object") {
    // let's assume we receive only objects
    // with the render method
    // since we don't have any state, we will just pass props
    if (tag.resolveData) {
      const newProps = await tag.resolveData(resolver);
      tag.props = { ...updatedProps, ...newProps };
    }
    const childTree = await tag.render(tag.props || updatedProps, context);
    return irender(childTree, context, resolver);
  }
}

// analog to `createReactClass`. for now there is no magic at all
function createWelgoClass(object) {
  return object;
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

async function processChildren(children, context, resolver) {
  const strings = await Promise.all(
    children.map(child => {
      if (Array.isArray(child)) {
        return processChildren(child, context, resolver);
      } else if (
        typeof child === "object" &&
        child !== null &&
        child.nodeName
      ) {
        return irender(child, context, resolver);
      } else if (typeof child === "string") {
        return Promise.resolve(child);
      }

      return Promise.resolve(null);
    })
  );

  return strings.filter(Boolean).reduce((acc, child) => acc + child, "");
}
