const { FRAGMENT_TAG_NAME } = require("./fragment");
const processProps = require("./props");

module.exports = irender;

async function irender(tree, resolver, { depth = null } = {}) {
  // TODO: abstract from strings completely
  if (!tree) {
    return "";
  }

  const nextDepth = depth === null ? null : depth - 1;

  const tag = tree.nodeName;
  const props = tree.props || {};
  const processCurrentChildren = () =>
    processChildren(tree.children, resolver, { depth: nextDepth });

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
    if (depth === 0) {
      return {
        component: tag
      };
    } else {
      const processedChildren = await processCurrentChildren();
      props.children = processedChildren;
      const childTree = await tag(props, resolver);
      const tree = await irender(childTree, resolver, { depth: nextDepth });
      return {
        component: tag,
        tree
      };
    }
  }
}

async function processChildren(children, resolver, { depth }) {
  const strings = await Promise.all(
    children.map(child => {
      if (Array.isArray(child)) {
        return processChildren(child, resolver, { depth });
      } else if (
        typeof child === "object" &&
        child !== null &&
        child.nodeName
      ) {
        return irender(child, resolver, { depth });
      } else if (typeof child === "string") {
        return Promise.resolve(child);
      } else if (
        typeof child === "object" &&
        child !== null &&
        !(child.tag || child.component)
      ) {
        throw new Error(`
          You can not pass plain object as children. You passed a following object:
          ${JSON.stringify(child)}
        `);
      }

      return Promise.resolve(child);
    })
  );

  return strings.filter(Boolean);
}
