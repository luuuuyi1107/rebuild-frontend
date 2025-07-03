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
    }, 250)
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
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="ssc ball-group small number-with-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        {/*{*/}
        {/*    this.props.HashCode && <a className="hash-less" href={"https://tronscan.org/#/transaction/"+this.props.HashCode} target="_blank"></a>*/}
        {/*}*/}
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
        <span className="text xt">{sum > 22 ? <em className="大">大</em> : <em className="小">小</em>}</span>
        <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>
      </div>
    )
  }

  renderRecordNumber() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="ssc ball-group small record-number row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls test">
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
      <div className="ssc ball-group small record-dx row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) >= 5 ? "大" : "小"}`}>
              {parseInt(item) >= 5 ? "大" : "小"}
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
      <div className="ssc ball-group small record-ds row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) % 2 == 1 ? "单" : "双"}`}>
              {parseInt(item) % 2 == 1 ? "单" : "双"}
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
    let xt = this.props.XingTai
    return (
      <div className="ssc ball-group small record-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm:ss", 8)}</span>
        <span className="text issue">{this.props.GameID}</span>
        <span className="text he">总和{sum}</span>
        <span className={`text xt dxds ${xt.ZhXt}`}>{xt.ZhXt}</span>
        <span className={`text xt lh ${xt.LongHu}`}>{xt.LongHu}</span>
        <span className={`text xt niu ${xt.Niu}`}>{xt.Niu}</span>
        <span className={`text xt jack ${xt.Jack}`}>{xt.Jack}</span>
        <span className={`text xt q3xt ${xt.Q3XT}`}>{xt.Q3XT}</span>
        <span className={`text xt z3xt ${xt.Z3XT}`}>{xt.Z3XT}</span>
        <span className={`text xt h3xt ${xt.H3XT}`}>{xt.H3XT}</span>
      </div>
    )
  }
  renderRecordBH() {
    let balls = this.props.OpenCode.split(",")
    let hashCode = this.props.HashCode
    let sum = parseInt(balls[0]) + parseInt(balls[1])

    const hxBuCode = (str) => {
      var arr = [],
        newStr = ""
      for (var i = 0; i < 10; i++) {
        if (str.indexOf(i) < 0) {
          if (i) {
            arr.push(i)
          } else {
            arr.push(10)
          }
        }
      }

      if (arr.length) {
        newStr = arr.join(", ")
      } else {
        newStr = "无"
      }
      return newStr
    }

    return (
      <div className="pks ball-group small record-bh row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <span className="text bh">
          补号:
          <span className="ball">{hxBuCode(hashCode)}</span>
        </span>
        <span className="text fill">
          {hashCode && <a className="hash" href={"https://tronscan.org/#/transaction/" + hashCode} target="_blank"></a>}
        </span>
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
      recordBH: this.renderRecordBH.bind(this),
    }
    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
