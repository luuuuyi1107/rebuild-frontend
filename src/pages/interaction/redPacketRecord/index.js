import React from "react"

import RecordPage from "@/components/RecordPage"
import { Modal } from "react-onsenui"
import util from "@/magic/util"

import "./style.scss"

export default class extends React.PureComponent {
  //总配置
  totalCofig = {
    tabs: [
      {
        name: "红包记录",
        listApi: "User/GetRedsLogList",
        filter: [{ key: "id", type: "hidden", defaultValue: 0 }],
        listApiMethod: "get",
        renderRow: (row, data) => {
          return (
            <div className="balance-record-item" key={row.ID}>
              <div>标题：{row.Title}</div>
              <div>金额：￥{row.Money}</div>
              <div>时间：{util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}</div>
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
        <RecordPage config={this.totalCofig} className="interaction-redPacketRecord" center="红包记录" />
      </div>
    )
  }
}
