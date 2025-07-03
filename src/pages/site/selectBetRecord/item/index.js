import React from "react"
import util from "@/magic/util"
import "./style.scss"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
  }
  render() {
    let date = util.date.toDate(this.props.BetTime)
    return (
      <div className="select-bet-record-item">
        <div className="left">
          <div>
            <p>{util.date.format(date, "M月DD日", 8)}</p>
            <p>{util.date.format(date, "hh:mm:ss", 8)}</p>
          </div>
        </div>
        <div className="center">
          <div>
            <p className="issue">
              <span>
                <strong>{this.props.GameID}</strong>期
              </span>
              &nbsp;&nbsp;
              <span className="play-type">{this.props.PlayType}</span>
            </p>
            <p className="content">
              <span className="bet-text">{this.props.BetText}</span> &nbsp;
            </p>
          </div>
        </div>
        <div className="right">
          <div className="bonus">
            {this.props.Status == 2 && <span className="unhit">未中奖</span>}
            {this.props.Status == 1 &&
              (this.props.otherUser ? <span className="hit">已中奖</span> : <span className="hit">+{this.props.Bonus}元</span>)}
            {this.props.Status == 0 && <span className="waiting">待开奖</span>}
            {this.props.Status == 3 && <span className="unhit">打和退款</span>}
            {this.props.Status == 4 && <span className="unhit">已撤销</span>}
            {!this.props.otherUser && <span className="amount">金额:{this.props.BetCount}元</span>}
          </div>
        </div>
      </div>
    )
  }
}
