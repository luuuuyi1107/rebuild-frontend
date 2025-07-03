import React from "react"

import LayoutPage from "@/components/LayoutPage"
import LotteryHead from "@/components/LotteryHead"
import LotteryTab from "@/components/LotteryTab"
import PlayRules from "./PlayRules"
import Broadcast from "@/components/Broadcast"
import CustomerServiceMsg from "@/components/CustomerServiceMsg"
import util from "@/magic/util"
import "./style.scss"
import siteConfig from "@/config/config"
import * as action from "@/action"
import InfoManager from "@/components/InfoManager"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

const config = {
  ssc: require("@/config/ssc"),
  syxw: require("@/config/syxw"),
  lhc: require("@/config/lhc"),
  pcdd: require("@/config/pcdd"),
  pks: require("@/config/pks"),
  klsf: require("@/config/klsf"),
  klb: require("@/config/klb"),
  ks: require("@/config/ks"),
  qxc: require("@/config/qxc"),
  fc3: require("@/config/fc3"),
}

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        loading: true,
        LotteryRate: {},
      }
    }

    componentDidMount() {
      this.load()
    }

    componentDidUpdate(preProps) {
      if (preProps.route.query.id != this.props.route.query.id) {
        this.load()
      }
    }

    async load() {
      if (!this.props.route.query.id) {
        this.props.router.back()
        return
      }
      getPush({ lotteryid: this.props.route.query.id, keys: "lotteryrate" }, null, 10 * 60 * 1000) //请求缓存10分钟
        .then((res) => {
          if (
            res.Code == 1 &&
            res.Data.hasOwnProperty("OpenLottery") &&
            (typeof res.Data.OpenLottery === "string" || res.Data.OpenLottery instanceof String)
          ) {
            //代表彩种被关闭-或其他状态
            notificationAsync.alert(res.Data.OpenLottery, { title: " 错误提示" }).then(() => {
              this.props.router.back()
            })
          } else if (res.Code == -5) {
            this.props.router.push("/site/maintain")
          }
          this.setState({ LotteryRate: res.Data.LotteryRate?.Rate })
        })
    }

    getPage(p1, p2, data) {
      this.props.router.push(`/${p1}/${p2}`, data)
    }

    render() {
      const game = util.findGames(this.props.route.query.id)
      const type = util.getUrlParam("lotteryType") || game.type
      const isFromFavorite = !!util.getUrlParam("fromFavorites")
      let isAdSite = false
      return (
        <LayoutPage
          className="ssc-home"
          title={game.name}
          onBack={() => {
            if (isFromFavorite) {
              this.props.router.back()
            } else {
              this.props.router.push("/site/home")
            }
          }}
        >
          <CustomerServiceMsg />
          <Broadcast />
          <LotteryHead lotteryId={this.props.route.query.id} lotteryType={type} drawLive={!isAdSite} />
          <LotteryTab lotteryId={this.props.route.query.id} lotteryType={type} rule="lottery" />
          <PlayRules id={this.props.route.query.id} rules={config[type]} go={this.getPage.bind(this)} LotteryRate={this.state.LotteryRate} />
          <InfoManager push={this.props.router.push} />
        </LayoutPage>
      )
    }
  }
)
