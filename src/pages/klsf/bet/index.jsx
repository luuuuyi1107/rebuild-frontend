import React from "react"

import LotteryPage from "@/components/LotteryPage"
import util from "@/magic/util"
import { useRouter, withRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

// 通用变量
const ballList = [
  { text: "01", shape: "circle", odds: "", color: "", jj: "春", fw: "东", wx: "木", sy: "中", dx: "小", ds: "单" },
  { text: "02", shape: "circle", odds: "", color: "", jj: "春", fw: "南", wx: "水", sy: "中", dx: "小", ds: "双" },
  { text: "03", shape: "circle", odds: "", color: "", jj: "春", fw: "西", wx: "火", sy: "中", dx: "小", ds: "单" },
  { text: "04", shape: "circle", odds: "", color: "", jj: "春", fw: "北", wx: "土", sy: "中", dx: "小", ds: "双" },
  { text: "05", shape: "circle", odds: "", color: "", jj: "春", fw: "东", wx: "金", sy: "中", dx: "小", ds: "单" },
  { text: "06", shape: "circle", odds: "", color: "", jj: "夏", fw: "南", wx: "木", sy: "中", dx: "小", ds: "双" },
  { text: "07", shape: "circle", odds: "", color: "", jj: "夏", fw: "西", wx: "水", sy: "发", dx: "小", ds: "单" },
  { text: "08", shape: "circle", odds: "", color: "", jj: "夏", fw: "被", wx: "火", sy: "发", dx: "小", ds: "双" },
  { text: "09", shape: "circle", odds: "", color: "", jj: "夏", fw: "东", wx: "土", sy: "发", dx: "小", ds: "单" },
  { text: "10", shape: "circle", odds: "", color: "", jj: "夏", fw: "南", wx: "金", sy: "发", dx: "大", ds: "双" },
  { text: "11", shape: "circle", odds: "", color: "", jj: "秋", fw: "西", wx: "木", sy: "发", dx: "大", ds: "单" },
  { text: "12", shape: "circle", odds: "", color: "", jj: "秋", fw: "北", wx: "水", sy: "发", dx: "大", ds: "双" },
  { text: "13", shape: "circle", odds: "", color: "", jj: "秋", fw: "东", wx: "火", sy: "白", dx: "大", ds: "单" },
  { text: "14", shape: "circle", odds: "", color: "", jj: "秋", fw: "南", wx: "土", sy: "白", dx: "大", ds: "双" },
  { text: "15", shape: "circle", odds: "", color: "", jj: "秋", fw: "西", wx: "金", sy: "白", dx: "大", ds: "单" },
  { text: "16", shape: "circle", odds: "", color: "", jj: "冬", fw: "北", wx: "木", sy: "白", dx: "大", ds: "双" },
  { text: "17", shape: "circle", odds: "", color: "", jj: "冬", fw: "东", wx: "水", sy: "白", dx: "大", ds: "单" },
  { text: "18", shape: "circle", odds: "", color: "", jj: "冬", fw: "南", wx: "火", sy: "白", dx: "大", ds: "双" },
  { text: "19", shape: "circle", odds: "", color: "", jj: "冬", fw: "西", wx: "土", sy: "白", dx: "大", ds: "单" },
  { text: "20", shape: "circle", odds: "", color: "", jj: "冬", fw: "北", wx: "金", sy: "白", dx: "大", ds: "双" },
]

// 快选过滤
const kxFilter = [
  [
    { text: "春", filter: { jj: "春" } },
    { text: "夏", filter: { jj: "夏" } },
    { text: "秋", filter: { jj: "秋" } },
    { text: "冬", filter: { jj: "冬" } },
    { text: "清", filter: null },
  ],
  [
    { text: "东", filter: { fw: "东" } },
    { text: "西", filter: { fw: "西" } },
    { text: "南", filter: { fw: "南" } },
    { text: "北", filter: { fw: "北" } },
    { text: "清", filter: null },
  ],
  [
    { text: "金", filter: { wx: "金" } },
    { text: "木", filter: { wx: "木" } },
    { text: "水", filter: { wx: "水" } },
    { text: "火", filter: { wx: "火" } },
    { text: "土", filter: { wx: "土" } },
    { text: "清", filter: null },
  ],
  [
    { text: "中", filter: { sy: "中" } },
    { text: "发", filter: { sy: "发" } },
    { text: "白", filter: { sy: "白" } },
    { text: "清", filter: null },
  ],
  [
    { text: "大", filter: { dx: "大" } },
    { text: "小", filter: { dx: "小" } },
    { text: "单", filter: { ds: "单" } },
    { text: "双", filter: { ds: "双" } },
    { text: "清", filter: null },
  ],
]

// 大小单双
const dxdsBallList = [
  { text: "大", shape: "circle", mutex: "dx", odds: "", color: "", dx: "大", ds: "" },
  { text: "小", shape: "circle", mutex: "dx", odds: "", color: "", dx: "小", ds: "" },
  { text: "单", shape: "circle", mutex: "ds", odds: "", color: "", dx: "", ds: "单" },
  { text: "双", shape: "circle", mutex: "ds", odds: "", color: "", dx: "", ds: "双" },
]

// 大小
const dxBallList = [
  { text: "大", shape: "circle", mutex: "dx", odds: "", color: "", dx: "大" },
  { text: "小", shape: "circle", mutex: "dx", odds: "", color: "", dx: "小" },
]

// 龙虎
const lhBallList = [
  { text: "龙", shape: "circle", mutex: "lh", odds: "", color: "", lh: "龙" },
  { text: "虎", shape: "circle", mutex: "lh", odds: "", color: "", lh: "虎" },
]

// 方位玩法
const fwBallList = [
  { text: "东", shape: "rect", mutex: "fw", odds: "", color: "" },
  { text: "南", shape: "rect", mutex: "fw", odds: "", color: "" },
  { text: "西", shape: "rect", mutex: "fw", odds: "", color: "" },
  { text: "北", shape: "rect", mutex: "fw", odds: "", color: "" },
]

// 春夏秋冬
const jjBallList = [
  { text: "春", shape: "rect", mutex: "jj", odds: "", color: "" },
  { text: "夏", shape: "rect", mutex: "jj", odds: "", color: "" },
  { text: "秋", shape: "rect", mutex: "jj", odds: "", color: "" },
  { text: "冬", shape: "rect", mutex: "jj", odds: "", color: "" },
]

// 五行玩法
const wxBallList = [
  { text: "金", shape: "rect", mutex: "wx", odds: "", color: "" },
  { text: "木", shape: "rect", mutex: "wx", odds: "", color: "" },
  { text: "水", shape: "rect", mutex: "wx", odds: "", color: "" },
  { text: "火", shape: "rect", mutex: "wx", odds: "", color: "" },
  { text: "土", shape: "rect", mutex: "wx", odds: "", color: "" },
]

// 中发玩法
const zfBallList = [
  { text: "中", shape: "rect", index: 0, mutex: "zf", odds: "RxZf", color: "" },
  { text: "发", shape: "rect", index: 1, mutex: "zf", odds: "RxZf", color: "" },
  { text: "白", shape: "rect", index: 2, mutex: "zf", odds: "RxZb", color: "" },
]

// 清除过滤
const clearFilter = [{ text: "清", filter: null }]

export const config = {
  // 球数玩法
  11: {
    quickMode: {
      title: "位置",
      rule: "投注的号码与开出的号码位置一致即中奖！赔率<span>#RxHm#</span>",
      odds: "RxHm",
      listName: "号码投注",
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
      filter: [
        { text: "季节", filter: { x: 1 }, subFilterIndex: 0 },
        { text: "方位", filter: { x: 2 }, subFilterIndex: 1 },
        { text: "五行", filter: { x: 3 }, subFilterIndex: 2 },
        { text: "三元", filter: { x: 4 }, subFilterIndex: 3 },
        { text: "双面", filter: { x: 5 }, subFilterIndex: 4 },
      ],
      list: [
        {
          key: "klsf_weizhi",
          title: "位置",
          column: "8",
          filter: [
            { text: "前", filter: { qh: "前" } },
            { text: "后", filter: { qh: "后" } },
            { text: "奇", filter: { jo: "奇" } },
            { text: "偶", filter: { jo: "偶" } },
            { text: "清", filter: null },
          ],
          list: [
            { text: "一", shape: "circle", index: 0, odds: "", color: "", qh: "前", jo: "奇" },
            { text: "二", shape: "circle", index: 1, odds: "", color: "", qh: "前", jo: "偶" },
            { text: "三", shape: "circle", index: 2, odds: "", color: "", qh: "前", jo: "奇" },
            { text: "四", shape: "circle", index: 3, odds: "", color: "", qh: "前", jo: "偶" },
            { text: "五", shape: "circle", index: 4, odds: "", color: "", qh: "后", jo: "奇" },
            { text: "六", shape: "circle", index: 5, odds: "", color: "", qh: "后", jo: "偶" },
            { text: "七", shape: "circle", index: 6, odds: "", color: "", qh: "后", jo: "奇" },
            { text: "八", shape: "circle", index: 7, odds: "", color: "", qh: "后", jo: "偶" },
          ],
        },
        {
          key: "klsf_kxfs",
          title: "快选方式",
          column: "5",

          filter: kxFilter,
          list: ballList,
        },
      ],
    },
    title: "球数",
    filter: [
      { text: "季节", filter: { x: 1 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 2 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 3 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 4 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 5 }, subFilterIndex: 4 },
      { text: "清", filter: null },
    ],
    rule: "猜指定位置上的号码，下注位置号码与开奖位置号码相同视为中奖！赔率<span>#RxHm#</span>",
    odds: "RxHm",
    listName: "号码快投",
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
        title: "第一球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
      {
        key: "2_ball",
        title: "第二球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },

      {
        key: "3_ball",
        title: "第三球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
      {
        key: "4_ball",
        title: "第四球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
      {
        key: "5_ball",
        title: "第五球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
      {
        key: "6_ball",
        title: "第六球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
      {
        key: "7_ball",
        title: "第七球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
      {
        key: "8_ball",
        title: "第八球",
        column: "5",
        filter: kxFilter,
        list: ballList,
      },
    ],
  },
  12: {
    title: "大小单双",
    filterLogic: "or",
    filter: [
      { text: "大", filter: { dx: "大" } },
      { text: "小", filter: { dx: "小" } },
      { text: "单", filter: { ds: "单" } },
      { text: "双", filter: { ds: "双" } },
      { text: "清", filter: null },
    ],
    rule: "投注的号码与开出的号码大小单双（01-10为小，11-20为大）一致即中奖！赔率<span>#DxDs#</span>",
    odds: "DxDs",
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
        title: "第一球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "2_ball",
        title: "第二球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "3_ball",
        title: "第三球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "4_ball",
        title: "第四球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "5_ball",
        title: "第五球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "6_ball",
        title: "第六球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "7_ball",
        title: "第七球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
      {
        key: "8_ball",
        title: "第八球",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
    ],
  },
  14: {
    // 方位玩法
    title: "",
    rule: "投注的号码与开出的号码方位一致即中奖！倍率<span>#RxFw#</span>",
    odds: "RxFw",
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
        title: "第一球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "2_ball",
        title: "第二球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "3_ball",
        title: "第三球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "4_ball",
        title: "第四球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "5_ball",
        title: "第五球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "6_ball",
        title: "第六球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "7_ball",
        title: "第七球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
      {
        key: "8_ball",
        title: "第八球",
        column: "4",
        filter: clearFilter,
        list: fwBallList,
      },
    ],
  },
  15: {
    // 春夏秋冬
    title: "",
    rule: "投注的号码与开出的号码季节一致即中奖！倍率<span>#RxJj#</span>",
    odds: "RxJj",
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
        title: "第一球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "2_ball",
        title: "第二球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "3_ball",
        title: "第三球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "4_ball",
        title: "第四球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "5_ball",
        title: "第五球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "6_ball",
        title: "第六球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "7_ball",
        title: "第七球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
      {
        key: "8_ball",
        title: "第八球",
        column: "4",
        filter: clearFilter,
        list: jjBallList,
      },
    ],
  },
  16: {
    // 五行玩法
    title: "",
    rule: "投注的号码与开出的号码五行一致即中奖！倍率<span>#RxWx#</span>",
    odds: "RxWx",
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
        title: "第一球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "2_ball",
        title: "第二球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "3_ball",
        title: "第三球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "4_ball",
        title: "第四球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "5_ball",
        title: "第五球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "6_ball",
        title: "第六球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "7_ball",
        title: "第七球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
      {
        key: "8_ball",
        title: "第八球",
        column: "5",
        filter: clearFilter,
        list: wxBallList,
      },
    ],
  },
  17: {
    // 中发白
    title: "",
    rule: "投注的号码与开出的号码中发白一致即中奖！",
    odds: "",
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
        key: "1_ball",
        title: "第一球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "2_ball",
        title: "第二球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "3_ball",
        title: "第三球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "4_ball",
        title: "第四球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "5_ball",
        title: "第五球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "6_ball",
        title: "第六球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "7_ball",
        title: "第七球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
      {
        key: "8_ball",
        title: "第八球",
        column: "4",
        filter: clearFilter,
        list: zfBallList,
      },
    ],
  },

  // 总和玩法
  18: {
    title: "大小单双",
    rule: "投注的号码与开出的号码和值大小（单双）一致即中奖！赔率<span>#ZhDxDs#</span>",
    odds: "ZhDxDs",
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
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["ZhDxDs"] * unit
    },
    list: [
      {
        key: "zh_dxds",
        title: "总和",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
    ],
  },
  20: {
    // 总尾大小
    title: "",
    rule: "投注的号码与开出的号码和尾大小一致即中奖！赔率<span>#ZwDx#</span>",
    odds: "ZwDx",
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
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["ZwDx"] * unit
    },
    list: [
      {
        key: "zwdx",
        title: "总尾",
        layout: "row",
        column: "2",
        list: dxBallList,
      },
    ],
  },
  21: {
    // 龙虎玩法
    title: "",
    rule: "第一球大于第八球为“龙”，反之为“虎”投注龙虎与开奖结果一致即中奖！赔率<span>#RxLh#</span>",
    odds: "RxLh",
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
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["RxLh"] * unit
    },
    list: [
      {
        key: "lh",
        title: "龙虎",
        layout: "row",
        column: "2",
        list: lhBallList,
      },
    ],
  },

  // 任选玩法
  2: {
    // 选一红投
    title: "",
    rule: "至少选1个号码投注，开奖号码第1位是红球（19或20），即中奖！倍率<span>#X1Ht#</span>",
    odds: "X1Ht",
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
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["X1Ht"] * unit
    },
    list: [
      {
        key: "1_",
        title: "第一球",
        layout: "row",
        column: "2",
        list: [
          { text: "19", shape: "circle", mutex: "ht", odds: "", color: "" },
          { text: "20", shape: "circle", mutex: "ht", odds: "", color: "" },
        ],
      },
    ],
  },
  1: {
    // 选一数投
    title: "选一数投",
    rule: "至少选1个号码投注，猜中开奖号码第1位，即中奖！赔率<span>#X1St#</span>",
    odds: "X1St",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
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
      return lotteryRate["X1St"] * unit
    },
    list: [
      {
        key: "x1st_number",
        title: "号码",
        column: "7",
        filter: kxFilter,
        list: [
          { text: "01", shape: "circle", odds: "", color: "", jj: "春", fw: "东", wx: "木", sy: "中", dx: "小", ds: "单" },
          { text: "02", shape: "circle", odds: "", color: "", jj: "春", fw: "南", wx: "水", sy: "中", dx: "小", ds: "双" },
          { text: "03", shape: "circle", odds: "", color: "", jj: "春", fw: "西", wx: "火", sy: "中", dx: "小", ds: "单" },
          { text: "04", shape: "circle", odds: "", color: "", jj: "春", fw: "北", wx: "土", sy: "中", dx: "小", ds: "双" },
          { text: "05", shape: "circle", odds: "", color: "", jj: "春", fw: "东", wx: "金", sy: "中", dx: "小", ds: "单" },
          { text: "06", shape: "circle", odds: "", color: "", jj: "夏", fw: "南", wx: "木", sy: "中", dx: "小", ds: "双" },
          { text: "07", shape: "circle", odds: "", color: "", jj: "夏", fw: "西", wx: "水", sy: "发", dx: "小", ds: "单" },
          { text: "08", shape: "circle", odds: "", color: "", jj: "夏", fw: "被", wx: "火", sy: "发", dx: "小", ds: "双" },
          { text: "09", shape: "circle", odds: "", color: "", jj: "夏", fw: "东", wx: "土", sy: "发", dx: "小", ds: "单" },
          { text: "10", shape: "circle", odds: "", color: "", jj: "夏", fw: "南", wx: "金", sy: "发", dx: "大", ds: "双" },
          { text: "11", shape: "circle", odds: "", color: "", jj: "秋", fw: "西", wx: "木", sy: "发", dx: "大", ds: "单" },
          { text: "12", shape: "circle", odds: "", color: "", jj: "秋", fw: "北", wx: "水", sy: "发", dx: "大", ds: "双" },
          { text: "13", shape: "circle", odds: "", color: "", jj: "秋", fw: "东", wx: "火", sy: "白", dx: "大", ds: "单" },
          { text: "14", shape: "circle", odds: "", color: "", jj: "秋", fw: "南", wx: "土", sy: "白", dx: "大", ds: "双" },
          { text: "15", shape: "circle", odds: "", color: "", jj: "秋", fw: "西", wx: "金", sy: "白", dx: "大", ds: "单" },
          { text: "16", shape: "circle", odds: "", color: "", jj: "冬", fw: "北", wx: "木", sy: "白", dx: "大", ds: "双" },
          { text: "17", shape: "circle", odds: "", color: "", jj: "冬", fw: "东", wx: "水", sy: "白", dx: "大", ds: "单" },
          { text: "18", shape: "circle", odds: "", color: "", jj: "冬", fw: "南", wx: "火", sy: "白", dx: "大", ds: "双" },
        ],
      },
    ],
  },
  22: {
    //
    title: "任选一",
    rule: "选1个或以上号码，猜中开奖号码任意1个号码中奖！赔率<span>#Rx1#</span>",
    odds: "Rx1",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 1 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 2 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 3 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 4 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 5 }, subFilterIndex: 4 },
    ],
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
      let count = selectedList[0].length > 8 ? 8 : selectedList[0].length

      return count * lotteryRate["Rx1"] * unit
    },
    list: [
      {
        key: "rx1_number",
        title: "选一",
        layout: "",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
  },
  4: {
    //
    title: "任选二",
    rule: "选2个或以上号码，猜中开奖号码任意2个号码中奖(顺序不限)！赔率<span>#Rx2#</span>",
    odds: "Rx2",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 2)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(8, 2)
      if (count > max) {
        count = max
      }
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "rx2_number",
        title: "选二",
        layout: "",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
    isComputed: true, // 计算注数
  },
  8: {
    //
    title: "任选三",
    rule: "选3个或以上号码，猜中开奖号码任意3个号码中奖(顺序不限)！赔率<span>#Rx3#</span>",
    odds: "Rx3",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 3)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(8, 3)
      if (count > max) {
        count = max
      }
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "rx3_number",
        title: "选三",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
    isComputed: true, // 计算注数
  },
  9: {
    //
    title: "任选四",
    rule: "选4个或以上号码，猜中开奖号码任意4个号码中奖(顺序不限)！赔率<span>#Rx4#</span>",
    odds: "Rx4",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 4)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(8, 4)
      if (count > max) {
        count = max
      }
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "rx4_number",
        title: "选四",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
    isComputed: true, // 计算注数
  },
  10: {
    //
    title: "任选五",
    rule: "选5个或以上号码，猜中开奖号码任意5个号码中奖(顺序不限)！赔率<span>#Rx5#</span>",
    odds: "Rx5",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 5)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      let count = config.betCount(selectedList, lotteryRate, config)
      let max = util.math.combination(8, 5)
      if (count > max) {
        count = max
      }
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "rx5_number",
        title: "选五",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
    isComputed: true, // 计算注数
  },
  5: {
    //
    title: "选二连组",
    rule: "从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)！赔率<span>#X2Lu#</span>",
    odds: "X2Lu",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      return util.math.combination(count, 2)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      let count = selectedList[0].length
      let max = 8
      if (count > max) {
        count = max
      }
      return lotteryRate[config.odds] * (count - 1) * unit
    },
    list: [
      {
        key: "x2lz_number",
        title: "连组",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
    isComputed: true, // 计算注数
  },
  6: {
    //
    title: "选三前组",
    rule: "从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中奖！赔率<span>#X3Qu#</span>",
    odds: "X3Qu",
    listName: "",
    filter: [
      { text: "季节", filter: { x: 0 }, subFilterIndex: 0 },
      { text: "方位", filter: { x: 1 }, subFilterIndex: 1 },
      { text: "五行", filter: { x: 2 }, subFilterIndex: 2 },
      { text: "三元", filter: { x: 3 }, subFilterIndex: 3 },
      { text: "双面", filter: { x: 4 }, subFilterIndex: 4 },
    ],
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      console.log({ count, selectedList })
      return util.math.combination(count, 3)
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "x3qz_number",
        title: "选三前组",
        column: "7",
        filter: kxFilter,
        list: ballList,
      },
    ],
    isComputed: true, // 计算注数
  },
  3: {
    //
    title: "选二连直",
    rule: "从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖！赔率<span>#X2Lz#</span>",
    odds: "X2Lz",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      console.log({ selectedList })
      if (selectedList.length > 1) {
        let all = selectedList[0].length * selectedList[1].length
        let same = 0
        selectedList[0].forEach((item) => {
          selectedList[1].forEach((item2) => {
            if (item.text == item2.text) {
              same++
            }
          })
        })
        return all - same
      }
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "x2lz_number",
        title: "前位",
        column: "7",
        list: ballList,
      },
      {
        key: "x2lz_number2",
        title: "后位",
        column: "7",
        list: ballList,
      },
    ],
    isComputed: true,
  },
  7: {
    //
    title: "选三前直",
    rule: "从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖！赔率<span>#X3Qz#</span>",
    odds: "X3Qz",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      console.log({ selectedList })
      if (selectedList.length > 2) {
        let couunt = 0
        selectedList[0].forEach((item1) => {
          selectedList[1].forEach((item2) => {
            selectedList[2].forEach((item3) => {
              if (item1.text != item2.text && item2.text != item3.text && item1.text != item3.text) {
                couunt++
              }
            })
          })
        })
        console.log({ couunt })
        return couunt
      }
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "x2lz_number",
        title: "第一位",
        column: "7",
        list: ballList,
      },
      {
        key: "x2lz_number2",
        title: "第二位",
        column: "7",
        list: ballList,
      },
      {
        key: "x2lz_number3",
        title: "第三位",
        column: "7",
        list: ballList,
      },
    ],
    isComputed: true,
  },
}

export default () => {
  const { route } = useRouter()
  return <LotteryPage config={config[route.query.lx]} />
}
