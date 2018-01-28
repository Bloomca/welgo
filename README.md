# Welgo

> This is a WIP, and not ready yet. However, the whole project is more like a research, so feel free to ask question or suggest new features

Server-side framework for rendering mostly static websites – it is _not_ suitable for applications.

- Zero runtime
- no VDOM
- React-inspired components
- support of events

## How does it work?

It is a server-side framework, so you need to create components using it, and then render the whole page using top-level component.
This framework will extract all code dependencies, and put them into script, which will be executed on the client-side. However, it is not a runtime – it is plain JavaScript, which will just add event listeners and execute your code.

## Rationale

This is intended to be a server-side framework for client-side code. What does it mean?

Modern frontend is very complicated, and while it allows to create very advanced applications, sometimes we end up having purely static websites, written in client-side frameworks, like React.js or Vue. It leads to several problems:
- longer startup time
- if there is no pre-rendering, no SEO
- more traffic for downloading script files
- more JS to parse and execute

To summarize, the biggest problem is that we have to ship runtime, which will execute our code and render our application (again, we are talking about mostly static websites) – [see this tweet from netflix](https://mobile.twitter.com/NetflixUIE/status/923374215041912833).

However, there are reasons why people prefer them:
- components
- composition of components

There are other reasons, but these are from my point of view are the strongest – they allow to move from old template systems, and render markup in much more clear way.

This framework intends to keep these benefits, while doing all the work only on the server-side, and ship zero runtime 

## License

MIT