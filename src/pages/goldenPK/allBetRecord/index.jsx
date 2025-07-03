import React from "react"

import RecordPage from "@/components/RecordPage"

import GoldenPKNavigatorBar from "@/components/GoldenPKNavigatorBar"
import Poker from "@/pages/goldenPK/gameTable/Poker"
import { Icon, Modal } from "react-onsenui"
import "./style.scss"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showRoundDetail: false,
      roundDetail: null,
    }
  }
  //总配置
  totalCofig = {
    tabs: [
      {
        name: "历史擂台",
        filter: [
          { key: "type", type: "hidden", defaultValue: 0 },
          { key: "status", type: "hidden", defaultValue: -1 },
          { key: "sort", type: "hidden", defaultValue: 0 },
          { key: "PageIndex", type: "hidden", defaultValue: 1 },
          { key: "PageSize", type: "hidden", defaultValue: 20 },
        ],
        listApi: "PKGame/GoldenList",
        listApiMethod: "get",
        renderRow: (row, data) => {
          let status = "等待挑战"
          if (row.Status == 1) {
            status = "擂台主胜"
          } else if (row.Status == 2) {
            status = "挑战者胜"
          } else if (row.Status == 3) {
            status = "和局"
          }
          let className = "state"
          if (row.Status == 1) {
            className = "win"
          } else if (row.Status == 2) {
            className = "lose"
          }

          return (
            <div className="recordItem" key={"betRecord" + row.ID} onClick={() => this.setState({ showRoundDetail: true, roundDetail: row })}>
              <div className="left tl">
                <p>{row.ID}</p>
                <p>牌局</p>
              </div>
              <div className="center info">
                <span className="name">
                  <span>
                    <Icon icon="ion-person" />
                  </span>
                  <b>{row.NickName}</b>&nbsp;
                  <b>(ID:{row.UID})</b>
                </span>
                <span className="money">彩金：{row.Money}</span>
              </div>
              <div className="right">
                <span className={className}>输赢：{status}</span>
                <Icon icon="ion-ios-arrow-right" />
              </div>
            </div>
          )
        },
      },
    ],
  }

  renderRoundDetail() {
    let roundDetail = this.state.roundDetail
    let defender = (roundDetail && roundDetail.UserCards) || {}
    let Challenger = (roundDetail && roundDetail.DareCards) || {}
    let status = ""
    switch (roundDetail.Status) {
      case 0:
        status = "下注中"
        break
      case 1:
        status = "庄家发牌"
        break
      case 2:
        status = "闲家发牌"
        break
      case 3:
        status = "兑奖中"
        break
      case 4:
        status = "完结"
        break
    }
    return (
      <div className="round-info">
        <div className="item Zdian dian">
          <div className="dianItem">
            <span className="profession">
              擂台主 : {roundDetail.NickName} ({roundDetail.UID})
            </span>
          </div>
          <div className="poker dianItem">
            {defender && defender.length
              ? defender.map((item, index) => {
                  return <Poker key={index} className={`zhuang poker-${index}`} value={item.code} shape={item.name} />
                })
              : null}
          </div>
          {/*<div className="point dianItem">{roundDetail.UserXingTai}</div>*/}
        </div>
        {Challenger && Challenger.length && (
          <div className="item Xdian dian">
            <div className="dianItem">
              <span className="profession">
                挑战者 : {roundDetail.DareNick} ({roundDetail.DareUID})
              </span>
            </div>
            <div className="poker dianItem">
              {Challenger.map((item, index) => {
                return <Poker key={index} className={`xian poker-${index}`} value={item.code} shape={item.name} />
              })}
            </div>
            {/*<div className="point dianItem">{roundDetail.DareXingTai}</div>*/}
          </div>
        )}
      </div>
    )
  }

  render() {
    let roundDetail = this.state.roundDetail
    // console.log(roundDetail);
    return (
      <div>
        <RecordPage
          config={this.totalCofig}
          className="goldenPK-history"
          center="历史擂台"
          renderFixed={() => <GoldenPKNavigatorBar active="allBet" PKGame="goldenPK" />}
        />

        {/* 战况细节 */}
        <Modal isOpen={this.state.showRoundDetail} className="report-record-modal round-detail-modal" animation="fade">
          {this.state.showRoundDetail && (
            <div className="modal-inner">
              {roundDetail && <div className="main-title">第 {roundDetail.ID} 局</div>}
              <div className="round-content">
                <div className="title">
                  <span>彩金：{roundDetail.Money}</span>
                </div>
                {roundDetail && this.renderRoundDetail()}
                {roundDetail.UserXingTai && roundDetail.DareXingTai && (
                  <div className="title">
                    {roundDetail.UserXingTai} vs {roundDetail.DareXingTai}
                  </div>
                )}
                {/*<TableRoundBet gameID={roundDetail.ID}></TableRoundBet>*/}
              </div>
              <div
                className="close"
                onClick={() => {
                  this.setState({ showRoundDetail: false })
                }}
              >
                <Icon icon="ion-close-round" />
              </div>
            </div>
          )}
        </Modal>
      </div>
    )
  }
}
