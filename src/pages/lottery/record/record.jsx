import React from "react"
import LayoutPage from "@/components/LayoutPage"
import LotteryBall from "@/components/LotteryBall"
import { Icon } from "react-onsenui"

import util from "@/magic/util"
import * as action from "@/action"
import "./style.scss"

const filters = {
  ssc: [
    { type: "recordNumber", name: "号码" },
    { type: "recordDX", name: "大小" },
    { type: "recordDS", name: "单双" },
    { type: "recordXT", name: "形态" },
  ],
  pks: [
    { type: "recordNumber", name: "号码" },
    { type: "recordDX", name: "大小" },
    { type: "recordDS", name: "单双" },
    { type: "recordXT", name: "冠军/龙虎" },
  ],
  pcdd: [
    { type: "recordNumber", name: "号码" },
    { type: "recordXT", name: "总和/形态" },
  ],
  lhc: [
    { type: "recordNumber", name: "号码" },
    { type: "recordTM", name: "特码属性" },
  ],
  syxw: [
    { type: "recordNumber", name: "号码" },
    { type: "recordDX", name: "大小" },
    { type: "recordDS", name: "单双" },
    { type: "recordXT", name: "总和" },
  ],
  klsf: [
    { type: "recordNumber", name: "号码" },
    { type: "recordDX", name: "大小" },
    { type: "recordDS", name: "单双" },
    { type: "recordXT", name: "形态" },
  ],
  klb: [{ type: "recordNumber", name: "号码" }],
  ks: [{ type: "recordNumber", name: "号码" }],
  qxc: [
    { type: "recordNumber", name: "号码" },
    { type: "recordDX", name: "大小" },
    { type: "recordDS", name: "单双" },
  ],
  fc3: [
    { type: "recordNumber", name: "号码" },
    { type: "recordDX", name: "大小" },
    { type: "recordDS", name: "单双" },
  ],
  baccarat: [{ type: "recordNumber", name: "号码" }],
}

export default class extends React.PureComponent {
  constructor() {
    super()
    this.lotteryId = util.getUrlParam("id")
    this.game = util.findGames(util.getUrlParam("id"))

    this.rowHeight = 45
    let serverTime = util.cache.get("serverTime")
    let displayType = filters[this.game.type][0].type
    if (this.lotteryId == 14) {
      this.game.type = "baccarat"
    }
    // 哈希PK拾、幸運10 补号
    if (this.lotteryId == 70 || this.lotteryId == 71 || this.lotteryId == 72) {
      let hasBH = filters.pks.filter((item) => item.type == "recordBH").length
      if (!hasBH) {
        filters.pks.push({ type: "recordBH", name: "哈希" })
      }
    }

    let date = null
    this.state = {
      date: date,
      PageIndex: 1,
      PageSize: 20,
      list: [],
      pageEnd: false,
      display: displayType,
      loading: true,
      loadingMore: false,
    }
  }
  componentDidMount() {
    this.loadMore(1).then(() => {
      this.setState({ loading: false })
      if ((window.innerHeight - 79) / this.rowHeight > this.state.PageSize) {
        this.loadMore()
      }
    })
  }
  async loadMore(pageIndex) {
    if (pageIndex) {
      this.setState({ pageIndex: pageIndex })
    } else {
      pageIndex = this.state.pageIndex + 1
      this.setState({ pageIndex: pageIndex })
    }
    let res = await action.post("Lottery/Lotterys", {
      lotteryid: this.game.id,
      date: this.state.date && util.date.format(this.state.date, "YYYYMMDD", 8),
      PageIndex: pageIndex,
      PageSize: this.state.PageSize,
    })
    let list = Object.assign([], this.state.list)
    this.setState({ list: list.concat(res.Data), pageEnd: res.Data.length < this.state.PageSize ? true : false })
  }
  async onInfiniteScroll(done) {
    if (!this.state.pageEnd && this.state.list.length > 0) {
      this.setState({ loadingMore: true })
      await this.loadMore()
      this.setState({ loadingMore: false })
    }
    setTimeout(() => {
      done()
    }, 500)
  }
  renderTop() {
    return (
      <div className="top-bar">
        <span className="text time">时间</span>
        <span className="text issue">期数</span>
        <div className="filter">
          {filters[this.game.type].map((item) => {
            return (
              <span
                key={item.type}
                className={`text ${item.type} ${this.state.display == item.type ? "active" : ""}`}
                onClick={() => {
                  this.setState({ display: item.type })
                }}
              >
                {item.name}
              </span>
            )
          })}
        </div>
      </div>
    )
  }
  onDateChange(e) {
    this.setState({ date: new Date(e.target.value), PageIndex: 1, list: [] })
    setTimeout(() => {
      this.loadMore(this.state.pageIndex)
    }, 0)
  }
  renderRight() {
    if (this.game.type2 == "六合彩") {
      return null
    }
    return (
      <div className="right-date-picker">
        <input type="date" onChange={this.onDateChange.bind(this)} />
        <div className="date">{this.state.date ? "日期:" + util.date.format(this.state.date, "M月DD日", 8) : "选择日期"}</div>
      </div>
    )
  }
  render() {
    let game = this.game
    return (
      <LayoutPage
        className="lottery-record"
        title={game.name}
        onBack={this.props.onBack}
        loading={this.state.loading}
        onInfiniteScroll={this.onInfiniteScroll.bind(this)}
        renderFixed={() => {
          return this.renderTop()
        }}
        right={() => {
          return this.renderRight()
        }}
      >
        <div>
          {this.state.list.map((item, index) => {
            return (
              <div key={item.GameID} className={`row ${index % 2 == 1 ? "odd" : "even"}`}>
                <LotteryBall {...item} type={game.type} display={this.state.display} showHash={true} />
              </div>
            )
          })}
        </div>
        {this.state.list.length == 0 && this.state.pageEnd && <div className="no-record">无开奖记录</div>}
        {this.state.pageEnd && this.state.list.length > this.state.PageSize && <div className="no-record">别扯，到底了</div>}
        {this.state.loadingMore && (
          <div className="loading">
            <Icon icon="ion-load-d" />
          </div>
        )}
      </LayoutPage>
    )
  }
}
