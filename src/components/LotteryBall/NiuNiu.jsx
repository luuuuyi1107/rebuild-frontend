import React from "react"
import util from "@/magic/util"
import DynamicSvg from "@/components/DynamicSvg"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 5
    this.state = {
      loadingOpenCode: [0, 0, 0, 0, 0],
    }
  }
  componentDidMount() {
    if (this.props.display == "loading") {
      this.randomCode()
    }
  }
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  renderLoading() {
    return (
      <div className="niuniu">
        {this.state.loadingOpenCode.map((item, index) => (
          <span key={index} className="ball circle">
            {item}
          </span>
        ))}
      </div>
    )
  }

  numberWithNiuCard() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="niuniu">
        <span className="time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="issue">{this.props.GameID}期</span>
        <p className="cards">
          {balls.map((item, pos) => (
            <DynamicSvg key={`latest_draw_${pos}`} style={{ width: 19, height: 26 }} className="card" svgPath={`lotteryBall/heart${item}`} />
          ))}
        </p>
        <div className="total"></div>
        {/*<div className="result">结果</div>*/}

        {/*设计图 无哈希验证*/}
        {/*{*/}
        {/*    this.props.HashCode && <a className="hash" href={"https://tronscan.org/#/transaction/"+this.props.HashCode} target="_blank"></a>*/}
        {/*}*/}
      </div>
    )
  }

  render() {
    let map = {
      loading: this.renderLoading.bind(this),
      numberWithNiuCard: this.numberWithNiuCard.bind(this),
    }

    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
