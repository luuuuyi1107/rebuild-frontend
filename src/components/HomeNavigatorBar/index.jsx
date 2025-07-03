import React from "react"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import config from "@/config/config"
import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import Badge from "@/components/Badge"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        Friends: 0,
        Notifys: 0,
        Message: 0,
        Service_Msgs: 0,
      }
    }
    componentDidMount() {
      window.addEventListener("globalMessage", this.update.bind(this))
      this.showPage()
    }
    componentWillUnmount() {
      window.removeEventListener("globalMessage", this.update.bind(this))
    }
    update(event) {
      let MsgCount = event.detail.MsgCount
      this.setState({
        Friends: MsgCount.Friends,
        Notifys: MsgCount.Notifys,
        Message: MsgCount.Messages,
        Service_Msgs: MsgCount.Service_Msgs,
      })
    }
    async showPage(e) {
      if (e && e.persisted) {
        this.setState({ Friends: 0, Notifys: 0, Message: 0, Service_Msgs: 0 })
        let res = await getPush()
        if (res.Code == 1) {
          this.update({ detail: res.Data })
        }
      }
    }

    render() {
      let number = this.state.Friends + this.state.Notifys + this.state.Message
      let user = util.cache.get("user") || {}

      return (
        <div className="home-navigator-bar">
          {this.props.active == "home" ? (
            <div
              className={`download-app tab`}
              onClick={() => {
                this.props.router.push("/site/download")
              }}
            >
              {/*<div className="icon"><Icon icon="ion-android-home"/></div>*/}
              <div className="icon">
                <Icon icon="ion-ios-cloud-download" />
              </div>
              <div className="text">导航</div>
            </div>
          ) : (
            <div
              className={`download-app tab ${this.props.active == "home" ? "active" : ""}`}
              onClick={() => {
                this.props.router.push("/site/home")
              }}
            >
              <div className="icon">
                <Icon icon="ion-android-home" />
              </div>
              <div className="text">首页</div>
            </div>
          )}

          <div
            className={`shop tab ${this.props.active == "shop" ? "active" : ""}`}
            onClick={async () => {
              let ShopConfig = await getPush({ keys: "shopset" })
              // let ShopConfig = await action.post("Config/Shop");
              if (ShopConfig.Code != 1) {
                apiNotification.alert(ShopConfig, {}, this.props)
                return
              }
              if (ShopConfig.Data.ShopSet.Status) {
                this.props.router.isLoginToOrRedirect("/shop/home")
              } else {
                notificationAsync.alert(ShopConfig.Data.ShopSet.CloseShow, { title: "商城关闭" })
              }
            }}
          >
            <div className="icon">
              <Icon icon="ion-android-cart" />
            </div>
            <div className="text">商城</div>
          </div>
          <div
            className={`user-center tab ${this.props.active == "my" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/site/my")
            }}
          >
            <div className="icon">
              <Icon icon="ion-android-person" />
            </div>
            <div className="text">我的</div>
          </div>

          <div
            className={`go-old-version tab`}
            onClick={() => {
              util.directToOldVersion()
            }}
          >
            <div className="icon">
              <Icon icon="ion-ios-undo" />
            </div>
            <div className="text">旧版</div>
          </div>

          <div
            className={`interaction tab ${this.props.active == "interaction" ? "active" : ""}`}
            onClick={() => {
              this.props.router.push("/interaction/home")
            }}
          >
            <div className="w-[36px] mx-auto">
              <Badge count={number} className="px-[1px] translate-y-[0]">
                <Icon icon="ion-pound" />
              </Badge>
            </div>
            <div className="text">互动</div>
          </div>
        </div>
      )
    }
  }
)
