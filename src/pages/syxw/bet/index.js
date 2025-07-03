import React from "react"

import LotteryPage from "@/components/LotteryPage"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

const ballList = [
  { text: "01", shape: "circle", odds: "", color: "", dx: "小", ds: "单" },
  { text: "02", shape: "circle", odds: "", color: "", dx: "小", ds: "双" },
  { text: "03", shape: "circle", odds: "", color: "", dx: "小", ds: "单" },
  { text: "04", shape: "circle", odds: "", color: "", dx: "小", ds: "双" },
  { text: "05", shape: "circle", odds: "", color: "", dx: "小", ds: "单" },
  { text: "06", shape: "circle", odds: "", color: "", dx: "大", ds: "双" },
  { text: "07", shape: "circle", odds: "", color: "", dx: "大", ds: "单" },
  { text: "08", shape: "circle", odds: "", color: "", dx: "大", ds: "双" },
  { text: "09", shape: "circle", odds: "", color: "", dx: "大", ds: "单" },
  { text: "10", shape: "circle", odds: "", color: "", dx: "大", ds: "双" },
  { text: "11", shape: "circle", odds: "", color: "", dx: "大", ds: "单" },
]

const ballListDanTuo = [
  { text: "1", shape: "circle", odds: "", color: "", globalMutex: "1" },
  { text: "2", shape: "circle", odds: "", color: "", globalMutex: "2" },
  { text: "3", shape: "circle", odds: "", color: "", globalMutex: "3" },
  { text: "4", shape: "circle", odds: "", color: "", globalMutex: "4" },
  { text: "5", shape: "circle", odds: "", color: "", globalMutex: "5" },
  { text: "6", shape: "circle", odds: "", color: "", globalMutex: "6" },
  { text: "7", shape: "circle", odds: "", color: "", globalMutex: "7" },
  { text: "8", shape: "circle", odds: "", color: "", globalMutex: "8" },
  { text: "9", shape: "circle", odds: "", color: "", globalMutex: "9" },
  { text: "10", shape: "circle", odds: "", color: "", globalMutex: "10" },
  { text: "11", shape: "circle", odds: "", color: "", globalMutex: "11" },
]

const dxdsFilter = [
  { text: "大", filter: { dx: "大" } },
  { text: "小", filter: { dx: "小" } },
  { text: "单", filter: { ds: "单" } },
  { text: "双", filter: { ds: "双" } },
  { text: "清", filter: null },
]

const dsdsList = [
  { text: "大", shape: "circle", mutex: "dx", odds: "", color: "", dx: "大", ds: "" },
  { text: "小", shape: "circle", mutex: "dx", odds: "", color: "", dx: "小", ds: "" },
  { text: "单", shape: "circle", mutex: "ds", odds: "", color: "", dx: "", ds: "单" },
  { text: "双", shape: "circle", mutex: "ds", odds: "", color: "", dx: "", ds: "双" },
]

function getDtCount(selectedList, dt) {
  let count = 0
  if (selectedList && selectedList.length == 2) {
    let length1 = isArrayEmpty(selectedList[0]) ? 0 : selectedList[0].length
    let length2 = isArrayEmpty(selectedList[1]) ? 0 : selectedList[1].length
    if (length1 + length2 < dt) {
      return 0
    }

    count = util.math.combination(length2, dt - length1)
  }
  return count
}

function getDtMaxCount(selectedList, dt) {
  let length1 = isArrayEmpty(selectedList[0]) ? 0 : selectedList[0].length
  let length2 = isArrayEmpty(selectedList[1]) ? 0 : selectedList[1].length
  if (dt <= 5) {
    return util.math.combination(5 - length1, dt - length1)
  } else {
    return util.math.combination(length1 + length2 - 5, dt - 5)
  }
}

export const config = {
  20: {
    quickMode: {
      title: "",
      rule: "猜指定位置上的号码，下注位置号码与开奖位置号码相同视为中奖！赔率<span>#RxHm#</span>",
      odds: "RxHm",
      listName: "号码快投",
      betCount: function (selectedList, lotteryRate, config) {
        if (!isArrayEmpty(selectedList[0]) && !isArrayEmpty(selectedList[1])) {
          return selectedList[0].length * selectedList[1].length
        }
        return 0
      },
      maxRate: function (selectedList, lotteryRate, config, unit) {
        if (isNaN(unit)) {
          return "-"
        }
        if (!isArrayEmpty(selectedList[0]) && !isArrayEmpty(selectedList[1])) {
          return lotteryRate[config.odds] * selectedList[0].length * unit
        }
        return 0
      },
      list: [
        {
          key: "weizhi",
          title: "位置",
          column: "5",
          filter: [
            { text: "全", filter: { q: "全" } },
            { text: "奇", filter: { ds: "单" } },
            { text: "偶", filter: { ds: "双" } },
            { text: "清", filter: null },
          ],
          list: [
            { text: "一", shape: "circle", index: 0, odds: "", color: "", q: "全", ds: "单" },
            { text: "二", shape: "circle", index: 1, odds: "", color: "", q: "全", ds: "双" },
            { text: "三", shape: "circle", index: 2, odds: "", color: "", q: "全", ds: "单" },
            { text: "四", shape: "circle", index: 3, odds: "", color: "", q: "全", ds: "双" },
            { text: "五", shape: "circle", index: 4, odds: "", color: "", q: "全", ds: "单" },
          ],
        },
        {
          key: "hm",
          title: "",
          column: "7",
          filter: dxdsFilter,
          list: ballList,
        },
      ],
    },
    title: "号码投注",
    filter: dxdsFilter,
    rule: "从任意名次上选择一个号码组成一注，选号与相同名次的号码一致！赔率<span>#RxHm#</span>",
    odds: "RxHm",
    listName: "号码投注",
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
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count++
        }
      })
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "1",
        title: "第一位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "2",
        title: "第二位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },

      {
        key: "3",
        title: "第三位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "4",
        title: "第四位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "5",
        title: "第五位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
  },
  1: {
    title: "前一直选",
    rule: "选1个号码，猜中开奖号码第1个数字，即为中奖！赔率<span>#Q1#</span>",
    odds: "Q1",
    baseUnit: 2,
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
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count++
        }
      })
      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "第一位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
  },
  9: {
    title: "前二直选",
    rule: "至少选2个号组成一注，猜中开奖号前2个号，且顺序一致，即为中奖！赔率<span>#Q2#</span>",
    odds: "Q2",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (selectedList && selectedList.length === 2) {
        for (let i = 0; i < selectedList[0].length; i++) {
          for (let j = 0; j < selectedList[1].length; j++) {
            if (selectedList[0][i] != selectedList[1][j]) {
              count++
            }
          }
        }
      }

      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      if (count > 1) {
        count = 1
      }
      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "第一位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "2",
        title: "第二位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  11: {
    title: "前三直选",
    rule: "至少选3个号组成一注，猜中开奖号前3个号，且顺序一致，即为中奖！赔率<span>#Q3#</span>",
    odds: "Q3",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (selectedList && selectedList.length === 3) {
        for (let i = 0; i < selectedList[0].length; i++) {
          for (let j = 0; j < selectedList[1].length; j++) {
            if (selectedList[0][i] == selectedList[1][j]) {
              continue
            }
            for (let k = 0; k < selectedList[2].length; k++) {
              if (selectedList[0][i] == selectedList[2][k]) {
                continue
              }
              if (selectedList[1][j] == selectedList[2][k]) {
                continue
              }
              count++
            }
          }
        }
      }

      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      if (count > 1) {
        count = 1
      }
      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "第一位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "2",
        title: "第二位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "3",
        title: "第三位",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  10: {
    title: "前二组选",
    rule: "至少选2个号组成一注，猜中开奖号前2个号，即为中奖！赔率<span>#Q2Zx#</span>",
    odds: "Q2Zx",
    baseUnit: 2,
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

      if (count > 1) {
        count = 1
      }
      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  12: {
    title: "前三组选",
    rule: "至少选3个号组成一注，猜中开奖号前3个号，即为中奖！赔率<span>#Q3Zx#</span>",
    odds: "Q3Zx",
    baseUnit: 2,
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

      if (count > 1) {
        count = 1
      }
      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  21: {
    title: "大小单双",
    filterLogic: "or",
    filter: [
      { text: "大", filter: { dx: "大" } },
      { text: "小", filter: { dx: "小" } },
      { text: "单", filter: { ds: "单" } },
      { text: "双", filter: { ds: "双" } },
      { text: "清", filter: null },
    ],
    rule: "投注的号码与开出的号码大小（01-05为小，06-10为大，11退回本金）单双一致即中奖！赔率<span>#DxDs#</span>",
    odds: "DxDs",
    betCount: function (selectedList, lotteryRate, config, unit) {
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
      let count = config.betCount(selectedList, lotteryRate, config, unit)
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "1_ball",
        title: "第一位",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "2_ball",
        title: "第二位",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "3_ball",
        title: "第三位",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "4_ball",
        title: "第四位",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "5_ball",
        title: "第五位",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
    ],
  },
  23: {
    title: "",
    rule: "投注的号码与开出的号码总和大小(0-29为小,30为和退回本金,31-45为大) 单双一致即中奖！",
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
        title: "总和玩法",
        column: "4",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "大", shape: "rect", odds: "DxDs", mutex: "dxds" },
          { text: "小", shape: "rect", odds: "DxDs", mutex: "dxds" },
          { text: "单", shape: "rect", odds: "ZhDs_D", mutex: "dxds" },
          { text: "双", shape: "rect", odds: "ZhDs_S", mutex: "dxds" },
        ],
      },
    ],
  },
  25: {
    title: "任选一",
    rule: "任选1个号组成一注，当期的5个开奖号码包含所选号码，即为中奖！赔率<span>#Rx1#</span>",
    odds: "Rx1",
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
      let count = config.betCount(selectedList, lotteryRate, config) > 5 ? 5 : config.betCount(selectedList, lotteryRate, config)

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
  },
  2: {
    title: "任选二",
    rule: "任选2个号组成一注，当期的5个开奖号码包含所选号码，即为中奖！赔率<span>#Rx2#</span>",
    odds: "Rx2",
    baseUnit: 2,
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
      console.log({ count })

      let max = util.math.combination(5, 2)
      if (count > max) {
        count = max
      }

      console.log({
        count,
        max,
      })

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  3: {
    title: "任选三",
    rule: "任选3个号组成一注，当期的5个开奖号码包含所选号码，即为中奖！赔率<span>#Rx3#</span>",
    odds: "Rx3",
    baseUnit: 2,
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

      console.log({ count })
      let max = util.math.combination(5, 3)
      if (count > max) {
        count = max
      }

      if (isNaN(unit)) {
        return "-"
      }

      console.log({
        count,
        max,
      })

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  4: {
    title: "任选四",
    rule: "任选4个号组成一注，当期的5个开奖号码包含所选号码，即为中奖！赔率<span>#Rx4#</span>",
    odds: "Rx4",
    baseUnit: 2,
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
      let max = util.math.combination(5, 4)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  5: {
    title: "任选五",
    rule: "任选5个号组成一注，当期的5个开奖号码包含所选号码，即为中奖！赔率<span>#Rx5#</span>",
    odds: "Rx5",
    baseUnit: 2,
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
      let max = 1
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  6: {
    title: "任选六",
    rule: "任选6个号组成一注，所选的号码包含当期的5个开奖号码，即为中奖！赔率<span>#Rx6#</span>",
    odds: "Rx6",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 6)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      if (count >= 6) {
        count -= 5
      } else {
        count = 0
      }

      console.log({
        odds: lotteryRate[config.odds],
        count,
        unit,
        baseUnit: config.baseUnit,
      })

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  7: {
    title: "任选七",
    rule: "任选7个号组成一注，所选的号码包含当期的5个开奖号码，即为中奖！赔率<span>#Rx7#</span>",
    odds: "Rx7",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 7)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      if (count > 5) {
        count -= 5
        count = util.math.combination(count, 2)
      } else {
        count = 0
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  8: {
    title: "任选八",
    rule: "任选8个号组成一注，所选的号码包含当期的5个开奖号码，即为中奖！赔率<span>#Rx8#</span>",
    odds: "Rx8",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 8)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      if (count >= 6) {
        count -= 5
        count = util.math.combination(count, 3)
      } else {
        count = 0
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "7",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
    isComputed: true,
  },
  13: {
    title: "任二胆拖",
    rule: "选1个胆码、1个拖码，胆码加拖码不少于2个，只要当期的开奖号码包含所选号码，即为中奖！赔率<span>#Rx2#</span>",
    odds: "Rx2",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 2)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 2)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 1,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
  14: {
    title: "任三胆拖",
    rule: "选1~2个胆码、1～10个拖码，胆码加拖码不少于3个，只要当期的开奖号码包含所选号码，即为中奖！赔率<span>#Rx3#</span>",
    odds: "Rx3",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 3)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 3)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 2,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
  15: {
    title: "任四胆拖",
    rule: "选1~3个胆码、1～10个拖码，胆码加拖码不少于4个，只要当期的开奖号码包含所选号码，即为中奖！赔率<span>#Rx4#</span>",
    odds: "Rx4",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 4)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 4)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 3,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
  16: {
    title: "任五胆拖",
    rule: "选1~4个胆码、1～10个拖码，胆码加拖码不少于5个，只要当期的开奖号码包含所选号码，即为中奖！赔率<span>#Rx5#</span>",
    odds: "Rx5",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 5)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 5)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 4,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
  17: {
    title: "任六胆拖",
    rule: "选1~5个胆码、1～10个拖码，胆码加拖码不少于6个，只要所选号码包含当期的开奖号码，即为中奖！赔率<span>#Rx6#</span>",
    odds: "Rx6",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 6)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 6)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 5,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
  18: {
    title: "任七胆拖",
    rule: "选1~6个胆码、1～10个拖码，胆码加拖码不少于7个，只要所选号码包含当期的开奖号码，即为中奖！赔率<span>#Rx7#</span>",
    odds: "Rx7",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 7)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 7)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 6,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
  19: {
    title: "任八胆拖",
    rule: "选1~7个胆码、1～10个拖码，胆码加拖码不少于8个，只要所选号码包含当期的开奖号码，即为中奖！赔率<span>#Rx8#</span>",
    odds: "Rx8",
    baseUnit: 2,
    betCount: function (selectedList, lotteryRate, config) {
      return getDtCount(selectedList, 8)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = getDtMaxCount(selectedList, 8)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "dan",
        title: "胆码",
        column: "7",
        maxBallNumber: 7,
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
      {
        key: "tuo",
        title: "拖码",
        column: "7",
        filter: [{ text: "清", filter: null }],
        list: ballListDanTuo,
      },
    ],
    isComputed: true,
  },
}

export default withRouter(({ route }) => {
  return <LotteryPage config={config[route.query.lx]} />
})
