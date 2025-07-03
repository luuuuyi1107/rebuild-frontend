import React from "react"
import LayoutPage from "@/components/LayoutPage"
import LotteryBetRecordItem from "@/components/LotteryBetRecordItem"
import { Icon } from "react-onsenui"

import util from "@/magic/util"
import * as action from "@/action"
import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import forumGames from "@/config/forum"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.lotteryId = util.getUrlParam("id")
      this.game = util.findGames(util.getUrlParam("id"))
      this.state = {
        loading: true,
        list: [],
        PageIndex: 1,
        PageSize: 20,
        pageEnd: false,
        loadingMore: false,
      }
    }
    componentDidMount() {
      this.loadMore(1).then(() => {
        this.setState({ loading: false })
        if (window.innerHeight / this.rowHeight > this.state.PageSize) {
          this.loadMore()
        }
      })
    }
    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ pageIndex: pageIndex })
      } else {
        pageIndex = this.state.pageIndex + 1
        this.setState({ pageIndex: pageIndex })
      }
      let query = { lotteryid: this.game.id, status: -1, PageIndex: pageIndex, PageSize: this.state.PageSize }
      let userID = util.getUrlParam("userID")
      if (userID) {
        query.id = userID
      }
      let res = await action.post("Lottery/Bets", query)
      if (res.Code != 1) {
        apiNotification.alert(
          res,
          {
            title: "操作提示",
            callback: () => {
              this.props.router.back()
            },
          },
          this.props
        )
        return
      }
      let list = Object.assign([], this.state.list)
      this.setState({ list: list.concat(res.Data), pageEnd: res.Data.length < this.state.PageSize ? true : false })
    }
    async onInfiniteScroll(done) {
      if (!this.state.pageEnd) {
        this.setState({ loadingMore: true })
        await this.loadMore()
        this.setState({ loadingMore: false })
      }

      setTimeout(() => {
        done()
      }, 500)
    }

    render() {
      const game = this.game
      const userID = util.getUrlParam("userID")
      const formInfoStr = util.cache.get("default_forum_info")

      let checkPostPermission = true
      let PostDepositMoney = 0
      let forumGame = Object.values(forumGames)
      if (formInfoStr != null) {
        var formInfo = JSON.parse(formInfoStr)
        var supportArray = formInfo.PostSet.PostLotteryID.split(",")
        forumGame = forumGame.filter((item, key) => {
          return supportArray.indexOf(item.id) !== -1 && item.id == this.lotteryId
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

      const isSupportShare = userID == util.getUserByKey("ID") && forumGame.length > 0

      return (
        <LayoutPage
          className="lottery-bet-record"
          title={game?.name}
          onBack={this.props.onBack}
          loading={this.state.loading}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          right={null}
        >
          <div>
            {this.state.list.map((item, index) => {
              return (
                <div key={item.BetTime + index} className={`row ${index % 2 == 1 ? "odd" : "even"}`}>
                  <LotteryBetRecordItem
                    {...item}
                    otherUser={userID ? true : false}
                    isSupportShare={isSupportShare}
                    checkPostPermission={checkPostPermission}
                    PostDepositMoney={PostDepositMoney}
                  />
                </div>
              )
            })}
          </div>
          {this.state.loadingMore && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && this.state.list.length == 0 && <div className="no-record">您还没有投注记录!</div>}
          {this.state.pageEnd && this.state.list.length > this.state.PageSize && <div className="no-record">别扯，到底了</div>}
        </LayoutPage>
      )
    }
  }
)
