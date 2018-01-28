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

module.exports.render = render;

module.exports.createWelgoClass = createWelgoClass;

module.exports.createElement = createElement;

// this constant is needed to replace all extracted script code
// to make page interactive
const WELGO_SCRIPT_CODE_CONSTANT = "WELGO_SCRIPT_CODE_CONSTANT";

// this function will mount script code inside the rendered component
// it assumes that it will receive the whole page as a component
function render(tag, props, children) {
  const updatedProps = {
    ...props,
    script: SCRIPT
  };

  const { html, code } = createElement(tag, updatedProps, children);

  return html.replace(WELGO_SCRIPT_CODE_CONSTANT, `<script>${code}</script>`);
}

// analog to `createReactClass`. for now there is no magic at all
function createWelgoClass(object) {
  return object;
}

// main building block.
// as usual, accepts tag or another element, and
// children in any form (both array and just arguments)
function createElement(tag, props, ...children) {
  const processedChildren = processChildren(children);

  if (typeof tag === "string") {
    const { processedProps, children } = processProps(props);
    return {
      html: `<${tag}${processedProps ? " " + processedProps : ""}>${children ||
        processedChildren.html}</${tag}>`,
      code: `${processedChildren.code}`
    };
  } else if (typeof tag === "object") {
    // let's assume we receive only objects
    // with the render method

    const updatedProps = {
      ...props,
      children: processedChildren
    };

    // since we don't have any state, we will just pass props
    return tag.render(props);
  }
}

// processing props does several things:
// - extracting children props
// - transforming all event listeners into code
// - stringifying all properties into attributes
function processProps(props = {}) {
  // we need to get actual element add add listeners to it
  if (props.onClick) {
    `document.addEventListener`;
  }

  return {
    processedProps: "",
    children: props.children
  };
}

function processChildren(children) {
  return children.reduce(
    (acc, child) => {
      if (Array.isArray(child)) {
        const { html, code } = processChildren(child);
        return {
          html: acc.html + html,
          code: acc.code + code
        };
      } else if (typeof child === "object" && child.html) {
        return {
          html: acc.html + child.html,
          code: acc.code + child.code
        };
      } else if (typeof child === "string") {
        return {
          html: acc.html + child,
          code: acc.code + ""
        };
      }

      return acc;
    },
    { html: "", code: "" }
  );
}
