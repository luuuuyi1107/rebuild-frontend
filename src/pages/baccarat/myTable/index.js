import React from "react"

import LayoutPage from "@/components/LayoutPage"
import { Icon } from "react-onsenui"

import "./style.scss"
import TableBetRecord from "./tableBetRecord"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import BaccaratNavigatorBar from "@/components/BaccaratNavigatorBar"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        data: null,
        showTableRecord: false,
        apiLoading: false,
        loading: true,
      }
    }

    componentDidMount() {
      action.get("Baccarat/GetMyDesktop").then((res) => {
        this.setState({ loading: false })
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }
        this.setState({ data: res.Data[0] })
      })
    }

    async reserveClose() {
      this.setState({ apiLoading: true })
      let res = await action.post("Baccarat/Reserve", { ID: this.state.data.ID })
      this.setState({ apiLoading: false })
      if (res.Code == 1) {
        notificationAsync.alert(res.Message, {
          title: "成功",
        })
      } else {
        notificationAsync.alert(res.Message, {
          title: "操作提示",
        })
      }
    }
    async setTlement() {
      this.setState({ apiLoading: true })
      let res = await action.post("Baccarat/Settlement", { ID: this.state.data.ID })
      this.setState({ apiLoading: false })
      if (res.Code == 1) {
        notificationAsync.alert(res.Message, {
          title: "成功",
        })
      } else {
        notificationAsync.alert(res.Message, {
          title: "操作提示",
        })
      }
    }

    /** 修改邀请码 */
    editCode() {
      let data = this.state.data
      if (!data.Code) {
        notificationAsync.alert("此台面非包厢无法修改邀请码", { title: "无法修改邀请码" })
        return
      }
      notificationAsync
        .prompt({
          title: "修改邀请码",
          placeholder: "请输入新邀请码",
          messageHTML: `<span></span>`,
          class: "invite-code-dialog",
        })
        .then(async (value) => {
          if (value != null && value !== "") {
            this.setState({ apiLoading: true })
            let res = await action.post("Baccarat/EditCode", { ID: data.ID, Code: value })
            this.setState({ apiLoading: false })
            if (res.Code == 1) {
              notificationAsync.alert(res.Message, {
                title: "成功",
              })
            } else {
              notificationAsync.alert(res.Message, {
                title: "操作提示",
              })
            }
          } else if (value === "") {
            notificationAsync.alert("邀请码不能为空", { title: "信息错误" })
          }
        })
    }
    addItional() {
      let data = this.state.data
      notificationAsync
        .prompt({
          title: "追加彩池",
          placeholder: "请输入追加金额",
          messageHTML: `<span></span>`,
          class: "invite-code-dialog",
          inputType: "text",
          primaryButtonIndex: 1,
        })
        .then(async (value) => {
          if (value != null && value !== "") {
            if (isNaN(value) || parseInt(value) <= 0) {
              notificationAsync.alert("请输入正确金额", { title: "信息错误" })
              return
            }
            this.setState({ apiLoading: true })
            let res = await action.post("Baccarat/Additional", { ID: data.ID, money: value })
            this.setState({ apiLoading: false })
            if (res.Code == 1) {
              notificationAsync.alert(res.Message, {
                title: "成功",
              })
            } else {
              notificationAsync.alert(res.Message, {
                title: "操作提示",
              })
            }
          } else if (value === "") {
            notificationAsync.alert("金额不能为空", { title: "信息错误" })
          }
        })
    }

    render() {
      let data = this.state.data
      return (
        <LayoutPage
          right={null}
          className="baccarat-myTable"
          center="我的台面"
          loading={this.state.loading}
          apiLoading={this.state.apiLoading}
          renderFixed={() => <BaccaratNavigatorBar active="my-table" />}
        >
          {data && (
            <div className="table-content">
              <div className="info">
                <div className="top">
                  <div className="avatar">
                    <Icon icon="ion-person" />
                  </div>
                  <span className="name">{data.NickName}</span>
                </div>
                <div className="middle">
                  <span>桌号：{data.ID}</span>
                  <span>
                    限红：{data.MinHide}/{data.MaxHide}
                  </span>
                  <span>
                    局数：{data.HandMax}/{data.SealHide}
                  </span>
                  <span>彩池：{data.PotMoney}</span>
                  {data.Code && <span>邀请码: {data.CodeString}</span>}
                  {data.Code && <span>匿名访问: {data.Anonymous ? "是" : "否"}</span>}
                  <span>时间：{data.PokerTime}秒</span>
                </div>
              </div>

              <div className="btn-box">
                <div className="btn" onClick={() => this.reserveClose()}>
                  <span className="icon" style={{ backgroundColor: "#99b898" }}>
                    {" "}
                    <Icon icon="ion-clock" />
                  </span>
                  <span>预约封庄</span>
                </div>
                <div className="btn" onClick={() => this.setTlement()}>
                  <span className="icon" style={{ backgroundColor: "#0e9aa7" }}>
                    {" "}
                    <Icon icon="ion-android-checkbox-outline" />
                  </span>
                  <span>结算台面</span>
                </div>
                <div
                  className={data.Code ? "btn" : "btn disabled"}
                  onClick={() => {
                    this.editCode()
                  }}
                >
                  <span className="icon" style={{ backgroundColor: "#ffcb74" }}>
                    {" "}
                    <Icon icon="ion-android-create" />
                  </span>
                  <span>修改邀请码</span>
                </div>
                <div
                  className="btn"
                  onClick={() => {
                    this.addItional()
                  }}
                >
                  <span className="icon" style={{ backgroundColor: "#ff9595" }}>
                    {" "}
                    <Icon icon="ion-social-usd" />
                  </span>
                  <span>追加彩池</span>
                </div>
              </div>
              <div className="click-btn" onClick={() => this.setState({ showTableRecord: true })}>
                <span>查看台面记录</span>
              </div>
              {/*/!* 桌面详情 *!/*/}
              <ModalPage
                isOpen={!!this.state.showTableRecord}
                className="report-record-modal"
                animation="lift"
                onClose={() => {
                  this.setState({ showTableRecord: false })
                }}
              >
                {this.state.showTableRecord && <TableBetRecord id={data.ID}></TableBetRecord>}
              </ModalPage>
            </div>
          )}
          {!data && (
            <div
              className="empty"
              onClick={() => {
                this.props.router.isLoginToOrRedirect("/baccarat/createTable")
              }}
            >
              <p>
                <span>
                  <Icon icon="ion-cube" />
                </span>
                <span>马上开庄</span>
              </p>
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
