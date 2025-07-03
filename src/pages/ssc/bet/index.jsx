import React from "react"

import LotteryPage from "@/components/LotteryPage"
import { withRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

const tenBallList = [
  { text: "0", shape: "circle", odds: "", color: "", dx: "小", ds: "双" },
  { text: "1", shape: "circle", odds: "", color: "", dx: "小", ds: "单" },
  { text: "2", shape: "circle", odds: "", color: "", dx: "小", ds: "双" },
  { text: "3", shape: "circle", odds: "", color: "", dx: "小", ds: "单" },
  { text: "4", shape: "circle", odds: "", color: "", dx: "小", ds: "双" },
  { text: "5", shape: "circle", odds: "", color: "", dx: "大", ds: "单" },
  { text: "6", shape: "circle", odds: "", color: "", dx: "大", ds: "双" },
  { text: "7", shape: "circle", odds: "", color: "", dx: "大", ds: "单" },
  { text: "8", shape: "circle", odds: "", color: "", dx: "大", ds: "双" },
  { text: "9", shape: "circle", odds: "", color: "", dx: "大", ds: "单" },
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

export const config = {
  12: {
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
            { text: "全", filter: { shape: "circle" } },
            { text: "奇", filter: { ds: "单" } },
            { text: "偶", filter: { ds: "双" } },
            { text: "清", filter: null },
          ],
          list: [
            { text: "一", shape: "circle", index: 0, odds: "", color: "", ds: "单" },
            { text: "二", shape: "circle", index: 1, odds: "", color: "", ds: "双" },
            { text: "三", shape: "circle", index: 2, odds: "", color: "", ds: "单" },
            { text: "四", shape: "circle", index: 3, odds: "", color: "", ds: "双" },
            { text: "五", shape: "circle", index: 4, odds: "", color: "", ds: "单" },
          ],
        },
        {
          key: "d1m",
          title: "",
          column: "5",
          filter: dxdsFilter,
          list: tenBallList,
        },
      ],
    },
    title: "号码投注",
    filter: dxdsFilter,
    rule: "猜指定位置上的号码，下注位置号码与开奖位置号码相同视为中奖！赔率<span>#RxHm#</span>",
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
        key: "1_ball",
        title: "一球（万位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "2_ball",
        title: "二球（千位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },

      {
        key: "3_ball",
        title: "三球（百位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "4_ball",
        title: "四球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
  },
  13: {
    title: "大小单双玩法",
    filterLogic: "or",
    filter: [
      { text: "大", filter: { dx: "大" } },
      { text: "小", filter: { dx: "小" } },
      { text: "单", filter: { ds: "单" } },
      { text: "双", filter: { ds: "双" } },
      { text: "清", filter: null },
    ],
    rule: "猜任意位置上的大小单双，0-4为小，5-9为大，选号与相同位置上的开奖号码形态一致！赔率<span>#RxDs#</span>",
    odds: "RxDs",
    listName: "",
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
        title: "一球（万位）",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "2_ball",
        title: "二球（千位）",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "3_ball",
        title: "三球（百位）",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "4_ball",
        title: "四球（十位）",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
    ],
  },
  15: {
    title: "总和玩法",
    rule: "投注的号码与开出的号码总和大小(0-22为小,23-45为大) 单双一致即中奖！赔率<span>#ZhDs#</span>",
    odds: "ZhDs",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList && selectedList.length > 0) {
        return selectedList[0].length
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["ZhDs"] * unit
    },
    list: [
      {
        key: "zh_dxds",
        title: "总和",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
    ],
  },
  17: {
    title: "龙虎和",
    rule: "开出号码(万位)大于(个位)则为龙，开出号码(万位)小于(个位)则为虎，开出号码(万位)与(个位)相同则为和！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList && selectedList.length > 0) {
        return selectedList[0].length
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            rate = lotteryRate[subItem.odds]
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "zh_dxds",
        title: "龙虎和",
        layout: "row",
        column: "3",
        list: [
          { text: "龙", shape: "rect", mutex: "lhh", odds: "LhDs", color: "", dx: "", ds: "" },
          { text: "虎", shape: "rect", mutex: "lhh", odds: "LhDs", color: "", dx: "", ds: "" },
          { text: "和", shape: "rect", mutex: "lhh", odds: "LhDh", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  18: {
    title: "特殊玩法",
    rule: "下注位置（前三、中三、后三）的形态与开奖位置形态一致视为中奖！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (selectedList && selectedList.length > 0) {
        selectedList.forEach((item) => {
          if (!isArrayEmpty(item)) {
            count += item.length
          }
        })
      }
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
        key: "qsxt",
        title: "前三形态",
        column: "5",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "豹子", shape: "rect", index: 0, mutex: "qsxt", odds: "R3Bz", color: "", ds: "" },
          { text: "顺子", shape: "rect", index: 1, mutex: "qsxt", odds: "R3Sz", color: "", ds: "" },
          { text: "对子", shape: "rect", index: 2, mutex: "qsxt", odds: "R3Dz", color: "", ds: "" },
          { text: "半顺", shape: "rect", index: 3, mutex: "qsxt", odds: "R3Bs", color: "", ds: "" },
          { text: "杂六", shape: "rect", index: 4, mutex: "qsxt", odds: "R3Z6", color: "", ds: "" },
        ],
      },
      {
        key: "zsxt",
        title: "中三形态",
        column: "5",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "豹子", shape: "rect", index: 0, mutex: "zsxt", odds: "R3Bz", color: "", ds: "" },
          { text: "顺子", shape: "rect", index: 1, mutex: "zsxt", odds: "R3Sz", color: "", ds: "" },
          { text: "对子", shape: "rect", index: 2, mutex: "zsxt", odds: "R3Dz", color: "", ds: "" },
          { text: "半顺", shape: "rect", index: 3, mutex: "zsxt", odds: "R3Bs", color: "", ds: "" },
          { text: "杂六", shape: "rect", index: 4, mutex: "zsxt", odds: "R3Z6", color: "", ds: "" },
        ],
      },
      {
        key: "hsxt",
        title: "后三形态",
        column: "5",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "豹子", shape: "rect", index: 0, mutex: "hsxt", odds: "R3Bz", color: "", ds: "" },
          { text: "顺子", shape: "rect", index: 1, mutex: "hsxt", odds: "R3Sz", color: "", ds: "" },
          { text: "对子", shape: "rect", index: 2, mutex: "hsxt", odds: "R3Dz", color: "", ds: "" },
          { text: "半顺", shape: "rect", index: 3, mutex: "hsxt", odds: "R3Bs", color: "", ds: "" },
          { text: "杂六", shape: "rect", index: 4, mutex: "hsxt", odds: "R3Z6", color: "", ds: "" },
        ],
      },
    ],
  },
  19: {
    title: "连码后二",
    filter: dxdsFilter,
    rule: "投注选号（十位、个位）与开奖号后二位按位（顺序相同）一致即中奖！赔率<span>#LmH2#</span>",
    odds: "LmH2",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (selectedList && selectedList.length >= 2) {
        count = selectedList[0].length * selectedList[1].length
      }
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "4_ball",
        title: "四球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
    isComputed: true,
  },
  20: {
    title: "连码后三",
    filter: dxdsFilter,
    rule: "投注选号（百位、十位、个位）与开奖号后三位按位（顺序相同）一致即中奖！赔率<span>#LmH3#</span>",
    odds: "LmH3",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (selectedList && selectedList.length >= 3) {
        count = selectedList[0].length * selectedList[1].length * selectedList[2].length
      }
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "3_ball",
        title: "三球（百位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "4_ball",
        title: "四球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
    isComputed: true,
  },
  21: {
    title: "连码后四",
    filter: dxdsFilter,
    rule: "投注选号（千位、百位、十位、个位）与开奖号后四位按位（顺序相同）一致即中奖！赔率<span>#LmH4#</span>",
    odds: "LmH4",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (selectedList && selectedList.length >= 4) {
        count = selectedList[0].length * selectedList[1].length * selectedList[2].length * selectedList[3].length
      }
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "2_ball",
        title: "二球（千位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },

      {
        key: "3_ball",
        title: "三球（百位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "4_ball",
        title: "四球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
    isComputed: true,
  },
  24: {
    title: "牛牛双面",
    rule: "牛大小：(牛6,牛7,牛8,牛9,牛牛)为牛大,(牛1,牛2,牛3,牛4,牛5)为牛小,没牛则不中奖。<br/>牛单双：(牛1,牛3,牛5,牛7,牛9)为牛单,(牛2,牛4,牛6,牛8,牛牛)为牛双,没牛则不中奖。<br/>牛质和：(牛1,牛2,牛3,牛5,牛7)为牛质,(牛4,牛6,牛8,牛9,牛牛)为牛和,没牛则不中奖。",
    odds: "",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList && selectedList.length > 0) {
        return selectedList[0].length
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            rate = lotteryRate[subItem.odds]
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "nnsm",
        title: "",
        column: "5",

        list: [
          { text: "牛大", shape: "rect", mutex: "nnsm", odds: "Niusm", color: "", dx: "", ds: "" },
          { text: "牛小", shape: "rect", mutex: "nnsm", odds: "Niusm", color: "", dx: "", ds: "" },
          { text: "牛单", shape: "rect", mutex: "nnsm", odds: "Niusm", color: "", dx: "", ds: "" },
          { text: "牛双", shape: "rect", mutex: "nnsm", odds: "Niusm", color: "", dx: "", ds: "" },
          { text: "牛质", shape: "rect", mutex: "nnsm", odds: "Niusm", color: "", dx: "", ds: "" },
          { text: "牛和", shape: "rect", mutex: "nnsm", odds: "Niusm", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  23: {
    title: "牛牛快玩",
    rule: "开出五个号码任意组合三个号码为0或10的倍数,剩余2个号码之和的个数为1-9，对应为牛1-牛9；剩余2个号码之和的个数0，为牛牛！",
    odds: "",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList && selectedList.length > 0) {
        return selectedList[0].length
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            rate = lotteryRate[subItem.odds]
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "nnkw",
        title: "",
        column: "5",

        list: [
          { text: "没牛", shape: "rect", mutex: "nnkw", odds: "Niu0", color: "", dx: "", ds: "" },
          { text: "牛1", shape: "rect", mutex: "nnkw", odds: "Niu1", color: "", dx: "", ds: "" },
          { text: "牛2", shape: "rect", mutex: "nnkw", odds: "Niu2", color: "", dx: "", ds: "" },
          { text: "牛3", shape: "rect", mutex: "nnkw", odds: "Niu3", color: "", dx: "", ds: "" },
          { text: "牛4", shape: "rect", mutex: "nnkw", odds: "Niu4", color: "", dx: "", ds: "" },
          { text: "牛5", shape: "rect", mutex: "nnkw", odds: "Niu5", color: "", dx: "", ds: "" },
          { text: "牛6", shape: "rect", mutex: "nnkw", odds: "Niu6", color: "", dx: "", ds: "" },
          { text: "牛7", shape: "rect", mutex: "nnkw", odds: "Niu7", color: "", dx: "", ds: "" },
          { text: "牛8", shape: "rect", mutex: "nnkw", odds: "Niu8", color: "", dx: "", ds: "" },
          { text: "牛9", shape: "rect", mutex: "nnkw", odds: "Niu9", color: "", dx: "", ds: "" },
          { text: "牛牛", shape: "rect", mutex: "nnkw", odds: "Niun", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  25: {
    title: "梭哈玩法",
    rule: "炸弹：开出五个号码任意四个相同:如00001,22223。<br>葫芦：开出五个号码任意组合三个号码相同(三条),剩余2个号相同(一对),如11122,22233。<br>顺子：开出五个号码从小到大排序01234,12345,23456,34567,45678,56789,06789,01789,01289,01239。<br>三条：开出五个号码中三个号码相同,剩余2个号码不同,如22215,22269。<br>两对：开出五个号码中有2组相同,如22166,22133。<br>单对：开出五个号码中只有一组相同,如22169,22389。<br>散牌：开出五个号码无法组成上面的任一形态则为散牌如,12356,56890<br>",
    odds: "",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList && selectedList.length > 0) {
        return selectedList[0].length
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            rate = lotteryRate[subItem.odds]
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "sh",
        title: "",
        column: "5",

        list: [
          { text: "炸弹", shape: "rect", mutex: "sh", odds: "SuoHa1", color: "", dx: "", ds: "" },
          { text: "葫芦", shape: "rect", mutex: "sh", odds: "SuoHa2", color: "", dx: "", ds: "" },
          { text: "顺子", shape: "rect", mutex: "sh", odds: "SuoHa3", color: "", dx: "", ds: "" },
          { text: "三条", shape: "rect", mutex: "sh", odds: "SuoHa4", color: "", dx: "", ds: "" },
          { text: "两对", shape: "rect", mutex: "sh", odds: "SuoHa5", color: "", dx: "", ds: "" },
          { text: "单对", shape: "rect", mutex: "sh", odds: "SuoHa6", color: "", dx: "", ds: "" },
          { text: "散牌", shape: "rect", mutex: "sh", odds: "SuoHa7", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  1: {
    title: "五星直选",
    filter: dxdsFilter,
    rule: "每位至少选择一个号码，竞猜开奖号码的全部五位，号码和位置都对应即中奖！赔率<span>#WxZx#</span>",
    odds: "WxZx",
    baseUnit: 2,
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList.length < 5) {
        return 0
      }
      let count = 1
      selectedList.forEach((item) => {
        if (isArrayEmpty(item)) {
          count = 0
        }
        count *= item.length
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || config.betCount(selectedList, lotteryRate, config) == 0) {
        return "-"
      }
      return lotteryRate[config.odds] * unit * config.baseUnit
    },
    list: [
      {
        key: "1_ball",
        title: "一球（万位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "2_ball",
        title: "二球（千位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "3_ball",
        title: "三球（百位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "4_ball",
        title: "四球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
    isComputed: true,
  },
  2: {
    title: "五星通选",
    filter: dxdsFilter,
    rule: "从万、千、百、十、个位各选1个或多个号码，所选号码与开奖号码一一对应！中二(前二或后二)赔率<span>#WxTx3#</span>,中三(前三或后三)赔率<span>#WxTx2#</span>,全中赔率(<span>#WxTx1#*1</span>) + (<span>#WxTx2#*2</span>) + (<span>#WxTx3#*2</span>)元",
    odds: "",
    baseUnit: 2,
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList.length < 5) {
        return 0
      }
      let count = 1
      selectedList.forEach((item) => {
        if (isArrayEmpty(item)) {
          count = 0
        }
        count *= item.length
      })
      return count
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || config.betCount(selectedList, lotteryRate, config) == 0) {
        return "-"
      }
      return (lotteryRate["WxTx1"] + lotteryRate["WxTx2"] * 2 + lotteryRate["WxTx3"] * 2) * unit * config.baseUnit
    },
    list: [
      {
        key: "1_ball",
        title: "一球（万位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "2_ball",
        title: "二球（千位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },

      {
        key: "3_ball",
        title: "三球（百位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "4_ball",
        title: "四球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5_ball",
        title: "五球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
    isComputed: true,
  },
}

export default withRouter(({ route }) => {
  return <LotteryPage config={config[route.query.lx]} />
})
