import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
import util from "@/magic/util"
import * as apiNotification from "@/magic/ApiNotification"
import EmptyView from "@/components/EmptyView"
import DetailsArea from "./details/index"
import FollowBetModal from "./betFollowmodal"
import DonateOwnerModal from "./donateOwnerModal"
import forumGames from "@/config/forum"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    // IsLike: "0:未表态，1:喜欢，-1：不喜欢"
    // IsDonate: 0: 未打赏, 大于0: 已打赏(打赏金额), -1: 不可打赏
    constructor(props) {
      super(props)
      var gameID = util.getUrlParam("id")
      var betLx = util.getUrlParam("lx")

      this.state = {
        cur_issue: "---",
        cur_game: forumGames[gameID],
        showFollowBetModal: false,
        showDonateOwnerModal: false,
        loading: true,
        ticket_details: null,
        history: [],
        // ticket_details: null
      }
    }

    componentDidMount() {
      this.loadData()
      this.getLottoInfo()
      this.loadForumInfo()

      // this.startCounting();
    }

    loadForumInfo() {
      //需要定期更新
      let res = action.post("betpost/try")
      res.then((res) => {
        if (res.Data != null) {
          util.cache.set("default_forum_info", JSON.stringify(res.Data))
        }
      })
    }

    componentWillUnmount() {
      // clearInterval(this.timeLottoId);
      // clearInterval(this.timeDetails);

      clearTimeout(this.timeoutID)
    }

    //设置循环
    startCounting() {
      // this.timeLottoId = setInterval(() => {
      //     this.getLottoInfo();
      // }, 600000);
      // this.timeDetails = setInterval(() => {
      //     this.loadData();
      // }, 900000);
    }

    getLottoInfo() {
      var id = util.getUrlParam("id")
      let d = getPush({
        lotteryid: id,
        keys: "",
      })
      d.then((res) => {
        if (res.Code == 1 && res.Data.OpenLottery) {
          util.cache.set("lottery-cache-" + id, res.Data)

          var lottoIssue = res.Data.OpenLottery
          this.setState({
            cur_issue: lottoIssue.NewKai.GameID,
          })

          setTimeout(() => {
            //获取投注开奖状态的缓冲时间
            this.reloadAfterOpenDraw(res)
          }, 500)
        }
      })
    }

    /***
     * 取得奖旗后,计算截止时间+5秒封盘时间 =》 下一期的开始时间
     */
    reloadAfterOpenDraw(res) {
      let OpenLottery = res.Data.OpenLottery
      let dt = util.date.toDate(res.Data.ServerTime).getTime() - new Date().getTime() // 校正时间用
      let showCountDown = util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt

      if (showCountDown > 0) {
        if (this.state.ticket_details && this.state.ticket_details.PostDetail) {
          var status = this.state.ticket_details.PostDetail.BetStatus
          if (status != 0) {
            console.log("draw_open")
            //开奖后，就不需要自动更新注单
            clearTimeout(this.timeoutID)
            return
          }
        }

        clearTimeout(this.timeoutID)

        //截止后预期开奖重新获取时间差，高频彩1分钟，低频彩10分钟
        var openDrawDelay = this.state.cur_game.delay_tms

        // console.log('timeout' + showCountDown)
        // console.log('倒计时' + (showCountDown/1000))
        // console.log('总共等几秒' + ((showCountDown + (5 * 1000) + openDrawDelay)/1000))

        //当 奖旗截止后，再过5秒(封盘)，如果还保留再当下页面，就会重新刷新
        this.timeoutID = setTimeout(() => {
          this.loadData(false)
          this.getLottoInfo()
          //5秒封盘时间 + 开奖预估时间
        }, showCountDown + 5 * 1000 + openDrawDelay)
      } else {
        //原则上会出现 刚好取得 -数的时间（封盘
        //这部分属于数据异常先不加处理
      }
    }

    loadData() {
      var tid = util.getUrlParam("tid")
      let d = action.post("betpost/detail", { id: tid })
      d.then((res) => {
        if (res.Code != 1) {
          this.setState({
            loading: false,
          })
          apiNotification.alert(res, {}, this.props)
          return
        }

        var withoutMe = res.Data.History.filter((e) => {
          return e.ID != tid
        })

        this.setState({
          ticket_details: res.Data,
          history: withoutMe,
          loading: false,
        })
      })
    }

    reloadDetails() {
      this.loadData()
    }

    updateModalState(modal, onOff, reload) {
      switch (modal) {
        case "FOLLOW":
          this.setState({
            showFollowBetModal: onOff,
          })
          if (reload) {
            this.reloadDetails()
          }
          break
        case "DONATE":
          if (onOff) {
            //判定是否有打赏资格
            var formInfoStr = util.cache.get("default_forum_info")
            if (formInfoStr != null) {
              var formInfo = JSON.parse(formInfoStr)
              //代表发帖需要校验
              if (formInfo.PostSet.DonateDepositLimit) {
                //充值最低限制 》 当前充值
                if (formInfo.PostSet.DonateDepositMoney > formInfo.RecTotal) {
                  //无发帖权限
                  notificationAsync.alert(`充值额度未达到要求，打赏充值总额需大于${formInfo.PostSet.DonateDepositMoney}`)
                  return
                }
              }
            }
          }
          //TODO 增加被打赏的额度-限制，后端增加限制
          this.setState({
            showDonateOwnerModal: onOff,
          })
          if (reload) {
            this.reloadDetails()
          }
          break
      }
    }

    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      var emptyDetails = this.state.ticket_details == null

      var myOwn = false
      let user = util.cache.get("user") || {}
      if (!emptyDetails) {
        myOwn = user.ID === this.state.ticket_details.User
      }

      return (
        <LayoutPage
          loading={this.state.loading}
          className="forum_ticket_desc"
          center={emptyDetails ? "推荐跟单" : myOwn ? "我的注单" : this.state.ticket_details.PostDetail.NickName}
          right={null}
        >
          {emptyDetails && <EmptyView imgId={1} desc={"暂无数据"} no_margin />}

          {!emptyDetails && (
            <DetailsArea
              ticket_details={this.state.ticket_details}
              history={this.state.history}
              cur_issue={this.state.cur_issue}
              cur_game={this.state.cur_game}
              reloadDetails={this.reloadDetails.bind(this)}
              updateModalState={this.updateModalState.bind(this)}
            />
          )}

          {!emptyDetails && [
            <ModalPage
              isOpen={this.state.showFollowBetModal}
              className="follow_bet_modal"
              animation="fade"
              onClose={() => {
                this.setState({
                  showFollowBetModal: false,
                })
              }}
            >
              {/*/!*    弹框 - 跟单的 下注金额*!/*/}
              <FollowBetModal
                ticket_details={this.state.ticket_details}
                updateModalState={this.updateModalState.bind(this)}
                cur_issue={this.state.cur_issue}
                cur_game={this.state.cur_game}

                //             onClose={this.onModalClose.bind(this, 1)}
              />
            </ModalPage>,
            <ModalPage
              isOpen={this.state.showDonateOwnerModal}
              className="donate_owner_modal"
              animation="fade"
              onClose={() => {
                this.setState({
                  showDonateOwnerModal: false,
                })
              }}
            >
              {/*/!* 弹框 - 打赏版主 的 弹框*!/*/}
              <DonateOwnerModal
                ticket_details={this.state.ticket_details}
                updateModalState={this.updateModalState.bind(this)}
                // onClose={this.onModalClose.bind(this, 2)}
              />
            </ModalPage>,
          ]}
        </LayoutPage>
      )
    }
  }
)
