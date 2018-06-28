# Welgo

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/Bloomca/welgo.svg?branch=master)](https://travis-ci.org/Bloomca/welgo)

Server-side framework for rendering mostly static websites – it is _not_ suitable for complex applications, and is not a viable solution for single-page applications.

- Zero runtime
- no VDOM
- React-inspired components
- data resolving

## Getting started

> you need to compile it with babel before running.

```js
const Welgo = require("welgo");
const path = require("path");

const express = require("express");

const app = express();

class Page extends Welgo.Component {
  // resolve data asynchronously. returned object will be merged
  // with props and `render` function will be called
  resolveData(resolver) {
    return {
      topics: resolver.topics()
    };
  }

  render() {
    return (
      <div>
        {this.props.topics.join(", ")}
      </div>
    );
  }
}

app.use(express.static(path.resolve(__dirname, "public")));

app.get("*", async (req, res) => {
  const page = await Welgo.render(<Page />, {
    topics: () => ["first", "second"]
  });
  res.send(page);
});

app.listen(3000);

```

## Babel configuration

You need to configure babel the same way as you'd use it with any other JSX engine:

```js
{
  presets: [
    [
      "@babel/preset-react",
      {
        pragma: "Welgo.createElement",
        pragmaFrag: "Welgo.Fragment"
      }
    ]
  ]
}
```

## Rationale

> After releasing this library I'll move this to a separate blog post

This is intended to be a server-side framework for client-side code. What does it mean?

Modern frontend is very complicated, and while it allows to create very advanced applications, sometimes we end up having purely static websites, written in client-side frameworks, like React.js or Vue. It leads to several problems:
- longer startup time
- if there is no pre-rendering, no SEO
- more traffic for downloading script files
- more JS to parse and execute

To summarize, the biggest problem is that we have to ship a runtime, which will execute our code and render our application (again, we are talking about mostly static websites) – [see this tweet from netflix](https://mobile.twitter.com/NetflixUIE/status/923374215041912833).

However, there are reasons why people prefer them:
- components
- composition of components

There are other reasons, but these are from my point of view are the strongest – they allow to move from old template systems, and render markup in much more clear way.

This framework intends to keep these benefits, while doing all the work only on the server-side, and ship zero runtime.

## License

MIT