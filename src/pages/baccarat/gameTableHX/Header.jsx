import React from "react"
import util from "@/magic/util"
import { getPush } from "@/action/apis"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      OpenLottery: {},
      showCountDown: -1,
      reloadCountDown: -1,
      UserData: {},
      lotteryReloading: false,
      loading: true,
      isCache: true,
    }
  }

  async componentDidMount() {
    if (this.props.data) {
      this.update(this.props.data)
      this.setState({ isCache: false })
      util.cache.set("lottery-cache-" + this.props.lotteryId, this.props.data)
    } else {
      //使用缓存数据
      let data = util.cache.get("lottery-cache-" + this.props.lotteryId)
      data && this.update(data)
      await this.load()
      this.setState({ isCache: false })
    }

    this.check()
    this.setState({ loading: false })
    window.addEventListener("updateUser", this.updateUser.bind(this))
    this.pageShow()
  }
  componentWillUnmount() {
    window.removeEventListener("updateUser", this.updateUser.bind(this))
  }
  updateUser(event) {
    this.setState({
      UserData: Object.assign({}, this.state.UserData, event.detail),
    })
  }
  async pageShow(e) {
    if (e && e.persisted) {
      this.setState({ lotteryReloading: true })
      await this.load()
      this.setState({ lotteryReloading: false })
    }
  }
  async load() {
    let res = await getPush({
      lotteryid: this.props.lotteryId,
      keys: "",
    })
    if (res.Code == 1 && res.Data.OpenLottery) {
      util.cache.set("lottery-cache-" + this.props.lotteryId, res.Data)
      this.update(res.Data)
    }
  }

  update(data) {
    let OpenLottery = data.OpenLottery
    let dt = util.date.toDate(data.ServerTime).getTime() - new Date().getTime()
    this.setState({
      OpenLottery: OpenLottery,
      dt: dt,
      showCountDown: util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt,
      reloadCountDown: util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt,
      UserData: data.UserData,
    })
    if (!OpenLottery.LastKai.KaiText) {
      setTimeout(this.load.bind(this), 3000)
    }
  }
  check() {
    let OpenLottery = this.state.OpenLottery
    let dt = this.state.dt || 0
    if (this.state.reloadCountDown > 0) {
      let c = util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt
      this.setState({ reloadCountDown: c })
      if (c <= 0) {
        setTimeout(this.load.bind(this), 1000)
      }
    }
    if (this.state.showCountDown > 0) {
      let c = util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt
      this.setState({ showCountDown: c })
    }

    setTimeout(this.check.bind(this), 1000)
  }

  render() {
    let lastKai = this.state.OpenLottery.LastKai
    let newKai = this.state.OpenLottery.NewKai
    let UserData = this.state.UserData
    let lotteryId = this.props.lotteryId
    // let lotteryGame = util.findGames(lotteryId);
    let lotteryType = this.props.lotteryType //${this.state.loading ? "loading":""}
    return (
      <div className={`lottery-head ${!this.state.OpenLottery.LastKai ? "loading" : ""}`}>
        {lastKai && (
          <div className="last">
            <div className="hd">
              <span>{lastKai.GameID}</span>期开奖结果
              <span className="money">余额: {UserData.Money}元</span>
            </div>

            {lastKai.KaiText && !lastKai.Zodiac && <div className="bd"></div>}
            {lastKai.KaiText && lastKai.Zodiac && <div className="bd"></div>}
            {!lastKai.KaiText && <div className="bd"></div>}

            {lastKai.HashCode && <a className="hash" href={"https://tronscan.org/#/transaction/" + lastKai.HashCode} target="_blank"></a>}
          </div>
        )}
        {newKai && (
          <div className="new">
            <div className="hd">
              <span className="issue">{newKai.GameID}</span>期<span>投注截止时间</span>
              {(this.state.lotteryReloading || this.state.isCache) && <span className="count-down">刷新中...</span>}
              {!this.state.isCache && this.state.lotteryReloading == false && this.state.showCountDown <= 0 && (
                <span className="count-down">已封盘</span>
              )}
              {!this.state.isCache && this.state.lotteryReloading == false && this.state.showCountDown > 0 && (
                <span className="count-down">{util.date.formatRemaintingTime(this.state.showCountDown)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}
