import React from "react"

import LayoutPage from "@/components/LayoutPage"
// import InputBox from "@/components/InputBox"
import { post } from "@/action"
import _ from "lodash"
import "./style.scss"
import { Button, Switch } from "react-onsenui"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { getMySet } from "@/action/apis"
import util from "@/magic/util"
import Select from "@/components/Select"
import { notificationAsync } from "@/magic/notification"
import { withLoginExceptTrial } from "@/magic/withLogin"

@withLoginExceptTrial
@withRouter
export default class extends React.PureComponent {
  MONEY_MAX = 8
  constructor() {
    super()
    this.state = {
      Stranger: false,
      Friend: false,
      WinXin: false,
      BetXin: false,
      BetXian: "0",
      TeleXian: false,
      KuaiMoney: "",
      moneys: new Array(this.MONEY_MAX).fill(""),
      ReceiveMail: true,
      apiLoading: false,
      loading: true,
    }
  }
  componentDidMount() {
    this.loadData()
  }

  async loadData() {
    let res = await getMySet()
    if (res.Code != 1) {
      apiNotification.alert(res, {}, this.props)
      return
    }

    this.setState({
      loading: false,
      ...res.Data,
      moneys: [...res.Data.KuaiMoney.split(","), ...this.state.moneys].slice(0, this.MONEY_MAX),
    })
  }

  changeSet() {
    const KuaiMoney = this.state.moneys.filter((money) => !!money && money > 0).join()
    this.setState({ apiLoading: true })
    const user = util.cache.get("user")

    post(
      "User/MySet",
      {
        ID: user.ID,
        Stranger: this.state.Stranger,
        Friend: this.state.Friend,
        WinXin: this.state.WinXin,
        BetXin: this.state.BetXin,
        BetXian: this.state.BetXian,
        TeleXian: this.state.TeleXian,
        KuaiMoney,
        ReceiveMail: this.state.ReceiveMail,
      },
      (res) => {
        // this.state.moneys
        const moneys = _(this.state.moneys)
          .filter((money) => !!money && money > 0)
          .uniq()
          .value()
          .concat(new Array(this.MONEY_MAX).fill(""))
          .slice(0, this.MONEY_MAX)

        const user = util.cache.get("user")
        if (!!user?.KuaiMoney) {
          user.KuaiMoney = KuaiMoney
          util.cache.set("user", user)
        }

        this.setState({ apiLoading: false, moneys })
        if (res.Code == 1) {
          notificationAsync.alert(res.Message, { title: "成功" })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      }
    )
  }

  render() {
    return (
      <LayoutPage className="site-set" center="信息设置" right={null} apiLoading={this.state.apiLoading} loading={this.state.loading}>
        <div className="content">
          <div className="setItem">
            <span className="inline">陌生消息</span>
            <span className="inline">
              <Switch
                checked={this.state.Stranger}
                onClick={() => {
                  this.setState({
                    Stranger: !this.state.Stranger,
                  })
                }}
              />
            </span>
          </div>
          <div className="setItem">
            <span className="inline">好友请求</span>
            <span className="inline">
              <Switch
                checked={this.state.Friend}
                onClick={() => {
                  this.setState({
                    Friend: !this.state.Friend,
                  })
                }}
              />
            </span>
          </div>
          <div className="setItem">
            <span className="inline">中奖通知</span>
            <span className="inline">
              <Switch
                checked={this.state.WinXin}
                onClick={() => {
                  this.setState({
                    WinXin: !this.state.WinXin,
                  })
                }}
              />
            </span>
          </div>
          <div className="setItem">
            <span className="inline">开奖通知</span>
            <span className="inline">
              <Switch
                checked={this.state.BetXin}
                onClick={() => {
                  this.setState({
                    BetXin: !this.state.BetXin,
                  })
                }}
              />
            </span>
          </div>
          <div className="setItem">
            <span className="inline">屏蔽广播</span>
            <span className="inline">
              <Switch
                checked={this.state.TeleXian}
                onClick={() => {
                  this.setState({
                    TeleXian: !this.state.TeleXian,
                  })
                }}
              />
            </span>
          </div>
          <div className="setItem">
            <span className="inline">邮件通知</span>
            <span className="inline">
              <Switch
                checked={this.state.ReceiveMail}
                onClick={() => {
                  this.setState({
                    ReceiveMail: !this.state.ReceiveMail,
                  })
                }}
              />
            </span>
          </div>
          <div className="setItem">
            <span className="inline">下注详情</span>
            <span className="inline">
              <Select
                value={this.state.BetXian}
                onChange={(event) => {
                  this.setState({ BetXian: event.target.value })
                }}
                options={[
                  { value: 0, name: "全部可见" },
                  { value: 1, name: "好友可见" },
                  { value: 2, name: "开奖可见" },
                  { value: 3, name: "自己可见" },
                ]}
              ></Select>
            </span>
          </div>
          <div className="setItem quick-money">
            <span className="flex justify-center items-center">快选金额</span>
            <span className="inline">
              <div className="moneys">
                {this.state.moneys.map((value, index) => (
                  <input
                    value={value}
                    onChange={(event) => {
                      const inputValue = event.target.value
                      if (/^\d*\.?\d*$/.test(inputValue)) {
                        const moneys = [...this.state.moneys]
                        moneys.splice(index, 1, inputValue)
                        console.log({ moneys })
                        this.setState({ moneys })
                      }
                    }}
                  />
                ))}
              </div>
            </span>
          </div>
          <div className="submit">
            <Button
              onClick={() => {
                this.changeSet()
              }}
            >
              确认
            </Button>
          </div>
        </div>
      </LayoutPage>
    )
  }
}
