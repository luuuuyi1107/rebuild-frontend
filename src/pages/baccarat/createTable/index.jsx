import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button, Switch } from "react-onsenui"
import BaccaratNavigatorBar from "@/components/BaccaratNavigatorBar"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        baccaratSet: null,
        guarantee: null,
        handMax: null,
        maxHide: null,
        pokerTime: null,
        code: null,
        anonymous: false,
        loading: true,
        apiLoading: false,
      }
    }
    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      let res = await action.post("Baccarat/BeiLv")
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      this.setState({ baccaratSet: res.Data, loading: false })
    }

    openTable() {
      let validate = this.check()
      if (validate) {
        notificationAsync.alert(validate, { title: "设置信息错误" })
        return
      }

      let query = {
        guarantee: this.state.guarantee,
        handMax: this.state.handMax,
        maxHide: this.state.maxHide,
        pokerTime: this.state.pokerTime,
        anonymous: this.state.anonymous,
      }
      if (this.state.code) {
        Object.assign(query, { code: this.state.code })
      }
      this.setState({ apiLoading: true })
      action.post("Baccarat/KaiZhuang", query, (res) => {
        this.setState({ apiLoading: false })
        if (res.Code == 1) {
          notificationAsync.alert(res.Message, { title: "成功" })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      })
    }

    check() {
      let baccaratSet = this.state.baccaratSet
      if (!this.state.guarantee) {
        return "彩池不能为空"
      }
      if (!this.state.handMax) {
        return "局数不能为空"
      }
      if (!this.state.maxHide) {
        return "上限额度不能为空"
      }
      if (!this.state.pokerTime) {
        return "开牌时间不能为空"
      }
      let r = /^[0-9]*[1-9][0-9]*$/ //正整数
      if (!r.test(this.state.guarantee)) {
        return "彩池须为整数!"
      }
      if (!r.test(this.state.handMax)) {
        return "局数须为整数!"
      }
      if (!r.test(this.state.maxHide)) {
        return "上限额度须为整数!"
      }
      if (!r.test(this.state.pokerTime)) {
        return "开牌时间须为整数!"
      }
      if (this.state.guarantee < baccaratSet.MakersLows || this.state.guarantee > baccaratSet.MakersHigh) {
        return "开桌彩池最低" + baccaratSet.MakersLows + ",最高" + baccaratSet.MakersHigh
      }
      if (this.state.handMax < baccaratSet.HandLows || this.state.handMax > baccaratSet.HandMaxs) {
        return "局数设定最小" + baccaratSet.HandLows + ",最大" + baccaratSet.HandMaxs
      }
      if (this.state.maxHide < this.state.guarantee / 10 || this.state.maxHide > this.state.guarantee / 2) {
        return "上限额度为彩池金额的1/10到1/2之间"
      }
      if (this.state.pokerTime < baccaratSet.MinTime || this.state.pokerTime > baccaratSet.MaxTime) {
        return "开牌时间为" + baccaratSet.MinTime + "秒到" + baccaratSet.MaxTime + "秒之间"
      }
      return ""
    }

    render() {
      let baccaratSet = this.state.baccaratSet
      return (
        <LayoutPage
          className="create-table"
          apiLoading={this.state.apiLoading}
          loading={this.state.loading}
          center="开庄"
          right={null}
          renderFixed={() => <BaccaratNavigatorBar active="create" />}
        >
          <div className="content">
            <div className=" item accountBalance">
              <div className="inline">桌面彩池:</div>
              <div className="inline">
                <InputBox
                  placeholder={baccaratSet ? "开桌彩池最低" + baccaratSet.MakersLows + ",最高" + baccaratSet.MakersHigh : ""}
                  type="number"
                  name="amount"
                  onChange={(value) => {
                    this.setState({ guarantee: value })
                  }}
                  value={this.state.guarantee}
                />
              </div>
            </div>
            <div className="item">
              <div className="inline">设定局数:</div>
              <div className="inline">
                <InputBox
                  placeholder={baccaratSet ? "局数设定最小" + baccaratSet.HandLows + ",最大" + baccaratSet.HandMaxs : ""}
                  type="number"
                  name="amount"
                  onChange={(value) => {
                    this.setState({ handMax: value })
                  }}
                  value={this.state.handMax}
                />
              </div>
            </div>
            <div className="item">
              <div className="inline">上限额度:</div>
              <div className="inline">
                <InputBox
                  placeholder="上限额度为彩池的1/10到1/2之间"
                  type="number"
                  name="pass"
                  onChange={(value) => {
                    this.setState({ maxHide: value })
                  }}
                  value={this.state.maxHide}
                />
              </div>
            </div>
            <div className="item">
              <div className="inline">开牌时间:</div>
              <div className="inline">
                <InputBox
                  placeholder={baccaratSet ? "开牌时间为" + baccaratSet.MinTime + "到" + baccaratSet.MaxTime + "之间,单位秒" : ""}
                  type="number"
                  name="pass"
                  onChange={(value) => {
                    this.setState({ pokerTime: value })
                  }}
                  value={this.state.pokerTime}
                />
              </div>
            </div>
            <div className="item">
              <div className="inline">邀请码:</div>
              <div className="inline">
                <InputBox
                  placeholder="设置邀请码(可选)"
                  type="text"
                  name="pass"
                  onChange={(value) => {
                    this.setState({ code: value })
                  }}
                  value={this.state.code}
                />
              </div>
            </div>
            <div className="item checkbox">
              <div className="inline">匿名访问:</div>
              <div className="inline">
                <Switch
                  checked={this.state.anonymous}
                  onClick={() => {
                    this.setState({ anonymous: !this.state.anonymous })
                  }}
                />
              </div>
            </div>
            <div className="tip">
              <p>系统限制每人24小时内只能开庄3次</p>
            </div>
            <div className="submit">
              <Button
                onClick={() => {
                  this.openTable()
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
)
