import React from "react"

import RecordPage from "@/components/RecordPage"

import BaccaratNavigatorBar from "@/components/BaccaratNavigatorBar"

export default class extends React.PureComponent {
  //总配置
  totalCofig = {
    tabs: [
      {
        name: "我的下注",
        filter: [{ key: "id", type: "hidden", defaultValue: 0 }],
        listApi: "Baccarat/GetBetList",
        listApiMethod: "get",
        renderRow: (row, data) => {
          let status = "未开奖"
          if (row.Status == 1) {
            status = "已中奖"
          } else if (row.Status == 2) {
            status = "未中奖"
          } else if (row.Status == 3) {
            status = "和局"
          }
          return (
            <div className="recordItem" key={"betRecord" + row.ID}>
              <p className="tl">
                第{row.ZID}桌 - 第{row.GID}局{" "}
                <span className="right" style={{ color: row.Status == 1 ? "#c30202" : "#666" }}>
                  {status}
                </span>
              </p>
              <p className="dd">
                <span>投注类型：{row.BetName}</span>
                <span>
                  投注金额：<b style={{ color: "#c30202" }}>{row.Money}</b>元
                </span>
              </p>
            </div>
          )
        },
      },
    ],
  }

  render() {
    return (
      <div>
        <RecordPage
          config={this.totalCofig}
          className="baccarat-myBetRecord"
          center="我的下注"
          renderFixed={() => <BaccaratNavigatorBar active="mybet" />}
        />
      </div>
    )
  }
}
