import React from "react"

import "./style.scss"
import { Button } from "react-onsenui"
import * as action from "@/action"
import CustomIcon from "@/components/CustomIcon"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)

    var limitLow = 0
    var limitHigh = 999999
    var formInfoStr = util.cache.get("default_forum_info")
    if (formInfoStr != null) {
      var formInfo = JSON.parse(formInfoStr)
      if (formInfo.PostSet && formInfo.PostSet.DonateAmountLimit) {
        limitLow = formInfo.PostSet.DonateAmountLow
        limitHigh = formInfo.PostSet.DonateAmountHigh
      }
    }
    this.state = {
      amount: "",
      limitLow: limitLow,
      limitHigh: limitHigh,
    }
  }

  handleChange(e) {
    // e.preventDefault();
    var value = e.target.value.replace(/[^0-9-]+/, "")
    this.setState({
      amount: value,
    })
  }

  onBtnClick(confirm) {
    if (confirm) {
      let unitInt = parseInt(this.state.amount)
      if (isNaN(unitInt) || unitInt <= 0) {
        notificationAsync.alert("请输入正确打赏金额")
        return
      }

      var tid = util.getUrlParam("tid")
      let d = action.post("betpost/donate", { id: tid, money: this.state.amount })
      d.then((res) => {
        if (res.Code === 1) {
          this.props.updateModalState("DONATE", false, true)
          this.setState({
            amount: "",
          })
          notificationAsync.alert(res.Message, { title: "成功" })
        } else {
          notificationAsync.alert(res.Message, { title: "失败" })
        }
      })
    } else {
      this.props.updateModalState("DONATE", false, false)
    }
  }

  render() {
    var ticket_details = this.props.ticket_details
    if (!ticket_details) {
      return <div />
    }
    return (
      <div className="modal-inner">
        <div className="lotto_title_method">打赏版主</div>

        <div className="recommend_box">
          {/* Relative */}
          <div className="recommend_bet">{ticket_details.PostDetail.NickName}</div>

          <div className="betting_area">
            <div className="title_shape">
              <CustomIcon style={{ width: 18, height: 18 }} type={require("../icons/action_state_donate.svg")} />
              <span className="title">打赏金额</span>
            </div>

            {/* 输入框*/}
            <input
              value={this.state.amount}
              type="number"
              placeholder={`打赏金额¥${this.state.limitLow} - ${this.state.limitHigh}`}
              onChange={this.handleChange.bind(this)}
            />
          </div>
        </div>
        <div className="bottom_bar">
          <Button className="confirm-btn" onClick={this.onBtnClick.bind(this, true)}>
            确认
          </Button>
          <div className="divider_vertical" />
          <Button className="cancel-btn" onClick={this.onBtnClick.bind(this, false)}>
            取消
          </Button>
        </div>
      </div>
    )
  }
}
