import React from "react"

import LotteryPage from "@/components/LotteryPage"
import { dxdsFilter, dsdsList, ballList } from "@/config/gameCommonData"
import { useRouter } from "@/magic/withRouter"
import _ from "lodash"

const oneSixBallList = ballList.slice(1, 7).map((ball, idx) => Object.assign(ball, { dx: idx < 3 ? "小" : "大" }))

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

export const config = {
  4: {
    title: "",
    rule: `下注位置形态与开奖位置形态一致视为中奖！<br>
        豹子：开出三个号码相同则为豹子,如111,222,333...... <br>
        顺子：开出三个骰子相连则为顺子，如123,234,345,456 <br>
        对子：开出骰子有2个相同（豹子除外）为对子。如号码为122,133,233  <br>
        半顺：开出骰子中有任意2位数相连为半顺（不包括顺子，对子），124,125,126 <br>
        杂六：开出的骰子不包含豹子/顺子/对子/半顺的号码，如135,136,146,246`,
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
              rate = lotteryRate[subItem.odds]
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "hmxt",
        title: "号码形态",
        column: "5",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "豹子", shape: "rect", odds: "BaoZi", mutex: "hmxt" },
          { text: "顺子", shape: "rect", odds: "ShunZi", mutex: "hmxt" },
          { text: "对子", shape: "rect", odds: "DuiZi", mutex: "hmxt" },
          { text: "半顺", shape: "rect", odds: "BanShun", mutex: "hmxt" },
          { text: "杂六", shape: "rect", odds: "ZaLiu", mutex: "hmxt" },
        ],
      },
    ],
  },
  1: {
    title: "",
    rule: `投注的号码和值与开出的号码和值一致即中奖！`,
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
              rate = lotteryRate[subItem.odds] > rate ? lotteryRate[subItem.odds] : rate
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "zhz",
        title: "号码形态",
        column: "4",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "03", shape: "rect", odds: "Hz318" },
          { text: "04", shape: "rect", odds: "Hz417" },
          { text: "05", shape: "rect", odds: "Hz516" },
          { text: "06", shape: "rect", odds: "Hz615" },
          { text: "07", shape: "rect", odds: "Hz714" },
          { text: "08", shape: "rect", odds: "Hz813" },
          { text: "09", shape: "rect", odds: "Hz912" },
          { text: "10", shape: "rect", odds: "Hz011" },
          { text: "11", shape: "rect", odds: "Hz011" },
          { text: "12", shape: "rect", odds: "Hz912" },
          { text: "13", shape: "rect", odds: "Hz813" },
          { text: "14", shape: "rect", odds: "Hz714" },
          { text: "15", shape: "rect", odds: "Hz615" },
          { text: "16", shape: "rect", odds: "Hz516" },
          { text: "17", shape: "rect", odds: "Hz417" },
          { text: "18", shape: "rect", odds: "Hz318" },
        ],
      },
    ],
  },
  2: {
    title: "总和玩法",
    rule: "投注的号码与开出的号码总和大小单双一致即中奖！赔率<span>#DsDx#</span>",
    odds: "DsDx",
    filter: [{ text: "清", filter: null }],
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
      let rate = lotteryRate[config.odds]
      let count = this.betCount(selectedList, lotteryRate, config)
      return count * rate * unit
    },
    list: [
      {
        key: "zhz",
        title: "总和",
        layout: "row",
        column: "4",
        list: [
          { text: "大", shape: "circle", mutex: "dx" },
          { text: "小", shape: "circle", mutex: "dx" },
          { text: "单", shape: "circle", mutex: "ds" },
          { text: "双", shape: "circle", mutex: "ds" },
        ],
      },
    ],
  },
  6: {
    title: "对子直选",
    rule: "从11-66中任选1个号码，选号与奖号(包含11-66，不限顺序)相同，即为中奖（不含豹子）！赔率<span>#ZxDz#</span>",
    odds: "ZxDz",
    betCount: function (selectedList, lotteryRate, config) {
      console.log({ selectedList })
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
      let rate = lotteryRate[config.odds]
      let count = this.betCount(selectedList, lotteryRate, config)
      return count * rate * unit
    },
    list: [
      {
        key: "dzzx",
        title: "对子直选",
        column: "6",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "11", shape: "rect", mutex: "dzzx", value: "1,1" },
          { text: "22", shape: "rect", mutex: "dzzx", value: "2,2" },
          { text: "33", shape: "rect", mutex: "dzzx", value: "3,3" },
          { text: "44", shape: "rect", mutex: "dzzx", value: "4,4" },
          { text: "55", shape: "rect", mutex: "dzzx", value: "5,5" },
          { text: "66", shape: "rect", mutex: "dzzx", value: "6,6" },
        ],
      },
    ],
    isComputed: true,
  },
  10: {
    title: "",
    rule: "对相同的三个号码(111、222、333、444、555、666)中的任意一个或多个进行投注，所选号码开出，即为中奖！赔率<span>#BZDX#</span>",
    odds: "BZDX",
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
              rate = lotteryRate[config.odds] > rate ? lotteryRate[config.odds] : rate
            }
          })
        }
      })
      return rate * unit
    },
    list: [
      {
        key: "bzdx",
        title: "豹子多选",
        column: "6",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "111", shape: "rect" },
          { text: "222", shape: "rect" },
          { text: "333", shape: "rect" },
          { text: "444", shape: "rect" },
          { text: "555", shape: "rect" },
          { text: "666", shape: "rect" },
        ],
      },
    ],
  },
  12: {
    title: "",
    rule: "选择1对相同号码和1个不同号码投注，选号与奖号相同，即为中奖！赔率<span>#DZDX#</span>",
    odds: "DZDX",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      if (count == 2) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = lotteryRate[config.odds]
      let count = this.betCount(selectedList, lotteryRate, config)
      return count * rate * unit
    },
    betText(list) {
      return _(list).flatten().orderBy("order").map("text").join(",")
    },
    list: [
      {
        key: "dzdx",
        title: "对子单选",
        column: "6",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "11", shape: "rect", mutex: "dzzx", mutex2: "1", order: 1 },
          { text: "22", shape: "rect", mutex: "dzzx", mutex2: "2", order: 1 },
          { text: "33", shape: "rect", mutex: "dzzx", mutex2: "3", order: 1 },
          { text: "44", shape: "rect", mutex: "dzzx", mutex2: "4", order: 1 },
          { text: "55", shape: "rect", mutex: "dzzx", mutex2: "5", order: 1 },
          { text: "66", shape: "rect", mutex: "dzzx", mutex2: "6", order: 1 },
          { text: "1", shape: "rect", mutex: "dzdx", mutex2: "1", order: 2 },
          { text: "2", shape: "rect", mutex: "dzdx", mutex2: "2", order: 2 },
          { text: "3", shape: "rect", mutex: "dzdx", mutex2: "3", order: 2 },
          { text: "4", shape: "rect", mutex: "dzdx", mutex2: "4", order: 2 },
          { text: "5", shape: "rect", mutex: "dzdx", mutex2: "5", order: 2 },
          { text: "6", shape: "rect", mutex: "dzdx", mutex2: "6", order: 2 },
        ],
      },
    ],
    isComputed: true,
  },
  13: {
    title: "",
    rule: "从11-66中任选1个或多个号码，选号与奖号(包含11-66，不限顺序)相同，即为中奖（不含豹子）！赔率<span>#DZFX#</span>",
    odds: "DZFX",
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
      let rate = lotteryRate[config.odds]
      let count = this.betCount(selectedList, lotteryRate, config)
      if (count > 1) {
        count = 1
      }
      return count * rate * unit
    },
    list: [
      {
        key: "dzfx",
        title: "对子复选",
        column: "6",
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "11", shape: "rect" },
          { text: "22", shape: "rect" },
          { text: "33", shape: "rect" },
          { text: "44", shape: "rect" },
          { text: "55", shape: "rect" },
          { text: "66", shape: "rect" },
        ],
      },
    ],
  },
  14: {
    title: "",
    rule: "从1-6中任选2个号码，所选号码与开奖号码任意2个号码相同，即为中奖！赔率<span>#EBT#</span>",
    odds: "EBT",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      if (count == 2) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = lotteryRate[config.odds]
      let count = this.betCount(selectedList, lotteryRate, config)
      return count * rate * unit
    },
    list: [
      {
        key: "2bt",
        title: "二不同玩法",
        column: "6",
        maxBallNumber: 2,
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "1", shape: "rect" },
          { text: "2", shape: "rect" },
          { text: "3", shape: "rect" },
          { text: "4", shape: "rect" },
          { text: "5", shape: "rect" },
          { text: "6", shape: "rect" },
        ],
      },
    ],
    isComputed: true,
  },
  15: {
    title: "",
    rule: "从1-6中任选3个号码，所选号码与开奖号码任意3个号码相同，即为中奖！赔率<span>#SBT#</span>",
    odds: "SBT",
    betCount: function (selectedList, lotteryRate, config) {
      console.log({ selectedList })
      let count = 0
      selectedList.forEach((item) => {
        count += item && item.length
      })
      console.log({ count })
      if (count == 3) {
        return 1
      }

      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let rate = lotteryRate[config.odds]
      let count = this.betCount(selectedList, lotteryRate, config)
      return count * rate * unit
    },
    list: [
      {
        key: "3bt",
        title: "三不同玩法",
        column: "6",
        maxBallNumber: 3,
        filter: [{ text: "清", filter: null }],
        list: [
          { text: "1", shape: "rect" },
          { text: "2", shape: "rect" },
          { text: "3", shape: "rect" },
          { text: "4", shape: "rect" },
          { text: "5", shape: "rect" },
          { text: "6", shape: "rect" },
        ],
      },
    ],
    isComputed: true,
  },
  16: {
    quickMode: {
      title: "",
      rule: "猜指定位置上的号码，下注位置号码与开奖位置号码相同视为中奖！赔率<span>#RXHM#</span>",
      odds: "RXHM",
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
          ],
        },
        {
          key: "d1m",
          title: "",
          column: "5",
          filter: dxdsFilter,
          list: oneSixBallList,
        },
      ],
    },
    title: "号码投注",
    filter: dxdsFilter,
    rule: "从百、十、个位任意位置上至少选择1个以上号码，每注由1个号码组成，所选号码与相同位置上的开奖号码一致，即为中奖！赔率<span>#RXHM#</span>",
    odds: "RXHM",
    listName: "号码投注",
    // predictReward: false,
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
      // console.log({ selectedList, lotteryRate, config, unit });
      if (isNaN(unit)) return "-"
      if (!lotteryRate.hasOwnProperty(config.odds)) return 0
      return lotteryRate[config.odds] * unit * selectedList.filter((item) => !isArrayEmpty(item)).length
    },
    list: [
      {
        key: "2",
        title: "百位",
        column: "5",
        filter: dxdsFilter,
        list: oneSixBallList,
      },

      {
        key: "3",
        title: "十位",
        column: "5",
        filter: dxdsFilter,
        list: oneSixBallList,
      },
      {
        key: "4",
        title: "个位",
        column: "5",
        filter: dxdsFilter,
        list: oneSixBallList,
      },
    ],
  },
  17: {
    title: "大小单双",
    filterLogic: "or",
    filter: dxdsFilter,
    rule: "猜任意位置上的大小单双，1-3为小，4-6为大，选号与相同位置上的开奖号码形态一致！赔率<span>#RXSM#</span>",
    odds: "RXSM",
    listName: "",
    // predictReward: false,
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
      if (isNaN(unit)) return "-"
      return lotteryRate[config.odds] * config.betCount(selectedList, lotteryRate, config, unit) * unit
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
    ],
  },
}

export default () => {
  const { route } = useRouter()
  return <LotteryPage config={config[route.query.lx]} />
}
