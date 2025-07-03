import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import util from "@/magic/util"

import "./style.scss"
import ClipboardJS from "clipboard"
import { Button, Icon, ActionSheet, ActionSheetButton } from "react-onsenui"
import * as apiNotification from "@/magic/ApiNotification"
import InputBoxWithMax from "@/components/InputBox/indexWithMax"
import { withRouter } from "@/magic/withRouter"
import { getPush, getSubBankList, payFunPay } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        accounts: null,
        accountsNo: 0,
        name: "",
        money: "",
        accountChange: false,
        loading: true,
        apiLoading: false,
        tip: "",
        showPop: true,
        bankId: null,
        depositSet: null, // 提领 USDT 汇率
      }
      this.depositTime = util.date.format(new Date(), "yyyy-MM-dd  hh:mm:ss")
    }
    componentDidMount() {
      if (!util.getUrlParam("token") && !util.isLogin()) {
        return Promise.resolve().then(() => this.props.router.push("/site/login"))
      }
      this.listenClipboard()
      this.loadData()
    }
    componentWillUnmount() {
      this.clipboardInstance?.destroy()
    }

    async loadData() {
      let id = util.getUrlParam("id")
      let res = await getSubBankList({ id: id })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      let account = null
      let Remark = ""
      let user = util.cache.get("user") || {}
      user = await getPush({ keys: "drawmoneyset" })
      if (user.Code != 1) {
        apiNotification.alert(user, {}, this.props)
        return
      }

      if (res.Data && res.Data.length > 0) {
        account = res.Data[this.state.accountsNo]
        Remark = account.Remark
        Remark = Remark.replace("{p=dff-2}", "")
        Remark = Remark.replace("{/p}", "")
        Remark = Remark.replace("[hr]", "")
        // Remark = Remark.replace( "[url=https://www.8181fk.com/index.html?userid=(Myid)]","<a id='onLineLink' href='https://www.8181fk.com/index.html?userid="+user.ID+"'>");
        // Remark = Remark.replace( "[/url]","</a>");
        Remark = Remark.replace(/\(Myid\)/g, user.ID || 0)
        Remark = Remark.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
        Remark = Remark.replace(/<a href="(.*?)#target=(.*?)">/g, '<a href="$1" target="$2">')
        Remark = Remark.replace(/<a href="(.*?)#&amp;f_u_c_k=y_o_u">/g, "<a href=\"$1\" target='_blank'>")
      }

      this.setState({
        accounts: res.Data,
        tip: <div className="tip" dangerouslySetInnerHTML={{ __html: Remark }}></div>,
        bankId: id,
        depositSet: user.Data.DrawMoneySet,
        loading: false,
      })
    }

    listenClipboard() {
      this.clipboardInstance = new ClipboardJS(".copy-btn")
      this.clipboardInstance.on("success", function (e) {
        notificationAsync.alert("已成功复制到剪贴板", {
          title: "复制成功",
        })
      })

      this.clipboardInstance.on("error", function (e) {
        notificationAsync.alert("请手动选择文字进行复制", {
          title: "复制失败",
        })
      })
    }

    deposite() {
      let validate = this.check()
      if (validate) {
        notificationAsync.alert(validate, { title: "信息错误" })
        return
      }

      this.setState({ apiLoading: true })
      payFunPay({
        Payee: this.state.name,
        PayTime: this.depositTime,
        Money: this.state.money,
        id: this.state.accounts[this.state.accountsNo].ID,
      }).then((res) => {
        this.setState({ apiLoading: false })
        if (res.Code == 1) {
          notificationAsync.alert(res.Message, { title: "成功" })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      })
    }

    check() {
      if (!this.state.name) {
        return "汇款人姓名不能为空!"
      }
      if (!this.state.money) {
        return "汇款金额不能为空!"
      }

      return ""
    }

    confirm() {
      this.setState({ showPop: false })
    }

    render() {
      let account = null
      let popContent = null

      if (this.state.accounts && this.state.accounts.length > 0) {
        account = this.state.accounts[this.state.accountsNo]
        if (account.PopUpMsg) {
          popContent = account.PopUpMsg
          popContent = popContent.replace("{p=dff-2}", "")
          popContent = popContent.replace("{/p}", "")
          popContent = popContent.replace("{hr}", "")
          popContent = popContent.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
          popContent = popContent.replace(/<a href="(.*?)#target=(.*?)">/g, '<a href="$1" target="$2">')
          popContent = popContent.replace(/<a href="(.*?)#&amp;f_u_c_k=y_o_u">/g, "<a href=\"$1\" target='_blank'>")
        }
      }

      return (
        <LayoutPage
          className="site-deposit-atm pop-message-page"
          right={null}
          // className={account && account.PopUpMsg?"site-deposit-atm pop-message-page":"site-deposit-atm"}
          center={account && account.PopUpMsg && this.state.showPop ? "汇款条款" : "银行卡转账汇款"}
          loading={this.state.loading}
        >
          {this.state.accounts && this.state.accounts.length > 0 && (
            <div className="content">
              {account.PopUpMsg && this.state.showPop ? (
                <div className="pop-bg">
                  <div className="pop-box">
                    <div className="pop-content">
                      <div className="title">请仔细阅读条款</div>
                      <div dangerouslySetInnerHTML={{ __html: popContent }}></div>
                    </div>
                    <div className="confirm-btn">
                      <Button
                        onClick={() => {
                          this.confirm()
                        }}
                      >
                        确认
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info">
                  {this.state.accounts.length > 1 && (
                    <div className="change-account">
                      <Button
                        onClick={(e) => {
                          this.setState({ accountChange: true })
                        }}
                      >
                        切换收款账号
                      </Button>
                    </div>
                  )}
                  <div className="title">收款讯息</div>
                  <div className="item">
                    <div className="name">收款姓名:</div>
                    <div className="content">{account.Payee}</div>
                    <div className="copy-btn" data-clipboard-text={account.Payee}>
                      复制
                    </div>
                  </div>
                  <div className="item">
                    <div className="name">银行卡号:</div>
                    <div className="content">{account.Account}</div>
                    <div className="copy-btn" data-clipboard-text={account.Account}>
                      复制
                    </div>
                  </div>
                  <div className="item address">
                    <div className="name">开户地址:</div>
                    <div className="content">{account.BankAddress}</div>
                    <div className="copy-btn" data-clipboard-text={account.BankAddress}>
                      复制
                    </div>
                  </div>
                  <div className="title">您的充值信息</div>
                  <div className="item">
                    <div className="name">汇款姓名:</div>
                    <div className="font-bold">
                      <InputBox
                        placeholder="请输入汇款人姓名"
                        type="text"
                        name="amount"
                        onChange={(value) => {
                          this.setState({ name: value })
                        }}
                        value={this.state.name}
                      />
                    </div>
                  </div>
                  <div className="item">
                    <div className="name">汇款金额:</div>
                    <div className="font-bold">
                      <InputBoxWithMax
                        placeholder="请输入汇款金额"
                        type="number"
                        name="amount"
                        onChange={(value) => {
                          this.setState({ money: value })
                        }}
                        value={this.state.money}
                      />
                    </div>
                    {[4, 44].includes(this.state.bankId) && (
                      <div className="inline rate">USDT ≈ {(this.state.money * this.state.depositSet.Usdt).toFixed(2)} 币</div>
                    )}
                  </div>
                  {[4, 44].includes(this.state.bankId) && (
                    <div className="item flex-item">
                      <div className="inline">当前汇率 : </div>
                      <div className="inline rate">
                        1 USDT <Icon icon="ion-arrow-right-c" />
                        {this.state.depositSet.Usdt} RMB
                      </div>
                    </div>
                  )}
                  <div className="item">
                    <div className="name py-0.75">汇款时间: </div>
                    <div className="font-bold py-0.75">{this.depositTime}</div>
                  </div>
                  {this.state.tip}

                  <div className="submit pb-1">
                    <Button
                      onClick={() => {
                        this.deposite()
                      }}
                    >
                      确认
                    </Button>
                  </div>

                  {this.state.accounts.length > 1 && (
                    <ActionSheet
                      isOpen={!!this.state.accountChange}
                      onCancel={() => {
                        this.setState({ accountChange: false })
                      }}
                      animation="default"
                      isCancelable={true}
                    >
                      {this.state.accounts.map((item, index) => (
                        <ActionSheetButton key={"accountsNo" + index} onClick={() => this.setState({ accountsNo: index, accountChange: false })}>
                          {item.BankAddress + " - " + item.Payee}
                        </ActionSheetButton>
                      ))}

                      <ActionSheetButton
                        onClick={() => {
                          this.setState({ accountChange: false })
                        }}
                        icon={"md-close"}
                      >
                        取消
                      </ActionSheetButton>
                    </ActionSheet>
                  )}
                </div>
              )}
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
