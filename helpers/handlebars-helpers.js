const dayjs = require('dayjs') // 載入 dayjs 套件
const relativeTime = require('dayjs/plugin/relativeTime') // 增加這裡
dayjs.extend(relativeTime) // 增加這裡
module.exports = {
  currentYear: () => dayjs().year(), // 取得當年年份作為 currentYear 的屬性值，並導出
  relativeTimeFromNow: a => dayjs(a).fromNow(),
  prettyTime: a => {
    if (a) {
      // 2023-08-05T18:00:00.000Z
      const day = ['Sat', 'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'][new Date(a).getDay()]
      const formattedTime = a.toISOString().split(/[- T :]/)
      const output = `${formattedTime[0]}-${formattedTime[1]}-${formattedTime[2]} (${day}.) ${formattedTime[3]}:${formattedTime[4]}`

      return output
    }
  },
  getFlagEmoji: countryCode => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
  },
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  consoleLog: function (a) {
    console.log(a)
  },
  extract: function (a, b) {
    return a[b]
  }
}
