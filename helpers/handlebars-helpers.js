const dayjs = require('dayjs') // 載入 dayjs 套件
const relativeTime = require('dayjs/plugin/relativeTime') // 增加這裡
dayjs.extend(relativeTime) // 增加這裡
module.exports = {
  currentYear: () => dayjs().year(), // 取得當年年份作為 currentYear 的屬性值，並導出
  relativeTimeFromNow: a => dayjs(a).fromNow(),
  prettyTime: a => {
    // 2023-08-05T18:00:00.000Z
    const formattedTime = a.toISOString().split(/[- T :]/)
    const output = `${formattedTime[0]}-${formattedTime[1]}-${formattedTime[2]} ${formattedTime[3]}:${formattedTime[4]}`

    return output
  },
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}
