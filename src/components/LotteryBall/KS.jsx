import React from "react"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 3
    this.state = {
      loadingOpenCode: [0, 0, 0],
      // display: ''
    }
  }
  componentDidMount() {
    if (this.props.display == "loading") this.randomCode()
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer)
  }
  randomCode() {
    let arr = []
    for (let i = 0; i < this.ballNumber; i++) {
      arr.push(1 + Math.floor(Math.random() * 6))
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
      <div className="ks ball-group number">
        <span className={`ball circle ball-${parseInt(balls[0])}`}></span>
        <span className={`ball circle ball-${parseInt(balls[1])}`}></span>
        <span className={`ball circle ball-${parseInt(balls[2])}`}></span>
      </div>
    )
  }
  renderLoading() {
    let balls = this.state.loadingOpenCode
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="ks ball-group number">
        <span className={`ball circle ball-${parseInt(balls[0])}`}></span>
        <span className={`ball circle ball-${parseInt(balls[1])}`}></span>
        <span className={`ball circle ball-${parseInt(balls[2])}`}></span>
      </div>
    )
  }
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    console.log({ balls })
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="ks ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          <span className={`ball circle ball-${parseInt(balls[0])}`}></span>
          <span className={`ball circle ball-${parseInt(balls[1])}`}></span>
          <span className={`ball circle ball-${parseInt(balls[2])}`}></span>
        </p>
        <span className="text he break-after-all">
          总和{sum}
          <span className={sum < 10 ? "invisible" : "hidden"}>0</span>
        </span>
        <span className="text xt">{sum > 10 ? <em className="大">大</em> : <em className="小">小</em>}</span>
        <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>

        {this.props.showHash && this.props.HashCode && (
          <a className="hash" href={"https://tronscan.org/#/transaction/" + this.props.HashCode} target="_blank"></a>
        )}
      </div>
    )
  }

  render() {
    let map = {
      number: this.renderNumber.bind(this),
      loading: this.renderLoading.bind(this),
      numberWithXt: this.renderNumberWithXt.bind(this),
      recordNumber: this.renderNumberWithXt.bind(this),
    }
    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
