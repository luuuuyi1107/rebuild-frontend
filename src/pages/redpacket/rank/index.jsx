import React from "react"

import LayoutPage from "@/components/LayoutPage"
import { Icon, List, ListItem } from "react-onsenui"
import util from "@/magic/util"
import * as apiNotification from "@/magic/ApiNotification"
import * as action from "@/action"
import AvatarImg from "@/components/AvatarImg"

import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    state = {
      type: 1,
      timer: 3,
      PageIndex: 1,
      PageSize: 20,
      list: [],
      loading: true,
    }
    componentDidMount() {
      this.loadMore(1)
    }
    async loadMore(pageIndex) {
      if (!pageIndex) {
        pageIndex = this.state.PageIndex + 1
      }
      this.setState({ PageIndex: pageIndex })

      let res = await action.get("RedPacket/GetTop", {
        type: this.state.type,
        timer: this.state.timer,
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
      this.setState({ list: list, loading: false })
    }
    filterChange(obj) {
      this.setState(Object.assign({}, this.state, { ...obj, list: [], PageIndex: 1, loading: true }))

      setTimeout(() => {
        this.loadMore(1)
      }, 0)
    }
    render() {
      return (
        <LayoutPage className="redpacket-rank-page" center="红包排行榜" right={null}>
          <div className="top-box">
            <div className="hd">
              {/* <Icon icon="ion-ribbon-b"/> */}
              <img src={util.buildAssetsPath("/file/reds/jb.png")} />
            </div>
            <div className="filter">
              <div className={`hour ${this.state.timer == 0 ? "active" : ""}`} onClick={this.filterChange.bind(this, { timer: 0 })}>
                小时榜
              </div>
              <div className={`day ${this.state.timer == 3 ? "active" : ""}`} onClick={this.filterChange.bind(this, { timer: 3 })}>
                日榜
              </div>
              <div className={`week ${this.state.timer == 1 ? "active" : ""}`} onClick={this.filterChange.bind(this, { timer: 1 })}>
                周榜
              </div>
              <div className={`month ${this.state.timer == 2 ? "active" : ""}`} onClick={this.filterChange.bind(this, { timer: 2 })}>
                月榜
              </div>
            </div>
            <div className="filter2">
              <div className={`send ${this.state.type == 0 ? "active" : ""}`} onClick={this.filterChange.bind(this, { type: 0 })}>
                发包
              </div>
              <div className={`grep center ${this.state.type == 1 ? "active" : ""}`} onClick={this.filterChange.bind(this, { type: 1 })}>
                抢包
              </div>
              <div className={`hit ${this.state.type == 2 ? "active" : ""}`} onClick={this.filterChange.bind(this, { type: 2 })}>
                中雷
              </div>
            </div>
            <div className="bd">
              {this.state.list.length == 0 && this.state.loading && (
                <div className="loading">
                  <Icon icon="ion-load-d" />
                </div>
              )}
              {this.state.list.length == 0 && !this.state.loading && <div className="loading">暂无记录</div>}
              <List>
                {this.state.list.map((item, index) => {
                  return (
                    <ListItem key={item.UID}>
                      <div className="left">
                        <div className="index no">
                          <span>{index + 1}</span>
                        </div>
                        <div className="avatar">
                          <AvatarImg UID={item.UID} width={24} height={24} />
                          {/*<Icon icon="ion-android-person"/>*/}
                        </div>
                      </div>
                      <div className="center">
                        <div className="name">{item.NickName}</div>
                      </div>
                      <div className="right">
                        <span>{item.Count}次</span>
                      </div>
                    </ListItem>
                  )
                })}
              </List>
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
