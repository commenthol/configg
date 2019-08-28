const { resolve } = require('path')
const { readPwdFileSync, EncDecSync } = require('vault-nacl')

const VAULT_NACL_FILE = 'vault-nacl.txt'

function tryVaultNaclFile (dirname) {
  const filename = resolve(dirname, VAULT_NACL_FILE)
  try {
    return readPwdFileSync(filename)
  } catch (e) {}
}

function decrypt (obj, { dirname }) {
  const filename = process.env.VAULT_NACL_FILE
  const pwd = process.env.VAULT_NACL ||
    (filename && readPwdFileSync(filename)) ||
    tryVaultNaclFile(dirname)
  if (pwd) {
    Reflect.deleteProperty(process.env, 'VAULT_NACL_FILE')
    Reflect.deleteProperty(process.env, 'VAULT_NACL')
    return new EncDecSync(pwd).decrypt(obj)
  } else {
    return obj
  }
}

module.exports = decrypt
