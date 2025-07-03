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
        name: "余额明细",
        filter: [{ key: "ac", type: "hidden", defaultValue: 0 }],
        listApi: "User/GetUser_Logs",
        listApiMethod: "get",
        renderRow: (row, data) => {
          return (
            <div className="balance-record-item" key={row.ID}>
              <p className="tl">
                时间：{util.date.format(util.date.toDate(row.AddTime), "yyyy-MM-dd hh:mm:ss")}
                <span className="right primary" style={row.AddBool ? { color: "red" } : { color: "green" }}>
                  {row.AddBool ? "+" : "-"}
                  {row.Amount}
                </span>
              </p>
              <p className="dd">账户总额：&nbsp;{row.Balance} 元</p>
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
        <RecordPage config={this.totalCofig} className="site-deposit-withdraw-record" center="余额明细" />
      </div>
    )
  }
}
