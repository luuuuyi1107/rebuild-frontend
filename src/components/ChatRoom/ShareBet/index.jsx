import React, { useEffect } from "react"
import LotteryBetRecordItem from "@/components/LotteryBetRecordItem"
import util from "@/magic/util"
import { getLotterBetRecrodsData } from "@/action/apis"
import RecordPage from "./RecordPage"
import forumGames from "@/config/forum"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  const closeShare = util.getUrlParam("closeShare")
  const config = {
    tabs: [
      {
        name: "全部注单",
        filter: [
          { key: "id", type: "hidden", defaultValue: 0 },
          { key: "status", type: "hidden", defaultValue: -1 },
          { key: "lotteryid", type: "hidden", defaultValue: 0 },
          { key: "PageIndex", type: "hidden", defaultValue: 1 },
          { key: "PageSize", type: "hidden", defaultValue: 20 },
        ],
        listApi: "Lottery/Bets",
        listApiMethod: "post",
        renderRow,
      },
      {
        name: "已中奖",
        filter: [
          { key: "id", type: "hidden", defaultValue: 0 },
          { key: "status", type: "hidden", defaultValue: 1 },
          { key: "lotteryid", type: "hidden", defaultValue: 0 },
          { key: "PageIndex", type: "hidden", defaultValue: 1 },
          { key: "PageSize", type: "hidden", defaultValue: 20 },
        ],
        listApi: "Lottery/Bets",
        listApiMethod: "post",
        renderRow,
      },
      {
        name: "待开奖",
        filter: [
          { key: "id", type: "hidden", defaultValue: 0 },
          { key: "status", type: "hidden", defaultValue: 0 },
          { key: "lotteryid", type: "hidden", defaultValue: 0 },
          { key: "PageIndex", type: "hidden", defaultValue: 1 },
          { key: "PageSize", type: "hidden", defaultValue: 20 },
        ],
        listApi: "Lottery/Bets",
        listApiMethod: "post",
        renderRow,
      },
    ],
  }

  function preloadBetRecords() {}

  useEffect(() => {
    config.tabs.forEach((tab) => {
      const storageKey = `${tab.name}_data` // 唯一的储存键值
      const requestData = tab.filter.reduce((sum, params) => ({ ...sum, [params.key]: params.defaultValue }), {})
      getLotterBetRecrodsData(requestData).then((res) => {
        if (res.Code !== 1) return
        const dataToStore = {
          list: res.Data,
          pageEnd: res.Data.length < requestData.PageSize,
          filter: requestData,
          pageIndex: requestData.PageIndex,
          timestamp: Date.now(), // 储存当前时间戳
        }
        util.cache.set(storageKey, dataToStore, "session")
      })
    })
  }, [])

  async function onInfiniteScroll(done) {
    if (!this.state.pageEnd && this.state.list.length > 0) {
      this.setState({ loadingMore: true })
      await this.loadMore()
      this.setState({ loadingMore: false })
    }
    setTimeout(() => {
      done()
    }, 500)
  }

  function renderRow(row, data) {
    let game = util.findGames(row.LotteryID)

    var checkPostPermission = true
    var PostDepositMoney = 0
    var forumGame = Object.values(forumGames)
    var formInfoStr = util.cache.get("default_forum_info")
    if (formInfoStr != null) {
      var formInfo = JSON.parse(formInfoStr)
      var supportArray = formInfo.PostSet.PostLotteryID.split(",")
      forumGame = forumGame.filter((item, key) => {
        return supportArray.indexOf(item.id) !== -1 && item.id == props.lotteryId
      })

      //代表发帖需要校验
      if (formInfo.PostSet != null && formInfo.PostSet.PostDepositLimit) {
        PostDepositMoney = formInfo.PostSet.PostDepositMoney
        //充值最低限制 》 当前充值
        if (formInfo.PostSet.PostDepositMoney > formInfo.RecTotal) {
          //无发帖权限
          checkPostPermission = false
        }
      }
    }

    var isSupportShare = forumGame.length > 0

    return (
      <div key={row.BetTime} className={`row `}>
        <div className="gameName">{game?.name || "unknown"}</div>
        <LotteryBetRecordItem
          {...row}
          otherUser={false}
          isSupportShare={isSupportShare}
          checkPostPermission={checkPostPermission}
          PostDepositMoney={PostDepositMoney}
        />
        {!closeShare && (
          <div className="text-white bg-[#576B95] rounded-[3px] w-10/12 py-0.25 mx-auto">
            <div
              className="btn"
              onClick={async () => {
                props.onShare(row.LotteryID + "|" + row.ID)
              }}
            >
              分享注单
            </div>
          </div>
        )}
      </div>
    )
  }

  return <RecordPage config={config} onInfiniteScroll={onInfiniteScroll} />
})
