# configg

> A Node/IO configuration manager

[![NPM version](https://badge.fury.io/js/configg.svg)](https://www.npmjs.com/package/configg/)
[![Build Status](https://secure.travis-ci.org/commenthol/configg.svg?branch=master)](https://travis-ci.org/commenthol/configg)

"configg" organizes _hierarchical_ configurations for your App deployments
while keeping the different configurations for your App and its modules _isolated_.

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

* [Quick Start](#quick-start)
  * [Use module overrides](#use-module-overrides)
* [Documentation](#documentation)
* [Contribution and License Agreement](#contribution-and-license-agreement)
* [License](#license)

<!-- toc! -->

## Quick Start

The following examples use [Hjson][] but [other file formats](./doc/documentation.md#file_formats)
including Js, JSON are supported.

All examples can be found in the [examples folder](./examples).
Run `run.sh` to see things in action.

**Install configg in your App directory**

```bash
$ npm install configg
$ mkdir config
```

**Define default values for your App**

```js
/* ./config/default.hjson */
{
  config: { // < always start with a config object...
    backend: {
      // configuration values of your app/ module go in here
      host: "test-system",
      port: 8080,
      timeout: 3600
    }
  }
}
```

**Define production overrides**

```js
/* ./config/production.hjson */
{
  config: {
    backend: {
      host: "production-system",
      path: "/path-on-prod"
    }
  }
}
```

**Add to your code**

```js
/* ./index.js */
var config = require('configg')()
console.log(config.get('config.backend'))
```

Running on development:

```
$ node index.js
{ host: 'test-system', port: 8080, timeout: 3600 }
```

Running on production:

```
$ export NODE_ENV=production
$ node index.js
{ host: 'production-system', port: 8080, timeout: 3600, path: '/path-on-prod' }
```

### Use module overrides

Assuming you now want to add a database connection to your Application
using a "my-database" module.

In development you'd like to use the [default settings](./examples/node_modules/my-database/config/default.js)
provided within "my-database" but change the host and credentials.

All examples can be found in the [examples folder](./examples).
Run `run-database.sh` to see things in action.

```js
/* /node_modules/my-database/config/default.js */
module.exports = {
  config: {
    host: 'test-db',
    port: 1529,
    credentials: {
      user: 'test',
      pass: '1234'
    }
  },
  common: {
    pool: false
  }
}
```

**Our sample database module**

```js
/* database.js */
var config = require('configg')()

console.log('---- Module "my-database" ----')
console.log(config.get('config'))

module.exports = {}
```

**Application with module "my-database"**

```js
/* ./index-database.js */
var config = require('configg')()
var database = require('my-database')

console.log('---- Application ----')
console.log(config.get('config.backend'))
```

**Running the App in development:**

```
$ NODE_ENV="" node index-database.js
---- Module "my-database" ----
{ host: 'test-db',
  port: 1529,
  credentials: { user: 'test', pass: '1234' } }
---- Application ----
{ host: 'test-system', port: 8080, timeout: 3600 }
```

For you productions settings you like to change to a different user and password using "my-database" as a module.
In your Application configuration add a branch named after the "my-database" module:

```js
/* ./config/production.hjson */
{
  config: { //< The config for the current module
    backend: {
      host: "production-system",
      path: "/path-on-prod"
    }
  },
  "my-database": {  //< Needs to be the name of the module!
    host: "production-db",
    credentials: {
      user: 'admin',
      pass: 'always-on-the-1'
    }
  },
  common: {
    pool: true
  }
}
```

**Runnning in production mode:**

```
$ node index-database.js --NODE_ENV=production
---- Module "my-database" ----
{ host: 'production-db', port: 1529,
  credentials: { user: 'admin', pass: 'always-on-the-1' } }
---- Application ----
{ host: 'production-system', port: 8080, timeout: 3600, path: '/path-on-prod' }
```

## Documentation

Further documentation is [here](./doc/documentation.md).

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your
code to be distributed under the MIT license. You are also implicitly
verifying that all code is your original work or correctly attributed
with the source of its origin and licence.

## License

Copyright (c) 2016-present commenthol (MIT License)

See [LICENSE][] for more info.

[LICENSE]: ./LICENSE
[The Twelve-Factor App]: https://12factor.net
[Hjson]: https://laktak.github.io/hjson/
[node-config]: https://github.com/lorenwest/node-config
