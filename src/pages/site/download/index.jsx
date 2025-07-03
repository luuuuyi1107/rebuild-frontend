import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import { getArticleData } from "@/action/apis"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        webLink: null,
        downloadLink: null,
      }
    }
    componentDidMount() {
      const articlesId = import.meta.env.MODE === "dev" || import.meta.env.MODE === "development" ? [164, 165] : [317, 318]
      Promise.all(articlesId.map(getArticleData)).then(([download, webLink]) => {
        if (download.Code != 1) {
          apiNotification.alert(download, {}, this.props)
        }
        if (webLink.Code != 1) {
          apiNotification.alert(webLink, {}, this.props)
        }
        if (download.Code == 1 && download.Data && webLink.Code == 1 && webLink.Data) {
          this.setState({
            downloadLink: download.Data.Content.replace(/<[^>]*>/g, ""), // remove html tags
            webLink: webLink.Data.Content.replace(/<[^>]*>/g, ""),
          })
        }
      })
    }

    renderWebLink(links) {
      let ret = []
      let webLinks = links.split("|")
      webLinks.map((webLink) => {
        ret.push(
          <a key={webLink} href={"http://www." + webLink} target="_blank" className="webLink">
            <span className="link">{webLink}</span>
            <span className="go">
              <span>立即前往</span>
            </span>
          </a>
        )
      })

      return ret
    }

    renderDownloadLink(links) {
      let downloadLinks = links.split("|")

      return (
        <div className="download-content">
          <div className="left"></div>
          <div className="right">
            <a className="downloadLink ios" href={downloadLinks[0]} target="_blank"></a>
            <a className="downloadLink and" href={downloadLinks[1]} target="_blank"></a>
            <a className="downloadLink service" href={downloadLinks[2]} target="_blank"></a>
          </div>
        </div>
      )
    }

    render() {
      let webLinks = this.state.webLink
      let downloadLinks = this.state.downloadLink

      return (
        <LayoutPage className="download-page" center="线路更换" right={null}>
          <div className="top-box">
            <div className="logo">
              <img src={util.buildAssetsPath("/assets/logo.gif")} />
            </div>
          </div>
          <div className="link-content">{webLinks && this.renderWebLink(webLinks)}</div>
          {downloadLinks && this.renderDownloadLink(downloadLinks)}
        </LayoutPage>
      )
    }
  }
)
