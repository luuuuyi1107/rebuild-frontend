import React from "react"

import RecordPage from "@/components/RecordPage"
import util from "@/magic/util"

export default class extends React.PureComponent {
  //总配置
  totalCofig = {
    tabs: [
      {
        name: "收益记录",
        listApi: "Pyramid/GetRecommendLogList",
        listApiMethod: "get",
        renderRow: (row, data) => {
          return (
            <div className="record-item" key={row.ID}>
              <p className="tl">
                <span>日期: {util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}</span>
                <span className="right">
                  收益：<b style={{ color: row.Money !== 0 && "#c30202" }}>{row.Money}</b>元
                </span>
              </p>
              <p className="dd">
                <span style={{ width: "33%" }}>收益编号：{row.UID}</span>
                <span style={{ width: "33%" }}>昵称：{row.NickName}</span>
                <span style={{ width: "33%" }}>等级：{row.LevelInt}</span>
              </p>
            </div>
          )
        },
      },
    ],
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <RecordPage config={this.totalCofig} className="site-deposit-withdraw-record" center="收益记录" />
      </div>
    )
  }
}
