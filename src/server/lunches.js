const path = require('path')
const glob = require('glob')
const {get} = require('./fetch')

const getLunches = async () => {
  const restaurants = glob
    .sync(path.join(__dirname, 'restaurants/*.js'))
    .map(file => {
      return require(path.resolve(file))
    })

  const fetchLunchJobs = restaurants.map(async ({url, getLunches, name}) => {
    const {data: html} = await get(url)
    const lunches = await getLunches(html)
    return {name, lunches}
  })

  const lunches = await Promise.all(fetchLunchJobs)

  return lunches
}

module.exports = {
  getLunches
}
