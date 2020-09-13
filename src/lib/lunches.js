import restaurants from './restaurants'

const getLunches = async () => {
  const fetchLunchJobs = restaurants.map(async ({url, getLunches, name}) => {
    const {data: html} = await axios.get(url)
    const lunches = await getLunches(html)
    return {name, lunches}
  })

  const lunches = await Promise.all(fetchLunchJobs)

  return lunches
}

export default getLunches
