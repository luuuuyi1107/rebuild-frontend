import React from "react"
import { Modal, Icon } from "react-onsenui"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import CustomIcon from "@/components/CustomIcon"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import AvatarImg from "@/components/AvatarImg"

import "./PickRedpacket.scss"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        PageIndex: 1,
        PageSize: 10,
        status: 0,
        pageEnd: false,
        list: [],
        selectedRedpacket: null,
      }
      this.user = util.cache.get("user")
      this.statusMap = {
        0: "未完成",
        1: "已完成",
      }
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

      let res = await action.get("RedPacket/GetData", {
        id: 1,
        type: 1,
        status: this.state.status,
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
    renderFilter() {
      return (
        <div className="filter">
          <div className={`status fitem ${this.state.status == 0 ? "active" : ""}`} onClick={this.onFilterChange.bind(this, { status: 0 })}>
            <span>未完成</span>
          </div>
          <div className={`status fitem ${this.state.status == 1 ? "active" : ""}`} onClick={this.onFilterChange.bind(this, { status: 1 })}>
            <span>已完成</span>
          </div>
        </div>
      )
    }
    onFilterChange(opt) {
      this.setState(Object.assign({}, this.state, opt, { pageIndex: 1, list: [] }))
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

    render() {
      return (
        <LayoutPage
          className={"pick-redpacket-page"}
          center="捡漏"
          right={<span onClick={this.loadMore.bind(this, 1)}>刷新</span>}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          renderFixed={this.renderFilter.bind(this)}
        >
          <div className="chat-list">
            {this.state.list.length == 0 && this.state.pageEnd && (
              <div className="loading">
                <p>暂无记录</p>
              </div>
            )}
            {this.state.list.map((msg) => {
              return (
                <div key={msg.ID}>
                  {msg.Time && (
                    <div className="spliter" key={msg.Time}>
                      <span>{msg.Time}</span>
                    </div>
                  )}
                  <div className={`chat_msg left`}>
                    <div className="user-info">
                      <AvatarImg UID={msg.UID} width={40} height={40} shape="round" />
                      {/*<span className="user-icon">*/}
                      {/*{*/}
                      {/*msg.Avatar!="null" && <img width={40} height={40} src={msg.Avatar}/>*/}
                      {/*}*/}
                      {/*{*/}
                      {/*msg.Avatar=="null" && <Icon icon="ion-person"/>*/}
                      {/*}*/}
                      {/**/}
                      {/*</span>*/}
                    </div>
                    <div
                      className={`message-body red-packet ${this.state.status == 1 ? "finish" : "unfinish"}`}
                      onClick={this.onRedpacketClick.bind(this, msg)}
                    >
                      <label className="user-name">{msg.NickName}</label>
                      <p>
                        <span className="icon">
                          <CustomIcon style={{ width: 30, height: 30 }} className="redpacket-icon" type={require("./icons/packet2.svg")} />
                        </span>
                        <span className="s1">
                          <em className="e1">
                            {msg.Money}
                            <font>—{msg.Mines}</font>
                          </em>
                          <em className="e2">领取红包</em>
                        </span>
                        <span className="s2">扫雷红包</span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <Modal isOpen={!!this.state.selectedRedpacket} animation="lift">
            <div>
              {this.state.selectedRedpacket && (
                <div className="grep-redpacket-dialog" onClick={this.grepRedpacket.bind(this, this.state.selectedRedpacket)}>
                  <img src={util.buildAssetsPath("/file/reds/chai.png")} />
                  <p>
                    <span>
                      {this.state.selectedRedpacket.Avatar != "null" ? (
                        <img width="18" height="18" src={this.state.selectedRedpacket.Avatar} />
                      ) : (
                        <Icon icon="ion-person" />
                      )}
                    </span>
                    <span>{this.state.selectedRedpacket.NickName}</span>
                  </p>
                  {this.state.grepLoading && (
                    <span className="grep-loading">
                      <Icon icon="ion-load-d" />
                    </span>
                  )}
                </div>
              )}
            </div>
          </Modal>
        </LayoutPage>
      )
    }
    onRedpacketClick(msg) {
      if (msg.Status == 0 && msg.Receive == false && msg.UID != this.user.ID) {
        //可抢红包
        this.setState({ selectedRedpacket: msg })
      } else {
        this.props.showRedpacketDetail(msg.ID)
      }
    }
    async grepRedpacket(msg) {
      if (!this.state.grepLoading) {
        this.setState({ grepLoading: true })
        let res = await action.get("RedPacket/Get", { id: msg.ID })
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        } else {
          this.props.showRedpacketDetail(msg.ID)
        }
      }
    }
  }
)
