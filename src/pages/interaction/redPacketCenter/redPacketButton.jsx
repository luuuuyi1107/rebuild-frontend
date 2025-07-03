import React from "react"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      countDown: 0,
    }
  }
  componentDidMount() {
    this.startCountDown()
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
  startCountDown() {
    this.countDown()
    this.timer = setInterval(() => {
      this.countDown()
    }, 1000)
  }
  showTip() {
    notificationAsync.alert("红包未开始", { title: "操作提示" })
  }
  countDown() {
    let start = util.date.toDate(this.props.row.KaiTime)
    let end = util.date.toDate(this.props.row.EndTime)
    let now = new Date().getTime()
    let isEnd = now > end
    let isGoing = now < end && now > start
    let countDown = start - now
    if (isGoing) {
      countDown = "going"
    }
    if (isEnd) {
      countDown = "end"
    }
    this.setState({ countDown: countDown })
  }
  render() {
    let row = this.props.row
    if (this.state.countDown == "going") {
      if (row.Mend) {
        return (
          <div className="clickBtn receive" onClick={this.props.onGetRedPacket.bind(this, row.ID)}>
            领红包: <b>{row.Mtop == row.Mend ? `${row.Mtop}元` : `${row.Mtop} - ${row.Mend}元`}</b>
          </div>
        )
      } else {
        return (
          <div className="clickBtn receive" onClick={this.props.onGetRedPacket.bind(this, row.ID)}>
            领随机红包
          </div>
        )
      }
    } else if (this.state.countDown == "end") {
      return <div className="clickBtn receive disabled">红包已结束</div>
    } else if (this.state.countDown > 0) {
      return (
        <div className="clickBtn receive" onClick={this.showTip.bind(this)}>
          开始倒计时: {util.date.formatRemaintingTime(this.state.countDown)}
        </div>
      )
    }
    return null
  }
}
