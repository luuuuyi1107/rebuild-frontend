import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"
import util from "@/magic/util"

import "./style.scss"
import { Button, Icon } from "react-onsenui"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      checkIndex: 0,
      money: 10,
      cardNumber: null,
      cardPass: null,
      apiLoading: false,
    }
  }
  componentDidMount() {}

  deposit() {
    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate)
      return
    }

    this.setState({ apiLoading: true })

    action.post(
      "Pay/Recharge",
      {
        type: this.state.checkIndex,
        money: this.state.money,
        cardNumber: this.state.cardNumber,
        cardPass: this.state.cardPass,
      },
      (res) => {
        this.setState({ apiLoading: false })
        if (res.Code == 1) {
          notificationAsync.alert(res.Message, { title: "成功" })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      }
    )
  }

  check() {
    if (this.state.checkIndex == null) {
      return "请选择充值卡类型!"
    }
    if (!this.state.money) {
      return "请选择充值面额!"
    }
    if (!this.state.cardNumber) {
      return "充值卡号不能为空!"
    }
    if (!this.state.cardPass) {
      return "充值密码不能为空!"
    }

    return ""
  }

  render() {
    return (
      <LayoutPage className="site-deposit-card" center="充值卡充值" apiLoading={this.state.apiLoading}>
        <div className="content">
          <div className={this.state.checkIndex == 0 ? "item checked" : "item"} onClick={() => this.setState({ checkIndex: 0 })}>
            <div className="inline chose-tile">
              <p className="p1">中国移动:</p>
              <p className="p2">移动(100%)</p>
            </div>
            <div className="inline check-btn">
              <div className="btn-inner">{this.state.checkIndex == 0 && <Icon icon="ion-android-done" />}</div>
            </div>
          </div>
          <div className={this.state.checkIndex == 1 ? "item checked" : "item"} onClick={() => this.setState({ checkIndex: 1 })}>
            <div className="inline chose-tile">
              <p className="p1">中国联通:</p>
              <p className="p2">联通(100%)</p>
            </div>
            <div className="inline check-btn">
              <div className="btn-inner">{this.state.checkIndex == 1 && <Icon icon="ion-android-done" />}</div>
            </div>
          </div>
          <div className={this.state.checkIndex == 2 ? "item checked" : "item"} onClick={() => this.setState({ checkIndex: 2 })}>
            <div className="inline chose-tile">
              <p className="p1">中国电信:</p>
              <p className="p2">电信(100%)</p>
            </div>
            <div className="inline check-btn">
              <div className="btn-inner">{this.state.checkIndex == 2 && <Icon icon="ion-android-done" />}</div>
            </div>
          </div>

          <div className="item money-box">
            <div className="inline">充值面额:</div>
            <div className="inline">
              <span className={this.state.money == 10 ? "moneyBtn select" : "moneyBtn"} onClick={() => this.setState({ money: 10 })}>
                10
              </span>
              <span className={this.state.money == 30 ? "moneyBtn select" : "moneyBtn"} onClick={() => this.setState({ money: 30 })}>
                30
              </span>
              <span className={this.state.money == 50 ? "moneyBtn select" : "moneyBtn"} onClick={() => this.setState({ money: 50 })}>
                50
              </span>
              <span className={this.state.money == 100 ? "moneyBtn select" : "moneyBtn"} onClick={() => this.setState({ money: 100 })}>
                100
              </span>
            </div>
          </div>
          <div className="item card-num">
            <div className="inline">充值卡号：</div>
            <div className="inline">
              <InputBox
                placeholder="请输入充值卡卡号"
                type="number"
                name="cardNumber"
                onChange={(value) => {
                  this.setState({ cardNumber: value })
                }}
                value={this.state.cardNumber}
              />
            </div>
          </div>
          <div className="item pwd">
            <div className="inline">充值密码：</div>
            <div className="inline">
              <InputBox
                placeholder="请输入充值卡密码"
                type="password2"
                name="cardPass"
                onChange={(value) => {
                  this.setState({ cardPass: value })
                }}
                value={this.state.cardPass}
              />
            </div>
          </div>

          <div className="submit">
            <Button
              onClick={() => {
                this.deposit()
              }}
            >
              确认
            </Button>
          </div>

          {/*{this.state.accounts.length>1&&*/}
          {/*<ActionSheet isOpen={!!this.state.accountChange}*/}
          {/*onCancel={()=>{this.setState({accountChange: false})}}*/}
          {/*animation='default'*/}
          {/*isCancelable={true}>*/}
          {/*{*/}
          {/*this.state.accounts.map((item,index) => <ActionSheetButton key={"accountsNo"+index} onClick={()=>this.setState({accountsNo:index,accountChange: false})}>{item.BankAddress+" - "+item.Payee}</ActionSheetButton>)*/}
          {/*}*/}

          {/*<ActionSheetButton onClick={()=>{this.setState({accountChange: false})}} icon={'md-close'}>取消</ActionSheetButton>*/}
          {/*</ActionSheet>*/}
          {/*}*/}
        </div>
      </LayoutPage>
    )
  }
}
