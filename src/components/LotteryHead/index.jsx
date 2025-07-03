import React from "react"
import util from "@/magic/util"
import LotteryBall from "@/components/LotteryBall"
import "./style.scss"
import { HashFactory } from "@/magic/hash"
import classNames from "classnames"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
const hashQuickly = ["167", "168", "169"] // 哈希快三
const hashList = ["65", "66", "70", "71", "67", "72", "73", "74"].concat(hashQuickly)
const numPreList = ["70", "71", "72", "73", "74"].concat(hashQuickly) // 取号从前面开始取，故取前 16 ，其余取后 16
import Bus from "@/magic/EventsBus"
import { gamesById } from "@/config/game"

@withRouter
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

  delayTime = 3 * 1000

  componentDidMount() {
    if (this.props.data) {
      this.update(this.props.data)
      this.setState({ isCache: false })
      util.cache.set("lottery-cache-" + this.props.lotteryId, this.props.data)
    } else {
      //使用缓存数据
      let data = util.cache.get("lottery-cache-" + this.props.lotteryId)
      data && this.update(data)
      this.load().then(() => {
        this.setState({ isCache: false })
      })
    }
    this.check()
    this.setState({ loading: false })
    this.addEvent()
    this.updateTimer = setInterval(this.load.bind(this), this.delayTime)
    this.checkTimer = setInterval(this.check.bind(this), 1000)
  }

  componentDidUpdate(preProps) {
    if (preProps.route.query.id != this.props.route.query.id) {
      this.setState({ isCache: true })
      this.load().then(() => {
        this.setState({ isCache: false })
      })
    }
  }

  componentWillUnmount() {
    this.updateTimer && clearInterval(this.updateTimer)
    this.checkTimer && clearInterval(this.checkTimer)
  }

  addEvent() {
    window.addEventListener("updateUser", (event) => {
      this.setState({ UserData: Object.assign({}, this.state.UserData, event.detail) })
    })
  }

  async load() {
    let res = await getPush({ lotteryid: this.props.lotteryId, keys: "" })
    if (res.Code == 1 && res.Data.OpenLottery) {
      util.cache.set("lottery-cache-" + this.props.lotteryId, res.Data)
      this.update(res.Data)
      // Bus.emit("lottery.openLottery", res.Data.OpenLottery)
    }
  }
  update(data) {
    const { OpenLottery } = data
    const dt = util.date.toDate(data.ServerTime).getTime() - new Date().getTime()
    const getCountDown = (time) => util.date.toDate(time).getTime() - new Date().getTime() - dt
    this.setState({
      OpenLottery,
      dt: dt,
      showCountDown: getCountDown(OpenLottery.NewKai.EndTime),
      reloadCountDown: getCountDown(OpenLottery.NewKai.KaiTime),
      UserData: data.UserData,
    })

    // if (!OpenLottery.LastKai.KaiText && this.delayTime === 3 * 1000) {
    //   this.delayTime = 1000
    //   clearInterval(this.updateTimer)
    //   this.updateTimer = setInterval(this.load.bind(this), this.delayTime)
    // } else if (!!OpenLottery.LastKai.KaiText && this.delayTime === 1000) {
    //   this.delayTime = 3 * 1000
    //   clearInterval(this.updateTimer)
    //   this.updateTimer = setInterval(this.load.bind(this), this.delayTime)
    // }

    Bus.emit("lottery.openLottery", OpenLottery)
  }
  check() {
    const { OpenLottery } = this.state
    const dt = this.state.dt || 0
    if (this.state.reloadCountDown > 0) {
      const reloadCountDown = util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt
      this.setState({ reloadCountDown })
    }

    if (this.state.showCountDown > 0) {
      const showCountDown = util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt
      this.setState({ showCountDown })
    }

    if (this.state.showCountDown < 0 && this.delayTime === 3 * 1000) {
      this.modifyUpdateTimer()
      // console.log("T" + this.state.showCountDown)
    } else if (this.state.showCountDown > 0 && this.delayTime === 1000 && OpenLottery.LastKai.KaiText) {
      this.modifyUpdateTimer()
      // console.log("F")
    }
  }

  modifyUpdateTimer() {
    if (!this.updateTimer) return
    this.delayTime = this.delayTime === 3000 ? 1000 : 3000
    clearInterval(this.updateTimer)
    this.updateTimer = setInterval(this.load.bind(this), this.delayTime)
  }

  render() {
    if (this.state.loading) return <div className="lottery-head loading"></div>

    const { LastKai, NewKai } = this.state.OpenLottery
    const { UserData } = this.state
    const { lotteryId, lotteryType } = this.props
    // ${this.state.loading ? "loading":""}
    // const lotteryState = this.state.lotteryReloading || this.state.isCache
    //     ? '刷新中...'
    //     : this.state.showCountDown > 0
    //         ? util.date.formatRemaintingTime(this.state.showCountDown)
    //         : '已封盘'
    const _display = LastKai && !LastKai.KaiText ? "loading" : LastKai && LastKai.Zodiac ? "headNumberWithXt" : "number"
    const _openCode = LastKai && LastKai.KaiText ? LastKai.KaiText : null
    const _hashCode = LastKai && LastKai.KaiText ? LastKai.HashCode : ""
    const _zodiac = LastKai && LastKai.Zodiac ? LastKai.Zodiac : null
    const _tmsx = LastKai && LastKai.TmSx ? LastKai.TmSx : ""
    const isHashLottery = hashList.indexOf(lotteryId) > -1
    const hashParseResult = LastKai && LastKai.HashCode ? HashFactory.make(lotteryId, LastKai.HashCode) : null

    return (
      <div className={`lottery-head ${!LastKai ? "loading" : ""}`}>
        {LastKai && (
          <div className="last">
            <div className="hd">
              <span>{LastKai.GameID}</span>期开奖结果
              <span className="money">余额: {UserData.Money.toFixed(2)}元</span>
            </div>

            <div className="bd">
              <LotteryBall
                key={_display}
                type={lotteryType}
                display={_display}
                OpenCode={_openCode}
                HashCode={_hashCode}
                Zodiac={_zodiac}
                TmSx={_tmsx}
              />
            </div>

            {LastKai.HashCode && hashList.indexOf(lotteryId) < 0 && !hashQuickly.includes(lotteryId) && (
              <a className="hash" href={"https://tronscan.org/#/transaction/" + LastKai.HashCode} target="_blank"></a>
            )}
          </div>
        )}
        {NewKai && (
          <div className="new">
            <div className="hd">
              <span className="issue">{NewKai.GameID}</span>期<span>投注截止时间</span>
              {/* <span className="count-down">{ lotteryState }</span> */}
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

        {isHashLottery && (
          <div className="hx-item">
            <div className="flex">
              <div className="flex-1">哈希验证：</div>
              <div className="flex-1 flex right">
                {LastKai && LastKai.HashCode && this.state.lotteryReloading == false && (
                  <a className="hash-btn" href={"https://tronscan.org/#/transaction/" + LastKai.HashCode} target="_blank"></a>
                )}
              </div>
            </div>

            <div className="hash-box">
              {LastKai && LastKai.HashCode && this.state.lotteryReloading == false ? (
                <>
                  <div className="hash-link">
                    {hashParseResult.getCodes().map((code, index) => (
                      <div
                        key={"hash-code" + index}
                        className={classNames("hash-code", {
                          picked: code.isPicked,
                          ["picked-index" + code.pickedIndex]: code.pickedIndex !== undefined && code.pickedIndex > -1,
                        })}
                      >
                        {code.name}
                      </div>
                    ))}
                  </div>
                  <div className="hash-name-box">
                    {hashParseResult.getNames().map((name, index) => (
                      <div key={"hash-name" + index} className={classNames("hash-name", `hash-name-index` + index)}>
                        {name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                "正在获取"
              )}
            </div>
          </div>
        )}

        {gamesById[this.props.lotteryId].headerDescription && (
          <div className="border-0 border-t border-solid border-[#f1f1f1] py-0.5">{gamesById[this.props.lotteryId].headerDescription}</div>
        )}
      </div>
    )
  }
}
