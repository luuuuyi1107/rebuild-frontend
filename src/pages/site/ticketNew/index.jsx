import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import { Button } from "react-onsenui"
import util from "@/magic/util"

import GameIcon from "@/components/GameIcon"
import CustomIcon from "@/components/CustomIcon"
import forumGames from "@/config/forum"
import "./style.scss"
import SelectBetRecord from "../selectBetRecord/index"
import EmptyView from "@/components/EmptyView"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

const DefaultTitleList = ["大神带路！", "包中", "中中", "继续中", "个人心水", "继续求稳…", "百分百中奖！！！"]

const DefaultContentList = [
  "同心水的一起砸",
  "喷狗绕道！！",
  "试试看！",
  "共同实现你们心中的理想和愿望！",
  "法拉利、兰博基尼不是梦",
  "本期必中 下好离手",
  "不能再有毒了 影响我的地位",
]

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      try {
        this.state = {
          last_kai: "",
          loading: false,
          cur_issue: "---",
          cur_game: null,
          cur_ticket: null,
          showSelectRecord: false,
          title: "",
          desc: "",
          defaultScript: [],
        }
      } catch (e) {}
    }

    componentDidMount() {
      try {
        var LottoID = util.getUrlParam("id")
        var ticket_id = util.getUrlParam("tid")

        var defaultTicket = null
        var defaultIssue = "---"
        if (ticket_id != null) {
          var shareGame = util.cache.get("share_game_to_forum")

          if (shareGame == null) {
            //接收 分享过来的内容
            notificationAsync.toast("参数输入错误，请重新操作", { timeout: 1200 })
            this.props.router.back()
            return null
          }

          defaultTicket = JSON.parse(shareGame)
          if (defaultTicket.BetText != null) {
            //从投注记录分享过来的
            defaultIssue = defaultTicket.GameID
          } else {
            //投注后，重新用id来获取最新的details
            defaultTicket = null

            let d = action.post("BetPost/betdetail", { id: ticket_id })
            d.then((res) => {
              if (res.Data == null) {
                //接收 分享过来的内容
                notificationAsync.toast("参数输入错误，请重新操作", { timeout: 1200 })
                return null
              }
              var ticketDetails = res.Data
              setTimeout(() => {
                this.setState({
                  cur_issue: ticketDetails.GameID,
                  cur_ticket: {
                    ID: ticketDetails.ID,
                    GameID: ticketDetails.GameID,
                    PlayType: ticketDetails.PlayType,
                    BetText: ticketDetails.BetText,
                    BetTime: ticketDetails.BetTime,
                    BetCount: ticketDetails.BetCount,
                    Bonus: ticketDetails.Bonus,
                    Status: ticketDetails.Status,
                    LotteryID: LottoID,
                  },
                })
              }, 500)
            })
          }
        }

        var gameValue = Object.values(forumGames)
        var currentGame = null
        gameValue.forEach((v) => {
          if (v.id === LottoID) {
            currentGame = v
          }
        })

        this.setState({
          cur_issue: defaultIssue,
          cur_game: currentGame,
          cur_ticket: defaultTicket,
          defaultScript: [
            DefaultTitleList[util.getRandomNum(0, DefaultTitleList.length - 1)],
            DefaultContentList[util.getRandomNum(0, DefaultContentList.length - 1)],
          ],
        })

        this.getLottoInfo()
        this.checkSendPermission()
        this.startCounting()
      } catch (e) {
        console.log("Error", e.stack)
      }
    }

    /***
     * 判断是否有发帖权限
     */
    checkSendPermission() {
      var formInfo = util.cache.get("default_forum_info")
      if (formInfo == null) {
        let res = action.post("betpost/try")
        res.then((res) => {
          if (res.Data != null && res.Data.PostSet != null) {
            util.cache.set("default_forum_info", JSON.stringify(res.Data))

            //代表发帖需要校验
            if (res.Data.PostSet.PostDepositLimit) {
              //充值最低限制 》 当前充值
              if (res.Data.PostSet.PostDepositMoney > res.Data.RecTotal) {
                //无发帖权限
                notificationAsync.alert(`充值额度未达到要求，发帖充值总额需大于${res.Data.PostSet.PostDepositMoney}`).then((d) => {
                  //无发帖权限,强制返回
                  this.props.router.back()
                })
              }
            }
          }
        })
      } else {
        var default_forum_info = JSON.parse(formInfo)
        //代表发帖需要校验
        if (default_forum_info.PostSet != null && default_forum_info.PostSet.PostDepositLimit) {
          //充值最低限制 》 当前充值
          if (default_forum_info.PostSet.PostDepositMoney > default_forum_info.RecTotal) {
            //无发帖权限
            notificationAsync.alert(`充值额度未达到要求，发帖充值总额需大于${default_forum_info.PostSet.PostDepositMoney}`).then((d) => {
              //无发帖权限,强制返回
              this.props.router.back()
            })
          }
        }
      }
    }

    //设置循环
    startCounting() {
      this.timeId = setInterval(() => {
        this.getLottoInfo()
      }, 10000)
    }

    componentWillUnmount() {
      clearInterval(this.timeId)
    }

    getLottoInfo() {
      var id = util.getUrlParam("id")
      getPush({
        lotteryid: id,
        keys: "",
      }).then((res) => {
        if (res.Code == 1 && res.Data.OpenLottery) {
          util.cache.set("lottery-cache-" + id, res.Data)

          var lottoIssue = res.Data.OpenLottery
          this.setState({
            last_kai: lottoIssue.NewKai.GameID,
          })
        }
      })
    }

    onLottoClick() {
      this.setState({
        showSelectRecord: true,
      })
    }

    closeModal(ticketData) {
      if (ticketData) {
        this.setState({
          cur_issue: ticketData.GameID,
          cur_ticket: ticketData,
          showSelectRecord: false,
        })
      } else {
        this.setState({
          showSelectRecord: false,
        })
      }
    }

    submitTicket() {
      //论坛要求可以留空-标题预言

      // console.log(this.state.cur_game);
      // {
      //     "id": "3",
      //     "name": "香港⑥合彩",
      //     "logo": "LHC",
      //     "type": "lhc",
      //     "type2": "六合彩",
      //     "betApi": "Six/Bet",
      //     "betListApi": "Six/GetBetList",
      //     "drawHistoryApi": "Six/GetLotterys",
      //     "typeOrder": 1,
      //     "drawLive": true,
      //     "delay_tms": 300000
      // }
      // lottery/home.html?id=3&lotteryType=lhc

      var title = this.state.title
      if (!this.state.title || this.state.title === "") {
        // return;
        title = this.state.defaultScript[0]
      }

      var desc = this.state.desc
      if (!this.state.desc || this.state.desc === "") {
        // return;
        desc = this.state.defaultScript[1]
      }
      if (this.state.cur_ticket == null) {
        notificationAsync.toast("请选择注单", { timeout: 1200 })
        return
      }

      let d = action.post("betpost/post", {
        id: this.state.cur_ticket.ID,
        title: title,
        desc: desc,
      })
      this.setState({ loading: true })
      d.then((res) => {
        this.setState({
          loading: false,
        })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message, { title: "操作提示" })
          return
        }

        notificationAsync
          .confirm(res.Message, { title: " 恭喜您发帖成功!", buttonLabels: ["查看帖子", "返回网站"] })
          .then(() => {
            this.props.router.push("/lottery/home", { id: this.state.cur_game.id, lotteryType: this.state.cur_game.type })
          })
          .catch(() => {
            this.props.router.push("/site/forumDetailsNew", {
              tid: res.Data.PostID,
              id: LottoID,
            })
          })
      })
    }

    render() {
      let id = util.getUrlParam("id")
      if (id == null || this.state.cur_game == null) {
        return (
          <LayoutPage loading={this.state.loading} className="forum_ticket_new" center="本期推荐" right={null}>
            <EmptyView imgId={1} desc={"获取彩种错误，请刷新"} />
          </LayoutPage>
        )
      }

      var isPickTicket = this.state.cur_ticket != null

      // console.log(this.state.last_kai, this.state.cur_issue); 20230321-904 904

      var isCurrentIssue = util.compareIssue(this.state.last_kai, this.state.cur_issue)

      var shortIssue = util.shortIssue(this.state.cur_issue)

      return (
        <LayoutPage loading={this.state.loading} className="forum_ticket_new" center="本期推荐" right={null}>
          {/*彩种+当前将其+ 温馨提示*/}
          <div className="top_area">
            {/* relative 直接做掉了 */}
            <div className="lotto_ic_img">
              <GameIcon id={this.state.cur_game.logo} />
            </div>
            <div className="lotto_info">
              <span className="name">{this.state.cur_game.name}</span>

              {this.state.cur_issue !== "---" && <span className="issue">第 {this.state.cur_issue}期</span>}

              {this.state.cur_issue === "---" && <span className="issue"></span>}
            </div>
            <span className="lotto_tips">
              温馨提示：单期单一玩法只能发布一次推荐，发布后不能更改不能发布带有个人联系方式的内容，不能发布广告和任何敏感议题，否则永久封号
            </span>
          </div>

          <div className="block_horizon" />

          <div className="ticket_picker">
            <div className="method_title">
              {this.state.cur_ticket == null && <div className={`method`}>玩法</div>}
              {this.state.cur_ticket != null && (
                <div className={`method on`}>
                  <div className="issue">{shortIssue}</div>
                  <div className="playtype">{this.state.cur_ticket.PlayType}</div>
                </div>
              )}
              <div className="method_vertical" />
              <div className="title_input">
                <input
                  placeholder={this.state.defaultScript[0]}
                  maxLength={20}
                  onChange={(e) => {
                    this.setState({ title: e.target.value })
                  }}
                />
              </div>
            </div>
            <div className="divider_horizon" />

            {this.state.cur_ticket == null && (
              <div className="method_pick_btn" onClick={this.onLottoClick.bind(this)}>
                <div>请选择注单</div>
                <CustomIcon style={{ height: 20, width: 20 }} type={require("./icons/add-circle.svg")} />
              </div>
            )}
            {this.state.cur_ticket != null && [
              <div className="title_bg">
                <CustomIcon style={{ height: 12, width: 12 }} type={require("./icons/star.svg")} />
                <div className="recommend_title">本期推荐</div>
              </div>,

              <div className="method_selected_area" onClick={this.onLottoClick.bind(this)}>
                <div className="bet_content">{this.state.cur_ticket.BetText}</div>
                <div className="bonus">
                  {this.state.cur_ticket.Status == 0 && <div className="waiting">待开奖</div>}
                  {/* {
                                this.state.cur_ticket.Status == 2 && <div className="unhit">未中奖</div>
                            } */}
                  {this.state.cur_ticket.Status == 1 && <div className="hit">已中奖 +{util.numberRoundedFix(this.state.cur_ticket.Bonus, 2)}元</div>}

                  {/* {
                                this.state.cur_ticket.Status == 3 && <div className="unhit">打和退款</div>
                            }
                            {
                                this.state.cur_ticket.Status == 4 && <div className="unhit">已撤销</div>
                            } */}
                  {<div className="amount">{util.numberRoundedFix(this.state.cur_ticket.BetCount, 2)}元</div>}
                </div>
                {/*<CustomIcon style={{height: 20, width: 20}}*/}
                {/*            type={require("./icons/add-circle.svg")}/>*/}
              </div>,
            ]}
          </div>

          <div className="block_horizon" />
          <div className="desc_area">
            {/* relative 直接*/}
            <CustomIcon style={{ height: 14, width: 14 }} type={require("./icons/msg.svg")} />
            <div className="desc_title">本期预言</div>
          </div>
          <div className="desc_border">
            <textarea
              className="textarea"
              onChange={(e) => {
                this.setState({ desc: e.target.value })
              }}
              maxLength={50}
              rows="5"
              placeholder={this.state.defaultScript[1]}
            />
          </div>

          {isPickTicket && isCurrentIssue && (
            <Button class="ticket_submit" onClick={this.submitTicket.bind(this)}>
              发布
            </Button>
          )}

          {isPickTicket && !isCurrentIssue && (
            <Button class="ticket_submit disable" onClick={null}>
              奖期已截止
            </Button>
          )}
          {!isPickTicket && (
            <Button class="ticket_submit disable" onClick={null}>
              请选择注单
            </Button>
          )}

          {this.state.showSelectRecord && (
            <ModalPage className="select-record-model" isOpen={this.state.showSelectRecord} animation="lift" onClose={() => this.closeModal()}>
              <SelectBetRecord game_id={this.props.id} onBack={this.closeModal.bind(this)} />
            </ModalPage>
          )}
        </LayoutPage>
      )
    }
  }
)
