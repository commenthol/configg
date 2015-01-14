# Notes

1. a `/config` dir shall always be in the same folder as a `package.json` file

	* implies only one config per module
	* if `package.json` cannot be found than only `common` conf-object is passed!
	* `require('configg')(__dirname)` needs to point to exactly the directory where the `package.json` resides

2. resolution per filename (same scheme as [node-config](https://github.com/lorenwest/node-config/wiki/Configuration-Files#multi-instance-deployments))

		default.EXT
		default-{instance}.EXT
		{deployment}.EXT
		{deployment}-{instance}.EXT
		{hostname}.EXT
		{hostname}-{instance}.EXT
		{hostname}-{deployment}.EXT
		{hostname}-{deployment}-{instance}.EXT
		local.EXT
		local-{instance}.EXT
		local-{deployment}.EXT
		local-{deployment}-{instance}.EXT

3. config can be stored in different fileformats (.EXT) parsable per extension (order of processing - first found breaks)

	1.  '.js': javascript file
	2.  '.json': json file
	3.  '.json5': json5 file
	4.  '.hjson': a human readable json file
	5.  '.toml': ??
	6.  '.coffee': a coffee script file
	7.  '.yaml': yaml file
	8.  '.yml': alternate yaml extension
	9.  '.cson': cson file - json for coffeescripters
	10. '.properties': properties file

4. prj-config resolution (order of merge) - on first call
	module name from `package.json` is ignored.
	`{ <moduleName>:{}, <moduleName1>:{}, ..., <moduleNameN>: {}, common: {} }`

	1. prj config
	2. NODE_CONFIG_DIR

5. module-config resolution for 'moduleNameX': `{ <moduleNameX>:{}, common: {} }`

	1. module-config
	2. prj-config for module-name only
	3. common settings get passed as well


# References

[12factor]: http://12factor.net/config
[harmful-env]: http://movingfast.io/articles/environment-variables-considered-harmful/
[node-config]: https://github.com/lorenwest/node-config
[nconf]: https://github.com/flatiron/nconf