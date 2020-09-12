import path from 'path'
import glob from 'glob'
import {get} from './fetch'
import restaurants from './restaurants'

const getLunches = async () => {
  const fetchLunchJobs = restaurants.map(async ({url, getLunches, name}) => {
    const {data: html} = await get(url)
    const lunches = await getLunches(html)
    return {name, lunches}
  })

  const lunches = await Promise.all(fetchLunchJobs)

  return lunches
}

export default getLunches