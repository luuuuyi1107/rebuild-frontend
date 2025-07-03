import React from "react"

import RecordPage from "@/components/RecordPage"
import { Modal } from "react-onsenui"
import util from "@/magic/util"

export default class extends React.PureComponent {
  //总配置
  totalCofig = {
    tabs: [
      {
        name: "我的下线",
        listApi: "Pyramid/GetRecommendList",
        listApiMethod: "get",
        renderRow: (row, data) => {
          return (
            <div className="record-item" key={row.UID}>
              <p className="tl">
                昵称：{row.NickName}
                <span className="right primary">贡献：{row.Devote}元</span>
              </p>
              <p className="dd">{row.Vip ? "达标" : "未达标"}</p>
              <p className="dd">
                <span>彩票打码：{row.LotteryBet}元</span>
                <span>彩票盈利：{row.LotteryWin}元</span>
                <span>对战打码：{row.PVPBet}元</span>
                <span>对战盈利：{row.PVPWin}元</span>
                <span>棋牌打码：{row.PokerBet}元</span>
                <span>棋牌盈利：{row.PokerWin}元</span>
                <span>充值总额：{row.RecMoney}元</span>
                <span>提款总额：{row.WrawMoney}元</span>
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
        <RecordPage config={this.totalCofig} className="site-deposit-withdraw-record" center="我的下线" />
      </div>
    )
  }
}
