import $ from 'cheerio'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'Factory Kamppi',
  url: 'https://factorykamppi.com/lounas/',
  getLunches: async html => {
    const allKamppiLunches = $('.lounaslista .list', html)
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

    return kamppiLunches
  }
}
