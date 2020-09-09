const axios = require('axios')
const memoize = require('memoizee')

const asyncGet = async url => {
  return axios.get(url)
}

const TWO_HOURS = 1000 * 60 * 60 * 2

const memoizedGET = memoize(asyncGet, {
  promise: true,
  maxAge: TWO_HOURS
})

module.exports = {
  get: memoizedGET
}
