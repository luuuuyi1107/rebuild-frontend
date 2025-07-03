import React from "react"
import util from "@/magic/util"
import * as action from "@/action"
import { Icon } from "react-onsenui"
import "./style.scss"
import LotteryBall from "../LotteryBall"
import LotteryRecord from "@/pages/lottery/record/record"
import LotteryBetRecord from "@/pages/lottery/betRecord/record"
import LotteryBetRecordItem from "../LotteryBetRecordItem"
import * as apiNotification from "@/magic/ApiNotification"
import forumGames from "@/config/forum"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"

export default withRouter(
  class LotteryTab extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        active: 0,
        drawHistory: [],
        showMoreRecord: false,
        betHistory: [],
        showMoreBet: false,
        apiLoading: true,
      }
    }

    showForumTab =
      import.meta.env.VITE_FORUM_ENABLE == "true" &&
      import.meta.env.VITE_FORUM_OPEN == "true" &&
      this.props.lotteryType === "lhc" &&
      forumGames["specific"].some((num) => num == this.props.lotteryId)

    async loadDrawHistory() {
      this.setState({ apiLoading: true })
      // const drawHistoryApi = game.drawHistoryApi;
      const lotteryType = this.props.lotteryType
      const res = await action.post("Lottery/Lotterys", {
        lotteryid: this.props.lotteryId,
        date: 0,
        PageIndex: 1,
        PageSize: lotteryType == "lhc" || lotteryType == "klb" ? 5 : 10,
      })
      this.setState({ drawHistory: res.Data, apiLoading: false })
    }

    async loadBetHistory() {
      this.setState({ apiLoading: true })
      // let game = util.findGames(this.props.lotteryId);
      // let betListApi = game.betListApi;
      let res = await action.post("Lottery/Bets", {
        lotteryid: this.props.lotteryId,
        status: -1,
        PageIndex: 1,
        PageSize: 5,
      })
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示", cancelType: "cancel" }, this.props)
        this.setState({ betHistory: [], apiLoading: false })
        return
      }
      this.setState({ betHistory: res.Data, apiLoading: false })
    }

    renderDrawHistory() {
      const drawHistory = this.state.drawHistory || []
      const lotteryType = this.props.lotteryType
      const result = drawHistory.map((item, index) => {
        return (
          <div key={item.GameID} className={index % 2 == 0 ? "odd" : "even"}>
            <LotteryBall {...item} type={lotteryType} display="numberWithXt" showHash={false} />
          </div>
        )
      })

      if (this.state.apiLoading) {
        if (drawHistory.length == 0) {
          result.push(
            <div key="loading" className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )
        }
      } else {
        if (drawHistory.length == 0) {
          result.push(
            <div key="loading" className="no-record">
              暂无记录!
            </div>
          )
        }
      }

      if (!this.state.apiLoading && drawHistory.length > 0) {
        result.push(
          <div className="more" key="more" onClick={this.openDrawHistoryModal.bind(this)}>
            更多&nbsp;
            <Icon icon="ion-arrow-down-c" />
          </div>
        )
      }

      return result
    }

    renderBetHistory() {
      let betHistory = this.state.betHistory || []

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

      let result = betHistory.map((item, index) => {
        var isSupportShare = forumGame.length > 0

        return (
          <div key={item.BetTime} className={index % 2 == 0 ? "odd" : "even"}>
            <LotteryBetRecordItem
              {...item}
              isSupportShare={isSupportShare}
              checkPostPermission={checkPostPermission}
              PostDepositMoney={PostDepositMoney}
            />
          </div>
        )
      })

      if (this.state.apiLoading) {
        if (betHistory.length == 0) {
          result.push(
            <div key="loading" className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )
        }
      } else {
        if (betHistory.length == 0) {
          result.push(
            <div key="loading" className="no-record">
              暂无记录!
            </div>
          )
        }
      }

      if (!this.state.apiLoading && betHistory.length > 0) {
        result.push(
          <div className="more" key="more" onClick={this.openBetHistoryModal.bind(this)}>
            更多&nbsp;
            <Icon icon="ion-arrow-down-c" />
          </div>
        )
      }

      return result
    }

    format(rule) {
      if (!rule) {
        return ""
      }
      let lotteryRate = this.props.LotteryRate
      let LotteryRebate = this.props.LotteryRebate
      let arr = rule.split("#")
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].startsWith("rebate_")) {
          let key = arr[i].replace("rebate_", "")
          arr[i] = LotteryRebate[key]
        } else if (lotteryRate[arr[i]]) {
          arr[i] = lotteryRate[arr[i]]
        }
      }
      return arr.join("")
    }

    tabClick(index) {
      if (index === 3) {
        this.props.router.push(`/site/forum?id=${this.props.lotteryId}`)
      } else if (this.state.active == index) {
        if (index != 0) {
          this.setState({ active: 0 })
        }
        return
      } else {
        this.setState({ active: index })
        if (index == 1) {
          this.loadDrawHistory()
        }
        if (index == 2) {
          this.loadBetHistory()
        }
      }
    }

    render() {
      return (
        <div className="lottery-tab">
          <div className="hd">
            {this.props.rule == "lottery" ? (
              <div
                className="tab intro"
                onClick={() => {
                  this.props.router.push(`/site/article?id=${this.props.lotteryId}`)
                }}
              >
                彩种介绍
              </div>
            ) : (
              <div className={`tab rule ${this.state.active == 0 ? "active" : ""}`} onClick={this.tabClick.bind(this, 0)}>
                玩法介绍
              </div>
            )}

            <div className={`tab draw-history ${this.state.active == 1 ? "active" : ""}`} onClick={this.tabClick.bind(this, 1)}>
              开奖记录
            </div>
            <div className={`tab bet-history  ${this.state.active == 2 ? "active" : ""}`} onClick={this.tabClick.bind(this, 2)}>
              投注记录
            </div>
            {this.showForumTab && (
              <div
                className={`tab bet-history forum ${this.state.active == 3 ? "active" : ""} id-${this.props.lotteryId}`}
                onClick={this.tabClick.bind(this, 3)}
              >
                <div className="forum-icon" />
                港澳论坛
              </div>
            )}
          </div>
          {((this.state.active == 0 && this.props.rule != "lottery") || this.state.active != 0) && (
            <div className="bd">
              {this.state.active == 0 && (
                <div className="intro">
                  <div dangerouslySetInnerHTML={{ __html: this.format(this.props.rule) }}></div>
                  {this.props.RefundMsg && (
                    <div className="flex items-center mt-0.25">
                      <div className="border border-solid rounded-[0.1rem] border-[#E14138] text-[#E14138] h-[16px] w-[16px] flex items-center justify-center mr-[0.1rem]">
                        保
                      </div>
                      {this.props.RefundMsg}
                    </div>
                  )}
                </div>
              )}
              {this.state.active == 1 && this.renderDrawHistory()}
              {this.state.active == 2 && this.renderBetHistory()}
            </div>
          )}
          <ModalPage
            className="record-model"
            isOpen={this.state.showMoreRecord}
            animation="lift"
            onClose={() => {
              this.setState({
                showMoreRecord: false,
              })
            }}
          >
            <LotteryRecord />
          </ModalPage>
          <ModalPage
            className="record-model"
            isOpen={this.state.showMoreBet}
            animation="lift"
            onClose={() => {
              this.setState({
                showMoreBet: false,
              })
            }}
          >
            <LotteryBetRecord />
          </ModalPage>
        </div>
      )
    }

    openDrawHistoryModal() {
      this.setState({
        showMoreRecord: true,
      })
    }

    closeModal() {
      this.setState({
        showMoreRecord: false,
        showMoreBet: false,
      })
    }

    openBetHistoryModal() {
      this.setState({
        showMoreBet: true,
      })
    }
  }
)
