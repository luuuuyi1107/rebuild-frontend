import React from "react"
import { List, ListItem } from "react-onsenui"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import CustomIcon from "@/components/CustomIcon"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import AvatarImg from "@/components/AvatarImg"

import "./RedpacketDetail.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        RedData: {},
        UserList: {},
        loading: true,
      }
      this.id = this.props.id
    }

    componentDidMount() {
      this.load()
    }
    async load() {
      let res = await action.post("RedPacket/GetRedPacket", { id: this.id })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      this.setState({
        RedData: res.Data.RedData,
        UserList: res.Data.UserList,
        loading: false,
      })
    }

    renderToolbar() {}
    isHit(amount) {
      let text = "" + amount
      let subText = text.substr(text.length - 1, 1)
      let bomb = this.state.RedData.Mines
      if (subText == bomb) {
        return true
      }
      return false
    }

    render() {
      let RedData = this.state.RedData

      let UserList = this.state.UserList

      return (
        <LayoutPage
          className="redpacket-detail-page"
          center="红包详情"
          right={
            <span
              onClick={() => {
                this.load()
              }}
            >
              刷新
            </span>
          }
          loading={this.state.loading}
        >
          <div className="packet-detail">
            {RedData.ID && (
              <div className="packet-head">
                <div className="bg"></div>
                <div className="inner">
                  <p className="p1">
                    <AvatarImg UID={RedData.UID} width={18} height={18} />
                    {/*{RedData.Avatar!="null" ? <img width="18" height="18" src={RedData.Avatar} /> : <Icon icon="ion-person"/>}*/}
                    &nbsp;{RedData.NickName}&nbsp;的红包
                  </p>
                  {<p className="my-amount">{RedData.Money.toFixed(0)}元</p>}
                  {<p className="p2">雷: {RedData.Mines}</p>}
                </div>
              </div>
            )}

            {RedData.ID && (
              <div className="packet-status">
                已领取&nbsp;{RedData.SendCount}/{RedData.Count}&nbsp;个, 共&nbsp;{RedData.SendMoney.toFixed(2)}/{RedData.Money}&nbsp;元
              </div>
            )}

            <List className="unit-list">
              {UserList.length > 0 &&
                UserList.map((item) => {
                  return (
                    <ListItem className={`${item.UID == 0 ? "god" : ""} person-list`} key={item.UID}>
                      <div className="left">
                        <AvatarImg UID={item.UID} width={24} height={24} />
                        {/*{item.Avatar!="null" ? <img width="24" height="24" src={item.Avatar} /> : <Icon icon="ion-person"/>}*/}
                      </div>
                      <div className="center">
                        {<p>{item.NickName}</p>}
                        <span>{util.date.format(util.date.toDate(item.Time), "MM月DD日 hh:mm:ss")}</span>
                      </div>
                      <div className="right">
                        {this.isHit(item.Money) && (
                          <span>
                            <CustomIcon style={{ width: 24, height: 24 }} className="lei-icon" type={require("./icons/lei.svg")} />
                          </span>
                        )}
                        <p>{item.Money}元</p>
                      </div>
                    </ListItem>
                  )
                })}
              {UserList.length == 0 && (
                <ListItem className="empty" key="empty">
                  <div className="left"></div>
                  <div className="center">
                    <p>暂无记录.</p>
                  </div>
                  <div className="right"></div>
                </ListItem>
              )}
            </List>
          </div>
        </LayoutPage>
      )
    }
    getDisplayName(item) {
      if (item.playerId == "SYSTEM") {
        let model = this.props.packetData.packetDetail
        if (model.type == "GRAB") {
          return { name: "免死", className: "god" }
        } else {
          return { name: item.playerNickName || "群主", className: "" }
        }
      }
      return { name: item.playerNickName || item.playerId, className: "" }
    }

    isGod(item) {
      return item.UID == 0
    }
  }
)
