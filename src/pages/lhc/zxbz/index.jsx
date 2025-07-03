import React from "react"

import LotteryPage from "@/components/LotteryPage"
import { lhcBallList } from "@/pages/lhc/common/config"
import { useRouter } from "@/magic/withRouter"

function isArrayEmpty(arr) {
  if (arr && arr.length > 0) {
    return false
  }
  return true
}

function getConfig(number) {
  let title = ""
  switch (number) {
    case 5:
      title = "买五不中"
      break
    case 6:
      title = "买六不中"
      break
    case 7:
      title = "买七不中"
      break
    case 8:
      title = "买八不中"
      break
    case 9:
      title = "买九不中"
      break
    case 10:
      title = "买十不中"
      break
    case 11:
      title = "十一不中"
      break
    case 12:
      title = "十二不中"
      break
    case 15:
      title = "十五不中"
      break
  }
  let config = {
    title: title,
    filter: [{ text: "清", filter: null }],
    rule: `挑选${number}个号码为一个组合，若当期开出的7个开奖号码都没有在该下注组合中，即为中奖！赔率<span>#No_${number}m#</span>`,
    odds: `No_${number}m`,
    listName: "",
    betCount: function (selectedList, lotteryRate, config) {
      let count = 0
      selectedList.forEach((item) => {
        if (!isArrayEmpty(item)) {
          count += item.length
        }
      })
      if (count == number) {
        return 1
      }
      return 0
    },
    maxRate: function (selectedList, lotteryRate, config, unit) {
      if (isNaN(unit)) {
        return "-"
      }
      let count = config.betCount(selectedList, lotteryRate, config)

      return lotteryRate[config.odds] * count * unit
    },
    list: [
      {
        key: "buzhong",
        title: "",
        column: "7",
        maxBallNumber: number,
        minBallNumber: number,
        list: lhcBallList,
      },
    ],
    isComputed: true,
  }
  return config
}

export const config = {
  30: getConfig(5),
  31: getConfig(6),
  32: getConfig(7),
  33: getConfig(8),
  34: getConfig(9),
  35: getConfig(10),
  36: getConfig(11),
  37: getConfig(12),
  38: getConfig(15),
}

export default () => {
  const { route } = useRouter()
  return <LotteryPage config={config[route.query.lx]} />
}
