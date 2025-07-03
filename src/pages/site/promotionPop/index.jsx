import React from "react"

import RecordPage from "@/components/RecordPage"

import "./style.scss"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        ID: 0,
      }
    }

    componentDidMount() {}

    config = {
      // defaultTabName: this.getDefaultTabName(),
      tabs: [
        {
          name: "最新活动",
          filter: [
            { key: "id", type: "hidden", defaultValue: util.getUrlParam("id") || 8 },
            { key: "status", type: "hidden", defaultValue: 0 },
            { key: "PageSize", type: "hidden", defaultValue: 50 },
          ],
          listApi: "Article/GetList",
          listApiMethod: "post",
          renderRow: this.renderRow.bind(this),
        },
      ],
    }

    renderRow(row, data) {
      return (
        <div
          className="promotion-record-item"
          key={row.ID}
          onClick={() => {
            this.props.router.push("/site/promotionContent", {
              id: row.ID,
              s: document.querySelector(".promotion-center-pop .page__content").scrollTop,
              title: "金花对战",
            })
          }}
        >
          {/*<div className="img-box">*/}
          {/*<div className="img-item">*/}
          {/*<img src={row.Name} alt="图片加载中..."/>*/}
          {/*</div>*/}
          {/*</div>*/}
          <div className="title">{row.Title}</div>
        </div>
      )
    }
    // getDefaultTabName(){
    //     let tabName = util.cache.get("promotionTab");
    //     this.currentTabName = tabName;
    //     util.cache.set("promotionTab", "");
    //     return tabName;
    // }
    // onTabClick(tab){
    //     this.currentTabName = tab.name;
    // }
    onListApiLoaded() {
      let scrollTop = util.cache.get("promotionScroll")
      if (scrollTop) {
        document.querySelector(".promotion-center-pop .page__content").scrollTop = scrollTop
      }
      util.cache.set("promotionScroll", "")
    }

    render() {
      return (
        <div>
          <RecordPage
            center="金花对战"
            config={this.config}
            className="promotion-center-page"
            // onTabClick={this.onTabClick.bind(this)}
            onListApiLoaded={this.onListApiLoaded.bind(this)}
          />
        </div>
      )
    }
  }
)
