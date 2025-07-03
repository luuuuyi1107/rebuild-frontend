import React from "react"

import RecordPage from "@/components/RecordPage"
import GameNavigatorBar from "@/components/GameNavigatorBar"
import Exchange from "./Exchange"
import util from "@/magic/util"

import "./stylenew.scss"
import platformMap from "@/config/platforms"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import dayjs from "dayjs"

let DailyRecordRenders = {
  // ag: function(platformId, row, data){
  //     return <div className="month-record-item">
  //         <p className="tl">日期: {row.DayInt}</p>
  //         <p className="dd">
  //             {/*<span>AG真人：{row.BRMoney}</span>*/}
  //             {/*<span>电子：{row.EBRMoney}</span>*/}
  //             {/*<span>捕鱼王：{row.HSRMoney}</span>*/}
  //             <span>总投注：{row.BetMoney}</span>
  //             <span>盈亏：{row.WinMoney}</span>
  //         </p>
  //     </div>
  // },
  // ky: function(platformId, row, data){
  //     return <div className="month-record-item">
  //         <p className="tl">日期: {row.DayInt}</p>
  //         <p className="dd">
  //             <span>投注金额：{row.BetMoney}</span>
  //             <span>盈亏金额：{row.WinMoney}</span>
  //         </p>
  //     </div>
  // },
  // le: function(platformId, row, data){
  //     return <div className="month-record-item">
  //         <p className="tl">日期: {row.DayInt}</p>
  //         <p className="dd">
  //             <span>投注金额：{row.BetMoney}</span>
  //             <span>盈亏金额：{row.WinMoney}</span>
  //         </p>
  //     </div>
  // },
  // sg: function(platformId, row, data){//皇冠体育
  //     return <div className="month-record-item">
  //         <p className="tl">日期: {row.DayInt}</p>
  //         <p className="dd">
  //             <span>投注金额：{row.BetMoney}</span>
  //             <span>盈亏金额：{row.WinMoney}</span>
  //         </p>
  //     </div>
  // },
  // sb: function(platformId, row, data){
  //     return <div className="month-record-item">
  //         <p className="tl">日期: {row.DayInt}</p>
  //         <p className="dd">
  //             <span>AG真人：{row.BRMoney}</span>
  //             <span>电子：{row.EBRMoney}</span>
  //             <span>捕鱼王：{row.HSRMoney}</span>
  //             <span>总投注：{row.BetMoney}</span>
  //             <span>盈亏：{row.WinMoney}</span>
  //         </p>
  //     </div>
  // },
  _default: function (platformId, row, data) {
    return (
      <div className="month-record-item">
        <p className="tl">日期: {row.DayInt}</p>
        <p className="dd">
          <span>投注金额：{row.BetMoney}</span>
          <span>盈亏金额：{row.WinMoney}</span>
        </p>
      </div>
    )
  },
}

export default withRouter(
  class extends React.PureComponent {
    //总配置
    platformId = util.getUrlParam("platform") || ""

    totalCofig = {
      // defaultTabName: platformMap[this.platformId] ? platformMap[this.platformId].title:"",
      // maxTabShow: 3,
      tabs: [
        {
          name: "打码统计",
          listApi: "User/GetCountMonthList",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="month-record-item">
                <p className="tl">
                  月份: {row.MonthInt}{" "}
                  <span
                    onClick={() => {
                      this.setMonthInt("all-" + row.MonthInt)
                    }}
                  >
                    查看明细
                  </span>
                </p>
                <p className="dd">
                  <span>投注金额：{row.BetMoney}</span>
                  <span>派奖金额：{row.WinMoney}</span>
                  <span>盈亏：{(row.WinMoney - row.BetMoney).toFixed(2)}</span>
                  <span>月返打码：{row.WaterBet}</span>
                  <span>充值金额：{row.RecMoney}</span>
                  <span>提款金额：{row.DrawMoney}</span>
                  <span>输赢：{(row.DrawMoney - row.RecMoney).toFixed(2)}</span>
                  <span>反水金额：{row.WaterMoney}</span>
                  <span>未兑点数：{row.BetCredit}</span>
                  <span>已兑点数：{row.ExcCredit}</span>
                  {/*{*/}
                  {/*row.WaterMoney!=0&&row.WaterMoney!=-1&&<span>反水金额：{row.WaterMoney}</span>*/}
                  {/*}*/}
                  <span
                    className="btn"
                    onClick={() => {
                      this.close()
                      this.setState({
                        exchangeData: row,
                      })
                    }}
                  >
                    积分兑换
                  </span>
                </p>
              </div>
            )
          },
          tabOrder: 999,
        },
      ],
    }

    //打码统计日报
    dailyConfigAll = {
      tabs: [
        {
          name: "打码日报",
          filter: [{ key: "agType", type: "hidden", defaultValue: "br" }],
          listApi: "User/GetCountDayList",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="month-record-item">
                <p className="tl">
                  日期: {row.DayInt}{" "}
                  <span
                    onClick={() => {
                      this.setCurrentDailyDetail(row.DayInt)
                    }}
                  >
                    分类明细
                  </span>
                </p>
                <p className="dd">
                  <span>投注：{row.BetMoney}</span>
                  <span>派奖：{row.WinMoney}</span>
                  <span>盈亏：{(row.WinMoney - row.BetMoney).toFixed(2)}</span>
                  <span>积分：{row.WaterBet}</span>
                  <span>充值：{row.RecMoney}</span>
                  <span>提款：{row.DrawMoney}</span>
                  <span>输赢：{(row.DrawMoney - row.RecMoney).toFixed(2)}</span>
                  {row.WaterMoney != 0 && row.WaterMoney != -1 && <span>反水金额：{row.WaterMoney}</span>}
                </p>
              </div>
            )
          },
        },
      ],
    }

    dailyDetialConfig = {
      tabs: [
        {
          name: "分类统计",
          filter: [],
          listApi: "User/GetCountGameList",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="month-record-item">
                <p className="tl" style={{ margin: "5x 0" }}>
                  游戏: {row.Game}
                </p>
                <p className="t2" style={{ margin: "5x 0" }}>
                  <span style={{ textDecoration: "none" }}>下注: {row.BetMoney}</span>
                  <span>派奖: {row.WinMoney}</span>{" "}
                  <span style={{ textDecoration: "none" }} className="right money">
                    盈亏: {(row.WinMoney - row.BetMoney).toFixed(2)}
                  </span>
                </p>
              </div>
            )
          },
        },
      ],
    }

    exchangeRecordConfig = {
      tabs: [
        {
          name: "积分兑换记录",
          filter: [{ key: "agType", type: "hidden", defaultValue: "mg" }],
          listApi: "Shop/GetLogs",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="month-record-item">
                <p className="tl">日期: {util.date.format(util.date.toDate(row.AddTime), "YYYY-MM-DD hh:mm:ss")}</p>
                <p className="dd">
                  <span>积分变动：{row.Credit}</span>
                  <span>积分余额：{row.Consume}</span>
                  <span style={{ width: "100%" }}>说明：{row.Content}</span>
                </p>
              </div>
            )
          },
        },
      ],
    }

    state = {
      currentDailyConfig: util.isTrialAccount() ? this.getDailyReportConfig("all", dayjs().format("YYYYMM")) : null,
      currentDailyDetail: null,
      showExchangeRecord: false,
      exchangeData: false,
    }

    constructor(props) {
      super(props)

      // Object.keys(platformMap).map(key => {
      //     let filter = [];
      //     let params = platformMap[key].monthReportApi.params;
      //     if(params){
      //         for(let key in params){
      //             filter.push({
      //                 key: key,
      //                 type: "hidden",
      //                 defaultValue: params[key]
      //             });
      //         }
      //     }
      //     if(key == "ag"){
      //         this.totalCofig.tabs.push({
      //             name: platformMap[key].title,
      //             filter: filter,
      //             listApi: platformMap[key].monthReportApi.url,
      //             listApiMethod: platformMap[key].monthReportApi.method,
      //             noSbSport: true,
      //             renderRow:  MonthRecordRenders[key] ? MonthRecordRenders[key].bind(this, key) : MonthRecordRenders["_default"].bind(this, key),
      //             tabOrder: this.platformId == key ? 1:0
      //         });
      //     }else{
      //         this.totalCofig.tabs.push({
      //             name: platformMap[key].title,
      //             filter: filter,
      //             listApi: platformMap[key].monthReportApi.url,
      //             listApiMethod: platformMap[key].monthReportApi.method,
      //             renderRow:  MonthRecordRenders[key] ? MonthRecordRenders[key].bind(this, key) : MonthRecordRenders["_default"].bind(this, key),
      //             tabOrder: this.platformId == key ? 1:0
      //         });
      //     }
      // });
    }
    getDailyReportConfig(platformId, monthInt, agGameId) {
      if (platformId == "all") {
        // console.log(this.dailyConfigAll.tabs[0].filter[0])
        this.dailyConfigAll.tabs[0].filter.push({
          key: "monthInt",
          type: "hidden",
          defaultValue: monthInt,
        })
        return this.dailyConfigAll
      }
      let platform = platformMap[platformId]
      let filter = []
      let params = platform.dailyReportApi.params
      if (agGameId) {
        platform.dailyReportApi.params.lotteryId = agGameId
      }
      if (params) {
        for (let key in params) {
          filter.push({
            key: key,
            type: "hidden",
            defaultValue: params[key],
          })
        }
      }
      filter.push({
        key: "monthInt",
        type: "hidden",
        defaultValue: monthInt,
      })

      return {
        tabs: [
          {
            name: `${platform.title}日报`,
            filter: filter,
            listApi: platform.dailyReportApi.url,
            listApiMethod: platform.dailyReportApi.method,
            renderRow: DailyRecordRenders[platformId]
              ? DailyRecordRenders[platformId].bind(this, platformId)
              : DailyRecordRenders["_default"].bind(this, platformId),
          },
        ],
      }
    }

    setMonthInt(monthInt) {
      this.close()
      let params = monthInt.split("-")
      if (params.length == 2 || params.length == 3) {
        console.log(params)
        let currentDailyConfig = Object.assign({}, this.getDailyReportConfig(...params))
        this.setState({ currentDailyConfig: currentDailyConfig })
      } else {
        this.setState(Object.assign({}, obj))
      }
    }

    setCurrentDailyDetail(dayInt) {
      let currentDailyDetail = Object.assign({}, this.dailyDetialConfig)
      currentDailyDetail.tabs[0].filter.push({ key: "dayInt", type: "hidden", defaultValue: dayInt })
      this.close()
      this.setState({
        currentDailyDetail: currentDailyDetail,
      })
    }

    close() {
      this.setState({
        currentDailyConfig: false,
        showExchangeRecord: false,
        exchangeData: false,
        currentDailyDetail: false,
      })
    }

    show(prop) {
      this.close()
      this.setState({
        [prop]: true,
      })
    }

    render() {
      if (this.totalCofig.defaultTabIndex < 0) {
        this.totalCofig.defaultTabIndex = 0
      }
      return (
        <div>
          <RecordPage
            config={this.totalCofig}
            className="report-record"
            center="月报表"
            right={() => (
              <span
                onClick={() => {
                  util.trialCheck()
                  this.props.router.isLoginToOrRedirect("/interaction/broadcastMoreShare")
                }}
              >
                战绩分享
              </span>
            )}
            renderFixed={() => {
              return this.platformId ? <GameNavigatorBar platform={this.platformId} active="report" /> : null
            }}
          />

          {/* 日报弹窗 */}
          <ModalPage
            isOpen={!!this.state.currentDailyConfig}
            className="report-record-modal"
            animation="lift"
            onClose={() => {
              this.setState({
                currentDailyConfig: false,
              })
            }}
          >
            <div>
              {this.state.currentDailyConfig && (
                <RecordPage right={null} config={this.state.currentDailyConfig} key={location.hash} center="日报表" />
              )}
            </div>
          </ModalPage>
          {/** 日报表分类统计弹窗 */}
          <ModalPage
            isOpen={!!this.state.currentDailyDetail}
            className="report-record-modal"
            animation="lift"
            onClose={() => {
              this.setState({
                currentDailyDetail: false,
              })
            }}
          >
            <div>
              {this.state.currentDailyDetail && (
                <RecordPage right={null} config={this.state.currentDailyDetail} key={location.hash} center="分类统计" />
              )}
            </div>
          </ModalPage>

          {/* 积分兑换 */}
          <ModalPage
            isOpen={!!this.state.exchangeData}
            className="report-record-modal"
            animation="lift"
            onClose={() => {
              this.setState({
                exchangeData: false,
              })
            }}
          >
            <div>{this.state.exchangeData && <Exchange data={this.state.exchangeData} show={(prop) => this.show(prop)} />}</div>
          </ModalPage>

          {/* 积分兑换记录 */}
          <ModalPage
            isOpen={this.state.showExchangeRecord}
            className="report-record-modal"
            animation="lift"
            onClose={() => {
              this.setState({
                showExchangeRecord: false,
              })
            }}
          >
            <div>
              {this.state.showExchangeRecord && (
                <RecordPage right={null} config={this.exchangeRecordConfig} center="积分兑换记录" key={location.hash} />
              )}
            </div>
          </ModalPage>
        </div>
      )
    }
  }
)
