import React from "react"

import LotteryPage from "@/components/LotteryPage"
import util from "@/magic/util"
import { useRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

let list1 = [
  { text: "01", shape: "circle", odds: "" },
  { text: "02", shape: "circle", odds: "" },
  { text: "03", shape: "circle", odds: "" },
  { text: "04", shape: "circle", odds: "" },
  { text: "05", shape: "circle", odds: "" },
  { text: "06", shape: "circle", odds: "" },
  { text: "07", shape: "circle", odds: "" },
  { text: "08", shape: "circle", odds: "" },
  { text: "09", shape: "circle", odds: "" },
  { text: "10", shape: "circle", odds: "" },
  { text: "11", shape: "circle", odds: "" },
  { text: "12", shape: "circle", odds: "" },
  { text: "13", shape: "circle", odds: "" },
  { text: "14", shape: "circle", odds: "" },
  { text: "15", shape: "circle", odds: "" },
  { text: "16", shape: "circle", odds: "" },
  { text: "17", shape: "circle", odds: "" },
  { text: "18", shape: "circle", odds: "" },
  { text: "19", shape: "circle", odds: "" },
  { text: "20", shape: "circle", odds: "" },
  { text: "21", shape: "circle", odds: "" },
  { text: "22", shape: "circle", odds: "" },
  { text: "23", shape: "circle", odds: "" },
  { text: "24", shape: "circle", odds: "" },
  { text: "25", shape: "circle", odds: "" },
  { text: "26", shape: "circle", odds: "" },
  { text: "27", shape: "circle", odds: "" },
  { text: "28", shape: "circle", odds: "" },
  { text: "29", shape: "circle", odds: "" },
  { text: "30", shape: "circle", odds: "" },
  { text: "31", shape: "circle", odds: "" },
  { text: "32", shape: "circle", odds: "" },
  { text: "33", shape: "circle", odds: "" },
  { text: "34", shape: "circle", odds: "" },
  { text: "35", shape: "circle", odds: "" },
  { text: "36", shape: "circle", odds: "" },
  { text: "37", shape: "circle", odds: "" },
  { text: "38", shape: "circle", odds: "" },
  { text: "39", shape: "circle", odds: "" },
  { text: "40", shape: "circle", odds: "" },
]
let list2 = [
  { text: "41", shape: "circle", odds: "" },
  { text: "42", shape: "circle", odds: "" },
  { text: "43", shape: "circle", odds: "" },
  { text: "44", shape: "circle", odds: "" },
  { text: "45", shape: "circle", odds: "" },
  { text: "46", shape: "circle", odds: "" },
  { text: "47", shape: "circle", odds: "" },
  { text: "48", shape: "circle", odds: "" },
  { text: "49", shape: "circle", odds: "" },
  { text: "50", shape: "circle", odds: "" },
  { text: "51", shape: "circle", odds: "" },
  { text: "52", shape: "circle", odds: "" },
  { text: "53", shape: "circle", odds: "" },
  { text: "54", shape: "circle", odds: "" },
  { text: "55", shape: "circle", odds: "" },
  { text: "56", shape: "circle", odds: "" },
  { text: "57", shape: "circle", odds: "" },
  { text: "58", shape: "circle", odds: "" },
  { text: "59", shape: "circle", odds: "" },
  { text: "60", shape: "circle", odds: "" },
  { text: "61", shape: "circle", odds: "" },
  { text: "62", shape: "circle", odds: "" },
  { text: "63", shape: "circle", odds: "" },
  { text: "64", shape: "circle", odds: "" },
  { text: "65", shape: "circle", odds: "" },
  { text: "66", shape: "circle", odds: "" },
  { text: "67", shape: "circle", odds: "" },
  { text: "68", shape: "circle", odds: "" },
  { text: "69", shape: "circle", odds: "" },
  { text: "70", shape: "circle", odds: "" },
  { text: "71", shape: "circle", odds: "" },
  { text: "72", shape: "circle", odds: "" },
  { text: "73", shape: "circle", odds: "" },
  { text: "74", shape: "circle", odds: "" },
  { text: "75", shape: "circle", odds: "" },
  { text: "76", shape: "circle", odds: "" },
  { text: "77", shape: "circle", odds: "" },
  { text: "78", shape: "circle", odds: "" },
  { text: "79", shape: "circle", odds: "" },
  { text: "80", shape: "circle", odds: "" },
]

export const config = {
  1: {
    title: "",
    rule: "从01-80中选择1个号码组成一注，当期开奖结果的20个号码中包含所选号码，即可中奖！赔率<span>#Rx1#</span>",
    odds: "Rx1",
    betText: function (selectedList, lotteryRate, config) {
      let bet = []
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          bet = bet.concat(item.map((ball) => ball.value || ball.text))
        }
      })
      return bet.join(",")
    },
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      if (count > 20) {
        count = 20
      }

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "shangpan",
        title: "上盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list1,
      },
      {
        key: "xiapan",
        title: "下盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list2,
      },
    ],
  },
  2: {
    title: "",
    rule: "从01-80中选择2-8个号码，当期开奖结果的20个号码中包含所选号码中的两个，即可中奖！赔率<span>#Rx2#</span>",
    odds: "Rx2",
    betText: function (selectedList, lotteryRate, config) {
      let bet = []
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          bet = bet.concat(item.map((ball) => ball.value || ball.text))
        }
      })
      return bet.join(",")
    },
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 2)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(20, 2)
      if (count > max) {
        count = max
      }
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "shangpan",
        title: "上盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list1,
      },
      {
        key: "xiapan",
        title: "下盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list2,
      },
    ],
  },
  3: {
    title: "",
    rule: "从01-80中选择3-8个号码，当期开奖结果的20个号码中包含所选号码中的三个，即可中奖！赔率<span>#Rx3to3#</span>",
    odds: "Rx3to3",
    betText: function (selectedList, lotteryRate, config) {
      let bet = []
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          bet = bet.concat(item.map((ball) => ball.value || ball.text))
        }
      })
      return bet.join(",")
    },
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 3)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(20, 3)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "shangpan",
        title: "上盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list1,
      },
      {
        key: "xiapan",
        title: "下盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list2,
      },
    ],
  },
  4: {
    title: "",
    rule: "从01-80中选择4-8个号码，当期开奖结果的20个号码中包含所选号码中的四个，即可中奖！赔率<span>#Rx4to4#</span>",
    odds: "Rx4to4",
    betText: function (selectedList, lotteryRate, config) {
      let bet = []
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          bet = bet.concat(item.map((ball) => ball.value || ball.text))
        }
      })
      return bet.join(",")
    },
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 4)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(20, 4)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "shangpan",
        title: "上盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list1,
      },
      {
        key: "xiapan",
        title: "下盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list2,
      },
    ],
  },
  5: {
    title: "",
    rule: "从01-80中选择5-8个号码，当期开奖结果的20个号码中包含所选号码中的五个，即可中奖！赔率<span>#Rx5to5#</span>",
    odds: "Rx5to5",
    betText: function (selectedList, lotteryRate, config) {
      let bet = []
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          bet = bet.concat(item.map((ball) => ball.value || ball.text))
        }
      })
      return bet.join(",")
    },
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 5)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(20, 4)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "shangpan",
        title: "上盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list1,
      },
      {
        key: "xiapan",
        title: "下盘",
        column: "8",
        filter: [{ text: "清", filter: null }],
        list: list2,
      },
    ],
  },

  11: {
    title: "",
    rule: "选择20个开奖号码总和值的“大小单双”属性组合(和值<810为小,和值=810为和,和值>810为大)！",
    odds: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
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
      return rate * unit
    },
    list: [
      {
        key: "dxds",
        title: "大小单双",
        column: "5",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "大", shape: "rect", odds: "Hz_Daa", mutex: "dxds" },
          { text: "小", shape: "rect", odds: "Hz_Xia", mutex: "dxds" },
          { text: "单", shape: "rect", odds: "Hz_Dan", mutex: "dxds" },
          { text: "双", shape: "rect", odds: "Hz_Sua", mutex: "dxds" },
          { text: "和", shape: "rect", odds: "Hz_810", mutex: "dxds" },
        ],
      },
    ],
  },
  16: {
    title: "",
    rule: "开奖号码和值形态与下注项一致即中奖！",
    odds: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
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
      return rate * unit
    },
    list: [
      {
        key: "bstz",
        title: "半数投注",
        column: "4",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "大单", shape: "rect", odds: "Hz_Ban", mutex: "bstz" },
          { text: "大双", shape: "rect", odds: "Hz_Ban", mutex: "bstz" },
          { text: "小单", shape: "rect", odds: "Hz_Ban", mutex: "bstz" },
          { text: "小双", shape: "rect", odds: "Hz_Ban", mutex: "bstz" },
        ],
      },
    ],
  },
  14: {
    title: "",
    rule: "选择20个开奖号码中包含“奇·偶”号码个数多少关系！",
    odds: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
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
      return rate * unit
    },
    list: [
      {
        key: "johp",
        title: "奇偶和盘",
        column: "3",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "奇", shape: "rect", odds: "Hz_J", mutex: "johp" },
          { text: "偶", shape: "rect", odds: "Hz_O", mutex: "johp" },
          { text: "和", shape: "rect", odds: "Hz_H", mutex: "johp" },
        ],
      },
    ],
  },
  13: {
    title: "",
    rule: "选择20个开奖号码中包含“上盘(01-40)”与“下盘(41-80)”号码个数多少关系！",
    odds: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
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
      return rate * unit
    },
    list: [
      {
        key: "szxp",
        title: "上中下盘",
        column: "3",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "上", shape: "rect", odds: "Hz_S", mutex: "szxp" },
          { text: "中", shape: "rect", odds: "Hz_Z", mutex: "szxp" },
          { text: "下", shape: "rect", odds: "Hz_X", mutex: "szxp" },
        ],
      },
    ],
  },
  15: {
    title: "",
    rule: "开奖号码和值五行形态与下注项一致即中奖（金:210-695木:696-763水:764-855火:856-923土:924-1410）！",
    odds: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
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
      return rate * unit
    },
    list: [
      {
        key: "hzwx",
        title: "和值五行",
        column: "5",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "金", shape: "rect", odds: "Wx_J", mutex: "hzwx" },
          { text: "木", shape: "rect", odds: "Wx_M", mutex: "hzwx" },
          { text: "水", shape: "rect", odds: "Wx_S", mutex: "hzwx" },
          { text: "火", shape: "rect", odds: "Wx_H", mutex: "hzwx" },
          { text: "土", shape: "rect", odds: "Wx_T", mutex: "hzwx" },
        ],
      },
    ],
  },
}

export default () => {
  const { route } = useRouter()
  return <LotteryPage config={config[route.query.lx]} />
}
