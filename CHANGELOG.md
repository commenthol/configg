# CHANGELOG

### 1.2.3

- 69f5010 bump dependencies

### 1.2.2

- 058afdf travis
- 8d9a626 bump dependencies

### 1.2.1

- 8078fdf bump dependencies

### 1.2.0

- d5b7266 change engine support to >=4.0.0
- eb31d5f discontinue ci tests for node 4.x
- cec125c bump dependencies

### 1.1.2

- bump dependencies

### 1.1.1

- fix automatic resolution

### 1.1.0

- automatic resolution of package root to obtain `config` dir with `find-root` package
  ```js
  // use now
  const {config} = require('configg')()
  // instead of
  const {config} = require('configg')(__dirname + '../../')
  ```
- linting
- bump dependencies
- documentation update
- re-enable cson

### 1.0.1

- bump dependencies
- fix tests related to undefined NODE_APP_INSTANCE

### 1.0.0

- more tests
- replacing console.log by debug
- update dependencies
- using eslint instead of jshint

### 0.3.0

- adding strict mode

### 0.2.0

- `NODE_CONFIG_DIR` controls app
- caching added
- refactor & improvements

### 0.1.0

- documentation update
- examples

### 0.0.9

- first release
