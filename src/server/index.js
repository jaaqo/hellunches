const express = require('express')
const axios = require('axios')
const cors = require('cors')
const $ = require('cheerio')
const moment = require('moment')
const memoize = require('memoizee')
const _ = require('lodash')

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
const BRUUVERI_LUNCHES_URL = 'https://www.bruuveri.fi/lounas-menu/'

const getLunches = async () => {
  const {data: bruuveriHTML} = await memoizedGET(BRUUVERI_LUNCHES_URL)

  const bruuveriMenusAsString = $('.tab-content', bruuveriHTML)
    .text()
    .trim()

  const bruuveriDates = bruuveriMenusAsString.match(/\d{1,2}\.\d{1,2}\./g)

  const bruuveriLunches = bruuveriMenusAsString
    .split(/.*\d{1,2}\.\d{1,2}\.\n?/)
    .filter(s => s)
    .reduce((acc, currentLine, i) => {
      if (!acc[i]) {
        acc.push({
          date: moment.utc(bruuveriDates[i].trim(), 'DD.MM.').toDate()
        })
      }


      acc[i].menuLines = currentLine.split(')').map(line => {
        let l = line;

        if (line.includes('('))
          l = l + ')'

        l = l.replace(/^[^a-zA-Z]*/, '');

        l = l.charAt(0).toUpperCase() + l.slice(1);

        return l.trim();
      })

      return acc
    }, [])

  const {data: kamppiHTML} = await memoizedGET(KAMPPI_LUNCHES_URL)

  const allKamppiLunches = $('.lounaslista .list', kamppiHTML)
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

  const kamppiLunches = _.uniqBy(allKamppiLunches, d => d.date.toString())

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
