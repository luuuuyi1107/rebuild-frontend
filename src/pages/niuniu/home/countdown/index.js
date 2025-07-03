import React from "react"

import "./style.scss"
// import ReactDOM from 'react-dom';
// import CustomIcon from "@/components/CustomIcon";
// import {Icon} from "react-onsenui";

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      drawState: -1, // -1 刷新中  0 无奖旗封盤   1 倒數中(可投注)  2 停止投注（暂时封盤  3 开奖中   flow state
      OpenLottery: null,
      restOfTime: 0,
      reloadCountDown: null,
      showCountDown: null,
    }
  }

  myTimer = null

  start(data) {
    const { OpenLottery } = data
    const dt = util.date.toDate(data.ServerTime).getTime() - new Date().getTime()
    const getCountDown = (time) => util.date.toDate(time).getTime() - new Date().getTime() - dt
    this.setState({
      OpenLottery,
      dt: dt,
      showCountDown: getCountDown(OpenLottery.NewKai.EndTime),
      reloadCountDown: getCountDown(OpenLottery.NewKai.KaiTime),
    })

    const { showCountDown, reloadCountDown } = this.state
    this.myTimer = setInterval(this.checking.bind(this), 1000)
  }

  checking() {
    const { OpenLottery } = this.state
    const dt = this.state.dt || 0
    if (this.state.reloadCountDown > 0) {
      const reloadCountDown = util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt
      this.setState({ reloadCountDown })
      if (reloadCountDown <= 0) {
        setTimeout(this.props.reloadNewIssue.bind(this), 0)
        clearInterval(this.myTimer)
      }
    }
    if (this.state.showCountDown > 0) {
      const showCountDown = util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt
      this.setState({ showCountDown })
    }
  }

  componentWillUnmount() {
    clearInterval(this.myTimer)
  }

  updateNewTimer(OpenLottery) {
    this.setState({ OpenLottery })
  }

  render() {
    const countDownTxt =
      this.state.showCountDown > 0
        ? // ? '00:' + (this.state.showCountDown < 10 ? '0':'') + this.state.showCountDown
          util.date.formatRemaintingTime(this.state.showCountDown)
        : "封盤"

    const latest = !!this.state.OpenLottery ? this.state.OpenLottery.NewKai.GameID : ""

    return (
      <div className="niuniu_countdown">
        <div className="issue">{latest}期</div>
        <div className="timer">
          投注截止还有
          <div className={`number ${this.state.showCountDown > 0 == 1 ? "" : "txt"}`}>{countDownTxt}</div>
        </div>
        <div className="clear" onClick={() => this.props.clearCoin()}>
          清
        </div>
      </div>
    )
  }
}
