import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import { Icon, Button } from "react-onsenui"
import * as action from "@/action"

import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { throttle } from "lodash"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

function getMaxDaysInMonth(year, month) {
  let date = new Date(year, month, 0)
  return date.getDate()
}
function getPreMonth(date) {
  let year = date.getFullYear()
  let month = date.getMonth()
  let preMonth = new Date(year, month, 0)
  preMonth.setDate(1)
  return preMonth
}
function getNextMonth(date) {
  let year = date.getFullYear()
  let month = date.getMonth()
  let nextMonth = new Date(year, month, 32)
  nextMonth.setDate(1)
  return nextMonth
}
function isBeforeToday(date) {
  let today = new Date()
  let today_zero = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let date_zero = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return today_zero.getTime() > date_zero.getTime()
}
function isAfterToday(date) {
  let today = new Date()
  let today_zero = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let date_zero = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return today_zero.getTime() < date_zero.getTime()
}

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      let today = this.getToday()
      this.state = {
        maxSignDay: 0,
        tabIndex: 0,
        signinRule: {},
        currentMonth: today,
        days: this.getDays(today.getFullYear(), today.getMonth() + 1),
        signinMap: {},
        isOpenRule: false,
        serverDate: null,
      }
    }
    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      let _this = this
      this.loadSigninList()
      let ruleRes = await action.post("Signin/GetSigninRule")
      this.setState({ signinRule: ruleRes.Data })
      let userRes = await getPush()
      this.setState({ serverDate: util.date.toDate(userRes.Data.ServerTime) })
    }

    async loadSigninList(date) {
      date = date || this.state.currentMonth
      let res = await action.post("Signin/GetSigninList", { monthInt: util.date.format(date, "YYYYMM") })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let signinMap = {}
      for (let i = 0; i < res.Data.Item.length; i++) {
        signinMap[res.Data.Item[i].DayInt] = res.Data.Item[i]
      }
      this.setState({
        maxSignDay: res.Data.SigDay,
        signinMap: signinMap,
      })
    }
    isToday(date) {
      let today = this.state.serverDate || new Date()

      let todayStr = util.date.format(today, "YYYYMMDD", 8)
      let dateStr = util.date.format(date, "YYYYMMDD", 8)
      return todayStr == dateStr
    }
    getDays(year, month) {
      let len = getMaxDaysInMonth(year, month)
      let days = []
      for (let i = 0; i < len; i++) {
        days.push(new Date(year, month - 1, i + 1))
      }
      return days
    }
    changeMonth(date) {
      if (isBeforeToday(date) || this.isToday(date)) {
        this.loadSigninList(date)
        this.setState({ currentMonth: date, days: this.getDays(date.getFullYear(), date.getMonth() + 1) })
      } else {
        notificationAsync.alert("已经是最后一月", { title: "日期限制" })
      }
    }
    async getCredit(item) {
      util.trialCheck()
      let res = await action.post("Signin/GetCycleCredit", { day: item.SignDay })
      notificationAsync.alert(res.Message, { title: res.Code == 1 ? "获取奖励成功" : "获取奖励失败" })
    }
    async signin(date) {
      if (this.isToday(date)) {
        let res = await action.post("Signin/Signin")
        notificationAsync.alert(res.Message, { title: res.Code == 1 ? "签到成功" : "签到失败" })
        if (res.Code == 1) {
          this.loadSigninList()
        }
      }
    }
    getToday() {
      if (this.state && this.state.serverDate) {
        return this.state.serverDate
      }
      return new Date()
    }
    render() {
      let today = this.getToday()
      let currentMonth = this.state.currentMonth
      let preMonth = getPreMonth(currentMonth)
      let nextMonth = getNextMonth(currentMonth)
      let signinRule = this.state.signinRule
      let maxSignDay = this.state.maxSignDay
      let signinMap = this.state.signinMap
      return (
        <LayoutPage right={null} center="签到福利" className="signin-page">
          <div className="max-sign-days">
            已坚持&nbsp;<span>{Math.floor(maxSignDay / 10)}</span>
            <span>{maxSignDay % 10}</span>&nbsp;天签到
          </div>
          {signinRule.SignRule && (
            <div className="bonus-rule">
              <ul>
                {signinRule.SignRule.map((item, index) => {
                  return (
                    <li
                      key={item.SignDay}
                      className={`${this.state.tabIndex == index ? "active" : ""}`}
                      onClick={() => {
                        this.setState({ tabIndex: index })
                      }}
                    >
                      签到{item.SignDay}天
                    </li>
                  )
                })}
              </ul>
              <div>
                {signinRule.SignRule.map((item, index) => {
                  return (
                    <div key={item.SignDay} className={`tab ${this.state.tabIndex == index ? "active" : ""}`}>
                      <p>
                        本月连续签到{item.SignDay}天，累计充值￥{item.RecMoney}可领取{item.Credit}积分
                      </p>
                      <Button onClick={this.getCredit.bind(this, item)}>领取{item.SignDay}天奖励</Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="calendar">
            <div className="hd">
              点击当天日期<span>{util.date.format(today, "DD")}</span>即可完成签到&nbsp;&nbsp;
              <Button onClick={this.openModal.bind(this)}>签到规则</Button>
            </div>
            <div className="month">
              <ul>
                <li onClick={this.changeMonth.bind(this, preMonth)}>{util.date.format(preMonth, "MM月")}</li>
                <li className="center">{util.date.format(currentMonth, "MM月")}</li>
                <li onClick={this.changeMonth.bind(this, nextMonth)}>{util.date.format(nextMonth, "MM月")}</li>
              </ul>
            </div>
            <div className="week">
              <ul>
                <li>日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li>六</li>
              </ul>
            </div>
            <div className="day">
              <ul>
                {this.state.days.map((date, index) => {
                  let key = util.date.format(date, "YYYYMMDD")
                  let isSignin = (signinMap[key] && signinMap[key].Signin) || false
                  return (
                    <li
                      key={date.getTime()}
                      onClick={throttle(this.signin.bind(this, date), 300)}
                      className={`day week-${date.getDay()} ${index == 0 ? "first-day" : ""} ${this.isToday(date) ? "today" : ""} ${
                        isAfterToday(date) ? "feture" : ""
                      } ${isBeforeToday(date) ? "passed" : ""} ${isSignin ? "signed" : "unsigned"}`}
                    >
                      {!isSignin && <span>{util.date.format(date, "DD")}</span>}
                      {isSignin && <Icon icon="ion-android-calendar" />}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <ModalPage
            isOpen={this.state.isOpenRule}
            className="signin-rule-modal"
            animation="lift"
            onClose={() => this.setState({ isOpenRule: false })}
          >
            <LayoutPage right={null} center={"签到规则"}>
              <ul>
                <li>
                  <p>会员登录账户，每日可签到一次，签到有【每日签到】商城积分奖励</p>
                </li>
                <li>
                  <p>连续签到天数越长，可获得【连续签到】商城积分奖励，若连续签到中断，则重新计算天数</p>
                </li>
                <li>
                  <p>签到以一个自然月为周期，系统将在每月1日0点清空上月签到记录</p>
                </li>
                <li>
                  <p>【每日签到】积分奖励规则:</p>
                </li>
              </ul>
              <table width="90%" cellSpacing="0">
                <tbody>
                  <tr>
                    <th>历史存款</th>
                    <th>获得积分</th>
                  </tr>
                  {signinRule.DayRules &&
                    signinRule.DayRules.map((item) => {
                      return (
                        <tr key={item.RecMoney}>
                          <td>{item.RecMoney}</td>
                          <td>{item.Credit}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              <ul>
                <li>
                  <p>【连续签到】积分奖励规则:</p>
                </li>
              </ul>
              <table width="90%" cellSpacing="0">
                <tbody>
                  <tr>
                    <th>连续签到天数</th>
                    <th>近30天存款</th>
                    <th>近30天打码</th>
                    <th>历史存款</th>
                    <th>奖励积分</th>
                  </tr>
                  {signinRule.SignRule &&
                    signinRule.SignRule.map((item) => {
                      return (
                        <tr key={item.SignDay}>
                          <td>{item.SignDay}</td>
                          <td>{signinRule.RecTotal}+</td>
                          <td>{signinRule.BetTotal}+</td>
                          <td>{item.RecMoney}</td>
                          <td>{item.Credit}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              <ul>
                <li>
                  <p>本平台保留签到活动最终解释权</p>
                </li>
              </ul>
            </LayoutPage>
          </ModalPage>
        </LayoutPage>
      )
    }

    openModal() {
      this.setState({ isOpenRule: true })
    }
  }
)
