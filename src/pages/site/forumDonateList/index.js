import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
// import {Icon, Modal} from 'react-onsenui';
// import ClipboardJS from "clipboard";
import util from "@/magic/util"

// import Broadcast from "@/components/Broadcast";
import CustomIcon from "../../../components/CustomIcon"
import EmptyView from "@/components/EmptyView"
import DonateListContent from "./donate_list/index"
import AuditListContent from "./audit_list/index"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        agent: null,
        loading: true,
        cur_tab: 0, //0打赏明细，1被打赏明细，2审核记录
        // ErrorMsg: "1.dfafdasfdasfdas. 2.dafdafdasfdasfdas",
        limitAmount: [],
        list: [
          // {
          //     id: 123223,
          //     from: 'fromWHO',
          //     to: 'toMe',
          //     amount: 100,
          //     status: 0,//0尚未领取，1申请领取，2已领取，-1运营拒绝
          //     DateTime: "/Date(1675673216980)/",
          // },
          // {
          //     id: 123224,
          //     from: 'fromWHO',
          //     to: 'toMe',
          //     amount: 999,
          //     status: 0,//0尚未领取，1申请领取，2已领取，-1运营拒绝
          //     DateTime: "/Date(1675673216980)/",
          // }
        ],
        totalAmount: 0,
      }
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

    componentDidMount() {
      this.loadData(0)
      this.loadForumInfo()
      this.checkBetPermission()
    }

    checkBetPermission() {
      //判定是否有被打赏资格
      var formInfoStr = util.cache.get("default_forum_info")
      if (formInfoStr != null) {
        var formInfo = JSON.parse(formInfoStr)

        //代表发帖需要校验
        if (formInfo.PostSet.ReceivePostLimit || formInfo.PostSet.ReceiveDepositLimit) {
          //最低帖 》 当前帖
          if (formInfo.PostSet.ReceivePostLimit && formInfo.PostSet.ReceivePostCount > formInfo.PostCount) {
            this.setState({
              limitAmount: [
                formInfo.PostSet.ReceiveDepositLimit ? formInfo.PostSet.ReceiveDepositMoney : null,
                formInfo.PostSet.ReceivePostLimit ? formInfo.PostSet.ReceivePostCount : null,
                formInfo.RecTotal,
                formInfo.PostCount,
              ],
            })
            return
          }
          if (formInfo.PostSet.ReceiveDepositLimit && formInfo.PostSet.ReceiveDepositMoney > formInfo.RecTotal) {
            this.setState({
              limitAmount: [
                formInfo.PostSet.ReceiveDepositLimit ? formInfo.PostSet.ReceiveDepositMoney : null,
                formInfo.PostSet.ReceivePostLimit ? formInfo.PostSet.ReceivePostCount : null,
                formInfo.RecTotal,
                formInfo.PostCount,
              ],
            })
            return
          }
        }
      }
    }

    loadData(cur_tab) {
      var map = {
        // owner: cur_tab > 0 ? 1: 0,
        // ...( cur_tab > 0 ? { status: cur_tab > 1 ? 1: 0 }:{} )
      }
      switch (cur_tab) {
        case 0:
          map = {
            owner: 0,
          }
          break
        case 1:
          map = {
            owner: 1,
            status: 0, //尚未审核，驳回
          }
          break
        case 2:
          map = {
            owner: 1,
            status: 1, //待审核
          }
          break
      }

      let d = action.post("betpost/donateList", map)
      d.then((res) => {
        this.setState({ loading: false })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message)
          return
        }
        //用户不具有打赏资格,展示不惧资格讯息
        if (res.Code === -1) {
          this.setState({ list: [] })
        } else {
          var totalPrice = 0
          res.Data.forEach((item) => {
            totalPrice += item.Amount
          })
          this.setState({ list: res.Data, totalAmount: totalPrice })
        }
      })
    }

    //打赏金额- 转入
    onTransferClick() {
      notificationAsync
        .confirm("确认要将打赏金额转入余额内? 已转入打赏金额与明细将会清除", {
          cancelable: true,
        })
        .then(() => {
          this.setState({ loading: true })
          //支持多id 导入，1，2，3，4，6 - id:1,2,3
          return action.post("betpost/donate2money")
        })
        .then((res) => {
          this.setState({ loading: false })
          if (res.Code != 1) {
            notificationAsync.alert(res.Message)
            return
          }
          notificationAsync
            .alert("转入成功,等待客服专员审核通过!", {
              title: "恭喜您!",
              buttonLabels: ["确定"],
            })
            .then(() => {
              this.loadData(this.state.cur_tab)
              this.loadForumInfo()
              this.checkBetPermission()
            })
        })
    }

    onTabSel(selPos) {
      this.setState({
        cur_tab: selPos,
      })
      this.loadData(selPos)
    }

    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      var isDisable = this.state.limitAmount.length > 0 || this.state.list.length <= 0
      var showTransitionBar = this.state.cur_tab == 1

      const footer = (
        <div className="forum_donate_list_footer">
          <div className="left">
            <div className="title">总金额</div>
            <div className="claim_input_border">{this.state.totalAmount <= 0 ? "-" : this.state.totalAmount}</div>
          </div>
          <div className="right" onClick={this.onTransferClick.bind(this)}>
            <CustomIcon style={{ width: 20, height: 20 }} type={require("./icons/transfer.svg")} />
            <div>转入余额</div>
          </div>
        </div>
      )
      const footerDisable = (
        <div className="forum_donate_list_footer disable">
          <div className="left">
            <div className="title">总金额</div>
            <div className="claim_input_border">{this.state.totalAmount <= 0 ? "-" : this.state.totalAmount}</div>
          </div>
          <div className="right disable">
            <CustomIcon style={{ width: 20, height: 20 }} type={require("./icons/transfer.svg")} />
            <div>转入余额</div>
          </div>
        </div>
      )
      var showTxt = ""
      switch (this.state.cur_tab) {
        case 0:
          showTxt = "打赏给他人的明细记录"
          break
        case 1:
          showTxt = "未转入余额之被打赏明细"
          break
        case 2:
          showTxt = "申请转入余额之审核记录"
          break
      }
      return (
        <LayoutPage
          loading={this.state.loading}
          className="forum_donate_list"
          center="打赏明细"
          renderFixed={() => (!showTransitionBar ? null : isDisable ? footerDisable : footer)}
          right={null}
        >
          <div className="tab_switch_area">
            <div className={`tab_item ${this.state.cur_tab == 0 ? "sel" : ""}`} onClick={this.onTabSel.bind(this, 0)}>
              打赏明细
            </div>
            <div className={`tab_item ${this.state.cur_tab == 1 ? "sel" : ""}`} onClick={this.onTabSel.bind(this, 1)}>
              被打赏明细
            </div>
            <div className={`tab_item ${this.state.cur_tab == 2 ? "sel" : ""}`} onClick={this.onTabSel.bind(this, 2)}>
              审核记录
            </div>
          </div>

          {this.state.limitAmount.length > 0 && (
            <div className="ErrorMsg">
              可接收打赏资格说明：
              <br />
              需达成以下条件才能接受其他玩家的打赏
              <br />
              <div className="content">
                {this.state.limitAmount[0] != null && [<span> • 充值总额需达到{this.state.limitAmount[0]}元</span>, <br />]}
                {this.state.limitAmount[1] != null && [<span> • 发帖数量需达到{this.state.limitAmount[1]}篇</span>, <br />]}
                <br />
                <br />
                当前
                <br />
                {this.state.limitAmount[0] != null && [<span> • 充值额{this.state.limitAmount[2]}元</span>, <br />]}
                {this.state.limitAmount[1] != null && [<span> • 发帖数量{this.state.limitAmount[3]}篇</span>, <br />]}
              </div>
              <EmptyView imgId={4} desc={""} no_margin />
            </div>
          )}

          {this.state.limitAmount.length <= 0 && (
            <div className="content">
              <div className="top_bar">
                <CustomIcon style={{ width: 15, height: 15 }} type={require("./icons/balance.svg")} />
                <div>{showTxt}</div>
              </div>

              {this.state.list.length <= 0 && this.state.limitAmount.length === 0 && <EmptyView imgId={3} desc={"暂无数据"} no_margin />}

              {/*打赏 或被打赏 用这个*/}
              {this.state.list.length > 0 && (this.state.cur_tab == 0 || this.state.cur_tab == 1) && (
                <DonateListContent
                  list={this.state.list}
                  limitAmount={this.state.limitAmount}
                  member={this.state.cur_tab === 0 ? "ToName" : "FromName"}
                />
              )}
              {/*审核记录*/}
              {this.state.list.length > 0 && this.state.cur_tab == 2 && (
                <AuditListContent list={this.state.list} limitAmount={this.state.limitAmount} />
              )}
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
