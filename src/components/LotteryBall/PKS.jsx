import React from "react"
import util from "@/magic/util"
import classNames from "classnames"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 10
    this.state = {
      loadingOpenCode: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    const hashAnswerReplacement = this.countHashAnswerReplacement()
    return (
      <div className="pks ball-group number">
        {balls.map((item, index) => (
          <span
            key={index}
            className={classNames("ball", "circle", `ball-${parseInt(item)}`, {
              "hash-replacement": hashAnswerReplacement.includes(+item), // || Math.random() * 2 > 1,
            })}
          >
            {item}
          </span>
        ))}
      </div>
    )
  }
  renderLoading() {
    return (
      <div className="pks ball-group number loading">
        {this.state.loadingOpenCode.map((item, index) => (
          <span key={index} className={`ball circle ball-${item}`}>
            {item}
          </span>
        ))}
      </div>
    )
  }
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    const hashAnswerReplacement = this.countHashAnswerReplacement()
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="pks ball-group small number-with-xt row">
        <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span
              key={index}
              className={classNames("ball", "circle", `ball-${parseInt(item)}`, {
                "hash-replacement": hashAnswerReplacement.includes(+item),
              })}
            >
              {item}
            </span>
          ))}
        </p>
      </div>
    )
  }
  renderRecordDX() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="pks ball-group small record-dx row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) <= 5 ? "小" : "大"}`}>
              {parseInt(item) <= 5 ? "小" : "大"}
            </span>
          ))}
        </p>
      </div>
    )
  }
  renderRecordDS() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="pks ball-group small record-ds row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) % 2 == 1 ? "单" : "双"}`}>
              {parseInt(item) % 2 == 1 ? "单" : "双"}
            </span>
          ))}
        </p>
      </div>
    )
  }
  renderRecordXT() {
    let balls = this.props.OpenCode.split(",")
    let sum = parseInt(balls[0]) + parseInt(balls[1])
    return (
      <div className="pks ball-group small record-xt row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <span className="text he break-after-all">
          {sum}
          <span className={sum < 10 ? "invisible" : "hidden"}>0</span>
        </span>
        <span className={`text xt ${sum <= 11 ? "小" : "大"}`}>{sum <= 11 ? "小" : "大"}</span>
        <span className={`text xt ${sum % 2 == 1 ? "单" : "双"}`}>{sum % 2 == 1 ? "单" : "双"}</span>
        <p className="balls">
          {balls.map((item, index) => {
            if (index < 5) {
              return (
                <span key={index} className={`ball circle ${parseInt(item) > parseInt(balls[9 - index]) ? "龙" : "虎"}`}>
                  {parseInt(item) > parseInt(balls[9 - index]) ? "龙" : "虎"}
                </span>
              )
            }
          })}
        </p>
      </div>
    )
  }

  countHashAnswerReplacement() {
    const res = []
    const hashCode = this.props.HashCode
    if (!hashCode) return res
    for (var i = 0; i < 10; i++) {
      if (hashCode.indexOf(i) < 0) {
        if (i == 0) {
          res.push(10)
        } else {
          res.push(i)
        }
      }
    }
    return res
  }

  renderRecordBH() {
    const hashCode = this.props.HashCode
    const hashAnswerReplacement = this.countHashAnswerReplacement()
    const hashAnswerReplacementTxt = hashAnswerReplacement.length ? hashAnswerReplacement.join(", ") : "无"

    return (
      <div className="pks ball-group small record-bh row">
        <span className="text time">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text issue">{this.props.GameID}期</span>
        <span className="text bh">
          补号:
          <span className="ball">{hashAnswerReplacementTxt}</span>
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
      recordNumber: this.renderNumberWithXt.bind(this),
      recordDX: this.renderRecordDX.bind(this),
      recordDS: this.renderRecordDS.bind(this),
      recordXT: this.renderRecordXT.bind(this),
      recordBH: this.renderRecordBH.bind(this), // 哈希PK10補號
    }
    if (map[this.props.display]) {
      return map[this.props.display]()
    }
    return null
  }
}
