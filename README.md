# configg

> A Node/IO configuration manager

[![NPM version](https://badge.fury.io/js/configg.svg)](https://www.npmjs.com/package/configg/)
[![Build Status](https://secure.travis-ci.org/commenthol/configg.svg?branch=master)](https://travis-ci.org/commenthol/configg)

"configg" organizes _hierarchical_ configurations for your App deployments
while keeping the different configurations for you App and its modules _isolated_.

Starting from  a defined set of default parameters, your App gets extended
for its different deployment environments (development, staging, production, ...),
optional the hosts it's going to run and/or the instance it uses.

The different environments get controlled using different environment
variables (e.g. `$NODE_ENV` for deployment).

To provide a clean separation between code and config as proclaimed by
[The Twelve-Factor App][] each App or module can get its own configuration
for the different deployment environments.

Configurations are stored in configuration files inside the `/config` folder
which resides next to a `package.json` file.
Isolation (i.e. a module or App can only access its associated configuration)
is maintained by extracting name and version from the `package.json` file.
This allows extending/ overwriting values for modules from your App-config
or even a module which includes other sub-modules.

This project is inspired from [node-config][].

## Table of Contents

<!-- !toc (minlevel=2 omit="Table of Contents") -->
<!-- toc! -->

## Quick Start

The following examples use [Hjson][] but [other file formats](./doc/documentation.md#file_formats)
including Js, JSON are supported.


## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your
code to be distributed under the MIT license. You are also implicitly
verifying that all code is your original work or correctly attributed
with the source of its origin and licence.

## License

Copyright (c) 2015 commenthol (MIT License)

See [LICENSE][] for more info.

[LICENSE]: ./LICENSE
[The Twelve-Factor App]: https://12factor.net
[Hjson]: https://laktak.github.io/hjson/
[node-config]: https://github.com/lorenwest/node-config
