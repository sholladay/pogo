# Security

Pogo aims to help you make secure applications, with good default options, high quality tests, and by following web standards.

This document describes some of the security choices made for Pogo. To request an improvement, please [file an issue](https://github.com/sholladay/pogo/issues/new). To report a vulnerability, contact [Seth Holladay](https://seth-holladay.com/contact) privately.

## The default `hostname` option is `'localhost'`

Pogo has a [`hostname`](https://github.com/sholladay/pogo#hostname) option that determines which domains and IP addresses the server will listen on for requests after you call [`server.start()`](https://github.com/sholladay/pogo#serverstart). The default is `'localhost'` for security reasons. You may need to set a different `hostname` value when deploying your app to a hosting provider, depending on their infrastructure (see [deployment](./deployment.md)).

Why does this matter? Sometimes, there is a tradeoff to be had between cnvenience and security.

Generally, during development all you need is for the server to respond to requests _from your own machine_. That is what the [localhost domain](https://en.wikipedia.org/wiki/Localhost) (and 127.0.0.1 IP address) is for, it refers to your computer's loopback interface (i.e. itself). Conversely, the 0.0.0.0 IP address refers to _all_ available addresses, including ones that can be accessed by other machines. As a result, listening on 0.0.0.0 causes the server to be public, whereas localhost does not.

Unfortunately, some other frameworks, and Deno itself, use 0.0.0.0 by default.

The security implications of exposing your development machine to the public internet are significant. In production, you probably _do_ want to expose your app to the public internet, but not necessarily, and doing so by accident is still a serious security risk. Thus, Pogo makes you opt-in explicitly to listening on a public address.

## Resources

 - [OWASP (Open Web Application Security Project)](https://owasp.org/)
