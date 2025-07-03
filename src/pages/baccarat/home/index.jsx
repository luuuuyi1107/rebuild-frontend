import React from "react"

import RecordPage from "@/components/RecordPage"
import { Icon, ListItem } from "react-onsenui"
import BaccaratNavigatorBar from "@/components/BaccaratNavigatorBar"

import "./style.scss"
import "@/pages/thirdGame/home/promotionicon.scss"
import * as action from "@/action"
import { withRouter } from "@/magic/withRouter"
import { getArticleList, getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import util from "@/magic/util"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        apiLoading: false,
        currentHxBaccarat: "      ",
        promotionIconShow: true,
        promotionListShow: false,
        promotionList: [],
      }

      this.renderCustomRow = this.renderCustomRow.bind(this)
    }

    componentDidMount() {
      this.setState({ apiLoading: true })
      this.getBaccaratHxInfo()
      this.getPromotionList()
    }

    async getPromotionList() {
      const promotionList = await getArticleList({ id: 11, status: 1, PageSize: 50 })
      if (promotionList.Code != 1) {
        apiNotification.alert(promotionList, {}, this.props)
        return
      }
      this.setState({ promotionList: promotionList.Data })
    }

    async getBaccaratHxInfo() {
      let res = await getPush({ lotteryid: 14, keys: "" })

      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示" }, this.props)
        this.setState({ apiLoading: false })
        return
      }

      let hxBaccaratIssue = res.Data.OpenLottery.NewKai.GameID
      this.setState({ currentHxBaccarat: hxBaccaratIssue, apiLoading: false })

      // 不好触发更新，直接跳出 react
      setTimeout(() => {
        document.querySelector(".baccarat-hx-issue").innerHTML = hxBaccaratIssue
      }, 100)
    }

    //总配置
    totalCofig = {
      tabs: [
        {
          name: "游戏大厅",
          listApi: "Baccarat/GetList",
          filter: [
            { key: "PageSize", type: "hidden", defaultValue: 50 },
            { key: "status", type: "hidden", defaultValue: 0 },
          ],
          className: "hall",
          broadcast: true,
          customerServiceMsg: true,
          listApiMethod: "get",
          customFirstRow: () => {
            return this.renderCustomRow(this.state.currentHxBaccarat)
          },
          renderRow: (row, data) => {
            return (
              <ListItem
                className="system-message-record-item recordItem"
                key={row.ID}
                onClick={() => {
                  this.goGameTable(row)
                }}
              >
                <div className="left ">
                  <div>
                    <span className={`table-id ${(row.ID + "").length >= 5 ? "text-[0.28rem]" : "text-[0.32rem]"}`}>{row.ID}</span>
                    <span className="table-name">号桌</span>
                  </div>
                </div>
                <div className="center tableInfo">
                  <div>
                    <span className="name">
                      <Icon icon="ion-person" />
                      <b>{row.NickName}</b>
                    </span>
                    <span className="set">
                      局数：
                      <b>
                        {row.HandMax}/{row.SealHide}
                      </b>
                    </span>
                    <span className="pot">
                      限红：
                      <b>
                        {row.MinHide}~{row.MaxHide}
                      </b>
                    </span>
                    <span className="pot">
                      彩池：<b>{row.PotMoney}</b>
                    </span>
                  </div>
                </div>
                <div className="right arrow">
                  {row.Code && <span className="vip">包厢</span>}
                  <span className="poker-time">{row.PokerTime}秒</span>
                  <Icon icon="ion-ios-arrow-right" />
                </div>
              </ListItem>
            )
          },
        },
      ],
    }

    async goGameTable(row) {
      util.trialCheck({ forGame: true })
      if (row.Code) {
        inviteCode = ""
        notificationAsync
          .originAlert(
            <div>
              <input placeholder="请输入邀请码" type="text" onchange="window.onInviteCodeChange(event)" />
            </div>,
            {
              title: `第${row.ID}桌邀请码`,
              class: "invite-code-dialog",
              buttonLabels: row.Anonymous ? ["取消", "匿名访问", "进入游戏"] : ["取消", "进入游戏"],
              cancelable: true,
            }
          )
          .then(async (value) => {
            let code = inviteCode
            if ((row.Anonymous && value == 2 && code != "") || (!row.Anonymous && value == 1 && code != "")) {
              this.setState({ apiLoading: true })
              let res = await action.get("Baccarat/GetData", { ID: row.ID, code: code })
              this.setState({ apiLoading: false })
              if (res.Code == 1) {
                this.props.router.isLoginToOrRedirect(`/baccarat/gameTable`, { id: row.ID, uid: row.UID, code })
              } else {
                notificationAsync.alert("邀请码输入错误", { title: "操作提示", cancelable: true })
              }
            }
            if (row.Anonymous && value == 1) {
              this.props.router.isLoginToOrRedirect(`/baccarat/gameTable`, { id: row.ID, uid: row.UID })
            }
          })
      } else {
        this.props.router.isLoginToOrRedirect(`/baccarat/gameTable`, { id: row.ID, uid: row.UID })
      }
    }

    renderCustomRow(issue) {
      return (
        <div className="record-list-item list-item baccarat-hx">
          <ListItem
            className="system-message-record-item  recordItem"
            onClick={() => {
              this.props.router.push(`/baccarat/gameTableHX?id=14&code=hxbaccarat`)
            }}
          >
            <div className="left ">
              <div className="hx-icon"></div>
            </div>
            <div className="center tableInfo">
              <div className="tableInfo-content">
                <div className="game-name">哈希百家乐</div>
                <span className="issues">
                  局数：
                  <span className="baccarat-hx-issue">{issue}</span>
                </span>
                <span className="pot">限红：无限制</span>
              </div>
            </div>
            <div className="right arrow">
              <span className="open-time">30秒</span>
              <Icon icon="ion-ios-arrow-right" />
            </div>
          </ListItem>
        </div>
      )
    }

    render() {
      return (
        <div>
          <RecordPage
            config={this.totalCofig}
            apiLoading={this.state.apiLoading}
            className="baccarat-home"
            center="百家乐"
            onBack={() => {
              this.props.router.push("/site/home")
            }}
            renderFixed={() => <BaccaratNavigatorBar active="home" />}
          />

          {this.state.promotionListShow && (
            <div className="promotionBg">
              <div className="promotionList">
                <div className="title"></div>
                <div className="content">
                  {this.state.promotionList &&
                    this.state.promotionList.map((item) => {
                      let titleInfo = item.Title.split(":")
                      return (
                        <div
                          key={item.ID}
                          className="listItem"
                          onClick={() => {
                            this.props.router.push(`/site/promotionContent?id=${item.ID}`)
                          }}
                        >
                          <div className={"left color" + titleInfo[0]}>{titleInfo[1]}</div>
                          <div className="right">{titleInfo[2]}</div>
                        </div>
                      )
                    })}
                </div>
                <span
                  className="promotionClose"
                  onClick={(e) => {
                    this.setState({ promotionListShow: false })
                  }}
                >
                  x
                </span>
              </div>
            </div>
          )}

          {this.state.promotionIconShow && this.state.promotionList.length > 0 && (
            <div
              className="promotionIcon"
              onClick={() => {
                this.setState({ promotionListShow: true })
              }}
            >
              <span
                className="closeBtn"
                onClick={(e) => {
                  this.setState({ promotionIconShow: false })
                  e.stopPropagation()
                }}
              >
                x
              </span>
            </div>
          )}
        </div>
      )
    }
  }
)
