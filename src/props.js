module.exports = processProps;

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
