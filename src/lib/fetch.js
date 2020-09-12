import axios from 'axios'
import memoize from 'memoizee'

const asyncGet = async url => {
  return axios.get(url)
}

const TWO_HOURS = 1000 * 60 * 60 * 2

const memoizedGET = memoize(asyncGet, {
  promise: true,
  maxAge: TWO_HOURS
})

export const get = memoizedGET
