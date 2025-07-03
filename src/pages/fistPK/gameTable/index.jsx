import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button, Switch } from "react-onsenui"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"
import { withLoginExceptTrial } from "@/magic/withLogin"

@withLoginExceptTrial
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      money: null,
      loading: true,
      apiLoading: false,
      userCards: this.props.gameData && this.props.gameData.UserCards ? this.props.gameData.UserCards : null,
      myCards: this.props.gameData && this.props.gameData.MyCards ? this.props.gameData.MyCards : null,
      closeGame: false,
      changeCard: false,
      passInput: util.cache.get("GoldenPKPass") && Object.keys(util.cache.get("GoldenPKPass")).length > 0 ? false : true,
      pass: util.cache.get("GoldenPKPass") && Object.keys(util.cache.get("GoldenPKPass")).length > 0 ? util.cache.get("GoldenPKPass") : null,
    }
  }
  componentDidMount() {
    this.setState({ loading: false })
  }

  challenge() {
    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate, { title: "设置信息错误" })
      return
    }

    let query = {
      id: this.props.gameData.ID,
      pass: this.state.pass,
      fist: this.state.fist,
    }
    this.setState({ apiLoading: true })
    action.post("PKGame/Fist_Challenge", query, (res) => {
      this.setState({ apiLoading: false })
      if (res.Code == 1) {
        notificationAsync.alert(res.Message, { title: "成功" })
        util.cache.set("GoldenPKPass", this.state.pass)
        let data = res.Data
        this.setState({ closeGame: true, passInput: false, myCards: data.DareCards, userCards: data.UserCards })
      } else {
        notificationAsync.alert(res.Message, { title: "操作提示" })
      }
    })
  }

  check() {
    if (!this.state.pass) {
      return "登入密码不能为空"
    } else if (!this.state.fist) {
      return "请选择拳种"
    }
    return ""
  }

  render() {
    let gameData = this.props.gameData
    let userCards = this.state.userCards
    let myCards = this.state.myCards
    let DareCards = this.state.myCards
    let fistMap = {
      0: "question",
      1: "stone",
      2: "scissors",
      3: "cloth",
    }
    let fistMap2 = {
      1: "石头",
      2: "剪刀",
      3: "布",
    }
    return (
      <LayoutPage
        className="game-table"
        apiLoading={this.state.apiLoading}
        loading={this.state.loading}
        center="猜拳对战"
        onBack={() => {
          this.props.onBack()
        }}
        right={null}
      >
        <div className="content">
          {gameData && gameData.NickName && gameData.Money && (
            <div className="tip">
              <span>擂主：&nbsp;{gameData.NickName}</span>
              <span>彩金：&nbsp;¥&nbsp;{gameData.Money}</span>
            </div>
          )}
          <div className="round-info">
            <div className="poker-group">
              <div className="pokerItem Zdian dian">
                <div className="dianItem dianItem-title t1">擂主牌面</div>
                <div className="poker dianItem">
                  {userCards ? (
                    <div className={"fist " + fistMap[userCards]}>{fistMap[userCards]}</div>
                  ) : (
                    <div className={"fist " + fistMap[0]}>{fistMap[0]}</div>
                  )}
                </div>
                {userCards && <div className="point dianItem">{fistMap2[userCards]}</div>}
              </div>
              <div className="pokerItem Zdian dian">
                <div className="dianItem dianItem-title t2">挑战者牌面</div>
                <div className="poker dianItem poker-state">
                  <div className={"fist not-select state" + this.state.fist}>{!this.state.fist ? "请选择" : null}</div>
                </div>
                <div className="poker dianItem">
                  <div
                    className={this.state.fist == 1 ? "active fist " + fistMap[1] : "fist " + fistMap[1]}
                    onClick={() => {
                      this.setState({ fist: 1 })
                    }}
                  >
                    {fistMap[1]}
                  </div>
                  <div
                    className={this.state.fist == 2 ? "active fist " + fistMap[2] : "fist " + fistMap[2]}
                    onClick={() => {
                      this.setState({ fist: 2 })
                    }}
                  >
                    {fistMap[2]}
                  </div>
                  <div
                    className={this.state.fist == 3 ? "active fist " + fistMap[3] : "fist " + fistMap[3]}
                    onClick={() => {
                      this.setState({ fist: 3 })
                    }}
                  >
                    {fistMap[3]}
                  </div>
                </div>
                {/*{*/}
                {/*DareCards  && <div className="point dianItem">{DareCards}</div>*/}
                {/*}*/}
              </div>
            </div>
            {this.state.passInput && (
              <div className=" item password">
                <div className="inline">验证密码:</div>
                <div className="inline">
                  <InputBox
                    placeholder={"请输入提款密码"}
                    type="number"
                    name="amount"
                    onChange={(value) => {
                      this.setState({ pass: value })
                    }}
                    value={this.state.pass}
                  />
                </div>
              </div>
            )}
          </div>

          {this.state.closeGame ? (
            <div className="submit">
              <Button
                onClick={() => {
                  this.props.onBack()
                }}
              >
                返回
              </Button>
            </div>
          ) : (
            <div className="submit">
              <Button
                onClick={() => {
                  this.challenge()
                }}
              >
                挑战
              </Button>
            </div>
          )}
        </div>
      </LayoutPage>
    )
  }
}
