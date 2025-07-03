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
  randomCode() {
    let arr = []
    for (let i = 0; i < this.ballNumber; i++) {
      arr.push(Math.floor(Math.random() * 10))
    }
    this.setState({ loadingOpenCode: arr })

    this.timer = setTimeout(() => {
      this.randomCode()
    }, 200)
  }
  renderNumber() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="syxw ball-group number">
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
      <div className="syxw ball-group number">
        {this.state.loadingOpenCode.map((item, index) => (
          <span key={index} className="ball circle">
            {item}
          </span>
        ))}
      </div>
    )
  }
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="syxw ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className="ball circle">
              {item}
            </span>
          ))}
        </p>
        <span className="text he break-after-all">
          总和{sum}
          <span className={sum < 10 ? "invisible" : "hidden"}>0</span>
        </span>
        <span className="text xt">{sum > 30 ? <em className="大">大</em> : sum == 30 ? <em className="和">和</em> : <em className="小">小</em>}</span>
        <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>
      </div>
    )
  }
  renderRecordNumber() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="syxw ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
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
  renderRecordDX() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="syxw ball-group small record-ds row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) <= 5 ? "小" : parseInt(item) <= 10 ? "大" : "和"}`}>
              {parseInt(item) <= 5 ? "小" : parseInt(item) <= 10 ? "大" : "和"}
            </span>
          ))}
        </p>
        {this.props.HashCode && <a className="hash" href={"https://tronscan.org/#/transaction/" + this.props.HashCode} target="_blank"></a>}
      </div>
    )
  }
  renderRecordDS() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="syxw ball-group small record-ds row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) == 11 ? "和" : parseInt(item) % 2 == 1 ? "单" : "双"}`}>
              {parseInt(item) == 11 ? "和" : parseInt(item) % 2 == 1 ? "单" : "双"}
            </span>
          ))}
        </p>
        {this.props.HashCode && <a className="hash" href={"https://tronscan.org/#/transaction/" + this.props.HashCode} target="_blank"></a>}
      </div>
    )
  }
  renderRecordXT() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="syxw ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <span className="text he">总和{sum}</span>
        <span className="text xt">{sum > 30 ? <em className="大">大</em> : sum == 30 ? <em className="和">和</em> : <em className="小">小</em>}</span>
        <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>
      </div>
    )
  }

  render() {
    let map = {
      number: this.renderNumber.bind(this),
      loading: this.renderLoading.bind(this),
      numberWithXt: this.renderNumberWithXt.bind(this),
      recordNumber: this.renderRecordNumber.bind(this),
      recordDX: this.renderRecordDX.bind(this),
      recordDS: this.renderRecordDS.bind(this),
      recordXT: this.renderRecordXT.bind(this),
    }
    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
