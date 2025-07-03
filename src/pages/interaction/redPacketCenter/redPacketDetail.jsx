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
        name: this.props.title || "红包明细",
        filter: [{ key: "id", type: "hidden", defaultValue: this.props.id }],
        listApi: "User/GetRedsLogList",
        listApiMethod: "post",
        renderRow: (row, data) => {
          return (
            <div className="detail-item" key={row.UID}>
              <div className="date">{util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}</div>
              <div>玩家：{row.NickName}</div>
              <div>
                金額：<b style={{ color: "#c30202" }}>{row.Money}</b>元
              </div>
            </div>
          )
        },
      },
    ],
  }

  render() {
    return <RecordPage config={this.totalCofig} className="red-packet-detail" center="红包明细" />
  }
}
