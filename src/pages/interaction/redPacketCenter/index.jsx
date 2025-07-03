import React from "react"

import RecordPage from "@/components/RedPacketRecordPage"
import util from "@/magic/util"

import "./style.scss"
import RedPacketDetail from "./redPacketDetail"
import { getPush } from "@/action/apis"
import * as apiNotification from "@/magic/ApiNotification"
import { Subject } from "rxjs"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { withLoginExceptTrial } from "@/magic/withLogin"

@withLoginExceptTrial
@withRouter
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showRedDetailed: false,
      redId: null,
      title: null,
      apiLoading: false,
      firstLoaded: false,
      validateObject: {},
    }
  }

  verifyCode = {
    captchaId: "",
    validate: "",
  }

  onClearValidateItems() {
    this.setState({ validateObject: {} })
  }

  onLoadEvent() {
    this.setState({ firstLoaded: true })
  }

  onTabChangeEvent() {
    this.setState({ firstLoaded: false })
    // setTimeout(() => {
    //     this.setState({ firstLoaded: true });
    // }, 1000)
  }

  //总配置
  totalCofig = {
    tabs: [
      {
        name: "待开放",
        filter: [{ key: "type", type: "hidden", defaultValue: 1 }],
      },
      {
        name: "进行中",
        filter: [{ key: "type", type: "hidden", defaultValue: 0 }],
      },
      {
        name: "已结束",
        filter: [{ key: "type", type: "hidden", defaultValue: 2 }],
      },
    ],
    defaultTabName: "进行中",
    subject: new Subject(),
    maxTabShow: 3,
  }

  handleUnload = () => {
    util.cache.removeStartsWith("YD0", "all")
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleUnload)
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleUnload)

    getPush({ keys: "userset" })
      .then((res) => {
        if (res.Code !== 1) throw new Error(res.Message)
        this.verifyCode.captchaId = res.Data.UserSet.CaptchaId
      })
      .catch((e) => {
        apiNotification.alert(e.message || "Error", {}, this.props)
      })

    this.totalCofig.subject.subscribe({
      next: (data) => {
        if (data.type === "loaded") {
          this.setState({ firstLoaded: true })
          return
        } else if (data.type === "addValidate") {
          const validateObject = Object.assign({}, this.state.validateObject, { [data.id]: data.code })
          this.setState({ validateObject })
        } else if (data.type === "removeValidate") {
          const validateObject = Object.assign({}, this.state.validateObject)
          delete validateObject[data.id]
          this.setState({ validateObject })
        }
      },
    })
  }

  openRedDetail(id, title) {
    this.setState({ redId: id, title: title, showRedDetailed: true })
  }

  render() {
    return (
      <div className={this.state.firstLoaded ? "loaded" : ""}>
        <RecordPage
          apiLoading={this.state.apiLoading}
          config={this.totalCofig}
          onClearValidateItems={this.onClearValidateItems.bind(this)}
          verifyCode={this.verifyCode}
          validateObject={this.state.validateObject}
          onLoadEvent={this.onLoadEvent}
          onTabChangeEvent={this.onTabChangeEvent.bind(this)}
          right={
            <span
              style={{ fontSize: "16px", paddingRight: ".2rem", color: "#fff" }}
              onClick={() => {
                this.props.router.push("/interaction/redPacketRecord")
              }}
            >
              领取记录
            </span>
          }
          className="interaction-redPacketCenter"
          center="红包中心"
        />
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
