const $ = require('cheerio')
const moment = require('moment')

module.exports = {
  name: 'Bruuveri',
  url: 'https://www.bruuveri.fi/lounas-menu/',
  getLunches: async html => {
    const bruuveriMenusAsString = $('.tab-content', html).text().trim()

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
          let l = line

          if (line.includes('(')) l = l + ')'

          l = l.replace(/^[^a-zA-Z]*/, '')

          l = l.charAt(0).toUpperCase() + l.slice(1)

          return l.trim()
        })

        return acc
      }, [])

    return bruuveriLunches
  }
}
