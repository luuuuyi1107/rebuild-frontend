import React from "react"

// import LayoutPage from '@/components/LayoutPage';
import { Icon } from "react-onsenui"

import "./style.scss"
import util from "@/magic/util"
import { getLotterBetHistoryData, getLottersData } from "@/action/apis"
// import {notification} from "onsenui/js/onsenui";
import LotteryBall from "@/components/LotteryBall"
import LotteryBetRecordItem from "@/components/LotteryBetRecordItem"

import LotteryBetRecord from "@/pages/lottery/betRecord/record"
import * as apiNotification from "@/magic/ApiNotification"
import LotteryRecord from "../../../lottery/record/record"
import DynamicSvg from "@/components/DynamicSvg"
import ModalPage from "@/components/ModalPage"
import { withRouter } from "@/magic/withRouter"
export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        recordList: [],
        recordLoading: false,
        showMoreRecord: false,
        showMoreBet: false,
        tab_active: 0,
        betHistory: [],
      }
    }

    componentDidMount() {
      const id = util.getUrlParam("id")
      const recordList = util.cache.get(`lotteryData-${id}`)
      if (!recordList) return
      this.setState({ recordList })
    }

    /***
     * 开奖记录
     * @returns {unknown[]}
     */
    renderDrawHistory(lottoId) {
      let drawHistory = this.state.recordList || []
      let game = util.findGames(lottoId)
      let result = drawHistory.map((item) => {
        return <LotteryBall {...item} key={item.GameID} type={game.type} display="numberWithNiuCard" />
      })

      if (this.state.recordLoading) {
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

      if (!this.state.recordLoading && drawHistory.length > 0) {
        result.push(
          <div className="more" key="more" onClick={this.openDrawHistoryModal.bind(this)}>
            &nbsp;
            <Icon icon="ion-arrow-down-c" />
          </div>
        )
      }

      return result
    }

    openBetHistoryModal() {
      this.props.openHistoryModel("bet")
    }

    openDrawHistoryModal() {
      this.props.openHistoryModel("draw")
    }
    /***
     * 下注记录
     * @returns {unknown[]}
     */
    renderBetHistory(lottoId) {
      this.setState({ recordLoading: true })
      const { betHistory } = this.state
      var forumGame = Object.values(forumGames)
      var formInfoStr = util.cache.get("default_forum_info")
      if (formInfoStr != null) {
        var formInfo = JSON.parse(formInfoStr)
        var supportArray = formInfo.PostSet.PostLotteryID.split(",")
        forumGame = forumGame.filter((item, key) => {
          return supportArray.indexOf(item.id) !== -1 && item.id == this.props.lotteryId
        })
      }

      let result = betHistory.map((item, index) => {
        var isSupportShare = forumGame.length > 0

        return (
          <div key={item.BetTime} className={index % 2 == 0 ? "odd" : "even"}>
            <LotteryBetRecordItem {...item} isSupportShare={isSupportShare} />
          </div>
        )
      })

      if (this.state.recordLoading) {
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
      if (!this.state.recordLoading && betHistory.length > 0) {
        result.push(
          <div className="more" key="more" onClick={this.openBetHistoryModal.bind(this)}>
            &nbsp;
            <Icon icon="ion-arrow-down-c" />
          </div>
        )
      }

      return result
    }

    closeModal() {
      this.setState({
        showMoreBet: false,
        showMoreRecord: false,
      })
    }

    onTabClick(tab_active) {
      this.setState({ tab_active })
      setTimeout(this.refresh.bind(this), 0)
    }

    refresh() {
      ;(this.state.tab_active === 0 ? this.getLottoryRecord.bind(this) : this.getBetHistoryData.bind(this))()
    }

    isBetRecord() {
      return this.state.tab_active === 1
    }

    getBetHistoryData() {
      const id = util.getUrlParam("id")
      getLotterBetHistoryData(id).then((res) => {
        if (res.Code === 1) {
          const betHistory = res.Data.map((bet) => ({
            ...bet,
            OpenCode: new Array(5)
              .fill(0)
              .map(() => Math.floor(Math.random() * 10))
              .join(","),
          }))
          this.setState({ betHistory })
        } else {
          this.setState({ betHistory: [] })
        }
      })
    }

    getLottoryRecord() {
      const id = util.getUrlParam("id")
      getLottersData(id).then((res) => {
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }

        if (res.Data.length > 0) {
          util.cache.set(`lotteryData-${id}`, res.Data)
        }

        this.setState({
          recordList: res.Data,
        })
        // resolve(res.Data)
      })
    }

    render() {
      let lottoId = util.getUrlParam("id")
      return (
        <div className="niuniu-betdraw-area">
          <div className="draw_tab">
            {["开奖", "下注"].map((title, idx) => (
              <div
                className={`draw_tab_item${this.state.tab_active === idx ? " active" : ""}`}
                key={`tab_draw_${idx}`}
                onClick={this.onTabClick.bind(this, idx)}
              >
                <DynamicSvg className="ic" style={{ width: 18, height: 18 }} svgPath={`niuniu/tab${idx + 1}`} />
                <div className="title">{title}记录</div>
              </div>
            ))}
          </div>
          <div className="divider_horizon" />

          {this.recordLoading ? (
            <div key="loading" className="loading">
              <Icon icon="ion-load-d" />
            </div>
          ) : this.state.tab_active == 0 ? (
            this.renderDrawHistory(lottoId)
          ) : this.state.betHistory.length === 0 ? (
            <div key="loading" className="no-record">
              暂无记录!
            </div>
          ) : (
            <div className="bet-items">
              {this.state.betHistory
                .map((betItem) => {
                  const isWin = betItem.Bonus > betItem.BetCount

                  const isWinText =
                    betItem.Status === 0 ? "" : "," + (betItem.Bonus > betItem.BetCount ? "中" : betItem.Bonus == betItem.BetCount ? "平" : "亏")
                  return (
                    <div key={betItem.ID} className="bet-item">
                      <div className="title">第{betItem.GameID}期</div>

                      <div className="cards" key={`cards-${betItem.GameID}-${betItem.OpenCode}`}>
                        {betItem.OpenCode.split(",").map((pos, idx) => (
                          <DynamicSvg key={`item-${pos}-${idx}`} style={{ width: 19, height: 26 }} className="card" svgPath={`niuniu/heart${pos}`} />
                        ))}
                      </div>
                      <div className="content">
                        {`${betItem.PlayType}:${betItem.BetText}(${isWin ? betItem.Bonus : betItem.BetCount}元${isWinText})`}
                      </div>
                    </div>
                  )
                })
                .concat(
                  <div className="more" key="more" onClick={this.openBetHistoryModal.bind(this)}>
                    &nbsp;
                    <Icon icon="ion-arrow-down-c" />
                  </div>
                )}
            </div>
          )}
          <ModalPage
            className="record-model"
            isOpen={this.state.showMoreRecord || this.state.showMoreBet}
            animation="lift"
            onClose={() => this.closeModal()}
          >
            {this.state.showMoreRecord && <LotteryRecord />}
            {this.state.showMoreBet && <LotteryBetRecord />}
          </ModalPage>
        </div>
      )
    }
  }
)
