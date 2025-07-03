import React from "react"

import LotteryPage from "@/components/LotteryPage"
import util from "@/magic/util"
import { dxdsFilter, ballList, dsdsList } from "@/config/gameCommonData"
import { useRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

export const config = {
  1: {
    title: "号码投注",
    filter: dxdsFilter,
    rule: "从百、十、个位任意位置上至少选择1个以上号码，每注由1个号码组成，所选号码与相同位置上的开奖号码一致，即为中奖！赔率<span>#RxHm#</span>",
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
        key: "2",
        title: "百位",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },

      {
        key: "3",
        title: "十位",
        column: "5",
        filter: dxdsFilter,
        list: ballList,
      },
      {
        key: "4",
        title: "个位",
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
    ],
  },
  3: {
    title: "总和双面",
    rule: "根据开奖号码开出的三个球号的和值形态进行投注，其中14-27为总数大，0-13为总数小，单数为总数单，双数为总数双！赔率<span>#ZhSm#</span>",
    odds: "ZhSm",
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
        title: "总和",
        layout: "row",
        column: "4",
        list: dsdsList,
      },
    ],
  },
  4: {
    title: "龙虎和",
    rule: "开出号码(百位)大于(个位)则为龙，开出号码(百位)小于(个位)则为虎，开出号码(百位)与(个位)相同则为和！",
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
        key: "dxds",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "龙", shape: "rect", mutex: "dx", odds: "LhDs", color: "", dx: "", ds: "" },
          { text: "虎", shape: "rect", mutex: "dx", odds: "LhDs", color: "", dx: "", ds: "" },
          { text: "和", shape: "rect", mutex: "dx", odds: "LhH", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  5: {
    title: "形态玩法",
    rule: "豹子：三个开奖号码都相同。例如：222、666、888...。<br>顺子：开奖号码数字都相连，不分顺序（数字9、0、1相连）。例如：123、901、321、798...。<br>对子：开奖号码的任意两位数字相同（不包括豹子）。例如：001，288、696...。<br>半顺：开奖号码中任意两位数字相连，不分顺序（不包括顺子、对子）。例如：125、540、390、160...。开奖号码为顺子、对子，则半顺视为不中奖。<br>杂六：不包括豹子、对子、顺子、半顺的所有开奖号码。例如：157、268...。",
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
            rate = lotteryRate[subItem.odds]
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "dxds",
        title: "",
        layout: "row",
        column: "5",
        list: [
          { text: "豹子", shape: "rect", mutex: "dx", odds: "BaoZi", color: "", dx: "", ds: "" },
          { text: "顺子", shape: "rect", mutex: "dx", odds: "ShunZi", color: "", dx: "", ds: "" },
          { text: "对子", shape: "rect", mutex: "dx", odds: "DuiZi", color: "", dx: "", ds: "" },
          { text: "半顺", shape: "rect", mutex: "dx", odds: "BanShun", color: "", dx: "", ds: "" },
          { text: "杂六", shape: "rect", mutex: "dx", odds: "ZaLiu", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  6: {
    title: "跨度玩法",
    rule: "根据开奖号码中的号码最大差值（跨度）进行投注，如开奖号码129，则最大跨度为8。可选择0-9中任意数字为跨度值，一个号码为一注。",
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
            if (lotteryRate[subItem.odds] > rate) {
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
        layout: "row",
        column: "4",
        list: [
          { text: "0", shape: "rect", mutex: "", odds: "HmKd0", color: "", dx: "", ds: "" },
          { text: "1", shape: "rect", mutex: "", odds: "HmKd1", color: "", dx: "", ds: "" },
          { text: "2", shape: "rect", mutex: "", odds: "HmKd2", color: "", dx: "", ds: "" },
          { text: "3", shape: "rect", mutex: "", odds: "HmKd3", color: "", dx: "", ds: "" },
          { text: "4", shape: "rect", mutex: "", odds: "HmKd4", color: "", dx: "", ds: "" },
          { text: "5", shape: "rect", mutex: "", odds: "HmKd5", color: "", dx: "", ds: "" },
          { text: "6", shape: "rect", mutex: "", odds: "HmKd6", color: "", dx: "", ds: "" },
          { text: "7", shape: "rect", mutex: "", odds: "HmKd7", color: "", dx: "", ds: "" },
          { text: "8", shape: "rect", mutex: "", odds: "HmKd8", color: "", dx: "", ds: "" },
          { text: "9", shape: "rect", mutex: "", odds: "HmKd9", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  7: {
    title: "三星直选",
    rule: "从百、十、个中选择一个3位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖！赔率<span>#SxZx#</span>",
    odds: "SxZx",
    baseUnit: 2,
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
      return lotteryRate[config.odds] * unit * config.baseUnit
    },
    list: [
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
    title: "后二直选",
    rule: "从十、个位中选择一个2位数号码组成一注，所选号码与开奖号码的前2位相同，且顺序一致，即为中奖！赔率<span>#H2#</span>",
    odds: "H2",
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
    title: "前二直选",
    rule: "从千、百、十、个位任意位置上至少选择二个位置，至少各选1个号码组成一注，所选号码与相同位置上的开奖号码相同，且顺序一致，即为中奖！赔率<span>#Q2#</span>",
    odds: "Q2",
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
    ],
    isComputed: true,
  },
  10: {
    title: "后二连组",
    rule: "从0-9中选2个号码组成一注，所选号码与开奖号码的十位、个位相同（不含对子号），顺序不限，即中奖！赔率<span>#H2Zx#</span>",
    odds: "H2Zx",
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
      const count = Math.min(config.betCount(selectedList, lotteryRate, config), 1)
      // let max = util.math.combination(4, 2);
      // if (count > max){
      //     count = max;
      // }
      return lotteryRate[config.odds] * count * unit
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
  11: {
    title: "前二连组",
    rule: "从0-9中选2个号码组成一注，所选号码与开奖号码的百位、十位相同（不含对子号），顺序不限，即中奖！赔率<span>#Q2Zx#</span>",
    odds: "Q2Zx",
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
      // let count = config.betCount(selectedList, lotteryRate, config);
      // let max = util.math.combination(4, 2);
      // if (count > max){
      //     count = max;
      // }
      const count = Math.min(config.betCount(selectedList, lotteryRate, config), 1)

      return lotteryRate[config.odds] * count * unit
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
  12: {
    title: "任选一",
    rule: "任选1个号组成一注，当期的3个开奖号码包含所选号码，即为中奖！赔率<span>#Rx1#</span>",
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
      let count = config.betCount(selectedList, lotteryRate, config) > 3 ? 3 : config.betCount(selectedList, lotteryRate, config)

      return lotteryRate[config.odds] * count * unit
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
  13: {
    title: "任选二",
    rule: "从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的百位、十位、个位中同时包含所选的2个号码，即为中奖！赔率<span>#Rx2#</span>",
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
      let max = util.math.combination(3, 2)
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
  14: {
    title: "任选三",
    rule: "从0-9中选择3个号码，每注由3个不同的号码组成，开奖号码的百位、十位、个位中同时包含所选的3个号码，即为中奖！赔率<span>#Rx3#</span>",
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
      let max = util.math.combination(3, 3)
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
}

export default () => {
  const { route } = useRouter()
  return <LotteryPage config={config[route.query.lx]} />
}
