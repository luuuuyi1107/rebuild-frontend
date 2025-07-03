import React from "react"

import LotteryPage from "@/components/LotteryPage"
import { lhcBallList, shengxiaoList, dxdsBallList } from "@/pages/lhc/common/config"
import { useRouter } from "@/magic/withRouter"
import util from "@/magic/util"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

// const zodiacAnimalIndexObj = util.getZodiacnimalObj()
const getZodiacRule = (num, rateText) =>
  `挑选${num}个生肖为一个组合，若特别号在此组合内，即为中奖（注：如开49为和，退回本金）！赔率<span>#${rateText}#</span>`
export const config = {
  1: {
    title: "特码投注",
    filter: [{ text: "清", filter: null }],
    rule: "所选号码与特别号码相同，即为中奖！",
    odds: "Tm",
    listName: "",
    // betCount: function(selectedList, lotteryRate, config){
    //     let count = 0;
    //     selectedList.forEach(item => {
    //         if (!isArrayEmpty(item)) {
    //             count += item.length;
    //         }
    //     });
    //     return count;
    // },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      return 49
    },
    list: [
      {
        key: "tmtz",
        title: "",
        column: "7",
        list: lhcBallList,
      },
    ],
    specialType: "tema_area",
    refundCode: "Tm_Refunds",
    chaseType: "single_normal",
  },
  2: {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: "若当期特别号，落在下注生肖范围内，即为中奖！",
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
    generateList(date = new Date()) {
      return util.getZodiacnimalList("Sx_Ben", "Sx", "sxtz", date)
    },
    list: util.getZodiacnimalList("Sx_Ben", "Sx", "sxtz"),
    refundCode: "Sx_Refunds",
    // list: [
    //   {
    //     key: "sxtz",
    //     title: "",
    //     column: "4",
    //     list: util.getZodiacnimals()
    //       .map((text) => ({ text, shape: "rect", odds: zodiacAnimalIndexObj[text] === 0 ? "Sx_Ben" : "Sx", color: "", dx: "", ds: "" })),
    //   },
    // ],
  },
  46: {
    title: "总肖",
    filter: [{ text: "清", filter: null }],
    rule: "若当期号码开出的不同生肖总数，与所投注之预计开出之生肖总和数相同，即为中奖！",
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
        key: "zxtz",
        title: "",
        column: "4",
        list: [
          { text: "2肖", value: "2", shape: "rect", mutex: "zxtz", odds: "Zx234", color: "", dx: "", ds: "" },
          { text: "3肖", value: "3", shape: "rect", mutex: "zxtz", odds: "Zx234", color: "", dx: "", ds: "" },
          { text: "4肖", value: "4", shape: "rect", mutex: "zxtz", odds: "Zx234", color: "", dx: "", ds: "" },
          { text: "5肖", value: "5", shape: "rect", mutex: "zxtz", odds: "ZxTo5", color: "", dx: "", ds: "" },
          { text: "6肖", value: "6", shape: "rect", mutex: "zxtz", odds: "ZxTo6", color: "", dx: "", ds: "" },
          { text: "7肖", value: "7", shape: "rect", mutex: "zxtz", odds: "ZxTo7", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  "48-4": {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: getZodiacRule(4, "Sx4"),
    odds: "Sx4",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      console.log({ selectedList })

      if (!isArrayEmpty(selectedList) && !isArrayEmpty(selectedList[0]) && selectedList[0].length == 4) {
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
        key: "sx",
        title: "",
        column: "4",
        maxBallNumber: 4,
        minBallNumber: 4,
        list: shengxiaoList,
      },
    ],
  },
  "48-5": {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: getZodiacRule(5, "Sx5"),
    odds: "Sx5",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && !isArrayEmpty(selectedList[0]) && selectedList[0].length == 5) {
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
        key: "sx",
        title: "",
        column: "4",
        maxBallNumber: 5,
        minBallNumber: 5,
        list: shengxiaoList,
      },
    ],
  },
  "48-6": {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: getZodiacRule(6, "DsDx"),
    odds: "DsDx",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      if (!isArrayEmpty(selectedList) && !isArrayEmpty(selectedList[0]) && selectedList[0].length == 6) {
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
        key: "sx",
        title: "",
        column: "4",
        maxBallNumber: 6,
        minBallNumber: 6,
        list: shengxiaoList,
      },
    ],
  },
  3: {
    title: "波色",
    filter: [{ text: "清", filter: null }],
    rule: "以特别号的球色下注，开奖的球色与下注的颜色相同，即为中奖！",
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
          { text: "红波", value: "红", shape: "rect", mutex: "bstz", odds: "Bs_H", color: "", dx: "", ds: "" },
          { text: "蓝波", value: "蓝", shape: "rect", mutex: "bstz", odds: "Bs_L", color: "", dx: "", ds: "" },
          { text: "绿波", value: "绿", shape: "rect", mutex: "bstz", odds: "Bs_V", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  54: {
    title: "波色",
    filter: [{ text: "清", filter: null }],
    rule:
      "以开出的7个色波，哪种颜色最多为中奖。 开出的6个正码各以1个色波计，特别号以1.5个色波计。而以下3种结果视为和局。<br/>" +
      "正码:3蓝3绿，特别码:红<br/>" +
      "正码:3蓝3红，特别码:绿<br/>" +
      "正码:3绿3红，特别码:蓝<br/>" +
      "出现和局，所有投注红，绿，蓝色波的金额将退回",
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
        key: "7sbtz",
        title: "",
        column: "4",
        list: [
          { text: "红波", value: "红", shape: "rect", mutex: "bstz", odds: "QSHB", color: "", dx: "", ds: "" },
          { text: "蓝波", value: "蓝", shape: "rect", mutex: "bstz", odds: "QSLB", color: "", dx: "", ds: "" },
          { text: "绿波", value: "绿", shape: "rect", mutex: "bstz", odds: "QSLV", color: "", dx: "", ds: "" },
          { text: "和局", value: "和局", shape: "rect", mutex: "bstz", odds: "QSHJ", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  7: {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: "以特别号的家禽/野兽下注，特别号码与下注的家禽/野兽相同，视为中奖！赔率<span>##DsDx##</span>",
    odds: "DsDx",
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
      let count = config.betCount(selectedList, lotteryRate, config, unit)
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "jqys",
        title: "",
        column: "4",
        list: [
          { text: "特家肖", shape: "rect", mutex: "jqys", odds: "", color: "", dx: "", ds: "" },
          { text: "特野肖", shape: "rect", mutex: "jqys", odds: "", color: "", dx: "", ds: "" },
          { text: "特天肖", shape: "rect", mutex: "jqya", odds: "", color: "", dx: "", ds: "" },
          { text: "特地肖", shape: "rect", mutex: "jqya", odds: "", color: "", dx: "", ds: "" },
          { text: "特前肖", shape: "rect", mutex: "jqyb", odds: "", color: "", dx: "", ds: "" },
          { text: "特后肖", shape: "rect", mutex: "jqyb", odds: "", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  6: {
    title: "五行",
    filter: [{ text: "清", filter: null }],
    rule: "以特别号的五行下注，特别号码与下注的五行相同，视为中奖！",
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
        key: "wx",
        title: "",
        column: "5",
        list: [
          { text: "金", shape: "rect", mutex: "wx", odds: "Wx1", color: "", dx: "", ds: "" },
          { text: "木", shape: "rect", mutex: "wx", odds: "Wx2", color: "", dx: "", ds: "" },
          { text: "水", shape: "rect", mutex: "wx", odds: "Wx3", color: "", dx: "", ds: "" },
          { text: "火", shape: "rect", mutex: "wx", odds: "Wx4", color: "", dx: "", ds: "" },
          { text: "土", shape: "rect", mutex: "wx", odds: "Wx5", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  8: {
    title: "五门",
    filter: [{ text: "清", filter: null }],
    rule: "5门任选其一,开奖结果特码为所选门数属性即为中奖！赔率<span>##Wm##</span>",
    odds: "Wm",
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
        key: "wm",
        title: "",
        column: "5",
        list: [
          { text: "一门", shape: "rect", mutex: "wm", odds: "Wm", color: "", dx: "", ds: "" },
          { text: "二门", shape: "rect", mutex: "wm", odds: "Wm", color: "", dx: "", ds: "" },
          { text: "三门", shape: "rect", mutex: "wm", odds: "Wm", color: "", dx: "", ds: "" },
          { text: "四门", shape: "rect", mutex: "wm", odds: "Wm", color: "", dx: "", ds: "" },
          { text: "五门", shape: "rect", mutex: "wm", odds: "Wm", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  12: {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: "猜中特别号的所属头数，即为中奖！赔率<span>##TmTs##</span>",
    odds: "TmTs",
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
      return lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "tmts",
        title: "",
        column: "5",
        list: [
          { text: "0头", value: "0", shape: "rect", mutex: "tmts", odds: "", color: "", dx: "", ds: "" },
          { text: "1头", value: "1", shape: "rect", mutex: "tmts", odds: "", color: "", dx: "", ds: "" },
          { text: "2头", value: "2", shape: "rect", mutex: "tmts", odds: "", color: "", dx: "", ds: "" },
          { text: "3头", value: "3", shape: "rect", mutex: "tmts", odds: "", color: "", dx: "", ds: "" },
          { text: "4头", value: "4", shape: "rect", mutex: "tmts", odds: "", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  11: {
    title: "生肖",
    filter: [{ text: "清", filter: null }],
    rule: "猜中特别号的所属尾数，即为中奖！",
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
        key: "tmws",
        title: "",
        column: "5",
        list: [
          { text: "0尾", value: "0", shape: "rect", mutex: "", odds: "TmWs_0", color: "", dx: "", ds: "" },
          { text: "1尾", value: "1", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "2尾", value: "2", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "3尾", value: "3", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "4尾", value: "4", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "5尾", value: "5", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "6尾", value: "6", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "7尾", value: "7", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "8尾", value: "8", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
          { text: "9尾", value: "9", shape: "rect", mutex: "", odds: "TmWs", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  43: {
    title: "特串投注",
    filter: [{ text: "清", filter: null }],
    rule: "所投注的每二个号码为一组合，其中一个是正码，一个是特别号码，即为中奖！赔率<span>#TcTz#</span>",
    odds: "TcTz",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return (count * (count - 1)) / 2
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return (count - 1) * lotteryRate[config.odds] * unit
    },
    list: [
      {
        key: "tmtz",
        title: "",
        column: "7",
        list: lhcBallList,
      },
    ],
    isComputed: true,
  },
  4: {
    title: "投注",
    rule: "竞猜的种类与开奖号码所属的种类相同，即为中奖（注：如开49为和，退回本金）！",
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
      // let count = config.betCount(selectedList, lotteryRate, config, unit);
      // return lotteryRate[config.odds] * count * unit;
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
          { text: "大", shape: "rect", mutex: "dx", odds: "DsDx", color: "", dx: "大", ds: "" },
          { text: "小", shape: "rect", mutex: "dx", odds: "DsDx", color: "", dx: "小", ds: "" },
          { text: "单", shape: "rect", mutex: "ds", odds: "DsDx", color: "", dx: "", ds: "单" },
          { text: "双", shape: "rect", mutex: "ds", odds: "DsDx", color: "", dx: "", ds: "双" },
          { text: "大单", shape: "rect", mutex: "dxx", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "大双", shape: "rect", mutex: "dxx", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "小单", shape: "rect", mutex: "dxx", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "小双", shape: "rect", mutex: "dxx", odds: "TDsDx", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  55: {
    title: "投注",
    rule: "选1个或1个以上形态进行投注！赔率<span>#DsDx#</span>",
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
      // let count = config.betCount(selectedList, lotteryRate, config, unit);
      // return lotteryRate[config.odds] * count * unit;
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
          { text: "特大", shape: "rect", mutex: "a1", odds: "DsDx", color: "", dx: "大", ds: "" },
          { text: "特小", shape: "rect", mutex: "a1", odds: "DsDx", color: "", dx: "小", ds: "" },
          { text: "特单", shape: "rect", mutex: "a2", odds: "DsDx", color: "", dx: "", ds: "单" },
          { text: "特双", shape: "rect", mutex: "a2", odds: "DsDx", color: "", dx: "", ds: "双" },
          { text: "特大单", shape: "rect", mutex: "b1", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "特大双", shape: "rect", mutex: "b1", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "特小单", shape: "rect", mutex: "b1", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "特小双", shape: "rect", mutex: "b1", odds: "TDsDx", color: "", dx: "", ds: "" },
          { text: "特合大", shape: "rect", mutex: "c1", odds: "DsDx", color: "", dx: "大", ds: "" },
          { text: "特合小", shape: "rect", mutex: "c1", odds: "DsDx", color: "", dx: "小", ds: "" },
          { text: "特合单", shape: "rect", mutex: "c2", odds: "DsDx", color: "", dx: "", ds: "单" },
          { text: "特合双", shape: "rect", mutex: "c2", odds: "DsDx", color: "", dx: "", ds: "双" },
          { text: "总大", shape: "rect", mutex: "d1", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "总小", shape: "rect", mutex: "d1", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "总单", shape: "rect", mutex: "d2", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "总双", shape: "rect", mutex: "d2", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "特尾大", shape: "rect", mutex: "e1", odds: "DsDx", color: "", dx: "大", ds: "" },
          { text: "特尾小", shape: "rect", mutex: "e1", odds: "DsDx", color: "", dx: "小", ds: "" },
          { text: "特尾单", shape: "rect", mutex: "e2", odds: "DsDx", color: "", dx: "", ds: "单" },
          { text: "特尾双", shape: "rect", mutex: "e2", odds: "DsDx", color: "", dx: "", ds: "双" },
          { text: "特天肖", shape: "rect", mutex: "f1", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "特地肖", shape: "rect", mutex: "f1", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "特前肖", shape: "rect", mutex: "f2", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "特后肖", shape: "rect", mutex: "f2", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "特野肖", shape: "rect", mutex: "f3", odds: "DsDx", color: "", dx: "", ds: "" },
          { text: "特家肖", shape: "rect", mutex: "f3", odds: "DsDx", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  9: {
    title: "投注",
    rule: "以特别号尾数判断大小单双，猜中即中奖（注：如开49为和，退回本金）！赔率<span>#DsDx#</span>",
    odds: "DsDx",
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
        key: "dxds",
        title: "大小单双",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
    ],
  },
  13: {
    title: "投注",
    rule: "以特码个位和十位数字之和来判断大小单双，猜中即中奖（注：如开49为和，退回本金）！赔率<span>#DsDx#</span>",
    odds: "DsDx",
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
        key: "dxds",
        title: "大小单双",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
    ],
  },
  39: {
    title: "投注",
    rule: "所有七个开奖号码的分数总和判断大小单双，猜中即中！赔率<span>#DsDx#</span>",
    odds: "DsDx",
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
        key: "dxds",
        title: "大小单双",
        layout: "row",
        column: "4",
        list: dxdsBallList,
      },
    ],
  },
  56: {
    title: "龙虎庄",
    filter: [{ text: "清", filter: null }],
    rule: "特码开1-24为虎，特码开25-48为龙，特码开出49为庄，下注龙虎如开49庄，本金不退!",
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
        key: "wx",
        title: "",
        column: "3",
        list: [
          { text: "龙", shape: "rect", mutex: "wx", odds: "LH", color: "", dx: "", ds: "" },
          { text: "虎", shape: "rect", mutex: "wx", odds: "LH", color: "", dx: "", ds: "" },
          { text: "庄", shape: "rect", mutex: "wx", odds: "LHZ", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
}

export default () => {
  const { route } = useRouter()
  const confgKey = route.query.lx == 48 ? `${route.query.lx}-${route.query.type}` : route.query.lx
  return <LotteryPage config={config[confgKey]} />
}
