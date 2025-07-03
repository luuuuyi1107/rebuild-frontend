import React from "react"
import "./menu.scss"
import RecordPage from "@/components/RecordPage"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      content: "",
      title: "",
    }
    this.tableRoundBetRecord = {
      tabs: [
        {
          name: "本局注单",
          filter: [
            { key: "gid", type: "hidden", defaultValue: this.props.gameID },
            { key: "PageSize", type: "hidden", defaultValue: 100 },
          ],
          listApi: "Baccarat/GetBetList",
          listApiMethod: "post",
          renderRow: (row, data) => {
            let status = "未开奖"
            if (row.Status == 1) {
              status = "中奖" + row.Win + "元"
            } else if (row.Status == 2) {
              status = "未中奖"
            } else if (row.Status == 3) {
              status = "和局"
            }
            return (
              <div className="recordItem game-table-bet-detail-item" key={"betRecord" + row.ID}>
                <p className="tl">
                  时间：{util.date.format(util.date.toDate(row.Time), "YYYY-MM-DD hh:mm:ss")}
                  <span className="right">{row.Status == 1 ? <b style={{ color: "#c30202" }}>{status}</b> : status}</span>
                </p>
                <p className="dd">
                  <span>金额：{row.Money} 元</span>
                  <span>类型：{row.BetName}</span>
                  <span style={{ width: "100%" }}>玩家：{row.NickName}</span>
                </p>
              </div>
            )
          },
        },
      ],
    }
  }

  componentDidMount() {}

  render() {
    return (
      <div className="round-bet">
        <RecordPage className="baccarat-gameRoundBetDetail" right={null} config={this.tableRoundBetRecord} center={null} key={location.hash} />
      </div>
    )
  }
}
