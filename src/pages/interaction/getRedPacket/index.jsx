import React from "react"

import util from "@/magic/util"

import "./style.scss"
import { getRedsDataById, getPush, getUserRecRedsByJson } from "@/action/apis"
import RedPacketDetail from "../redPacketCenter/redPacketDetail"
import * as apiNotification from "@/magic/ApiNotification"
import LayoutPage from "@/components/LayoutPage"
import RedPacketButton from "../redPacketCenter/redPacketButton"
import YidunVerifyCode from "@/components/YidunVerifyCode"
import { Observable } from "rxjs"
import { take } from "rxjs/operators"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { withLogin } from "@/magic/withLogin"
import { notificationAsync } from "@/magic/notification"

@withLogin
@withRouter
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showRedDetailed: false,
      redId: null,
      title: null,
      apiLoading: false,
      loading: true,
      redPacket: null,
      captchaId: "",
      validate: "",
      operate: false,
      isLoaded: false,
      puzzle: false,
    }
  }

  handleUnload = () => {
    util.cache.removeStartsWith("YD0", "all")
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleUnload)
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleUnload)
    this.loadData()
  }

  async loadData() {
    const id = util.getUrlParam("id")
    const res = await getRedsDataById(id)
    if (res.Code != 1) {
      apiNotification.alert(res, {}, this.props)
      return
    }
    this.setState({ redPacket: res.Data })

    const resUserSet = await getPush({ keys: "userset" })
    this.setState({ captchaId: resUserSet.Data.UserSet.CaptchaId, loading: false })
  }

  openRedDetail(id, title) {
    this.setState({ redId: id, title: title, showRedDetailed: true })
  }

  async getRedPacket(id, needPwd, needCaptcha) {
    const _data = { id }
    if (needCaptcha) _data["NECaptchaValidate"] = this.state.validate
    try {
      if (needPwd) _data["pass"] = await notificationAsync.prompt("请输入密码", { title: "提示" })
      const _response = await getUserRecRedsByJson(_data)
      const title = _response.Code === 1 ? "成功" : "操作提示"
      const callback =
        _response.Code === 1 || _response.Message.indexOf("银行卡") < 0
          ? null
          : () => {
              this.props.router.push("/site/setBankCard")
            }
      notificationAsync.alert(_response.Message, { title, callback })
    } catch (error) {
      console.log(error)
    } finally {
      this.setState({ apiLoading: false })
    }
  }

  onVerifySuccess(data) {
    this.setState({ validate: data.validate, operate: false, puzzle: false })
  }

  observeTags() {
    const subscription = Observable.interval(200)
      .pipe(take(10))
      .subscribe({
        next: () => {
          if (document.getElementsByClassName("yidun yidun-custom yidun--light yidun--embed yidun--size-small yidun--jigsaw").length > 0) {
            this.setState({ operate: true })
            subscription.unsubscribe()
          }
        },
        error: (err) => console.log("error:", err),
        complete: () => {
          subscription.unsubscribe()
        },
      })
  }

  onLoad() {
    this.setState({ isLoaded: true })
    const dom = document.getElementsByClassName("yidun_classic-wrapper")[0]
    const config = { childList: true, attributes: true, attributeFilter: ["style"] }
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          this.setState({ puzzle: true })
        }

        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          this.setState({ puzzle: dom.style.display === "block" })
        }
      }
    })
    observer.observe(dom, config)
  }
  render() {
    let redPacket = this.state.redPacket
    try {
      if (redPacket) {
        redPacket.Title = redPacket.Title.replaceAll("(", "<").replaceAll(")", ">")
      }
    } catch (e) {}
    // let title = this.redPacket.Title;
    // let desc = this.redPacket.Text;
    return (
      <div className={this.state.isLoaded ? "loaded" : ""}>
        <LayoutPage
          loading={this.state.loading}
          apiLoading={this.state.apiLoading}
          right={() => (
            <span
              style={{ fontSize: 12 }}
              className="redCenterBtn"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/interaction/redPacketCenter")
              }}
            >
              红包中心
            </span>
          )}
          className="interaction-redPacketCenter record-page"
          center="领取红包"
        >
          {redPacket && (
            <div className={`red-packet-record-item ${this.state.operate ? "flex" : ""} ${this.state.puzzle ? "puzzle" : ""}`} key={redPacket.ID}>
              <div className="main-content">
                <div className="item title">
                  <span className="bd" dangerouslySetInnerHTML={{ __html: redPacket.Title }}></span>
                  {redPacket.RedsRecord && (
                    <span className="clickBtn " onClick={() => this.openRedDetail(redPacket.ID, redPacket.Title)}>
                      领取详情
                    </span>
                  )}
                </div>
                <div className="item money">
                  红包余额：
                  <span>
                    <b style={{ color: "#c30202" }}>{redPacket.PotMoney}</b>元
                  </span>
                </div>
                <div className="item money">
                  最高金额：<b style={{ color: "#c30202" }}>{redPacket.Mend}元</b>
                </div>
                <div className="item time">发放周期：{redPacket.UpCycle ? `${redPacket.UpCycle}小时` : "每人仅限1次"}</div>
                <div className="item time">限量周期：{redPacket.Collar}个</div>
                {redPacket.Text && (
                  <div className="item text">
                    红包说明：
                    <span className="bd" dangerouslySetInnerHTML={{ __html: redPacket.Text }}></span>
                  </div>
                )}
              </div>
              {redPacket.Captcha === 1 && !this.state.validate ? (
                !!this.state.captchaId ? (
                  <YidunVerifyCode
                    id="login-verify"
                    CaptchaId={this.state.captchaId}
                    className={this.state.captchaId.indexOf("dd952") >= 0 ? "" : "hard"}
                    onSuccess={this.onVerifySuccess.bind(this)}
                    onLoad={this.onLoad.bind(this)}
                  />
                ) : (
                  <div></div>
                )
              ) : (
                <RedPacketButton row={redPacket} onGetRedPacket={(ID) => this.getRedPacket(ID, redPacket.Pass, redPacket.Captcha === 1)} />
              )}

              {/* <div className="clickBtn receive" onClick={()=>this.getRedPacket(redPacket.ID)}>领取红包</div> */}
            </div>
          )}
        </LayoutPage>

        {/*/!* 红包详情 *!/*/}
        <ModalPage
          isOpen={!!this.state.showRedDetailed}
          className="report-record-modal"
          animation="lift"
          onClose={() => {
            this.setState({ showRedDetailed: false })
          }}
        >
          {this.state.showRedDetailed && <RedPacketDetail title={this.state.title} id={this.state.redId}></RedPacketDetail>}
        </ModalPage>
      </div>
    )
  }
}
