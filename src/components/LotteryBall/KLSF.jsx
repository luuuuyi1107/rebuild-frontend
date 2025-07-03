import React from "react"
import util from "@/magic/util"
const WXMap = {
  "01": "东春木中",
  "02": "南春水中",
  "03": "西春火中",
  "04": "北春土中",
  "05": "东春金中",
  "06": "南夏木中",
  "07": "西夏水中",
  "08": "北夏火发",
  "09": "东夏土发",
  10: "南夏金发",
  11: "西秋木发",
  12: "北秋水发",
  13: "东秋火发",
  14: "南秋土发",
  15: "西秋金白",
  16: "北冬木白",
  17: "东冬水白",
  18: "南冬火白",
  19: "西冬土白",
  20: "北冬金白",
}
export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 8
    this.state = {
      loadingOpenCode: [0, 0, 0, 0, 0, 0, 0, 0],
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
      <div className="klsf ball-group number">
        {balls.map((item, index) => (
          <span key={index} className={`ball circle ball-${parseInt(item)}`}>
            {item}
          </span>
        ))}
      </div>
    )
  }
  renderLoading() {
    return (
      <div className="klsf ball-group number loading">
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
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="klsf ball-group small number-with-xt row">
        <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ball-${parseInt(item)}`}>
              {item}
            </span>
          ))}
        </p>
        <span className="text he break-after-all">
          和{sum}
          <span className={sum < 10 ? "invisible" : "hidden"}>0</span>
        </span>
        <span className="text xt">{sum > 84 ? <em className="大">大</em> : sum < 84 ? <em className="小">小</em> : <em className="小">和</em>}</span>
        <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>
      </div>
    )
  }
  renderRecordNumber() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="klsf ball-group small number-with-xt row">
        <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ball-${parseInt(item)}`}>
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
      <div className="klsf ball-group small number-with-xt row">
        <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text">{this.props.GameID}期</span>
        <p className="balls">
          {balls.map((item, index) => (
            <span key={index} className={`ball circle ${parseInt(item) <= 10 ? "小" : "大"}`}>
              {parseInt(item) <= 10 ? "小" : "大"}
            </span>
          ))}
        </p>
      </div>
    )
  }
  renderRecordDS() {
    let balls = this.props.OpenCode.split(",")
    return (
      <div className="klsf ball-group small number-with-xt row">
        <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text">{this.props.GameID}期</span>
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
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div>
        <div className="klsf ball-group small number-with-xt row">
          <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
          <span className="text">{this.props.GameID}期</span>
          <span className="text he">{sum}</span>
          <span className="text xt">
            {sum > 84 ? <em className="大">大</em> : sum < 84 ? <em className="小">小</em> : <em className="小">和</em>}
          </span>
          <span className="text xt">{sum % 2 == 1 ? <em className="单">单</em> : <em className="双">双</em>}</span>
          <span className={`text xt`}>{<em className={`${sum % 10 >= 5 ? "大" : "小"}`}>{sum % 10 >= 5 ? "尾大" : "尾小"}</em>}</span>
          <span className="text xt">{balls[0] > balls[7] ? <em className="龙">龙</em> : <em className="虎">虎</em>}</span>
        </div>
        <div className="wuxing">
          {balls.map((item) => {
            return (
              <div className="wuxing-ball">
                <p className="p1">{item}</p>
                <p className="p2">{WXMap[item]}</p>
              </div>
            )
          })}
        </div>
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
