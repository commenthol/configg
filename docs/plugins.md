# Writing configg plugins

This is a guide to write your own configg plugin.

## Table of Contents

<!-- !toc (minlevel=2 omit="Table of Contents") -->

* [Synchronous plugins](#synchronous-plugins)
* [Asynchronous plugins](#asynchronous-plugins)
* [Interface](#interface)
* [Publishing](#publishing)

<!-- toc! -->

## Synchronous plugins

Synchronous plugins are intended to change the configuration e.g. for decrypting values:

Example:

```js
module.exports = function plugin (options, conf ) {
  const password = process.env.PASSWORD
  const { secret } = conf.config
  return { 
    config: { 
      secret: decipherSync(secret, password)
    }
  }
}
```

## Asynchronous plugins

Asynchronous plugins may load configuration objects from remote sources. 

Imagine a plugin named _configg-plugin-fetch_:

```js
const fetch = require('unfetch')

module.exports = async function plugin (options, /* conf */ ) {
  const { url } = options
  // Load some configuration
  return fetch(url)
    .then(res => res.json())
    .then(valueObj => {
      // returned object needs to have the structure of the configg config object
      return {
        '@my/other-module': valueObj.otherObj,
        config: valueObj.configObj
      }
    })
}
```

This plugin would need the following configuration e.g. in `default.js`

```js
module.exports = {
  config: {},
  plugins: [
    ['configg-plugin-fetch', { url: 'https://my-config-server'}]
  ]
}
```

## Interface

API Definition in _TypeScript_:

```typescript
/* options passed via `conf.plugins` */
interface Options { 
  dirname: string, // directory name of current config files
  [propName: string]: any
}

/* Our configg configuration object */
interface Conf {
  config: object, // config values
  common?: object, // common values shared amongs all modules
  [propName: string]: object // other modules config values
}

/* The plugin function */
function plugin (
  options: Options, 
  config: Conf
): Conf | Promise<Conf> {
  return new Promise((resolve) => {
    resolve({ config: { ... } }) 
  })
}

module.exports = plugin
```

## Publishing

If you consider open-sourcing your package via `npm` please add prefix your package name with `configg-plugin-` as well as adding a `configg-plugin` keyword in `package.json` such being able to be found. 

Sample `package.json`:

```json
{
  "name": "configg-plugin-cool",
  "keywords": [
    "configg-plugin",
    "cool"
  ],
  ...
}
```
