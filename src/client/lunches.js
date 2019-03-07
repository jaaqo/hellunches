import axios from 'axios'

const base = process.env.REACT_APP_API_URL_BASE

export const getLunches = async () => {
  const {data: lunches} = await axios.get(`${base}/lunches`)
  return lunches
}
