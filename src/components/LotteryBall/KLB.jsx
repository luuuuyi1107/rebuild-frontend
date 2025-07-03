import React from "react"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.ballNumber = 20
    this.state = {
      loadingOpenCode: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
      <div className="klb ball-group number">
        <div>
          {balls.map((item, index) =>
            index < 10 ? (
              <span key={index} className={`ball circle`}>
                {item}
              </span>
            ) : null
          )}
        </div>
        <div>
          {balls.map((item, index) =>
            index >= 10 ? (
              <span key={index} className={`ball circle`}>
                {item}
              </span>
            ) : null
          )}
        </div>
      </div>
    )
  }
  renderLoading() {
    let balls = this.state.loadingOpenCode
    return (
      <div className="klb ball-group number loading">
        <div>
          {balls.map((item, index) =>
            index < 10 ? (
              <span key={index} className={`ball circle`}>
                {item}
              </span>
            ) : null
          )}
        </div>
        <div>
          {balls.map((item, index) =>
            index >= 10 ? (
              <span key={index} className={`ball circle`}>
                {item}
              </span>
            ) : null
          )}
        </div>
      </div>
    )
  }
  renderNumberWithXt() {
    let balls = this.props.OpenCode.split(",")
    let sum = 0
    balls.map((item) => (sum += parseInt(item)))
    return (
      <div className="klb ball-group small number-with-xt row">
        <span className="text">{util.date.format(util.date.toDate(this.props.OpenTime), "hh:mm", 8)}</span>
        <span className="text">{this.props.GameID}期</span>
        <div className="balls">
          <div>
            {balls.map((item, index) =>
              index < 10 ? (
                <span key={index} className={`ball circle`}>
                  {item}
                </span>
              ) : null
            )}
          </div>
          <div>
            {balls.map((item, index) =>
              index >= 10 ? (
                <span key={index} className={`ball circle`}>
                  {item}
                </span>
              ) : null
            )}
          </div>
        </div>
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
