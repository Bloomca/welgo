/**
 * Basic example:
 *
 * h('div', null,
 *  h('div, null, 'some text'),
 *  h('div, null, 'another text')
 * );
 *
 * This is the simplest example. However, one important thing is that
 * we want to generate js code as well (e.g. for onclicks),
 * so all elements will produce an object { html, code }
 *
 * So, the call above will be transformed into (resolving only inner calls):
 *
 * h('div', null,
 *   { html: '<div>some text</div>', code: '' }
 *   { html '<div>another text</div>', code: '' }
 * );
 *
 * What is the point to generate onclicks, though?
 * - make async calls (easily doable, but need to be careful about calls)
 * - make state changes (so the content changes, but without runtime framework)
 *     this concept is complicated, since we strive to have no runtime.
 *     one possible solution is to render everything, and then show based
 *     on css, or our custom markup
 *
 *     other approach is, though, just to add some code, so it will be executed
 *     after this component mounts -> e.g. the user will do everything with $
 *     by themselves.
 *
 *     but, again, this code essentially belongs to the component. the problem is
 *     that it will work only without any imports (even fn calls are not fine)
 *
 *     so, possibly the easiest solution is to actually forbid all imports and
 *     closures, and _maybe_ introduce middleware as a concept to add abstraction,
 *     so later we
 *
 *     top component should receive two props – html and js
 *
 * jsx
 * - maybe through babel-runtime
 * - string templates
 *
 * list of events:
 * - onclick
 * - onchange
 */

// constant to detect if class was defined by welgo
const IS_WELGO_CLASS = "$$__WELGO_CLASS_DEFINITION";

class Component {
  constructor(props) {
    this.props = props;
  }
}
Component.IS_WELGO_CLASS = IS_WELGO_CLASS;

module.exports = {
  render,
  createElement,
  createWelgoClass,
  Component
};

// this function will mount script code inside the rendered component
// it assumes that it will receive the whole page as a component
function render(tag, props, ...children) {
  const updatedProps = {
    ...props
    // script: WELGO_SCRIPT_CODE_CONSTANT
  };

  const tree = createElement(tag, updatedProps, ...children);

  return irender(tree, {});
}

function irender(tree, context) {
  const tag = tree.nodeName;
  const props = tree.props;
  const processedChildren = processChildren(tree.children, context);
  const updatedProps = {
    ...props,
    children: processedChildren
  };

  if (typeof tag === "string") {
    const { processedProps, children } = processProps(props);
    return `<${tag}${processedProps ? " " + processedProps : ""}>${children ||
      processedChildren}</${tag}>`;
  } else if (typeof tag === "function") {
    // we have class definition
    if (tag.prototype && tag.prototype.IS_WELGO_CLASS === IS_WELGO_CLASS) {
      const component = new tag(updatedProps, context);
      let newContext = context;
      if (component.getChildContext) {
        newContext = {
          ...context,
          ...component.getChildContext()
        };
      }
      const childTree = component.render(); // tree
      return irender(childTree, newContext);
    } else {
      // we have just function
      const childTree = tag(props, context);
      return irender(childTree, context);
    }
  } else if (typeof tag === "object") {
    // let's assume we receive only objects
    // with the render method
    // since we don't have any state, we will just pass props
    const childTree = tag.render(props, context);
    return irender(childTree, context);
  }
  // tree
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
  // const { context, children } = processContext(rawChildren);
  // const processedChildren = processChildren(children);

  // // we have 0 context, but somehow we need to pass this context down
  // // or to be able to climb up
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

function processChildren(children, context) {
  return children.reduce((acc, child) => {
    if (Array.isArray(child)) {
      return acc + processChildren(child, context);
    } else if (typeof child === "object" && child.nodeName) {
      const tree = irender(child, context);

      return acc + tree;
    } else if (typeof child === "string") {
      return acc + child;
    }

    return acc;
  }, "");
}
