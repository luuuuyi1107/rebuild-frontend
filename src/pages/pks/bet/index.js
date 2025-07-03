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

const lhList = [
  { text: "龙", shape: "circle", mutex: "lh", odds: "", color: "", dx: "", ds: "" },
  { text: "虎", shape: "circle", mutex: "lh", odds: "", color: "", dx: "", ds: "" },
]

export const config = {
  1: {
    quickMode: {
      title: "",
      rule: "从任意名次上选择一个号码组成一注，选号与相同名次的号码一致！赔率<span>#RxHm#</span>",
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
            { text: "前", filter: { qh: "前" } },
            { text: "后", filter: { qh: "后" } },
            { text: "奇", filter: { ds: "单" } },
            { text: "偶", filter: { ds: "双" } },
            { text: "清", filter: null },
          ],
          list: [
            { text: "一", shape: "circle", index: 0, odds: "", color: "", qh: "前", ds: "单" },
            { text: "二", shape: "circle", index: 1, odds: "", color: "", qh: "前", ds: "双" },
            { text: "三", shape: "circle", index: 2, odds: "", color: "", qh: "前", ds: "单" },
            { text: "四", shape: "circle", index: 3, odds: "", color: "", qh: "前", ds: "双" },
            { text: "五", shape: "circle", index: 4, odds: "", color: "", qh: "前", ds: "单" },
            { text: "六", shape: "circle", index: 5, odds: "", color: "", qh: "后", ds: "双" },
            { text: "七", shape: "circle", index: 6, odds: "", color: "", qh: "后", ds: "单" },
            { text: "八", shape: "circle", index: 7, odds: "", color: "", qh: "后", ds: "双" },
            { text: "九", shape: "circle", index: 8, odds: "", color: "", qh: "后", ds: "单" },
            { text: "十", shape: "circle", index: 9, odds: "", color: "", qh: "后", ds: "双" },
          ],
        },
        {
          key: "hm",
          title: "",
          column: "5",
          filter: dxdsFilter,
          list: tenBallList,
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
        title: "冠军",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "2",
        title: "亚军",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },

      {
        key: "3",
        title: "季军",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "4",
        title: "第四名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "5",
        title: "第五名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "6",
        title: "第六名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "7",
        title: "第七名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "8",
        title: "第八名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "9",
        title: "第九名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
      {
        key: "10",
        title: "第十名",
        column: "5",
        filter: dxdsFilter,
        list: tenBallList,
      },
    ],
  },
  2: {
    title: "大小单双玩法",
    filter: dxdsFilter,
    filterLogic: "or",
    rule: "猜任意名次上的大小单双，01-05为小，06-10为大，选号与相同名次上的开奖号码形态一致！赔率<span>#DsDx#</span>",
    odds: "DsDx",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (!isArrayEmpty(selectedList)) {
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
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["DsDx"] * unit
    },
    list: [
      {
        key: "1",
        title: "冠军",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "2",
        title: "亚军",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "3",
        title: "季军",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "4",
        title: "第四名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "5",
        title: "第五名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "6",
        title: "第六名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "7",
        title: "第七名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "8",
        title: "第八名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "9",
        title: "第九名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "10",
        title: "第十名",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
    ],
  },
  4: {
    title: "龙虎",
    rule: "对应两位的号码进行比较，前者大于后者为龙，小于后者为虎！赔率<span>#DsDx#</span>",
    odds: "DsDx",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      if (!isArrayEmpty(selectedList)) {
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
      return config.betCount(selectedList, lotteryRate, config, unit) * lotteryRate["DsDx"] * unit
    },
    list: [
      {
        key: "1",
        title: "冠军",
        layout: "row",
        column: "2",
        list: lhList,
      },
      {
        key: "2",
        title: "亚军",
        layout: "row",
        column: "2",
        list: lhList,
      },
      {
        key: "3",
        title: "季军",
        layout: "row",
        column: "2",
        list: lhList,
      },
      {
        key: "4",
        title: "第四名",
        layout: "row",
        column: "2",
        list: lhList,
      },
      {
        key: "5",
        title: "第五名",
        layout: "row",
        column: "2",
        list: lhList,
      },
    ],
  },
  10: {
    title: "冠亚和值",
    rule: "冠军、亚军之和与投注号码相同即中奖！",
    odds: "",
    listName: "",
    filter: [{ text: "清", filter: null }],
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
        key: "gyhz",
        title: "",
        column: "4",

        list: [
          { text: "03", shape: "rect", odds: "HZ3", color: "", dx: "", ds: "" },
          { text: "04", shape: "rect", odds: "HZ4", color: "", dx: "", ds: "" },
          { text: "05", shape: "rect", odds: "HZ5", color: "", dx: "", ds: "" },
          { text: "06", shape: "rect", odds: "HZ6", color: "", dx: "", ds: "" },
          { text: "07", shape: "rect", odds: "HZ7", color: "", dx: "", ds: "" },
          { text: "08", shape: "rect", odds: "HZ8", color: "", dx: "", ds: "" },
          { text: "09", shape: "rect", odds: "HZ9", color: "", dx: "", ds: "" },
          { text: "10", shape: "rect", odds: "HZ10", color: "", dx: "", ds: "" },
          { text: "11", shape: "rect", odds: "HZ11", color: "", dx: "", ds: "" },
          { text: "12", shape: "rect", odds: "HZ12", color: "", dx: "", ds: "" },
          { text: "13", shape: "rect", odds: "HZ13", color: "", dx: "", ds: "" },
          { text: "14", shape: "rect", odds: "HZ14", color: "", dx: "", ds: "" },
          { text: "15", shape: "rect", odds: "HZ15", color: "", dx: "", ds: "" },
          { text: "16", shape: "rect", odds: "HZ16", color: "", dx: "", ds: "" },
          { text: "17", shape: "rect", odds: "HZ17", color: "", dx: "", ds: "" },
          { text: "18", shape: "rect", odds: "HZ18", color: "", dx: "", ds: "" },
          { text: "19", shape: "rect", odds: "HZ19", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  11: {
    title: "冠亚形态",
    filter: [{ text: "清", filter: null }],
    rule: "冠亚军号码相加的和数大小单双！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList)) {
        return selectedList[0].length
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit) || isArrayEmpty(selectedList)) {
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
        key: "gyxt",
        title: "",
        column: "4",
        list: [
          { text: "大单", shape: "rect", mutex: "dds", odds: "DaDan", color: "", dx: "", ds: "" },
          { text: "大双", shape: "rect", mutex: "dds", odds: "DaShuang", color: "", dx: "", ds: "" },
          { text: "小单", shape: "rect", mutex: "xds", odds: "XiaoDan", color: "", dx: "", ds: "" },
          { text: "小双", shape: "rect", mutex: "xds", odds: "XiaoShuang", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  5: {
    title: "冠亚双面",
    filter: [{ text: "清", filter: null }],
    rule: "猜冠军号码和亚军号码的和值大小单双，03-11为小，12-19为大！",
    odds: "",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList)) {
        return selectedList[0].length
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
              rate += lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "gyxt",
        title: "",
        column: "4",
        list: [
          { text: "大", shape: "rect", mutex: "dx", odds: "GyDx_D", color: "", dx: "", ds: "" },
          { text: "小", shape: "rect", mutex: "dx", odds: "GyDx_X", color: "", dx: "", ds: "" },
          { text: "单", shape: "rect", mutex: "ds", odds: "GyDs_D", color: "", dx: "", ds: "" },
          { text: "双", shape: "rect", mutex: "ds", odds: "GyDs_S", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
}

export default withRouter(({ route }) => {
  return <LotteryPage config={config[route.query.lx]} />
})
