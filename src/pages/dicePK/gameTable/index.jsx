import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button, Switch } from "react-onsenui"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      money: null,
      loading: true,
      apiLoading: false,
      userCards: null,
      dareCards: this.props.gameData && this.props.gameData.MyCards ? this.props.gameData.MyCards : null,
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
    }
    this.setState({ apiLoading: true })
    action.post("PKGame/Dice_Challenge", query, (res) => {
      this.setState({ apiLoading: false })
      if (res.Code == 1) {
        notificationAsync.alert(res.Message, { title: "成功" })
        util.cache.set("GoldenPKPass", this.state.pass)
        let data = res.Data
        this.setState({ closeGame: true, passInput: false, dareCards: data.DareCards, userCards: data.UserCards })
      } else {
        notificationAsync.alert(res.Message, { title: "操作提示" })
      }
    })
  }

  check() {
    if (!this.state.pass) {
      return "登入密码不能为空"
    }
    return ""
  }

  render() {
    let gameData = this.props.gameData
    let userCards = this.state.userCards
    // let myCards = this.state.myCards;
    // let DareCards = this.state.myCards;
    let defender = this.state.userCards || null
    // console.log(defender)
    let challenger = this.state.dareCards || null
    let defenderSum = 0
    let challengerSum = 0
    if (defender) {
      defender = defender.split(",")
      defender.map((item) => {
        defenderSum += parseInt(item, 10)
      })
    }
    if (challenger) {
      challenger = challenger.split(",")
      challenger.map((item) => {
        challengerSum += parseInt(item, 10)
      })
    }
    return (
      <LayoutPage
        className="dice-game-table"
        apiLoading={this.state.apiLoading}
        loading={this.state.loading}
        center="骰子对战"
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
                {defender ? (
                  <div className="poker dianItem">
                    {defender.map((item, index) => {
                      return <div key={"defenderdice" + index} className={"dice dice" + item}></div>
                    })}
                  </div>
                ) : (
                  <div className="poker dianItem">
                    <div className={"dice diceQ1"}></div>
                    <div className={"dice diceQ2"}></div>
                    <div className={"dice diceQ3"}></div>
                  </div>
                )}
                {defender && challenger && (
                  <div className="point">
                    {defenderSum} vs {challengerSum}
                  </div>
                )}
              </div>
              <div className="pokerItem Zdian dian">
                <div className="dianItem dianItem-title t2">挑战者牌面</div>
                {challenger ? (
                  <div className="poker dianItem">
                    {challenger.map((item, index) => {
                      return <div key={"challengerdice" + index} className={"dice dice" + item}></div>
                    })}
                  </div>
                ) : (
                  <div className="poker dianItem">
                    <div className={"dice diceQ1"}></div>
                    <div className={"dice diceQ2"}></div>
                    <div className={"dice diceQ3"}></div>
                  </div>
                )}
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
