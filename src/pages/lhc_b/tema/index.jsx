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

export const config = {
  1: {
    title: "特码投注",
    filter: [{ text: "清", filter: null }],
    rule: "所选号码与特别号码相同，即为中奖（当前反水:#rebate_Tm#%）！",
    odds: "Tm",
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
}

export default () => {
  const { route } = useRouter()
  const confgKey = route.query.lx == 48 ? `${route.query.lx}-${route.query.type}` : route.query.lx
  return <LotteryPage config={config[confgKey]} />
}
