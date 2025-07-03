import React from "react"
import util from "@/magic/util"
import "./style.scss"
import CustomIcon from "@/components/CustomIcon"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
    }

    /***
     * 支持彩种才能出现
     */
    goShareClick() {
      util.cache.set("share_game_to_forum", JSON.stringify(this.props))
      notificationAsync.confirm("是否要分享该注单到论坛?", {
        title: "分享注单",
        buttonLabels: ["确认分享", "取消"],
        cancelable: true,
        callback: (c) => {
          //将注单 ID 带入 新增注单 里面进行更新
          if (c === 0) {
            this.props.router.push(`/site/ticketNew`, {
              tid: this.props.ID,
              id: this.props.LotteryID,
              from: 1,
            })
          }
        },
      })
    }

    goNoPermissionDialog() {
      notificationAsync.alert(`充值额度未达到要求，发帖充值总额需大于${this.props.PostDepositMoney}`)
    }

    render() {
      var isSupport = import.meta.env.VITE_FORUM_ENABLE === "true" && this.props.isSupportShare && this.props.Status == 0 //  && isOpenForum

      //可分享，但此用户无发帖权限
      var checkPostPermission = this.props.checkPostPermission

      let date = util.date.toDate(this.props.BetTime)

      const betText = this.props.LotteryID !== 80 ? this.props.BetText : this.props.PlayType.split("-")[0] || ""

      return (
        <div className="bet-record-item">
          <div className="left">
            <div>
              <p>{util.date.format(date, "M月DD日", 8)}</p>
              <p>{util.date.format(date, "hh:mm:ss", 8)}</p>
            </div>
          </div>
          <div
            className="center"
            onClick={isSupport ? (checkPostPermission ? this.goShareClick.bind(this) : this.goNoPermissionDialog.bind(this)) : null}
          >
            <div>
              <p className="issue">
                <span>
                  <strong>{this.props.GameID}</strong>期
                </span>
                &nbsp;&nbsp;
                <span className="play-type">{this.props.PlayType}</span>
                {/*分享到论坛*/}
                {isSupport && <CustomIcon style={{ height: 16, width: 16 }} type={require("./icons/share.svg")} />}
              </p>
              <p className="content">
                <span className="bet-text">{betText}</span> &nbsp;
              </p>
            </div>
          </div>
          <div className="right">
            <div className="bonus">
              {this.props.Status == 2 && <span className="unhit">未中奖</span>}
              {this.props.Status == 1 &&
                (this.props.otherUser ? <span className="hit">已中奖</span> : <span className="hit">+{this.props.Bonus}元</span>)}
              {this.props.Status == 0 && <span className="waiting">待开奖</span>}
              {this.props.Status == 3 && <span className="unhit">打和退款</span>}
              {this.props.Status == 4 && <span className="unhit">已撤销</span>}
              {!this.props.otherUser && <span className="amount">金额:{this.props.BetCount}元</span>}
            </div>
          </div>
        </div>
      )
    }
  }
)
