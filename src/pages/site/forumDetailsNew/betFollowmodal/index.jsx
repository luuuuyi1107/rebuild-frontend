import React from "react"

import "../model.scss"
import { Button } from "react-onsenui"
import * as action from "@/action"
import CustomIcon from "@/components/CustomIcon"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      amount: "",
    }
  }

  handleChange(e) {
    // e.preventDefault();
    var value = e.target.value.replace(/[^0-9-]+/, "")
    this.setState({
      amount: value,
    })
  }
  /***
   *
   * @param confirm
   * @param ticket_details
   * @param singleBetAmount 这个注单 共 X注
   */
  onBtnClick(confirm, ticket_details, singleBetAmount) {
    if (confirm) {
      let unitInt = parseInt(this.state.amount)
      if (isNaN(unitInt) || unitInt <= 0) {
        notificationAsync.alert("请输入正确跟单金额")
        return
      }

      if (ticket_details == null) {
        notificationAsync.alert("数据错误请重新登陆")
        return
      }

      const lotteryid = util.getUrlParam("id")
      const lx = ticket_details.PostDetail.BetLx
      // if ((lx == '51' || lx == '52') && !ticket_details.PostDetail.BetText.includes('|')) { // 正一~正六系列
      //     const _playType = util.convertChineseToNumber(ticket_details.PostDetail.PlayType);
      //     // const games = lx == '51'
      //     //     ? ['一', '二', '三', '四', '五', '六'].map(num => `正${num}`)
      //     //     : new Array(6).fill(1).map((val, idx) => `正特${val + idx}`)
      //     const position = new Array(6).fill(1).map((val, idx) => (val + idx) + '').findIndex((num) => _playType.includes(num));
      //     if (position >= 0) {
      //         ticket_details.PostDetail.BetText = new Array(6).fill('').map((_, idx) => idx === position ? ticket_details.PostDetail.BetText:'').join('|');
      //     }
      // }

      //TODO 这边目前支持六合彩
      action
        .post("Lottery/Bet", {
          lotteryid,
          lx,
          money: this.state.amount,
          betText: ticket_details.PostDetail.BetText,
        })
        .then((res) => {
          if (res.Code != 1) {
            notificationAsync.alert(res.Message, { title: "操作提示" })
            return
          }
          var tid = util.getUrlParam("tid")

          //跟单接口 - 总注数 * 总投注金额
          let d = action.post("BetPost/Follow", {
            id: tid,
            money: singleBetAmount * unitInt,
          })
          d.then((FollowRes) => {
            if (FollowRes.Code === 1) {
              this.setState({
                amount: "",
              })
              this.props.updateModalState("FOLLOW", false, true)
              notificationAsync.alert("跟投成功", { title: "恭喜您!" })
            } else {
              notificationAsync.alert(FollowRes.Message, { title: "失败" })
            }
          })
        })
    } else {
      this.props.updateModalState("FOLLOW", false, false)
    }
  }

  render() {
    var ticket_details = this.props.ticket_details
    if (!ticket_details) {
      return <div />
    }
    //当前注数 = 总金额BetCount/单笔金额BetMoney
    var singleBetAmount = ticket_details.PostDetail.BetCount / ticket_details.PostDetail.BetMoney

    return (
      <div className="modal-inner">
        <div className="lotto_title_method">
          {this.props.cur_game.name} - {ticket_details.PostDetail.PlayType}
        </div>
        <div className="issue">第 {this.props.cur_issue}期</div>

        <div className="recommend_box">
          <div className="recommend_bet">{ticket_details.PostDetail.BetText.replace(/,/g, " ").replace(/\|/g, "")}</div>
          <div className="betting_area">
            <div className="title_shape">
              <CustomIcon style={{ width: 18, height: 18 }} type={require("../icons/action_state_money.svg")} />
              <span className="title">下注金额</span>
            </div>
            <input value={this.state.amount} type="number" placeholder="请输入金额" maxLength={9} onChange={this.handleChange.bind(this)} />
          </div>
          <div className="total">
            共{singleBetAmount}注，{singleBetAmount * (this.state.amount == "" ? 0 : parseInt(this.state.amount))}元
          </div>
        </div>
        <div className="bottom_bar">
          <Button className="confirm-btn" onClick={this.onBtnClick.bind(this, true, ticket_details, singleBetAmount)}>
            确认
          </Button>
          <div className="divider_vertical" />
          <Button className="cancel-btn" onClick={this.onBtnClick.bind(this, false, ticket_details, singleBetAmount)}>
            取消
          </Button>
        </div>
      </div>
    )
  }
}
