import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import "./style.scss"
import config from "@/config/config"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { getArticleList } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import { withTrialCheck } from "@/magic/withLogin"

@withTrialCheck
@withRouter
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      content: null,
      loading: true,
    }
  }
  componentDidMount() {
    this.loadData()
    this.setState({ loading: false })
  }

  async loadData() {
    let res = await getArticleList({ id: config.depositCenterID ? config.depositCenterID : -1, PageIndex: 1, PageSize: 10 })
    if (res.Code != 1) {
      apiNotification.alert(res, {}, this.props)
      return
    }
    if (!res.Data || res.Data.length === 0) {
      notificationAsync.toast("配置读取失败，请联系客服协助", {
        class: "baccarat-toast",
        timeout: 1200,
      })

      setTimeout(() => {
        this.props.router.back()
      }, 1500)
      return
    }
    let user = util.cache.get("user") || {}

    let content = res.Data[0].Content

    // content = content.replace("/#/news", util.getPage("site", "service"))
    // // content = content.replace( "iframe", "#target=iframe_+"+util.getPage("site", "service"));
    // if (util.isLogin()) {
    //   content = content.replace("/#/banks", util.getPage("site", "depositOffline"))
    //   content = content.replace("/#/GoPay", util.getPage("site", "depositGoPay"))
    //   content = content.replace("/#/LoginGOPay", util.getPage("site", "depositGoPay"))
    //   content = content.replace("/#/cards", util.getPage("site", "depositCard"))
    //   content = content.replace("/Index.Html#/pend", util.getPage("orderPost", "home"))
    // } else {
    //   content = content.replace("/#/banks", util.getPage("site", "login"))
    //   content = content.replace("/#/GoPay", util.getPage("site", "login"))
    //   content = content.replace("/#/LoginGOPay", util.getPage("site", "login"))
    //   content = content.replace("/#/cards", util.getPage("site", "login"))

    //   // content = content.replace('<a href="/Index.Html#/pend"><img src="https://ydtupian.com/货币商城.webp" alt="图片加载中.."/>挂单充值</a>', `<a id="orderPost"><img src="https://ydtupian.com/货币商城.webp" alt="图片加载中.."/><div class="czfs_r">挂单充值</div></a>`);
    //   content = content.replace("/web/site/depositOffline", util.getPage("site", "login"))
    //   content = content.replace("/web/site/depositCard", util.getPage("site", "login"))
    // }
    content = content.replace(/\(Myid\)/g, user.ID || 0)
    content = content.replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1"/>')
    content = content.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
    content = content.replace(/\n/g, "").replace(/<\/a>/g, "</a>\n")
    // content = content.replace(
    //   /<a href="(.*?)#target=iframe">(.*?)<\/a>/g,
    //   '<a href="' + util.getPage("site", "depositIframe") + '?depositLink=$1">$2</a>'
    // )
    // content = content.replace(/<a href="(.*?)#target=(.*?)">(.*?)<\/a>/g, '<a href="$1" target="$2">$3</a>')
    // content = content.replace(/<a href="(.*?)#&amp;f_u_c_k=y_o_u">(.*?)<\/a>/g, "<a href=\"$1\" target='_blank'>$2</a>")

    this.setState({
      content: <div dangerouslySetInnerHTML={{ __html: content }}></div>,
      loading: false,
    })

    // setTimeout(() => {
    //   document.querySelectorAll('a[href^="/Index.Html#/helpdetail"]').forEach((el) => {
    //     el.href = el.href.replace("/Index.Html#/helpdetail", "/web/site/promotionContent") + "&title=挂单教程"
    //   })
    // }, 0)

    // /web/site/promotionContent.html?id=96&title=挂单教程
  }

  render() {
    return (
      <LayoutPage
        className="site-deposit-center"
        center="充值中心"
        right={
          <span
            className="text-1.25 mr-1 text-white"
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/site/depositWithdrawRecord", { tab: "快充" })
            }}
          >
            充值记录
          </span>
        }
        loading={this.state.loading}
        onBack={() => {
          this.props.router.push("/site/home")
        }}
      >
        <div className="content">
          {this.state.content && this.state.content}
          <a href=""></a>
        </div>
      </LayoutPage>
    )
  }
}
