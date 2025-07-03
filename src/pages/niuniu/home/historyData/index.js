import React from "react"

import "./style.scss"
import { getLotterBetHistoryData, getLottersData } from "@/action/apis"
import { BackButton } from "react-onsenui"
import LotteryBall from "@/components/LotteryBall"
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      current: 1,
      isEnd: false,
      isLoading: false,
      items: [],
    }
  }

  getData = null
  pageSize = 20
  componentDidMount() {
    if (!this.props.type) return
    this.getData = this.props.type === "draw" ? getLottersData : getLotterBetHistoryData
    this.loadData(1)
    const content = document.getElementById("hisContent")

    content.onscroll = () => {
      if (content.scrollTop + content.clientHeight >= content.scrollHeight - 50) {
        if (!this.state.isEnd && !this.state.isLoading) this.loadData(this.state.current + 1)
      }
    }
  }

  loadData(current) {
    this.setState({ isLoading: true })
    this.getData(this.props.id, current, this.pageSize)
      .then((res) => {
        let isEnd = false
        if (this.state.items.length > 0) {
          const _newData = res.Data[0]
          isEnd = this.state.items.some((item) => item.GameID === _newData.GameID)
        }

        if (!isEnd) {
          if (res.Data.length === 0 || res.Data.length < this.pageSize) isEnd = true
        }

        const _newItems = isEnd ? res.Data.filter((item) => !this.state.items.some((oldItem) => oldItem.GameID === item.GameID)) : res.Data

        const items = [...this.state.items, ..._newItems]
        this.setState({ items: [] })
        const data = { items, isLoading: false }

        if (isEnd) data["isEnd"] = isEnd
        if (!isEnd) data["current"] = current
        this.setState(data)

        // if (isEnd) {
        //   const restOfItem = res.Data.filter(item => !this.state.items.some(oldItem => oldItem.GameID === item.GameID));
        //   const items = [...this.state.items, ...restOfItem];
        //   this.setState({ items: [] })
        //   this.setState({ isEnd, items })
        // } else {
        //   const items = [...this.state.items, ...res.Data];
        //   this.setState({ items: [] })
        //   this.setState({ items, current })
        // }
      })
      .catch(() => {
        this.setState({ isLoading: false })
        // setTimeout(() => {
        // }, 1000)
      })
  }
  // util.date.toDate(res.Data.ServerTime)

  render() {
    const _title = !this.props.type ? "" : this.props.type === "draw" ? "开奖记录" : "下注记录"
    return (
      <div className="history">
        <div className="head">
          <div
            className="back-button"
            onClick={() => {
              this.props.onClickClose()
            }}
          >
            <BackButton>返回</BackButton>
          </div>
          <div className="title">{_title}</div>
          <div />
        </div>

        <div className="content" id="hisContent">
          {this.state.items.map((item) => {
            const isWin = this.props.type === "draw" ? false : item.Bonus > item.BetCount

            const betState = item.Status === 0 ? "" : item.Bonus == item.BetCount ? ",平" : isWin ? ",中" : ",亏"

            return this.props.type === "draw" ? (
              <LotteryBall {...item} key={item.GameID} type="hxcow" display="numberWithNiuCard" />
            ) : (
              <div key={item.ID} className="bet-item">
                <div className="title">第{item.GameID}期</div>
                <div className="content">{`${item.PlayType}:${item.BetText}(${isWin ? item.Bonus : item.BetCount}元${betState})`}</div>
              </div>
            )
          })}
          {this.state.isLoading && <div className="loading" />}
          {this.state.isEnd && <div className="end">到底了</div>}
        </div>
      </div>
    )
  }
}
