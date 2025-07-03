import React from "react"

import LotteryPage from "@/components/LotteryPage"
import { withRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

export const config = {
  1: {
    title: "特码下注",
    filter: [{ text: "清", filter: null }],
    rule: "从0-27中选取一个以上的数字，投注号码与开奖号码和值相同，即中奖！",
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
        key: "tmxz",
        title: "",
        column: "4",
        list: [
          { text: "00", shape: "rect", odds: "TM0", color: "", dx: "", ds: "" },
          { text: "01", shape: "rect", odds: "TM1", color: "", dx: "", ds: "" },
          { text: "02", shape: "rect", odds: "TM2", color: "", dx: "", ds: "" },
          { text: "03", shape: "rect", odds: "TM3", color: "", dx: "", ds: "" },
          { text: "04", shape: "rect", odds: "TM4", color: "", dx: "", ds: "" },
          { text: "05", shape: "rect", odds: "TM5", color: "", dx: "", ds: "" },
          { text: "06", shape: "rect", odds: "TM6", color: "", dx: "", ds: "" },
          { text: "07", shape: "rect", odds: "TM7", color: "", dx: "", ds: "" },
          { text: "08", shape: "rect", odds: "TM8", color: "", dx: "", ds: "" },
          { text: "09", shape: "rect", odds: "TM9", color: "", dx: "", ds: "" },
          { text: "10", shape: "rect", odds: "TM10", color: "", dx: "", ds: "" },
          { text: "11", shape: "rect", odds: "TM11", color: "", dx: "", ds: "" },
          { text: "12", shape: "rect", odds: "TM12", color: "", dx: "", ds: "" },
          { text: "13", shape: "rect", odds: "TM13", color: "", dx: "", ds: "" },
          { text: "14", shape: "rect", odds: "TM14", color: "", dx: "", ds: "" },
          { text: "15", shape: "rect", odds: "TM15", color: "", dx: "", ds: "" },
          { text: "16", shape: "rect", odds: "TM16", color: "", dx: "", ds: "" },
          { text: "17", shape: "rect", odds: "TM17", color: "", dx: "", ds: "" },
          { text: "18", shape: "rect", odds: "TM18", color: "", dx: "", ds: "" },
          { text: "19", shape: "rect", odds: "TM19", color: "", dx: "", ds: "" },
          { text: "20", shape: "rect", odds: "TM20", color: "", dx: "", ds: "" },
          { text: "21", shape: "rect", odds: "TM21", color: "", dx: "", ds: "" },
          { text: "22", shape: "rect", odds: "TM22", color: "", dx: "", ds: "" },
          { text: "23", shape: "rect", odds: "TM23", color: "", dx: "", ds: "" },
          { text: "24", shape: "rect", odds: "TM24", color: "", dx: "", ds: "" },
          { text: "25", shape: "rect", odds: "TM25", color: "", dx: "", ds: "" },
          { text: "26", shape: "rect", odds: "TM26", color: "", dx: "", ds: "" },
          { text: "27", shape: "rect", odds: "TM27", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  2: {
    title: "特码包三",
    filter: [{ text: "清", filter: null }],
    rule: "从0-27中任选3个号码组成1注，任意一个选号与开奖号码和值相同，即中奖！赔率<span>#TeMaBao3#</span>",
    odds: "TeMaBao3",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 3) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "tmbs",
        title: "",
        column: "4",
        maxBallNumber: 3,
        list: [
          { text: "00", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "01", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "02", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "03", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "04", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "05", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "06", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "07", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "08", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "09", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "10", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "11", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "12", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "13", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "14", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "15", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "16", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "17", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "18", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "19", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "20", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "21", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "22", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "23", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "24", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "25", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "26", shape: "rect", odds: "", color: "", dx: "", ds: "" },
          { text: "27", shape: "rect", odds: "", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  3: {
    title: "大小单双",
    filter: [{ text: "清", filter: null }],
    rule: "数字14-27为大 ；数字0-13为小；当期开奖号码和值，符合投注组合，即中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 1) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || isArrayEmpty(selectedList)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              rate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "dxds",
        title: "",
        column: "4",
        list: [
          { text: "大", shape: "rect", mutex: "dxds", odds: "DXDS", color: "", dx: "", ds: "" },
          { text: "小", shape: "rect", mutex: "dxds", odds: "DXDS", color: "", dx: "", ds: "" },
          { text: "单", shape: "rect", mutex: "dxds", odds: "DXDS", color: "", dx: "", ds: "" },
          { text: "双", shape: "rect", mutex: "dxds", odds: "DXDS", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  4: {
    title: "混合组合",
    filter: [{ text: "清", filter: null }],
    rule: "从大双,小单,大单,小双中至少选一注，当期开奖号码和值，符合投注组合，即中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 1) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || isArrayEmpty(selectedList)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              rate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "hhzh",
        title: "",
        column: "4",
        list: [
          { text: "大双", shape: "rect", mutex: "hhzh", odds: "DSDDXSXD", color: "", dx: "", ds: "" },
          { text: "小单", shape: "rect", mutex: "hhzh", odds: "DSDDXSXD", color: "", dx: "", ds: "" },
          { text: "大单", shape: "rect", mutex: "hhzh", odds: "DSDDXSXD", color: "", dx: "", ds: "" },
          { text: "小双", shape: "rect", mutex: "hhzh", odds: "DSDDXSXD", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  5: {
    title: "极值投注",
    filter: [{ text: "清", filter: null }],
    rule: "数字0，1，2，3，4，5为极小 ；数字22，23，24，25，26，27为极大；当期开奖号码和值，符合投注组合，即中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 1) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || isArrayEmpty(selectedList)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              rate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "jztz",
        title: "",
        column: "4",
        list: [
          { text: "极大", shape: "rect", mutex: "jztz", odds: "JDJX", color: "", dx: "", ds: "" },
          { text: "极小", shape: "rect", mutex: "jztz", odds: "JDJX", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  6: {
    title: "波色投注",
    filter: [{ text: "清", filter: null }],
    rule: "猜特码的颜色，3,6,9,12,15,18,21,24为红波，1,4,7,10,16,19,22,25为绿波，2,5,8,11,17,20,23,26为蓝波，0,13,14,27不中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 1) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || isArrayEmpty(selectedList)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              rate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "bstz",
        title: "",
        column: "4",
        list: [
          { text: "红波", shape: "rect", mutex: "bstz", odds: "BOSE", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "bstz", odds: "BOSE", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "bstz", odds: "BOSE", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  7: {
    title: "形态投注",
    filter: [{ text: "清", filter: null }],
    rule: "当期开奖号码和值，符合投注形态，即中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && selectedList[0].length == 1) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || isArrayEmpty(selectedList)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              rate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "xttz",
        title: "",
        column: "4",
        list: [
          { text: "豹子", shape: "rect", mutex: "xttz", odds: "BaoZi", color: "", dx: "", ds: "" },
          { text: "对子", shape: "rect", mutex: "xttz", odds: "DuiZi", color: "", dx: "", ds: "" },
          { text: "顺子", shape: "rect", mutex: "xttz", odds: "ShunZi", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
}

export default withRouter(({ route }) => {
  return <LotteryPage config={config[route.query.lx]} />
})
