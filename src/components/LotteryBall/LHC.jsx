import React from "react"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 7
    this.state = {
      loadingOpenCode: [0, 0, 0, 0, 0, 0, 0],
    }
  }
  getBallColor(num) {
    num = parseInt(num)
    if ([1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46].indexOf(num) > -1) {
      return "red"
    }
    if ([3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48].indexOf(num) > -1) {
      return "blue"
    }
    if ([5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49].indexOf(num) > -1) {
      return "green"
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

    return (
      <div className="lhc ball-group number">
        <span className={`ball circle ${this.getBallColor(balls[0])}`}>{balls[0]}</span>
        <span className={`ball circle ${this.getBallColor(balls[1])}`}>{balls[1]}</span>
        <span className={`ball circle ${this.getBallColor(balls[2])}`}>{balls[2]}</span>
        <span className={`ball circle ${this.getBallColor(balls[3])}`}>{balls[3]}</span>
        <span className={`ball circle ${this.getBallColor(balls[4])}`}>{balls[4]}</span>
        <span className={`ball circle ${this.getBallColor(balls[5])}`}>{balls[5]}</span>
        <span className="text">+</span>
        <span className={`ball circle ${this.getBallColor(balls[6])}`}>{balls[6]}</span>
      </div>
    )
  }
  renderLoading() {
    let balls = this.state.loadingOpenCode
    return (
      <div className="lhc ball-group number">
        <span className={`ball circle ${this.getBallColor(balls[0])}`}>{balls[0]}</span>
        <span className={`ball circle ${this.getBallColor(balls[1])}`}>{balls[1]}</span>
        <span className={`ball circle ${this.getBallColor(balls[2])}`}>{balls[2]}</span>
        <span className={`ball circle ${this.getBallColor(balls[3])}`}>{balls[3]}</span>
        <span className={`ball circle ${this.getBallColor(balls[4])}`}>{balls[4]}</span>
        <span className={`ball circle ${this.getBallColor(balls[5])}`}>{balls[5]}</span>
        <span className="text">+</span>
        <span className={`ball circle ${this.getBallColor(balls[6])}`}>{balls[6]}</span>
      </div>
    )
  }
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    let sx = this.props.Zodiac.split(",")
    return (
      <div className="lhc ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <div className="balls">
          <div className={`${this.getBallColor(balls[0])}`}>
            <span className={`ball circle ${this.getBallColor(balls[0])}`}>{balls[0]}</span>
            <span className="shengxiao">{sx[0]}</span>
          </div>
          <div className={`${this.getBallColor(balls[1])}`}>
            <span className={`ball circle ${this.getBallColor(balls[1])}`}>{balls[1]}</span>
            <span className="shengxiao">{sx[1]}</span>
          </div>
          <div className={`${this.getBallColor(balls[2])}`}>
            <span className={`ball circle ${this.getBallColor(balls[2])}`}>{balls[2]}</span>
            <span className="shengxiao">{sx[2]}</span>
          </div>
          <div className={`${this.getBallColor(balls[3])}`}>
            <span className={`ball circle ${this.getBallColor(balls[3])}`}>{balls[3]}</span>
            <span className="shengxiao">{sx[3]}</span>
          </div>
          <div className={`${this.getBallColor(balls[4])}`}>
            <span className={`ball circle ${this.getBallColor(balls[4])}`}>{balls[4]}</span>
            <span className="shengxiao">{sx[4]}</span>
          </div>
          <div className={`${this.getBallColor(balls[5])}`}>
            <span className={`ball circle ${this.getBallColor(balls[5])}`}>{balls[5]}</span>
            <span className="shengxiao">{sx[5]}</span>
          </div>
          <div>
            <span className="text">+</span>
          </div>
          <div className={`${this.getBallColor(balls[6])}`}>
            <span className={`ball circle ${this.getBallColor(balls[6])}`}>{balls[6]}</span>
            <span className="shengxiao">{sx[6]}</span>
          </div>
        </div>
        {this.props.showHash && this.props.HashCode && (
          <a className="hash" href={"https://tronscan.org/#/transaction/" + this.props.HashCode} target="_blank"></a>
        )}
      </div>
    )
  }
  renderTM() {
    let TMS = this.props.LiangMian.split(",")
    return (
      <div className="lhc ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <div className="balls TM">
          {TMS.map((TM, index) => {
            if (TM == "") {
              TM = "和局"
            }
            return (
              <span key={TM + index} className="text xt">
                {TM}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  renderHeadNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    let sx = this.props.Zodiac.split(",")
    return (
      <div className="lhc ball-group small number-with-xt row">
        <div className="balls">
          <div className={`${this.getBallColor(balls[0])}`}>
            <span className={`ball circle ${this.getBallColor(balls[0])}`}>{balls[0]}</span>
            <span className="shengxiao">{sx[0]}</span>
          </div>
          <div className={`${this.getBallColor(balls[1])}`}>
            <span className={`ball circle ${this.getBallColor(balls[1])}`}>{balls[1]}</span>
            <span className="shengxiao">{sx[1]}</span>
          </div>
          <div className={`${this.getBallColor(balls[2])}`}>
            <span className={`ball circle ${this.getBallColor(balls[2])}`}>{balls[2]}</span>
            <span className="shengxiao">{sx[2]}</span>
          </div>
          <div className={`${this.getBallColor(balls[3])}`}>
            <span className={`ball circle ${this.getBallColor(balls[3])}`}>{balls[3]}</span>
            <span className="shengxiao">{sx[3]}</span>
          </div>
          <div className={`${this.getBallColor(balls[4])}`}>
            <span className={`ball circle ${this.getBallColor(balls[4])}`}>{balls[4]}</span>
            <span className="shengxiao">{sx[4]}</span>
          </div>
          <div className={`${this.getBallColor(balls[5])}`}>
            <span className={`ball circle ${this.getBallColor(balls[5])}`}>{balls[5]}</span>
            <span className="shengxiao">{sx[5]}</span>
          </div>
          <div>
            <span className="text">+</span>
          </div>
          <div className={`${this.getBallColor(balls[6])}`}>
            <span className={`ball circle ${this.getBallColor(balls[6])}`}>{balls[6]}</span>
            <span className="shengxiao">{this.props.TmSx}</span>
          </div>
        </div>
        {/* {
                    this.props.HashCode && <a className="hash" href={"https://tronscan.org/#/transaction/"+this.props.HashCode} target="_blank"></a>
                } */}
      </div>
    )
  }

  render() {
    let map = {
      number: this.renderNumber.bind(this),
      loading: this.renderLoading.bind(this),
      numberWithXt: this.renderNumberWithXt.bind(this),
      headNumberWithXt: this.renderHeadNumberWithXt.bind(this),
      recordNumber: this.renderNumberWithXt.bind(this),
      recordTM: this.renderTM.bind(this),
    }

    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
