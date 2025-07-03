import React from "react"

import RecordPage from "@/components/RecordPage"

import "./style.scss"
import config from "@/config/config"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        ID: 0,
        promotionCenterID: -3,
      }
    }

    renderRow(row, data) {
      return (
        <div
          className="promotion-record-item"
          key={row.ID}
          onClick={() => {
            this.props.router.push("/site/promotionContent", {
              id: row.ID,
              tab: this.currentTabName || "",
              s: document.querySelector(".promotion-center-page .page__content").scrollTop,
            })
          }}
        >
          <div className="img-box">
            <div className="img-item">
              <img src={row.Name} alt="图片加载中..." />
            </div>
          </div>
          <div className="title">{row.Title}</div>
        </div>
      )
    }
    getDefaultTabName() {
      let tabName = util.cache.get("promotionTab")
      this.currentTabName = tabName
      util.cache.set("promotionTab", "")
      return tabName
    }
    onTabClick(tab) {
      this.currentTabName = tab.name
    }
    onListApiLoaded() {
      const scrollTop = util.cache.get("promotionScroll")
      if (scrollTop) {
        document.querySelector(".promotion-center-page .page__content").scrollTop = scrollTop
      }
      util.cache.set("promotionScroll", "")
    }

    render() {
      const config = {
        defaultTabName: this.getDefaultTabName(),
        tabs: [
          {
            name: "最新活动",
            filter: [
              { key: "id", type: "hidden", defaultValue: this.state.promotionCenterID },
              { key: "status", type: "hidden", defaultValue: 0 },
            ],
            listApi: "Article/GetList",
            listApiMethod: "post",
            renderRow: this.renderRow.bind(this),
            className: "remove-padding",
          },
          {
            name: "全部活动",
            filter: [
              { key: "id", type: "hidden", defaultValue: this.state.promotionCenterID },
              { key: "status", type: "hidden", defaultValue: 1 },
              { key: "PageSize", type: "hidden", defaultValue: 50 },
            ],
            listApi: "Article/GetList",
            listApiMethod: "post",
            sort: ["PxID", -1],
            renderRow: this.renderRow.bind(this),
            className: "remove-padding",
          },
          {
            name: "已结束活动",
            filter: [
              { key: "id", type: "hidden", defaultValue: this.state.promotionCenterID },
              { key: "status", type: "hidden", defaultValue: 2 },
              { key: "PageSize", type: "hidden", defaultValue: 100 },
            ],
            listApi: "Article/GetList",
            listApiMethod: "post",
            sort: ["PxID", -1],
            renderRow: this.renderRow.bind(this),
            className: "remove-padding",
          },
        ],
      }
      return (
        <div>
          <RecordPage
            center="优惠活动"
            config={config}
            className="promotion-center-page"
            onTabClick={this.onTabClick.bind(this)}
            onListApiLoaded={this.onListApiLoaded.bind(this)}
          />
        </div>
      )
    }
  }
)
