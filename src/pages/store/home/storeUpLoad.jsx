import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Page, Button, List, Modal, Icon } from "react-onsenui"
import "./style.scss"
import InputBox from "@/components/InputBox"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      amount: null,
      count: null,
      // storeClose:props.storeDetail.Closed
    }
  }

  upLoad() {
    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate, { title: "设置信息错误" })
      return
    }

    this.setState({ apiLoading: true })
    action.post("Shop/Sold", { amount: this.state.amount, count: this.state.count }, (res) => {
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        notificationAsync.alert(res.Message, { title: "操作提示" })
        return
      }
      notificationAsync.alert(res.Message, { title: "成功" })
    })
  }

  check() {
    if (!this.state.amount) {
      return "商品金额不能为空!"
    }
    if (!this.state.count) {
      return "商品库存不能为空!"
    }

    return ""
  }

  render() {
    return (
      <LayoutPage className={"store-area-modal " + this.props.type} title={this.props.title} onBack={this.props.onBack} right={null}>
        <div>
          <div className="store-top" key="storeAvatar">
            <InputBox
              placeholder="单件商品金额"
              type="number"
              name="amount"
              onChange={(value) => {
                this.setState({ amount: value })
              }}
              value={this.state.amount}
            />
            <InputBox
              placeholder="商品库存"
              type="number"
              name="amount"
              onChange={(value) => {
                this.setState({ count: value })
              }}
              value={this.state.count}
            />
            <Button
              onClick={() => {
                this.upLoad()
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
