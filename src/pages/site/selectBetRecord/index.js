import React from "react"
import LayoutPage from "@/components/LayoutPage"
import { Icon, Button } from "react-onsenui"

import util from "@/magic/util"
import * as action from "@/action"
import "./style.scss"
import SelectBetRecordItem from "./item/index"

import EmptyView from "@/components/EmptyView"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.lotteryId = util.getUrlParam("id")
    this.game = util.findGames(util.getUrlParam("id"))
    this.state = {
      loading: true,
      list: [],
      PageIndex: 1,
      PageSize: 20,
      pageEnd: false,
      loadingMore: false,
    }
  }

  componentDidMount() {
    this.loadMore(1)
    this.setState({ loading: false })
    if (window.innerHeight / this.rowHeight > this.state.PageSize) {
      this.loadMore()
    }
  }

  loadMore(pageIndex) {
    if (pageIndex) {
      this.setState({ pageIndex: pageIndex })
    } else {
      pageIndex = this.state.pageIndex + 1
      this.setState({ pageIndex: pageIndex })
    }
    //只需要 搜索 为开奖state = 0的数据
    let query = {
      lotteryid: this.game.id,
      gameid: 0, //gameid=0获取自己的下注记录，gameid>0获取该期下注记录
      status: 0,
      PageIndex: pageIndex,
      PageSize: this.state.PageSize,
    }
    let userID = util.getUrlParam("userID")
    if (userID) {
      query.id = userID
    }
    let d = action.post("Lottery/Bets", query)
    d.then((res) => {
      if (res.Code != 1) {
        notificationAsync.alert(res.Message, { title: "操作提示" })
        return
      }
      let list = Object.assign([], this.state.list)
      this.setState({ list: list.concat(res.Data), pageEnd: res.Data.length < this.state.PageSize ? true : false })
    })
  }

  onInfiniteScroll(done) {
    if (!this.state.pageEnd) {
      this.setState({ loadingMore: true })
      this.loadMore()
      this.setState({ loadingMore: false })
    }

    setTimeout(() => {
      done()
    }, 500)
  }

  render() {
    let GI = util.getUrlParam("id")
    if (GI == null || GI == undefined) {
      return <div></div>
    }

    let game = this.game
    let userID = util.getUrlParam("userID")
    return (
      <LayoutPage
        className="select-bet-record"
        title={game.name}
        onBack={() => {
          this.props.onBack(null)
        }}
        loading={this.state.loading}
        onInfiniteScroll={this.onInfiniteScroll.bind(this)}
        right={null}
      >
        <div>
          {this.state.list.map((item, index) => {
            return (
              <div key={item.BetTime + index} className="row">
                <SelectBetRecordItem {...item} otherUser={false} />
                <Button
                  className="select_btn"
                  onClick={() => {
                    //回调选择到的 注单
                    this.props.onBack(item)
                  }}
                >
                  分享注单
                </Button>
              </div>
            )
          })}
        </div>
        {this.state.loadingMore && (
          <div className="loading">
            <Icon icon="ion-load-d" />
          </div>
        )}
        {this.state.pageEnd && this.state.list.length == 0 && <EmptyView imgId={1} desc={"您还没有投注记录"} no_margin />}
        {this.state.pageEnd && this.state.list.length > this.state.PageSize && <div className="no-record">别扯，到底了</div>}
      </LayoutPage>
    )
  }
}
