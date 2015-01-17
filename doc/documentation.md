# Documentation

## Table of Contents

//TODO

## Configuration files

All configuration files need to be stored in the `config/` folder which
needs to be in the same folder as the `package.json` of your module or
project.

    + package.json
    + config/
       + default.js
       + development.js


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

* `default` : This is the default configuration for the module or project.
  This configuration should be defined in every case.
* `{deployment}` : Is the deployment name which is read from the `$NODE_ENV` environment variable.
  Typical values are "development" and "production". Anyhow you can use any
  name which fits your needs.
* `{hostname}` : Is the hostname of your server taken from the `$HOST`,
  or `$HOSTNAME` environment variable. If none is set, then `os.hostname()`
  is used to get the hostname from the OS.
* `{instance}` : Is an optional instance for Multi-Instance-Deployments
  which is read from the `$NODE_APP_INSTANCE` environment variable.
* `local` : The local files are intended to not be tracked in your version
  control system. External configuration management tools can write these
  files upon application deployment, before application loading.
* `{ext}` : Is the extension of the file.

**Example:**

| No. | Filename        | Note   |
| --: | :-------------- | :----- |
| 1.  | default.js      | A Javascript file with its default configuration. |
| 2.  | development.yml |  A YAML file with only the diff settings from `default` for deployment "development". |
| 3.  | staging.hjson   | A HJSON file with only the diff settings from `default` for deployment "staging". |
| 4.  | production.yml  | A YAML file with only the diff settings from `default` for deployment "production". |
| 5.  | myserver.js     | A Javascript file with only the diff settings from `deployment` for HOST myserver. |
| 6.  | myserver-production.js | A Javascript file with only the diff settings from `myserver.js` for deployment "production". |
| 7.  | local.js        |  Local settings for the module, project |

In case of `NODE_ENV=development`, `HOSTNAME=myserver` the following files get loaded:

* default.js
* development.yml
* myserver.js
* local.js

For `NODE_ENV=production`, `HOSTNAME=myserver` the following files get loaded:

* default.js
* production.yml
* myserver.js
* myserver-production.js
* local.js

### Extension loading

Supported files for parsing are (in order of resolution)

* .js: javascript
* .json: json
* .json5: json5
* .hjson: human json
* .toml: TOML
* .coffee: coffee-script
* .yaml: YAML,
* .yml: alternative YAML extension
* .cson: CSON
* .properties: Properties

File extensions can be mixed inside a configuration directory.
The first file encountered with a certain extension results in continuing
with the next file as described in [File loading order](#File_loading_order).

