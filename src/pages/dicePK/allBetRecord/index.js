import React from "react"

import RecordPage from "@/components/RecordPage"

import GoldenPKNavigatorBar from "@/components/GoldenPKNavigatorBar"
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
        listApi: "PKGame/DiceList",
        listApiMethod: "get",
        renderRow: (row, data) => {
          let status = "等待挑战"
          if (row.Status == 1) {
            status = "擂台主胜"
          } else if (row.Status == 2) {
            status = "挑战者胜"
          } else if (row.Status == 3) {
            status = "双方和局"
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
                <p>擂台</p>
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
    let defender = (roundDetail && roundDetail.UserCards) || null
    let Challenger = (roundDetail && roundDetail.DareCards) || null
    if (defender) {
      defender = defender.split(",")
    }
    if (Challenger) {
      Challenger = Challenger.split(",")
    }
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
            {defender && Challenger ? (
              <div className="poker dianItem">
                {defender.map((item) => {
                  return <div className={"dice dice" + item}></div>
                })}
              </div>
            ) : (
              <div className="poker dianItem">
                <div className={"dice diceQ1"}></div>
                <div className={"dice diceQ2"}></div>
                <div className={"dice diceQ3"}></div>
              </div>
            )}
          </div>
        </div>
        <div className="item Xdian dian">
          <div className="dianItem">
            <span className="profession">
              {Challenger ? "挑战者 : " + roundDetail.DareNick + " (" + roundDetail.DareUID + ")" : "挑战者 : 等待挑战"}
            </span>
          </div>
          {Challenger ? (
            <div className="poker dianItem">
              {Challenger.map((item) => {
                return <div className={"dice dice" + item}></div>
              })}
            </div>
          ) : (
            <div className="poker dianItem">
              <div className={"dice diceQ1"}></div>
              <div className={"dice diceQ2"}></div>
              <div className={"dice diceQ3"}></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  render() {
    let roundDetail = this.state.roundDetail
    let defender = (roundDetail && roundDetail.UserCards) || null
    let Challenger = (roundDetail && roundDetail.DareCards) || null
    let defenderSum = 0
    let ChallengerSum = 0
    if (defender && Challenger) {
      defender = defender.split(",")
      Challenger = Challenger.split(",")
      defender.map((item) => {
        defenderSum += parseInt(item, 10)
      })
      Challenger.map((item) => {
        ChallengerSum += parseInt(item, 10)
      })
    }
    return (
      <div>
        <RecordPage
          config={this.totalCofig}
          className="goldenPK-history"
          center="历史擂台"
          renderFixed={() => <GoldenPKNavigatorBar active="allBet" PKGame="dicePK" />}
        />

        {/* 战况细节 */}
        <Modal isOpen={this.state.showRoundDetail} className="report-record-modal round-detail-modal" animation="fade">
          {this.state.showRoundDetail && (
            <div className="modal-inner">
              {roundDetail && (
                <div className="main-title">
                  <span>{roundDetail.ID} 擂台</span>
                  <span>（彩金：{roundDetail.Money}）</span>
                </div>
              )}
              <div className="round-content">
                {roundDetail && this.renderRoundDetail()}
                {defender && Challenger && (
                  <div className="title">
                    {defenderSum} vs {ChallengerSum}
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
