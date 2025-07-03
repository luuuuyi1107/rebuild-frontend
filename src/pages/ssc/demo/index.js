import React from "react"

import LotteryPage from "@/components/LotteryPage"

export const config = {
  quickMode: {
    title: "",
    rule: "xxxxx",
    odds: "ZhDs",
    listName: "号码快投",
    baseUnit: 2,
    list: [
      {
        key: "weizhi",
        title: "位置",
        column: "5",
        maxBallNumber: 2,
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
        title: "冠军",
        column: "5",
        filter: [
          { text: "大", filter: { dx: "大" } },
          { text: "小", filter: { dx: "小" } },
          { text: "单", filter: { ds: "单" } },
          { text: "双", filter: { ds: "双" } },
          { text: "清", filter: null },
        ],
        list: [
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
        ],
      },
    ],
  },
  title: "大小单双玩法",
  filter: [
    { text: "大", filter: null, subFilterIndex: 0 },
    { text: "小", filter: null, subFilterIndex: 1 },
    { text: "单", filter: null, subFilterIndex: 2 },
    { text: "双", filter: null, subFilterIndex: 3 },
    { text: "清", filter: null },
  ],
  rule: "从任意名次上选择一个号码组成一注，选号与相同名次的号码一致！赔率<span>#ZhDs#</span>",
  odds: "ZhDs",
  listName: "号码投注",
  baseUnit: 2,
  // betCount: function(selectedList, lotteryRate, config, unit){

  // },
  maxRate: function (selectedList, lotteryRate, config, unit) {
    let count = 0
    for (let i = 0; i < selectedList.length; i++) {
      if (selectedList[i] && selectedList[i].length > 0) {
        count++
      }
    }
    return count * lotteryRate[config.odds]
  },

  list: [
    {
      key: "d1m",
      title: "冠军",
      column: "5",
      filter: [
        [
          { text: "大", filter: { dx: "大" } },
          { text: "清", filter: null },
        ],

        [
          { text: "小", filter: { dx: "小" } },
          { text: "清", filter: null },
        ],
        [
          { text: "单", filter: { ds: "单" } },
          { text: "清", filter: null },
        ],
        [
          { text: "双", filter: { ds: "双" } },
          { text: "清", filter: null },
        ],
      ],
      list: [
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
      ],
    },
    {
      key: "d2m",
      title: "亚军",
      column: "5",
      filter: [
        { text: "大", filter: { dx: "大" } },
        { text: "小", filter: { dx: "小" } },
        { text: "单", filter: { ds: "单" } },
        { text: "双", filter: { ds: "双" } },
        { text: "清", filter: null },
      ],
      list: [
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
      ],
    },

    {
      key: "d3m",
      title: "季军",
      column: "4",
      list: [
        { text: "大", shape: "rect", odds: "R3Bs", color: "", dx: "大" },
        { text: "小", shape: "rect", odds: "R3Bs", color: "", dx: "小" },
        { text: "单", shape: "rect", odds: "R3Bs", color: "", ds: "单" },
        { text: "双", shape: "rect", odds: "R3Bs", color: "", ds: "双" },
      ],
    },
    {
      key: "d4m",
      title: "季军",
      layout: "row",
      column: "4",
      list: [
        { text: "大", shape: "circle", odds: "", color: "", dx: "大" },
        { text: "小", shape: "circle", odds: "", color: "", dx: "小" },
        { text: "单", shape: "circle", odds: "", color: "", ds: "单" },
        { text: "双", shape: "circle", odds: "", color: "", ds: "双" },
      ],
    },
  ],
}

export default () => <LotteryPage config={config} />
