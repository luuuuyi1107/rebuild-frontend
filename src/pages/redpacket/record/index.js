import React from "react"

import LayoutPage from "@/components/LayoutPage"
import { Icon, ActionSheet, ActionSheetButton } from "react-onsenui"
import RedpacketDetail from "../room/RedpacketDetail"
import util from "@/magic/util"
import * as apiNotification from "@/magic/ApiNotification"
import * as action from "@/action"

import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"

export default withRouter(
  class extends React.PureComponent {
    state = {
      type: "0",
      beginTime: util.date.format(new Date(), "YYYY-MM-DD"),
      endTime: util.date.format(new Date(), "YYYY-MM-DD"),
      PageIndex: 1,
      PageSize: 10,
      showTypeSelect: false,
      pageEnd: false,
      list: [],
    }
    typeMap = {
      0: "全部记录",
      1: "发红包",
      2: "埋雷返款",
      3: "领红包",
    }
    componentDidMount() {
      this.loadMore(1)
    }

    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ PageIndex: pageIndex })
      } else {
        pageIndex = this.state.PageIndex + 1
        this.setState({ PageIndex: pageIndex })
      }

      let res = await action.get("RedPacket/GetLogs", {
        type: this.state.type,
        beginTime: this.state.beginTime,
        endTime: this.state.endTime,
        PageIndex: pageIndex,
        PageSize: this.state.PageSize,
      })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let list = Object.assign([], this.state.list)
      if (pageIndex == 1) {
        list = res.Data
      } else {
        list = list.concat(res.Data)
      }
      this.setState({ list: list, pageEnd: res.Data.length < this.state.PageSize ? true : false })
    }
    onFilterChange(opt) {
      if (opt.beginTime) {
        opt.beginTime = util.date.format(new Date(opt.beginTime), "YYYY-MM-DD")
      }
      if (opt.endTime) {
        opt.endTime = util.date.format(new Date(opt.endTime), "YYYY-MM-DD")
      }
      this.setState(Object.assign({}, this.state, opt, { PageIndex: 1, showTypeSelect: false, pageEnd: false }))
      setTimeout(() => {
        this.loadMore(1)
      }, 0)
    }
    async onInfiniteScroll(done) {
      if (!this.state.pageEnd) {
        await this.loadMore()
      }
      setTimeout(() => {
        done()
      }, 500)
    }
    renderFilter() {
      return (
        <div className="filter">
          <div className="type fitem" onClick={() => this.setState({ showTypeSelect: true })}>
            <span>{this.typeMap[this.state.type]}</span>
            <Icon icon="ion-android-arrow-dropdown" />
          </div>
          <div className="beginTime fitem">
            <span>{this.state.beginTime}</span>
            <Icon icon="ion-android-arrow-dropdown" />
            <input type="date" onChange={(e) => this.onFilterChange({ beginTime: e.target.value })} />
          </div>
          <span style={{ marginRight: 5, marginLeft: -5 }}>至</span>
          <div className="endTime fitem">
            <span>{this.state.endTime}</span>
            <Icon icon="ion-android-arrow-dropdown" />
            <input type="date" onChange={(e) => this.onFilterChange({ endTime: e.target.value })} />
          </div>

          <ActionSheet
            isOpen={!!this.state.showTypeSelect}
            onCancel={() => {
              this.setState({ showTypeSelect: false })
            }}
            animation="default"
            className="repacket-type-select"
            isCancelable={true}
          >
            <ActionSheetButton onClick={() => this.onFilterChange({ type: "0" })}>全部记录</ActionSheetButton>
            <ActionSheetButton onClick={() => this.onFilterChange({ type: "1" })}>发红包</ActionSheetButton>
            <ActionSheetButton onClick={() => this.onFilterChange({ type: "3" })}>领红包</ActionSheetButton>
            <ActionSheetButton onClick={() => this.onFilterChange({ type: "2" })}>埋雷返款</ActionSheetButton>
            <ActionSheetButton
              onClick={() => {
                this.setState({ showTypeSelect: false })
              }}
              icon={"md-close"}
            >
              取消
            </ActionSheetButton>
          </ActionSheet>
        </div>
      )
    }
    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      let list = this.state.list

      return (
        <LayoutPage
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          className="repacket-record-page"
          renderFixed={this.renderFilter.bind(this)}
          center="扫雷报表"
          right={() => (
            <span
              onClick={() => {
                this.props.router.push("/redpacket/dailyReport")
              }}
            >
              每日报表
            </span>
          )}
        >
          {!this.state.pageEnd && list.length == 0 && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && list.length == 0 && <div className="loading">暂无记录</div>}
          {list.map((item) => {
            return (
              <div className="record-list-item" key={item.ID} onClick={this.openDetail.bind(this, item)}>
                <p className="p1">
                  {item.Content}
                  <span className="right money">{item.Money}</span>
                </p>
                <p className="p2">
                  {util.date.format(util.date.toDate(item.Time), "YYYY年MM月DD日 hh:mm:ss")}
                  <span className="right">查看详情</span>
                </p>
              </div>
            )
          })}
          <ModalPage
            isOpen={!!this.state.detailId}
            onClose={() => {
              this.setState({
                detailId: false,
              })
            }}
          >
            {!!this.state.detailId && <RedpacketDetail id={this.state.detailId} />}
          </ModalPage>
        </LayoutPage>
      )
    }
    openDetail(item) {
      this.setState({ detailId: item.RID })
    }
  }
)
