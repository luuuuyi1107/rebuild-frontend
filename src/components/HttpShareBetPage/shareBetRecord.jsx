import React from "react"

import RecordPage from "@/components/RecordPage"
// import { Modal } from "react-onsenui"
// import util from "@/magic/util"

import "./style.scss"
import { gamesById } from "@/config/game"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      ServerTime: null,
    }
  }

  //总配置
  shareRecordConfig = {
    tabs: [
      {
        name: "分享注单记录",
        filter: [{ key: "id", type: "hidden", defaultValue: this.props.id }],
        listApi: "Room/GetShareList",
        listApiMethod: "get",
        renderRow: (row) => {
          return (
            <div className="month-record-item" key={"share-record-" + row.ID}>
              <p className="dd">
                <span>{gamesById[row.Content.LoId]}</span>
                <span>No.{row.Content.LoNo}期</span>
              </p>
              {row.Content.Items.map((betItem) => {
                let draw = "待开奖"
                if (betItem.Win == 0) {
                  draw = "未中奖"
                } else if (betItem.Win > 0) {
                  draw = "已中奖"
                }
                return (
                  <p className="dd" key={"share-record-item" + betItem.ID}>
                    <span>
                      {betItem.Play} {betItem.Bet}
                    </span>
                    {/*<span>{this.props.ServerTime && util.date.toDate(row.Content.ExT).getTime()-this.props.ServerTime >0?<b>待开奖</b>:(betItem.Win>0?<b style={{color:"#c30202"}}>已中奖</b>:<b>未中奖</b>)}</span>*/}
                    <span>
                      <b>{draw}</b>
                    </span>
                  </p>
                )
              })}
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
        <RecordPage config={this.shareRecordConfig} center="历史记录" />
      </div>
    )
  }
}
