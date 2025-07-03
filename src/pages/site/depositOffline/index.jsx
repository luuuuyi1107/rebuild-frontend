import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { withLogin } from "@/magic/withLogin"
import { getSubBankList } from "@/action/apis"
import constants from "@/config/constants"
import { notificationAsync } from "@/magic/notification"

@withLogin
@withRouter
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      offlinePays: [],
      loading: true,
      apiLoading: false,
    }
  }
  componentDidMount() {
    this.loadData()
    this.setState({ loading: false })
  }

  async loadData() {
    let res = await action.get("Pay/GetBankList")
    if (res.Code != 1) {
      apiNotification.alert(res, {}, this.props)
      return
    }
    res.Data = res.Data.sort(function (a, b) {
      return a.PID > b.PID ? 1 : -1
    })

    this.setState({ offlinePays: res.Data, loading: false })
  }

  paySubmit(id) {
    this.setState({ apiLoading: true })
    getSubBankList({ id }).then((res) => {
      this.setState({ apiLoading: false })
      if (res.Code !== 1) {
        return notificationAsync.alert(res.Message, { title: "操作提示" })
      }
      if (res.Count == 0) {
        return notificationAsync.alert("暂无收款账户,请更换其他充值方式!", { title: "操作提示" })
      }
      if (id == constants.USDT_BANK_ID) {
        this.props.router.isLoginToOrRedirect(`/site/depositUSDT`)
      } else {
        this.props.router.isLoginToOrRedirect(`/site/depositAtm`, { id })
      }
    })
  }

  render() {
    return (
      <LayoutPage
        loading={this.state.loading}
        apiLoading={this.state.apiLoading}
        className="site-deposit-offline"
        center="线下充值通道"
        right={
          <span
            style={{ fontSize: ".28rem", paddingRight: ".2rem", color: "#fff" }}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/site/depositWithdrawRecord")
            }}
          >
            入款记录
          </span>
        }
      >
        <div className="content">
          {this.state.offlinePays.map((offlinePay) => {
            return (
              <div key={offlinePay.ID} onClick={() => this.paySubmit(offlinePay.ID)}>
                <img src={offlinePay.Logo} alt="" />
              </div>
            )
          })}
        </div>
      </LayoutPage>
    )
  }
}
