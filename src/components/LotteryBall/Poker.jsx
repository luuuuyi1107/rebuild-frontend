import React from "react"
import util from "@/magic/util"

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

  renderNumber() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="ssc ball-group number">
        {balls.map((item, index) => (
          <span key={index} className="ball circle">
            {item}
          </span>
        ))}
      </div>
    )
  }
  renderLoading() {
    return (
      <div className="ssc ball-group number">
        {this.state.loadingOpenCode.map((item, index) => (
          <span key={index} className="ball circle">
            {item}
          </span>
        ))}
      </div>
    )
  }

  renderRecordNumber() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="ssc ball-group small record-number row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className="ball circle">
              {item}
            </span>
          ))}
        </p>
        {this.props.HashCode && <a className="hash" href={"https://tronscan.org/#/transaction/" + this.props.HashCode} target="_blank"></a>}
      </div>
    )
  }

  render() {
    let map = {
      number: this.renderNumber.bind(this),
      loading: this.renderLoading.bind(this),
      recordNumber: this.renderRecordNumber.bind(this),
    }
    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
