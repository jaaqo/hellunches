const $ = require('cheerio')
const moment = require('moment')

moment.locale('fi')

module.exports = {
  name: 'Old Sophie',
  url: 'https://oldsophie.fi/?page_id=19',
  getLunches: async html => {
    const oldSophieMenuString = $('#content', html).text().trim()
    const [
      ,
      weekOfYear
    ] = /Lounaat viikolla.+(\d{2}).*klo (\d{2})-(\d{2})/.exec(
      oldSophieMenuString
    )
    const week = Number(weekOfYear)
    const [, dayOfWeek] = /lounaalla (.*)\n/i.exec(oldSophieMenuString)
    const day = moment
      .weekdays()
      .filter(day => dayOfWeek.toLowerCase().includes(day.toLowerCase()))[0]
    const date = moment.utc().day(day).week(week).startOf('day').toDate()

    const menuLines = oldSophieMenuString
      .split('\n')
      .filter(line => /– /.test(line))
      .map(line =>
        line
          .replace('– ', '')
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase())
      )

    return [{date, menuLines}]
  }
}
