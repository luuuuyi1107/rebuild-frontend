import React from "react"
import LayoutPage from "@/components/LayoutPage"

import { getUserCredit, getPush, convertCredit } from "@/action/apis"
import InputBox from "@/components/InputBox"
import { Button, List, ListItem } from "react-onsenui"
import "./stylenew.scss"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        exchangeCreditNumber: this.props.data.BetCredit || null,
        shopCredit: 0,
        rate: 0,
        showDetailRecord: false,
      }
    }
    componentDidMount() {
      Promise.all([getPush(), getUserCredit(1)]).then(([user, rate]) => {
        this.setState({
          shopCredit: user.Data.UserData.Credit,
          rate,
          loading: false,
        })
      })
    }

    exchange() {
      let validate = this.check()
      if (validate) {
        notificationAsync.alert(validate)
        return
      }

      convertCredit(this.props.data.MonthInt, this.state.exchangeCreditNumber).then((res) => {
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }
        notificationAsync.alert(res.Message, { title: "成功" })
      })
    }

    check() {
      if (!this.state.exchangeCreditNumber) {
        return "请输入积分兑换!"
      }
      let r = /^[0-9]*[1-9][0-9]*$/ //正整数
      if (!r.test(this.state.exchangeCreditNumber)) {
        return "金额须为整数!"
      }

      return ""
    }

    render() {
      return (
        <LayoutPage
          className="exchange-modal"
          title="积分兑换"
          right={<span onClick={() => this.props.show("showExchangeRecord")}>转换记录</span>}
          loading={this.state.loading}
        >
          <List>
            <ListItem>
              <div className="left">商城积分：</div>
              <div className="center">{this.state.shopCredit}</div>
            </ListItem>
            <ListItem>
              <div className="left">未兑点数：</div>
              <div className="center">{this.props.data.BetCredit}</div>
            </ListItem>
            <ListItem>
              <div className="left">已兑点数：</div>
              <div className="center">{this.props.data.ExcCredit}</div>
            </ListItem>
            <ListItem>
              <div className="left">兑换比例：</div>
              <div className="center">{1 / parseFloat(this.state.rate.Data)}点数兑换1积分</div>
            </ListItem>
            <ListItem>
              <div className="left">积分兑换：</div>
              <div className="center">
                <InputBox
                  placeholder="请输入兑换点数"
                  type="number"
                  name="amount"
                  onChange={(value) => {
                    this.setState({ exchangeCreditNumber: value })
                  }}
                  value={this.state.exchangeCreditNumber}
                />
              </div>
            </ListItem>
          </List>
          <div className="submit flex justify-center text-center">
            <Button
              onClick={() => {
                this.exchange()
              }}
            >
              确认
            </Button>
          </div>
        </LayoutPage>
      )
    }
  }
)
