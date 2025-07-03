import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import ClipboardJS from "clipboard"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import Env from "@/magic/env"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        serviceContent: null,
      }
    }
    componentDidMount() {
      let _this = this
      this.loadServiceUrl(Env.isDev() ? 24 : 397)
      window.copy = function (element) {
        let text = element.getAttribute("data-clipboard-text")
        _this.onCopy(text.trim())
      }
    }
    async loadServiceUrl(id) {
      let res = await action.post("Article/GetData", { id: id })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      if (res.Data && res.Data.Content && res.Data.Content.length > 0) {
        let htmlContent = res.Data.Content
        htmlContent = htmlContent.replace("{p=dff-2}", "")
        htmlContent = htmlContent.replace("{/p}", "")
        htmlContent = htmlContent.replace("[hr]", "")

        htmlContent = htmlContent.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
        htmlContent = htmlContent.replace(/<a href="(.*?)#target=(.*?)">/g, '<a href="$1" target="$2">')
        htmlContent = htmlContent.replace(/<a href="(.*?)#&amp;f_u_c_k=y_o_u">/g, "<a href=\"$1\" target='_blank'>")
        htmlContent = htmlContent.replace(
          /\{Copy=Copy\}(.+?)\{\/Copy\}/gi,
          '<span class="copy-line"><span class="copy-text" data-clipboard-text="$1" onclick=\'copy(this)\'>$1</span></span>'
        )

        this.setState({ serviceContent: htmlContent })
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

        notificationAsync.alert("已成功复制", {
          title: "复制成功",
        })
      })
      clipboard.on("error", function (e) {
        clipboard.destroy()
        notificationAsync.alert({
          title: "浏览器不支持，请手动复制",
          messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
        })
      })
      document.body.appendChild(fakeElement)
      fakeElement.click()
      document.body.removeChild(fakeElement)
    }

    render() {
      return (
        <LayoutPage right={null} center="客服中心" className="admin-service-page">
          <div className="admin-service-page-inner">
            <div className="page-content" dangerouslySetInnerHTML={{ __html: this.state.serviceContent }}></div>
          </div>
        </LayoutPage>
      )
    }
  }
)
