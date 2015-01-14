module.exports = {
	'sample-prj': {
		"prj-default": "origin",
		override: "prj-default",
	},
	'module-a': {
		"prj-default": "origin",
		override: "prj-default",
	},
	'module-b': {
		"prj-default": "origin",
		override: "prj-default",
	},
	'module-c': {
		"prj-default": "origin",
		override: "prj-default",
	},
	'module-c@0.1.2': {
		'prj-default': 'v0.1.2 only',
		override: "prj-default",
	},
	// common configuration
	common: {
		module: 'prj',
		type: 'default',
	}
};