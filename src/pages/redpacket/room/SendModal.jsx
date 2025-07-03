import React from "react"
import CustomIcon from "@/components/CustomIcon"
import { ListItem, Button } from "react-onsenui"

import "./SendModal.scss"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  state = {
    lei: false,
    money: 0,
  }
  selectLei(lei) {
    this.setState({ lei: lei })
  }
  onSend() {
    if (isNaN(this.state.money) || +this.state.money > +this.props.maxMoney || +this.state.money < +this.props.minMoney) {
      notificationAsync.alert(`金额限制${this.props.minMoney}-${this.props.maxMoney}`, { title: "金额限制" })
      return
    }
    if (this.state.lei === false) {
      notificationAsync.alert(`请选择雷号`, { title: "请选择雷号" })
      return
    }
    this.props.onSend && this.props.onSend({ money: this.state.money, mines: this.state.lei })
  }
  render() {
    return (
      <div className="send-redpacket-box box">
        <div className="hd">
          <h5>发送红包</h5>
        </div>
        <div className="bd">
          <div className="summary">&yen;&nbsp;{this.state.money || 0}</div>
          <div className="amount">
            <ListItem>
              <div className="left">发包金额</div>
              <div className="center">
                <input type="number" placeholder="请输入金额" onChange={(e) => this.setState({ money: e.target.value })} />
              </div>
              <div className="right">元</div>
            </ListItem>
            <ListItem>
              <div className="left">红包个数</div>
              <div className="center">
                <span>{this.props.redNum}</span>
              </div>
              <div className="right">包</div>
            </ListItem>
          </div>
          <div className="tip">
            红包发包范围:{this.props.minMoney}-{this.props.maxMoney}
          </div>
          <div className="lei">
            <ListItem>
              <div className="left">雷号</div>
              <div className="center">1</div>
              <div className="right">个</div>
            </ListItem>
            <ul>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => {
                return (
                  <li key={item} onClick={this.selectLei.bind(this, item)} className={this.state.lei === item ? "on" : ""}>
                    <span>{item}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="send-button">
            <Button onClick={this.onSend.bind(this)}>赛进钱包</Button>
            <p>未领取的红包,将于5分钟后发起退款</p>
          </div>
        </div>
      </div>
    )
  }
}
