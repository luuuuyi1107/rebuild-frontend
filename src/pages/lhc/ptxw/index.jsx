import React from "react"

import LotteryPage from "@/components/LotteryPage"
import util from "@/magic/util"
import { useRouter } from "@/magic/withRouter"

// const zodiacAnimalIndexObj = util.getZodiacnimalObj()

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

const getBetOdds = (selectedList, lotteryRate) =>
  selectedList
    .flat()
    .filter((x) => x)
    .reduce((result, x) => {
      return result[x.odds] ? result : { ...result, [x.odds]: lotteryRate[x.odds] }
    }, {})
const getMaxRate = (selectedList, lotteryRate) => {
  const odds = selectedList
    .flat()
    .filter((x) => x)
    .map((x) => lotteryRate[x.odds])
  return odds.length ? Math.max(...odds) : 0
}

export const config = {
  41: {
    title: "半波",
    filter: [{ text: "清", filter: null }],
    rule: "以特别号色波和特单，特双，特大，特小为一个投注组合，当期特别号开出符合投注组合，即视为中奖（注：如开49为和，退回本金）！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let maxRate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem && maxRate <= lotteryRate[subItem.odds]) {
              maxRate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return maxRate * unit
    },
    list: [
      {
        key: "bbtz",
        title: "",
        column: "4",
        list: [
          { text: "红单", shape: "rect", mutex: "bbtz", odds: "HB_Dan", color: "", dx: "", ds: "" },
          { text: "红双", shape: "rect", mutex: "bbtz", odds: "HB_Shuan", color: "", dx: "", ds: "" },
          { text: "红大", shape: "rect", mutex: "bbtz", odds: "HB_Da", color: "", dx: "", ds: "" },
          { text: "红小", shape: "rect", mutex: "bbtz", odds: "HB_Xiao", color: "", dx: "", ds: "" },
          { text: "蓝单", shape: "rect", mutex: "bbtz", odds: "LB_Dan", color: "", dx: "", ds: "" },
          { text: "蓝双", shape: "rect", mutex: "bbtz", odds: "LB_Shuan", color: "", dx: "", ds: "" },
          { text: "蓝大", shape: "rect", mutex: "bbtz", odds: "LB_Da", color: "", dx: "", ds: "" },
          { text: "蓝小", shape: "rect", mutex: "bbtz", odds: "LB_Xiao", color: "", dx: "", ds: "" },
          { text: "绿单", shape: "rect", mutex: "bbtz", odds: "LV_Dan", color: "", dx: "", ds: "" },
          { text: "绿双", shape: "rect", mutex: "bbtz", odds: "LV_Shuan", color: "", dx: "", ds: "" },
          { text: "绿大", shape: "rect", mutex: "bbtz", odds: "LV_Da", color: "", dx: "", ds: "" },
          { text: "绿小", shape: "rect", mutex: "bbtz", odds: "LV_Xiao", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  42: {
    title: "半半波",
    filter: [{ text: "清", filter: null }],
    rule: "以特别号色波和特别号单双及特码大小等三种游戏为一个投注组合，当期特码开出符合投注组合，即视为中奖（注：如开49为和，退回本金）！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let maxRate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem && maxRate <= lotteryRate[subItem.odds]) {
              maxRate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return maxRate * unit
    },
    list: [
      {
        key: "bbbs",
        title: "",
        column: "4",
        list: [
          { text: "红大单", shape: "rect", mutex: "bbbs", odds: "HB_DaDan", color: "", dx: "", ds: "" },
          { text: "红大双", shape: "rect", mutex: "bbbs", odds: "HB_DaShuan", color: "", dx: "", ds: "" },
          { text: "红小单", shape: "rect", mutex: "bbbs", odds: "HB_XiaoDan", color: "", dx: "", ds: "" },
          { text: "红小双", shape: "rect", mutex: "bbbs", odds: "HB_XiaoShuang", color: "", dx: "", ds: "" },
          { text: "蓝大单", shape: "rect", mutex: "bbbs", odds: "LB_DaDan", color: "", dx: "", ds: "" },
          { text: "蓝大双", shape: "rect", mutex: "bbbs", odds: "LB_DaShuan", color: "", dx: "", ds: "" },
          { text: "蓝小单", shape: "rect", mutex: "bbbs", odds: "LB_XiaoDan", color: "", dx: "", ds: "" },
          { text: "蓝小双", shape: "rect", mutex: "bbbs", odds: "LB_XiaoShuang", color: "", dx: "", ds: "" },
          { text: "绿大单", shape: "rect", mutex: "bbbs", odds: "LV_DaDan", color: "", dx: "", ds: "" },
          { text: "绿大双", shape: "rect", mutex: "bbbs", odds: "LV_DaShuan", color: "", dx: "", ds: "" },
          { text: "绿小单", shape: "rect", mutex: "bbbs", odds: "LV_XiaoDan", color: "", dx: "", ds: "" },
          { text: "绿小双", shape: "rect", mutex: "bbbs", odds: "LV_XiaoShuang", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  19: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "开奖的七个号码包含所投注的生肖，即为中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              rate += lotteryRate[subItem.odds]
            }
          })
        }
      })
      //let count = config.betCount(selectedList, lotteryRate, config, unit);
      // count = count > 2 ? count - 1 : 1;
      return rate * unit
    },
    list: [
      {
        key: "pt1x",
        title: "",
        column: "4",
        maxBallNumber: 6,
        list: util
          .getZodiacnimals()
          .map((text, idx) => ({ text, shape: "rect", odds: `Pt1x_${util.padStart(idx + 1 + "")}`, color: "", dx: "", ds: "" })),
      },
    ],
    refundCode: "Pt1x_Refunds",
  },
  20: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择二个生肖为一投注组合进行下注。该注的二个生肖必须在当期开出的7个开奖号码相对应的生肖中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 2) return 0
      return (count * (count - 1)) / 2
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      const betOdds = getBetOdds(selectedList, lotteryRate)
      return (this.betCount(selectedList) === 1 ? betOdds["Pt2x_Ben"] ?? betOdds["Pt2x"] : getMaxRate(selectedList, lotteryRate)) * unit
    },
    generateList(date = new Date()) {
      return util.getZodiacnimalList("Pt2x_Ben", "Pt2x", "pt2x", date, 6)
    },
    list: util.getZodiacnimalList("Pt2x_Ben", "Pt2x", "pt2x", new Date(), 6),
    isComputed: true,
    // list: [
    //   {
    //     key: "pt2x",
    //     title: "",
    //     column: "4",
    //     maxBallNumber: 6,
    //     list: util.getZodiacnimals()
    //       .map((text) => ({ text, shape: "rect", odds: zodiacAnimalIndexObj[text] === 0 ? "Pt2x_Ben" : "Pt2x", color: "", dx: "", ds: "" })),
    //   },
    // ],
  },
  21: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择三个生肖为一投注组合进行下注。该注的三个生肖必须在当期开出的7个开奖号码相对应的生肖中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 3) return 0
      return util.math.combination(count, 3)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      const betOdds = getBetOdds(selectedList, lotteryRate)
      return (this.betCount(selectedList) === 1 ? betOdds["Pt3x_Ben"] ?? betOdds["Pt3x"] : getMaxRate(selectedList, lotteryRate)) * unit
    },

    generateList(date = new Date()) {
      return util.getZodiacnimalList("Pt3x_Ben", "Pt3x", "pt3x", date, 6)
    },
    list: util.getZodiacnimalList("Pt3x_Ben", "Pt3x", "pt3x", new Date(), 6),
    isComputed: true,
    // list: [
    //   {
    //     key: "pt3x",
    //     title: "",
    //     column: "4",
    //     maxBallNumber: 6,
    //     list: util.getZodiacnimals()
    //       .map((text) => ({ text, shape: "rect", odds: zodiacAnimalIndexObj[text] === 0 ? "Pt3x_Ben" : "Pt3x", color: "", dx: "", ds: "" })),
    //   },
    // ],
  },
  22: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择四个生肖为一投注组合进行下注。该注的四个生肖必须在当期开出的7个开奖号码相对应的生肖中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 4) return 0
      return util.math.combination(count, 4)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      const betOdds = getBetOdds(selectedList, lotteryRate)
      return (this.betCount(selectedList) === 1 ? betOdds["Pt4x_Ben"] ?? betOdds["Pt4x"] : getMaxRate(selectedList, lotteryRate)) * unit
    },
    generateList(date = new Date()) {
      return util.getZodiacnimalList("Pt4x_Ben", "Pt4x", "pt4x", date, 6)
    },
    list: util.getZodiacnimalList("Pt4x_Ben", "Pt4x", "pt4x", new Date(), 6),
    isComputed: true,
    // list: [
    //   {
    //     key: "pt4x",
    //     title: "",
    //     column: "4",
    //     maxBallNumber: 6,
    //     list: util.getZodiacnimals()
    //       .map((text) => ({ text, shape: "rect", odds: zodiacAnimalIndexObj[text] === 0 ? "Pt4x_Ben" : "Pt4x", color: "", dx: "", ds: "" })),
    //   },
    // ],
  },
  28: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择五个生肖为一投注组合进行下注。该注的五个生肖必须在当期开出的7个开奖号码相对应的生肖中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 5) return 0
      return util.math.combination(count, 5)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      const betOdds = getBetOdds(selectedList, lotteryRate)
      return (this.betCount(selectedList) === 1 ? betOdds["Pt5x_Ben"] ?? betOdds["Pt5x"] : getMaxRate(selectedList, lotteryRate)) * unit
    },
    generateList(date = new Date()) {
      return util.getZodiacnimalList("Pt5x_Ben", "Pt5x", "pt5x", date, 5)
    },
    list: util.getZodiacnimalList("Pt5x_Ben", "Pt5x", "pt5x", new Date(), 5),
    isComputed: true,
    // list: [
    //   {
    //     key: "pt5x",
    //     title: "",
    //     column: "4",
    //     maxBallNumber: 5,
    //     list: util.getZodiacnimals()
    //       .map((text) => ({ text, shape: "rect", odds: zodiacAnimalIndexObj[text] === 0 ? "Pt5x_Ben" : "Pt5x", color: "", dx: "", ds: "" })),
    //   },
    // ],
  },
  23: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "开奖的七个号码包含所投注的尾数，即为中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = 0
      let length = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem && length < 7) {
              length++
              rate += lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "pt1w",
        title: "",
        column: "4",
        list: [
          { text: "零尾", value: "0", shape: "rect", odds: "Pt1w_0", color: "", dx: "", ds: "" },
          { text: "一尾", value: "1", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "二尾", value: "2", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "三尾", value: "3", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "四尾", value: "4", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "五尾", value: "5", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "六尾", value: "6", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "七尾", value: "7", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "八尾", value: "8", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
          { text: "九尾", value: "9", shape: "rect", odds: "Pt1w", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  24: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择二个尾数为一投注组合进行下注。该注的二个尾数必须在当期开出的7个开奖号码相对应的尾数中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 2) return 0
      return util.math.combination(count, 2)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return getMaxRate(selectedList, lotteryRate) * unit
    },
    list: [
      {
        key: "pt2w",
        title: "",
        column: "4",
        list: [
          { text: "零尾", value: "0", shape: "rect", odds: "Pt2w_0", color: "", dx: "", ds: "" },
          { text: "一尾", value: "1", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "二尾", value: "2", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "三尾", value: "3", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "四尾", value: "4", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "五尾", value: "5", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "六尾", value: "6", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "七尾", value: "7", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "八尾", value: "8", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
          { text: "九尾", value: "9", shape: "rect", odds: "Pt2w", color: "", dx: "", ds: "" },
        ],
      },
    ],
    isComputed: true,
  },
  25: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择三个尾数为一投注组合进行下注。该注的三个尾数必须在当期开出的7个开奖号码相对应的尾数中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 3) return 0
      return util.math.combination(count, 3)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return getMaxRate(selectedList, lotteryRate) * unit
    },
    list: [
      {
        key: "pt3w",
        title: "",
        column: "4",
        list: [
          { text: "零尾", value: "0", shape: "rect", odds: "Pt3w_0", color: "", dx: "", ds: "" },
          { text: "一尾", value: "1", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "二尾", value: "2", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "三尾", value: "3", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "四尾", value: "4", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "五尾", value: "5", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "六尾", value: "6", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "七尾", value: "7", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "八尾", value: "8", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
          { text: "九尾", value: "9", shape: "rect", odds: "Pt3w", color: "", dx: "", ds: "" },
        ],
      },
    ],
    isComputed: true,
  },
  26: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择四个尾数为一投注组合进行下注。该注的四个尾数必须在当期开出的7个开奖号码相对应的尾数中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count < 4) return 0
      return util.math.combination(count, 4)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return getMaxRate(selectedList, lotteryRate) * unit
    },
    list: [
      {
        key: "pt4w",
        title: "",
        column: "4",
        list: [
          { text: "零尾", value: "0", shape: "rect", odds: "Pt4w_0", color: "", dx: "", ds: "" },
          { text: "一尾", value: "1", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "二尾", value: "2", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "三尾", value: "3", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "四尾", value: "4", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "五尾", value: "5", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "六尾", value: "6", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "七尾", value: "7", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "八尾", value: "8", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
          { text: "九尾", value: "9", shape: "rect", odds: "Pt4w", color: "", dx: "", ds: "" },
        ],
      },
    ],
    isComputed: true,
  },
  27: {
    title: "下注",
    filter: [{ text: "清", filter: null }],
    rule: "选择五个尾数为一投注组合进行下注。该注的五个尾数必须在当期开出的7个开奖号码相对应的尾数中，即为中奖！",
    odds: "",
    listName: "",
    customBetResultPrefix: "单注可中",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 5) {
        return 1
      } else {
        return 0
      }
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return getMaxRate(selectedList, lotteryRate) * unit
    },
    list: [
      {
        key: "pt5w",
        title: "",
        column: "4",
        maxBallNumber: 5,
        list: [
          { text: "零尾", value: "0", shape: "rect", odds: "Pt5w_0", color: "", dx: "", ds: "" },
          { text: "一尾", value: "1", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "二尾", value: "2", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "三尾", value: "3", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "四尾", value: "4", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "五尾", value: "5", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "六尾", value: "6", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "七尾", value: "7", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "八尾", value: "8", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
          { text: "九尾", value: "9", shape: "rect", odds: "Pt5w", color: "", dx: "", ds: "" },
        ],
      },
    ],
    isComputed: true,
  },
}

export default () => {
  const { route } = useRouter()
  return <LotteryPage config={config[route.query.lx]} />
}
