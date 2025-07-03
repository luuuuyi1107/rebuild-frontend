import React from "react"
import { Icon, Modal } from "react-onsenui"
import util from "@/magic/util"
import RecordPage from "@/components/RecordPage"
import TableRoundBet from "./tableRoundBet"
import Poker from "./Poker"

import "./menu.scss"
import * as action from "@/action"
import ClipboardJS from "clipboard"
import ModalPage from "@/components/ModalPage"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showAction: false,
      showTableBetRecord: false,
      showRoundRecord: false,
      showRoundDetail: false,
      roundDetail: null,
      showWinStatistic: false,
      statisticData: null,
    }
    //打码统计日报
    this.tableBetRecord = {
      tabs: [
        {
          name: "本桌注单",
          filter: [{ key: "zid", type: "hidden", defaultValue: this.props.gameTableID }],
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
            /** 尽量使用recordPage的默认样式 */
            return (
              <div className="recordItem" key={"betRecord" + row.ID}>
                <p className="tl">
                  时间：{util.date.format(util.date.toDate(row.Time), "YYYY-MM-DD hh:mm:ss")}
                  <span className="right">{row.Status == 1 ? <b style={{ color: "#c30202" }}>{status}</b> : status}</span>
                </p>
                <p className="dd">
                  <span>局数：{row.GID}</span>
                  <span>玩家：{row.NickName}</span>
                  <span>类型：{row.BetName}</span>
                  <span>金额：{row.Money} 元</span>
                </p>
              </div>
            )
          },
        },
      ],
    }
    this.tableRoundRecord = {
      tabs: [
        {
          name: "战况",
          filter: [{ key: "ID", type: "hidden", defaultValue: this.props.gameTableID }],
          listApi: "Baccarat/GetBoardList",
          listApiMethod: "post",
          renderRow: (row, data) => {
            let winning = "和局"
            if (row.Poker.Zdian > row.Poker.Xdian) {
              winning = "庄赢"
            } else if (row.Poker.Zdian < row.Poker.Xdian) {
              winning = "闲赢"
            }
            /** 尽量使用recordPage的默认样式 */
            return (
              <div className="recordItem" key={"betRecord" + row.ID}>
                <p className="tl">
                  第{row.GID}局{" "}
                  <span className="right" style={{ color: "#c30202" }} onClick={() => this.setState({ showRoundDetail: true, roundDetail: row })}>
                    查看明细
                  </span>
                </p>
                <p className="dd">
                  <span style={{ width: "33%" }}>庄：{row.Poker.Zdian}点</span>
                  <span style={{ width: "33%" }}>闲：{row.Poker.Xdian}点</span>
                  <span style={{ width: "33%" }}>{winning}</span>
                </p>
              </div>
            )
          },
        },
      ],
    }
    this.tableRoundBetRecord = {
      tabs: [
        {
          name: "本局注单",
          filter: [{ key: "gid", type: "hidden", defaultValue: this.props.gameTableID }],
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
                  <span>玩家：{row.NickName}</span>
                </p>
                <p className="dd">
                  <span>类型：{row.BetName}</span>
                  <span>金额：{row.Money} 元</span>
                </p>
              </div>
            )
          },
        },
      ],
    }
  }

  componentDidMount() {
    this.listenClipboard()
  }
  componentWillUnmount() {
    this.clipboardInstance?.destroy()
  }

  listenClipboard() {
    this.clipboardInstance = new ClipboardJS(".copy-btn")
    this.clipboardInstance.on("success", function (e) {
      notificationAsync.alert("已成功复制到剪贴板", {
        title: "复制成功, 发送链接给好友",
      })
    })

    this.clipboardInstance.on("error", function (e) {
      notificationAsync.alert("请手动选择文字进行复制", {
        title: "复制失败",
      })
    })
  }

  onMenuClick(index) {
    if (index == 0) {
      this.setState({ showTableBetRecord: true })
    } else if (index == 1) {
      action.post("Baccarat/GetBoardList", { PageIndex: 1, PageSize: 15, ID: this.props.gameTableID }, (res) => {
        if (res.Code == 1) {
          this.setState({ showWinStatistic: true, statisticData: res.Data })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      })
    } else if (index == 2) {
      this.setState({ showRoundRecord: true })
    }
  }

  renderRoundDetail() {
    let roundDetail = this.state.roundDetail
    let pokers = (roundDetail && roundDetail.Poker) || {}
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
          <div className="dianItem">庄家</div>
          <div className="poker dianItem">
            {pokers.Zhuan && pokers.Zhuan.length
              ? pokers.Zhuan.map((item, index) => {
                  return <Poker key={index} className={`zhuang poker-${index}`} value={item.code} shape={item.name} />
                })
              : null}
          </div>
          <div className="point dianItem">{roundDetail.Poker.Zdian}点</div>
        </div>
        <div className="item Xdian dian">
          <div className="dianItem">闲家</div>
          <div className="poker dianItem">
            {pokers.Xian && pokers.Xian.length
              ? pokers.Xian.map((item, index) => {
                  return <Poker key={index} className={`xian poker-${index}`} value={item.code} shape={item.name} />
                })
              : null}
          </div>
          <div className="point dianItem">{roundDetail.Poker.Xdian}点</div>
        </div>
        <div className="item p30">
          <span>状态：{status}</span>
        </div>
        <div className="item p30">
          <span>下注：{roundDetail.BetMoney}</span>
        </div>
        <div className="item p30">
          <span>派奖：{roundDetail.WinMoney}</span>
        </div>
      </div>
    )
  }

  renderWinStatistic() {
    let data = this.state.statisticData
    let statistic = []
    let lastWin = null
    let column = 0
    statistic[column] = []
    data.map((record) => {
      let poker = record.Poker
      if (poker.Zdian > poker.Xdian) {
        if (lastWin == "Xdian") {
          column++
          statistic[column] = []
        }
        lastWin = "Zdian"
        statistic[column].push({ win: "Z", number: poker.Zdian })
      } else if (poker.Zdian < poker.Xdian) {
        if (lastWin == "Zdian") {
          column++
          statistic[column] = []
        }
        lastWin = "Xdian"
        statistic[column].push({ win: "X", number: poker.Xdian })
      } else {
        statistic[column].push({ win: "D", number: poker.Xdian })
      }
    })

    let maxColumn = 15
    let maxRow = 3
    if (statistic.length > 15) {
      maxColumn = statistic.length
    }
    statistic.map((data) => {
      if (data.length > maxRow) {
        maxRow = data.length
      }
    })

    let columns = []

    for (let i = 0; i < maxColumn; i++) {
      columns.push(<div className="column"></div>)
    }

    return (
      <div className="statisticScroll">
        <div className="statisticList">
          {statistic.map((column, index) => {
            let ret = []
            return (
              <div className="column" key={"column" + index}>
                {column.map((row, rowIndex) => {
                  ret.push(
                    <div className="row" key={"row" + rowIndex + index}>
                      <span className={"rowBall " + row.win}>{row.number}</span>
                    </div>
                  )
                  if (statistic[index].length == rowIndex + 1 && statistic[index].length < maxRow) {
                    for (let x = 0; x < maxRow - statistic[index].length; x++) {
                      ret.push(<div className="row" key={"row" + rowIndex + index + x}></div>)
                    }
                  }
                  if (statistic[index].length == rowIndex + 1) {
                    return ret
                  }
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  render() {
    let roundDetail = this.state.roundDetail
    return (
      <div className="baccarat-menu">
        <div
          className="btn"
          onClick={() => {
            this.setState({ showAction: true })
          }}
        >
          明细
        </div>

        <Modal
          isOpen={this.state.showAction}
          className="action-pop-menu-modal"
          animation="fade"
          onClick={() => {
            this.setState({ showAction: false })
          }}
        >
          <div className="menus group">
            <div className="menu" onClick={this.onMenuClick.bind(this, 0)}>
              本桌注单
            </div>
            <div className="menu" onClick={this.onMenuClick.bind(this, 1)}>
              路纸
            </div>
            <div className="menu" onClick={this.onMenuClick.bind(this, 2)}>
              战况
            </div>
            <div className="menu copy-btn" data-clipboard-text={window.location.href} onClick={this.onMenuClick.bind(this, 3)}>
              分享台面
            </div>
          </div>
        </Modal>

        {/*/!* 本桌注单 *!/*/}
        <ModalPage
          isOpen={this.state.showTableBetRecord}
          className="report-record-modal"
          animation="lift"
          onClose={() => {
            this.setState({
              showTableBetRecord: false,
            })
          }}
        >
          <div>
            {this.state.showTableBetRecord && (
              <RecordPage className="baccarat-gameTableBetRecord" right={null} config={this.tableBetRecord} center="本桌注单" key={location.hash} />
            )}
          </div>
        </ModalPage>

        {/*/!* 战况 *!/*/}
        <ModalPage
          isOpen={this.state.showRoundRecord}
          className="report-record-modal"
          animation="lift"
          onClose={() => {
            this.setState({
              showRoundRecord: false,
            })
          }}
        >
          <div>
            {this.state.showRoundRecord && (
              <RecordPage className="baccarat-gameRoundRecord" right={null} config={this.tableRoundRecord} center="战况" key={location.hash} />
            )}
          </div>
        </ModalPage>

        {/*/!* 战况细节 *!/*/}
        <ModalPage
          isOpen={this.state.showRoundDetail}
          className="report-record-modal round-detail-modal"
          animation="fade"
          onClose={() => {
            this.setState({
              showRoundDetail: false,
            })
          }}
        >
          {this.state.showRoundDetail && (
            <div className="modal-inner">
              {roundDetail && <div className="main-title">第 {roundDetail.GID} 局</div>}
              <div className="round-content">
                {roundDetail && this.renderRoundDetail()}
                <div className="title">本局注单</div>
                <TableRoundBet gameID={roundDetail.ID}></TableRoundBet>
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
        </ModalPage>

        {/*/!* 路纸 *!/*/}
        <Modal isOpen={this.state.showWinStatistic} className="report-record-modal win-statistic-modal" animation="fade">
          {this.state.showWinStatistic && (
            <div className="modal-inner">
              <div className="main-title">路纸</div>
              <div className="statistic-content">
                <div className="colorTitle">
                  <span className="colorList Z">庄赢</span>
                  <span className="colorList X">闲赢</span>
                  <span className="colorList D">和局</span>
                </div>
                {this.renderWinStatistic()}
              </div>
              <div
                className="close"
                onClick={() => {
                  this.setState({ showWinStatistic: false })
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
