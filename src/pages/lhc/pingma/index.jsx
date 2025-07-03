import LotteryPage from "@/components/LotteryPage"
import util from "@/magic/util"
import { useRouter } from "@/magic/withRouter"
import { lhcBallList } from "@/pages/lhc/common/config"

const zodiacAnimalIndexObj = util.getZodiacnimalObj()

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

export const config = {
  "51-1": {
    title: "正一特",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上号码投注，所选号码与开奖号码的第一位相同，即为中奖！赔率<span>#ZMT#</span>",
    odds: "ZMT",
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
        key: "zmtz",
        title: "",
        column: "7",
        list: lhcBallList,
      },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "51-2": {
    title: "正二特",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上号码投注，所选号码与开奖号码的第二位相同，即为中奖！赔率<span>#ZMT#</span>",
    odds: "ZMT",
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
      { key: "zmtz", list: [] },
      {
        key: "zmtz2",
        title: "",
        column: "7",
        list: lhcBallList,
      },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "51-3": {
    title: "正三特",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上号码投注，所选号码与开奖号码的第三位相同，即为中奖！赔率<span>#ZMT#</span>",
    odds: "ZMT",
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
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      {
        key: "zmtz3",
        title: "",
        column: "7",
        list: lhcBallList,
      },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "51-4": {
    title: "正四特",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上号码投注，所选号码与开奖号码的第四位相同，即为中奖！赔率<span>#ZMT#</span>",
    odds: "ZMT",
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
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      {
        key: "zmtz4",
        title: "",
        column: "7",
        list: lhcBallList,
      },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "51-5": {
    title: "正五特",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上号码投注，所选号码与开奖号码的第五位相同，即为中奖！赔率<span>#ZMT#</span>",
    odds: "ZMT",
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
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      {
        key: "zmtz5",
        title: "",
        column: "7",
        list: lhcBallList,
      },
      { key: "zmtz6", list: [] },
    ],
  },
  "51-6": {
    title: "正六特",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上号码投注，所选号码与开奖号码的第六位相同，即为中奖！赔率<span>#ZMT#</span>",
    odds: "ZMT",
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
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      {
        key: "zmtz6",
        title: "",
        column: "7",
        list: lhcBallList,
      },
    ],
  },
  "52-1": {
    title: "正一混合",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上正码属性，所选正码属性与开奖号码的第一位属性相同，即为中奖！",
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
        key: "zmtz",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "单码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "双码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "大码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "小码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合单", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合双", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合大", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合小", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "红波", shape: "rect", mutex: "c1", odds: "ZMHB", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "c1", odds: "ZMLB", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "c1", odds: "ZMLV", color: "", dx: "", ds: "" },
          { text: "尾大", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "尾小", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
        ],
      },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "52-2": {
    title: "正二混合",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上正码属性，所选正码属性与开奖号码的第二位属性相同，即为中奖！",
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
            if (subItem) {
              maxRate += lotteryRate[subItem.odds] * unit
            }
          })
        }
      })
      return maxRate
    },
    list: [
      { key: "zmtz", list: [] },
      {
        key: "zmtz2",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "单码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "双码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "大码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "小码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合单", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合双", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合大", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合小", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "红波", shape: "rect", mutex: "c1", odds: "ZMHB", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "c1", odds: "ZMLB", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "c1", odds: "ZMLV", color: "", dx: "", ds: "" },
          { text: "尾大", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "尾小", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
        ],
      },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "52-3": {
    title: "正三混合",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上正码属性，所选正码属性与开奖号码的第三位属性相同，即为中奖！",
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
            if (subItem) {
              maxRate += lotteryRate[subItem.odds] * unit
            }
          })
        }
      })
      return maxRate
    },
    list: [
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      {
        key: "zmtz3",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "单码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "双码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "大码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "小码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合单", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合双", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合大", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合小", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "红波", shape: "rect", mutex: "c1", odds: "ZMHB", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "c1", odds: "ZMLB", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "c1", odds: "ZMLV", color: "", dx: "", ds: "" },
          { text: "尾大", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "尾小", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
        ],
      },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "52-4": {
    title: "正四混合",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上正码属性，所选正码属性与开奖号码的第四位属性相同，即为中奖！",
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
            if (subItem) {
              maxRate += lotteryRate[subItem.odds] * unit
            }
          })
        }
      })
      return maxRate
    },
    list: [
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      {
        key: "zmtz4",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "单码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "双码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "大码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "小码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合单", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合双", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合大", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合小", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "红波", shape: "rect", mutex: "c1", odds: "ZMHB", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "c1", odds: "ZMLB", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "c1", odds: "ZMLV", color: "", dx: "", ds: "" },
          { text: "尾大", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "尾小", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
        ],
      },
      { key: "zmtz5", list: [] },
      { key: "zmtz6", list: [] },
    ],
  },
  "52-5": {
    title: "正五混合",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上正码属性，所选正码属性与开奖号码的第五位属性相同，即为中奖！",
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
            if (subItem) {
              maxRate += lotteryRate[subItem.odds] * unit
            }
          })
        }
      })
      return maxRate
    },
    list: [
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      {
        key: "zmtz5",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "单码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "双码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "大码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "小码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合单", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合双", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合大", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合小", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "红波", shape: "rect", mutex: "c1", odds: "ZMHB", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "c1", odds: "ZMLB", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "c1", odds: "ZMLV", color: "", dx: "", ds: "" },
          { text: "尾大", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "尾小", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
        ],
      },
      { key: "zmtz6", list: [] },
    ],
  },
  "52-6": {
    title: "正六混合",
    name: "lhc-more",
    filter: [{ text: "清", filter: null }],
    rule: "选1个或者1个以上正码属性，所选正码属性与开奖号码的第六位属性相同，即为中奖！",
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
            if (subItem) {
              maxRate += lotteryRate[subItem.odds] * unit
            }
          })
        }
      })
      return maxRate
    },
    list: [
      { key: "zmtz", list: [] },
      { key: "zmtz2", list: [] },
      { key: "zmtz3", list: [] },
      { key: "zmtz4", list: [] },
      { key: "zmtz5", list: [] },
      {
        key: "zmtz6",
        title: "",
        layout: "row",
        column: "4",
        list: [
          { text: "单码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "双码", shape: "rect", mutex: "a1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "大码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "小码", shape: "rect", mutex: "a2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合单", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合双", shape: "rect", mutex: "b1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合大", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "合小", shape: "rect", mutex: "b2", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "红波", shape: "rect", mutex: "c1", odds: "ZMHB", color: "", dx: "", ds: "" },
          { text: "蓝波", shape: "rect", mutex: "c1", odds: "ZMLB", color: "", dx: "", ds: "" },
          { text: "绿波", shape: "rect", mutex: "c1", odds: "ZMLV", color: "", dx: "", ds: "" },
          { text: "尾大", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
          { text: "尾小", shape: "rect", mutex: "d1", odds: "ZMSMHW", color: "", dx: "", ds: "" },
        ],
      },
    ],
  },
  53: {
    title: "正肖",
    rule: "当期6个正码落在你投注的生肖所属号码中，则视为中奖！",
    odds: "ZX",
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
      let rate = 0

      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })

      if (count < 7) {
        selectedList.forEach((item) => {
          if (!isArrayEmpty(item)) {
            item.forEach((subItem) => {
              if (subItem) {
                rate += lotteryRate[subItem.odds]
              }
            })
          }
        })
      } else {
        rate = lotteryRate[config.odds] * 6
      }

      return rate * unit
    },
    generateList(date = new Date()) {
      return util.getZodiacnimalList("ZXNiu", "ZX", "zxtz", date)
    },
    list: util.getZodiacnimalList("ZXNiu", "ZX", "zxtz"),

    // list: [
    //   {
    //     key: "zxtz",
    //     title: "",
    //     column: "4",
    //     list: util.getZodiacnimals()
    //       .map((text) => ({ text, shape: "rect", odds: zodiacAnimalIndexObj[text] === 0 ? "ZXNiu" : "ZX", color: "", dx: "", ds: "" })),
    //   },
    // ],
  },
  45: {
    title: "二中特平",
    filter: [{ text: "清", filter: null }],
    rule: "所投注的每二个号码为一组合，二个号码都是开奖号码之正码或其中一个是正码，一个是特别号码，即为中奖！中二平码赔率<span>#EzTp_P#</span>,一特一平赔率<span>#EzTp_T#</span>",
    odds: "EzTp_P",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return util.math.combination(count, 2)
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
      if (count > 7) {
        count = 7
      } else if (count < 2) {
        return 0
      }

      let ret = (count - 1) * lotteryRate["EzTp_T"] * unit

      ret += util.math.combination(count - 1, 2) * lotteryRate["EzTp_P"] * unit

      return ret
    },
    list: [
      {
        key: "pingma",
        title: "",
        column: "7",
        list: lhcBallList,
      },
    ],
    isComputed: true,
  },
  15: {
    title: "平一中一",
    filter: [{ text: "清", filter: null }],
    rule: "猜中六个正码的号码，即为中奖！赔率<span>#P1v1#</span>",
    odds: "P1v1",
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
      let count = config.betCount(selectedList, lotteryRate, config)
      if (count > 6) {
        count = 6
      }
      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "pingma",
        title: "",
        column: "7",
        list: lhcBallList,
      },
    ],
  },
  16: {
    title: "平二中二",
    filter: [{ text: "清", filter: null }],
    rule: "所投注的每二个号码为一组合，二个号码都是开奖号码之正码，即为中奖！赔率<span>#P2v2#</span>",
    odds: "P2v2",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return util.math.combination(count, 2)
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
      if (count > 6) {
        count = 6
      }
      count = util.math.combination(count, 2)

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "pingma",
        title: "",
        column: "7",
        maxBallNumber: 10,
        list: lhcBallList,
      },
    ],
    isComputed: true,
  },
  18: {
    title: "平三中二",
    filter: [{ text: "清", filter: null }],
    rule: "所投注的每三个号码为一组合，若二个号码都是开奖号码之正码，即为中奖！全中赔率<span>#P3v2All#</span>，中二赔率<span>#P3v2To2#</span>",
    odds: "P3v2All",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return util.math.combination(count, 3)
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
      if (count < 3) {
        return 0
      } else if (count <= 6) {
        return util.math.combination(count, 3) * lotteryRate[config.odds] * unit
      } else {
        let ret = util.math.combination(6, 3) * lotteryRate[config.odds] * unit
        ret += util.math.combination(6, 2) * (count - 6) * lotteryRate["P3v2To2"] * unit
        return ret
      }
    },
    list: [
      {
        key: "pingma",
        title: "",
        column: "7",
        maxBallNumber: 3,
        list: lhcBallList,
      },
    ],
    isComputed: true,
  },
  17: {
    title: "平三中三",
    filter: [{ text: "清", filter: null }],
    rule: "所投注的每三个号码为一组合，若三个号码都是开奖号码之正码，即为中奖！赔率<span>#P3v3#</span>",
    odds: "P3v3",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return util.math.combination(count, 3)
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
      if (count > 6) {
        count = 6
      }
      count = util.math.combination(count, 3)

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "pingma",
        title: "",
        column: "7",
        maxBallNumber: 10,
        list: lhcBallList,
      },
    ],
    isComputed: true,
  },
  29: {
    title: "平四中四",
    filter: [{ text: "清", filter: null }],
    rule: "选择投注号码每四个为一组，如四个号码都在开奖号码的正码里面，即为中奖！赔率<span>#P4v4#</span>",
    odds: "P4v4",
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      return util.math.combination(count, 4)
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
      if (count > 6) {
        count = 6
      }
      count = util.math.combination(count, 4)

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "pingma",
        title: "",
        column: "7",
        maxBallNumber: 4,
        list: lhcBallList,
      },
    ],
    isComputed: true,
  },
}

export default () => {
  const { route } = useRouter()
  const configKey = route.query.lx == 51 || route.query.lx == 52 ? `${route.query.lx}-${route.query.type}` : route.query.lx
  return <LotteryPage config={config[configKey]} />
}
