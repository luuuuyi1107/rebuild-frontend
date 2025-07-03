import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import util from "@/magic/util"

import "./style.scss"
import { Icon } from "react-onsenui"
import * as apiNotification from "@/magic/ApiNotification"
import ClipboardJS from "clipboard"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        promotion: null,
        content: null,
      }
    }
    componentDidMount() {
      this.loadData()
      let _this = this
      window.copy = function (element) {
        let text = element.getAttribute("data")
        _this.onCopy(text)
      }
    }

    onCopy(text) {
      let fakeElement = document.createElement("button")

      let clipboard = new ClipboardJS(fakeElement, {
        text: function () {
          return text
        },
        action: function () {
          return "copy"
        },
        container: typeof container === "object" ? container : document.body,
      })
      clipboard.on("success", function (e) {
        clipboard.destroy()

        notificationAsync.alert("已成功复制到剪贴板", {
          title: "复制成功",
        })
      })
      clipboard.on("error", function (e) {
        clipboard.destroy()
        //alert(JSON.stringify(e));
        notificationAsync.alert({
          title: "浏览器不支持，请手动复制",
          messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
        })
      })
      document.body.appendChild(fakeElement)
      fakeElement.click()
      document.body.removeChild(fakeElement)
    }

    loadData() {
      let id = util.getUrlParam("id")
      let d = action.get("Article/GetData", { id: id })
      d.then((res) => {
        this.setState({ loading: false })
        let user = util.cache.get("user") || {}
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }
        let promotionInfo = res.Data
        let content = promotionInfo.Content

        content = content.replace(/\(Myid\)/g, user.ID || 0)
        content = content.replace(/\(Cid\)/g, user.Token || "")
        content = util.formatUbb(content)

        this.setState({ promotion: promotionInfo, content: <div dangerouslySetInnerHTML={{ __html: content }}></div> })
      })
    }
    goBack() {
      util.cache.set("promotionTab", util.getUrlParam("tab"))
      util.cache.set("promotionScroll", util.getUrlParam("s") || 0)
      this.props.router.back()
    }

    render() {
      let title = util.getUrlParam("title")
      return (
        <LayoutPage
          className="site-promotion-content"
          center={title ? title : "优惠活动"}
          right={null}
          loading={this.state.loading}
          onBack={this.goBack.bind(this)}
        >
          {this.state.promotion && (
            <div className="content">
              <div className="promotionInfo">
                <div className="title">{this.state.promotion.Title}</div>
                <div className="time">
                  <span>{util.date.format(util.date.toDate(this.state.promotion.AddTime), "yyyy/MM/dd hh:mm:ss")}</span>
                  <span className="num">
                    <Icon icon="ion-eye" />
                    {this.state.promotion.Cick}
                  </span>
                </div>
              </div>
              <div className="txt">{this.state.content && this.state.content}</div>
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
