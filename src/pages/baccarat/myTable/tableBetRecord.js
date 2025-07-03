import React from "react"
import "./style.scss"
import RecordPage from "@/components/RecordPage"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      content: "",
      title: "",
    }
  }

  componentDidMount() {}

  totalCofig = {
    tabs: [
      {
        name: "台面记录",
        filter: [{ key: "id", type: "hidden", defaultValue: this.props.id }],
        listApi: "Baccarat/GetLogList",
        listApiMethod: "post",
        renderRow: (row, data) => {
          return (
            <div className="table-detail-item" key={row.UID}>
              <p className="tl">时间: {util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}</p>
              <p className="dd">
                <span style={{ width: "33%" }}>ID:{row.ID}</span>
                <span style={{ width: "33%" }}>
                  金额：<b style={{ color: "#c30202" }}>{row.Amount}</b>元
                </span>
                <span style={{ width: "33%" }}>
                  余额：<b style={{ color: "#c30202" }}>{row.Balance}</b>元
                </span>
                <span style={{ width: "100%" }}>事件：{row.Text}</span>
              </p>
            </div>
          )
        },
      },
    ],
  }

  render() {
    return <RecordPage config={this.totalCofig} className="table-bet-record" center="台面记录" right={null} />
  }
}
