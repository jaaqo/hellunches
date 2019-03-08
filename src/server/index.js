const express = require('express')
const axios = require('axios')
const cors = require('cors')
const $ = require('cheerio')
const moment = require('moment')
const memoize = require('memoizee')

let app = express()
app.use(cors())

const asyncGet = async url => {
  return axios.get(url)
}

const TWO_HOURS = 1000 * 60 * 60 * 2

const memoizedGET = memoize(asyncGet, {
  promise: true,
  maxAge: TWO_HOURS
})

const KAMPPI_LUNCHES_URL = 'https://factorykamppi.com/lounas/'
const BRUUVERI_LUNCHES_URL = 'https://bruuveri.fi/lounas/'

const getLunches = async () => {
  const {data: bruuveriHTML} = await memoizedGET(BRUUVERI_LUNCHES_URL)

  const bruuveriMenusAsString = $('#menu .add-bottom', bruuveriHTML)
    .text()
    .trim()

  const bruuveriDates = bruuveriMenusAsString.match(/\d{1,2}\.\d{1,2}\./g)

  const bruuveriLunches = bruuveriMenusAsString
    .split(/.{2} \d{1,2}\.\d{1,2}\.\n?/)
    .filter(s => s)
    .reduce((acc, currentLine, i) => {
      if (!acc[i]) {
        acc.push({
          date: moment.utc(bruuveriDates[i].trim(), 'DD.MM.').toDate()
        })
      }

      acc[i].menuLines = currentLine.split('\n')

      return acc
    }, [])

  const {data: kamppiHTML} = await memoizedGET(KAMPPI_LUNCHES_URL)

  const kamppiLunches = $('#content .main .entry-content', kamppiHTML)
    .text()
    .trim()
    .split('\n')
    .reduce((acc, currentLine) => {
      if (!currentLine) {
        return acc
      } else if (/.+\d{1,2}\.\d{1,2}\.\d{4}\n?/.test(currentLine)) {
        const [, date] = currentLine.split(' ')

        acc.push({
          date: moment.utc(date.trim(), 'DD.M.YYYY').toDate()
        })

        return acc
      } else {
        const lastElement = acc[acc.length - 1]
        if (lastElement) {
          if (!lastElement.menuLines) lastElement.menuLines = []
          lastElement.menuLines.push(currentLine.trim())
        }
        return acc
      }
    }, [])

  return [
    {name: 'Factory Kamppi', lunches: kamppiLunches},
    {name: 'Bruuveri', lunches: bruuveriLunches}
  ]
}

app.get('/', (_, res) => {
  res.send('ok')
})

app.get('/v1/lunches', async function(req, res) {
  const lunches = await getLunches()
  res.json(lunches)
})

app.listen(process.env.PORT || 3001)
