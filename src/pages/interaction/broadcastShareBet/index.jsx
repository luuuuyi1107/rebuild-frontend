import React from "react"
// import LayoutPage from '@/components/LayoutPage';
import LotteryBetRecordItem from "@/components/LotteryBetRecordItem"
// import {Icon} from "react-onsenui";

import util from "@/magic/util"
import * as action from "@/action"
import "./style.scss"
import RecordPage from "@/components/RecordPage"
import forumGames from "@/config/forum"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      // this.lotteryId = util.getUrlParam("id");
      this.closeShare = util.getUrlParam("closeShare")
      this.state = {
        loading: true,
        list: [],
        PageIndex: 1,
        PageSize: 20,
        pageEnd: false,
        loadingMore: false,
      }
    }
    componentDidMount() {}

    config = {
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
          renderRow: this.renderRow.bind(this),
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
          renderRow: this.renderRow.bind(this),
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
          renderRow: this.renderRow.bind(this),
        },
      ],
    }

    renderRow(row, data) {
      let game = util.findGames(row.LotteryID)

      var checkPostPermission = true
      var PostDepositMoney = 0
      var forumGame = Object.values(forumGames)
      var formInfoStr = util.cache.get("default_forum_info")
      if (formInfoStr != null) {
        var formInfo = JSON.parse(formInfoStr)
        var supportArray = formInfo.PostSet.PostLotteryID.split(",")
        forumGame = forumGame.filter((item, key) => {
          return supportArray.indexOf(item.id) !== -1 && item.id == this.props.lotteryId
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
          {!this.closeShare && (
            <div className="shareBtn">
              <div
                className="btn"
                onClick={async () => {
                  let res = await action.post("User/SendBroadcast", { type: 1, text: row.LotteryID + "|" + row.ID })
                  if (res.Code != 1) {
                    notificationAsync.alert(res.Message, {}, this.props)
                  } else {
                    notificationAsync.alert(res.Message, { title: " 恭喜您!" }).then(() => {
                      this.props.router.back()
                    })
                  }
                }}
              >
                分享注单
              </div>
            </div>
          )}
        </div>
      )
    }

    render() {
      return (
        <div>
          <RecordPage
            center="投注记录"
            right={
              <span
                onClick={() => {
                  this.props.router.isLoginToOrRedirect(`/lottery/nav?to=betHistory`)
                }}
              >
                选择
              </span>
            }
            config={this.config}
            className="share-bet-page"
          />
        </div>
      )
    }
  }
)
