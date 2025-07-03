import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import "./style.scss"
import { Button } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { generateQRCode } from "@/magic/qrcode"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        amount: "",
        qrcodeImgUrl: null,
        appLink: null,
        countdownStart: false,
        countdownSec: 300,
        loading: true,

        apiLoading: false,
        receiveInfo: false,

        countdownTimer: 0,
        time: {
          h: "00",
          m: "00",
          s: "00",
        },
      }

      this.startCountdown = this.startCountdown.bind(this)
      this.countdown = this.countdown.bind(this)

      let receiveInfo = JSON.parse(sessionStorage.getItem("depositQRcode"))
      if (receiveInfo) {
        this.state.amount = receiveInfo.amount
        this.state.qrcodeImgUrl = receiveInfo.qrcodeImgUrl
        this.state.appLink = receiveInfo.appLink
        this.state.countdownStart = true
        this.state.receiveInfo = true
      }
    }
    componentDidMount() {
      // this.listenClipboard();
      this.setState({ loading: false })
      if (!this.state.receiveInfo) {
        this.refreshMsg()
      }
    }

    componentDidUpdate() {
      if (this.state.receiveInfo) {
        sessionStorage.removeItem("depositQRcode")
        this.startCountdown()
      }
    }

    refreshMsg() {
      notificationAsync.alert("为避免二维码失效，刷新后请重新生成！", {
        callback: () => {
          this.props.router.push("/site/depositGoPay")
        },
      })
    }

    secondsToTime(secs) {
      if (secs <= 0) return { h: 0, m: 0, s: 0 }

      let hours = Math.floor(secs / (60 * 60))

      let divisor_for_minutes = secs % (60 * 60)
      let minutes = Math.floor(divisor_for_minutes / 60)

      let divisor_for_seconds = divisor_for_minutes % 60
      let seconds = Math.ceil(divisor_for_seconds)

      if (hours < 10) {
        hours = "0" + hours
      }
      if (minutes < 10) {
        minutes = "0" + minutes
      }
      if (seconds < 10) {
        seconds = "0" + seconds
      }

      let obj = {
        h: hours,
        m: minutes,
        s: seconds,
      }
      return obj
    }

    startCountdown() {
      console.log("start countdown")
      if (this.state.countdownTimer == 0 && this.state.countdownSec > 0) {
        this.state.countdownTimer = setInterval(this.countdown, 1000)
      }
    }

    countdown() {
      let seconds = this.state.countdownSec - 1
      console.log("sec", seconds, this.secondsToTime(seconds))
      this.setState({
        time: this.secondsToTime(seconds),
        countdownSec: seconds,
      })

      if (seconds == 0) {
        notificationAsync.alert("为避免二维码失效，请重新生成！", {
          callback: () => {
            this.props.router.push("/site/depositGoPay")
          },
        })
        clearInterval(this.countdownTimer)
      }
    }

    render() {
      let title = util.getUrlParam("title") || "付款信息"

      return (
        <LayoutPage
          className="site-deposit-qrcode"
          onBack={() => {
            let back = util.getUrlParam("back")
            if (back == "true") {
              this.props.router.push("/site/depositGoPay")
            } else {
              this.props.router.back()
            }
          }}
          center={title}
          right={null}
          loading={this.state.loading}
        >
          <div className="content">
            <div className="deposit-qrcode-content">
              <div className="amount flex w-full justify-center">
                <div className="flex-none">￥</div>
                <div className="break-all">{this.state.amount}</div>
              </div>

              <div className="countdown">
                支付倒计时：
                <span className="time">
                  {this.state.time.m}分{this.state.time.s}秒
                </span>
              </div>

              <div className="qrcode-area">
                <div className="qrcode-img flex justify-center">
                  {this.state.appLink && <span dangerouslySetInnerHTML={{ __html: generateQRCode(this.state.appLink) }}></span>}
                </div>
              </div>
              {this.state.appLink && (
                <Button
                  className="open-app-btn"
                  onClick={() => {
                    window.location.href = this.state.appLink
                  }}
                >
                  点击打开 APP 付款
                </Button>
              )}
            </div>
            <div className="deposit-notice">
              请开启购宝钱包扫码， 依照钱包显示货币数量进行支付『 付款步骤』 请谨慎操作以下步骤
              <br />
              <div className="deposit-notice-title">步骤一</div>
              请截屏保存二维码图片 步骤一
              <div className="deposit-notice-title">步骤二</div>
              开启手机中的购宝钱包（ 首次使用请点击“ 下载购宝钱包”）
              <div className="deposit-notice-title">步骤三</div>
              点击购宝钱包右上角“ 扫码图片” {">"} “选择” {">"} “相册” 中的截屏图片， 依照指定金额进行付款
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
