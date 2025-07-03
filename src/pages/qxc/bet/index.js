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

const ballListDanTuo = [
  { text: "0", shape: "circle", odds: "", color: "", globalMutex: "0" },
  { text: "1", shape: "circle", odds: "", color: "", globalMutex: "1" },
  { text: "2", shape: "circle", odds: "", color: "", globalMutex: "2" },
  { text: "3", shape: "circle", odds: "", color: "", globalMutex: "3" },
  { text: "4", shape: "circle", odds: "", color: "", globalMutex: "4" },
  { text: "5", shape: "circle", odds: "", color: "", globalMutex: "5" },
  { text: "6", shape: "circle", odds: "", color: "", globalMutex: "6" },
  { text: "7", shape: "circle", odds: "", color: "", globalMutex: "7" },
  { text: "8", shape: "circle", odds: "", color: "", globalMutex: "8" },
  { text: "9", shape: "circle", odds: "", color: "", globalMutex: "9" },
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
  if (dt <= 4) {
    return util.math.combination(4 - length1, dt - length1)
  } else {
    return util.math.combination(length1 + length2 - 4, dt - 4)
  }
}

export const config = {
  1: {
    quickMode: {
      title: "",
      rule: "从千、百、十、个位任意位置上至少选择1个以上号码，每注由1个号码组成，所选号码与相同位置上的开奖号码一致，即为中奖！赔率<span>#RxHm#</span>",
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
    rule: "从千、百、十、个位任意位置上至少选择1个以上号码，每注由1个号码组成，所选号码与相同位置上的开奖号码一致，即为中奖！赔率<span>#RxHm#</span>",
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
        title: "一球（千位）",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "2",
        title: "二球（百位）",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },

      {
        key: "3",
        title: "三球（十位）",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "4",
        title: "四球（个位）",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
  },
  2: {
    title: "双面投注",
    filter: dxdsFilter,
    rule: "投注的号码与开出的号码大小单双（0-4为小，5-9为大）一致即中奖！赔率<span>#RxSm#</span>",
    odds: "RxSm",
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
        key: "x2lz_number",
        title: "第一球",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "x2lz_number2",
        title: "第二球",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "x2lz_number3",
        title: "第三球",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
      {
        key: "x2lz_number4",
        title: "第四球",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
    ],
  },
  3: {
    title: "总和双面",
    rule: "根据开奖号码开出的四个球号的和值形态进行投注，其中18-36为总数大，0-17为总数小，单数为总数单，双数为总数双。",
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
      let maxRate = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          item.forEach((subItem) => {
            if (subItem) {
              maxRate += lotteryRate[subItem.odds] * unit
            }
          })
        }
      })
      return maxRate
    },
    list: [
      {
        key: "dxds",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "总和大", shape: "rect", mutex: "dx", odds: "ZhDd", color: "", dx: "大", ds: "" },
          { text: "总和小", shape: "rect", mutex: "dx", odds: "ZhXs", color: "", dx: "小", ds: "" },
          { text: "总和单", shape: "rect", mutex: "ds", odds: "ZhDd", color: "", dx: "", ds: "单" },
          { text: "总和双", shape: "rect", mutex: "ds", odds: "ZhXs", color: "", dx: "", ds: "双" },
          { text: "大双", shape: "rect", mutex: "dxx", odds: "Ds", color: "", dx: "", ds: "" },
          { text: "小双", shape: "rect", mutex: "dxx", odds: "DxDs", color: "", dx: "", ds: "" },
          { text: "大单", shape: "rect", mutex: "dxx", odds: "DxDs", color: "", dx: "", ds: "" },
          { text: "小单", shape: "rect", mutex: "dxx", odds: "DxDs", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  4: {
    title: "任选二",
    rule: "从0-9中选择2个号码，每注由2个号码组成，只要开奖号码的千位、百位、十位、个位中包含所选号码，即为中奖！赔率<span>#Rx2#</span>",
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
      let max = util.math.combination(4, 2)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
  },
  5: {
    title: "任选三",
    rule: "从0-9中选择3个号码，每注由3个号码组成，只要开奖号码的千位、百位、十位、个位中包含所选号码，即为中奖！赔率<span>#Rx3#</span>",
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
      let max = util.math.combination(4, 3)
      if (count > max) {
        count = max
      }

      return lotteryRate[config.odds] * count * unit * config.baseUnit
    },
    list: [
      {
        key: "1",
        title: "号码",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },
    ],
  },
  7: {
    title: "直选二",
    rule: "从千、百、十、个位任意位置上至少选择二个位置，至少各选1个号码组成一注，所选号码与相同位置上的开奖号码相同，且顺序一致，即为中奖！赔率<span>#Zx2#</span>",
    odds: "Zx2",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList.length > 1) {
        let couunt = 0

        for (let data1 = 0; data1 < selectedList.length; data1++) {
          for (let data2 = data1 + 1; data2 < selectedList.length; data2++) {
            if (selectedList[data1]) {
              selectedList[data1].forEach((item1) => {
                if (selectedList[data2]) {
                  selectedList[data2].forEach((item2) => {
                    couunt++
                  })
                }
              })
            }
          }
        }

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
        title: "千位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number2",
        title: "百位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number3",
        title: "十位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number4",
        title: "个位",
        column: "5",
        list: ballList,
      },
    ],
  },
  8: {
    title: "直选三",
    rule: "从千、百、十、个位任意位置上至少选择三个位置，至少各选1个号码组成一注，所选号码与相同位置上的开奖号码相同，且顺序一致，即为中奖！赔率<span>#Zx3#</span>",
    odds: "Zx3",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList.length > 2) {
        let couunt = 0

        for (let data1 = 0; data1 < selectedList.length; data1++) {
          for (let data2 = data1 + 1; data2 < selectedList.length; data2++) {
            for (let data3 = data2 + 1; data3 < selectedList.length; data3++) {
              if (selectedList[data1]) {
                selectedList[data1].forEach((item1) => {
                  if (selectedList[data2]) {
                    selectedList[data2].forEach((item2) => {
                      if (selectedList[data3]) {
                        selectedList[data3].forEach((item3) => {
                          couunt++
                        })
                      }
                    })
                  }
                })
              }
            }
          }
        }

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
        title: "千位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number2",
        title: "百位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number3",
        title: "十位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number4",
        title: "个位",
        column: "5",
        list: ballList,
      },
    ],
  },
  9: {
    title: "直选四",
    rule: "从千、百、十、个位任意位置上至少选择四个位置，至少各选1个号码组成一注，所选号码与相同位置上的开奖号码相同，且顺序一致，即为中奖！赔率<span>#Zx4#</span>",
    odds: "Zx4",
    listName: "",
    filter: [{ text: "清", filter: null }],
    betCount: function (selectedList, lotteryRate, config) {
      if (selectedList.length > 3) {
        let couunt = 0
        selectedList[0].forEach((item1) => {
          selectedList[1].forEach((item2) => {
            selectedList[2].forEach((item3) => {
              selectedList[3].forEach((item4) => {
                couunt++
              })
            })
          })
        })
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
        title: "千位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number2",
        title: "百位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number3",
        title: "十位",
        column: "5",
        list: ballList,
      },
      {
        key: "x2lz_number4",
        title: "个位",
        column: "5",
        list: ballList,
      },
    ],
  },
}

export default withRouter(({ route }) => {
  return <LotteryPage config={config[route.query.lx]} />
})
