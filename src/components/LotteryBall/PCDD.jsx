import React from "react"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 3
    this.state = {
      loadingOpenCode: [0, 0, 0],
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
    }, 250)
  }
  renderNumber() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="pcdd ball-group number">
        <span className="ball circle">{balls[0]}</span>
        <span className="text">+</span>
        <span className="ball circle">{balls[1]}</span>
        <span className="text">+</span>
        <span className="ball circle">{balls[2]}</span>
        <span className="text">=</span>
        <span className="ball circle">{sum}</span>
      </div>
    )
  }
  renderLoading() {
    let balls = this.state.loadingOpenCode
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="pcdd ball-group number">
        <span className="ball circle">{balls[0]}</span>
        <span className="text">+</span>
        <span className="ball circle">{balls[1]}</span>
        <span className="text">+</span>
        <span className="ball circle">{balls[2]}</span>
        <span className="text">=</span>
        <span className="ball circle">{sum}</span>
      </div>
    )
  }
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="pcdd ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          <span className="ball circle">{balls[0]}</span>
          <span className="text">+</span>
          <span className="ball circle">{balls[1]}</span>
          <span className="text">+</span>
          <span className="ball circle">{balls[2]}</span>
          <span className="text">=</span>
          <span className="ball circle">{sum}</span>
        </p>
        <span className="text xt">{sum > 13 ? <em className="大">大</em> : <em className="小">小</em>}</span>
        <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>
      </div>
    )
  }
  renderRecordNumber() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="pcdd ball-group small record-number row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          <span className="ball circle">{balls[0]}</span>
          <span className="text">+</span>
          <span className="ball circle">{balls[1]}</span>
          <span className="text">+</span>
          <span className="ball circle">{balls[2]}</span>
          <span className="text">=</span>
          <span className="ball circle">{sum}</span>
        </p>
      </div>
    )
  }
  renderRecordXT() {
    const getSebo = function (sum) {
      if ([3, 6, 9, 12, 15, 18, 21, 24].indexOf(sum) > -1) {
        return "红波"
      }
      if ([1, 4, 7, 10, 16, 19, 22, 25].indexOf(sum) > -1) {
        return "绿波"
      }
      if ([2, 5, 8, 11, 17, 20, 23, 26].indexOf(sum) > -1) {
        return "蓝波"
      }
      return "-"
    }
    const getJizhi = function (sum) {
      if ([0, 1, 2, 3, 4, 5].indexOf(sum) > -1) {
        return "极小"
      }
      if ([22, 23, 24, 25, 26, 27].indexOf(sum) > -1) {
        return "极大"
      }
      return "-"
    }
    const getXt = function (balls) {
      if (balls[0] == balls[1] && balls[1] == balls[2]) {
        return "豹子"
      }
      if (balls[0] == balls[1] || balls[1] == balls[2] || balls[0] == balls[3]) {
        return "对子"
      }
      let copy = Object.assign([], balls)
      let res = copy.join("")
      if (["012", "123", "234", "345", "456", "567", "678", "789"].indexOf(res) > -1) {
        return "顺子"
      }
      return "-"
    }
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="pcdd ball-group small record-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <span className="text he break-after-all">
          {sum}
          <span className={sum < 10 ? "invisible" : "hidden"}>0</span>
        </span>
        <span className="text sebo">{getSebo(sum)}</span>
        <span className={`text dx ${sum <= 13 ? "小" : "大"}`}>{sum <= 13 ? "小" : "大"}</span>
        <span className={`text ds ${sum % 2 == 1 ? "单" : "双"}`}>{sum % 2 == 1 ? "单" : "双"}</span>
        <span className={`text jz ${getJizhi(sum)}`}>{getJizhi(sum)}</span>
        <span className={`text dz ${getXt(balls)}`}>{getXt(balls)}</span>
      </div>
    )
  }

  render() {
    let map = {
      number: this.renderNumber.bind(this),
      loading: this.renderLoading.bind(this),
      numberWithXt: this.renderNumberWithXt.bind(this),
      recordNumber: this.renderNumberWithXt.bind(this),
      recordXT: this.renderRecordXT.bind(this),
    }
    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
