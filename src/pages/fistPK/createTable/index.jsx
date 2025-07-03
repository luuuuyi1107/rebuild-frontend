import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button } from "react-onsenui"
import GoldenPKNavigatorBar from "@/components/GoldenPKNavigatorBar"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        money: null,
        loading: true,
        apiLoading: false,
        changeCard: false,
        fist: 0,
        passInput: util.cache.get("GoldenPKPass") && Object.keys(util.cache.get("GoldenPKPass")).length > 0 ? false : true,
        pass: util.cache.get("GoldenPKPass") && Object.keys(util.cache.get("GoldenPKPass")).length > 0 ? util.cache.get("GoldenPKPass") : null,
      }
    }
    componentDidMount() {
      this.setState({ loading: false })
    }

    openTable() {
      let validate = this.check()
      if (validate) {
        notificationAsync.alert(validate, { title: "设置信息错误" })
        return
      }

      let query = {
        money: this.state.money || 2,
        pass: this.state.pass,
        fist: this.state.fist,
      }
      this.setState({ apiLoading: true })
      action.post("PKGame/Fist_Make", query, (res) => {
        this.setState({ apiLoading: false })
        if (res.Code == 1) {
          notificationAsync.alert(res.Message, { title: "成功" }).then(() => {
            this.props.router.isLoginToOrRedirect("/fistPK/home")
          })
          util.cache.set("GoldenPKPass", this.state.pass)
          this.setState({ passInput: false })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      })
    }

    check() {
      if (!this.state.pass) {
        return "登入密码不能为空"
      } else if (!this.state.fist) {
        return "请选择拳种"
      }
      return ""
    }

    render() {
      // let seting = this.state.set;
      let poker = this.state.poker
      let fistMap = {
        0: "question",
        1: "stone",
        2: "scissors",
        3: "cloth",
      }
      return (
        <LayoutPage
          className="fistPK-create-table"
          apiLoading={this.state.apiLoading}
          loading={this.state.loading}
          center="摆放擂台"
          right={
            <span
              style={{ fontSize: ".28rem", paddingRight: ".2rem", color: "#fff" }}
              onClick={() => {
                this.props.router.push("/site/article?id=14")
              }}
            >
              规则
            </span>
          }
          renderFixed={() => <GoldenPKNavigatorBar active="create" PKGame="fistPK" />}
        >
          <div className="content">
            <div className="creat-info">
              <div className="round-info">
                <div className="poker-group">
                  <div className="pokerItem Zdian dian">
                    <div className="dianItem dianItem-title">您的牌面</div>
                    <div className="poker dianItem">
                      <div className={"fist " + fistMap[this.state.fist]}>{!this.state.fist ? "请选择" : null}</div>
                      {/*<Poker*/}
                      {/*key="1"*/}
                      {/*className={`zhuang`}*/}
                      {/*value={0}*/}
                      {/*/>*/}
                    </div>
                  </div>
                  <div className="myFist item">
                    <div
                      className={this.state.fist == 1 ? "active fist stone" : "fist stone"}
                      onClick={() => {
                        this.setState({ fist: 1 })
                      }}
                    >
                      stone
                    </div>
                    <div
                      className={this.state.fist == 2 ? "active fist scissors" : "fist scissors"}
                      onClick={() => {
                        this.setState({ fist: 2 })
                      }}
                    >
                      scissors
                    </div>
                    <div
                      className={this.state.fist == 3 ? "active fist cloth" : "fist cloth"}
                      onClick={() => {
                        this.setState({ fist: 3 })
                      }}
                    >
                      cloth
                    </div>
                  </div>
                </div>
              </div>

              <div className=" item accountBalance">
                <div className="inline">牌局金额 :</div>
                <div className="inline">
                  <InputBox
                    placeholder={"2"}
                    type="number"
                    name="amount"
                    onChange={(value) => {
                      this.setState({ money: value })
                    }}
                    value={this.state.money}
                  />
                </div>
              </div>
              {this.state.passInput && (
                <div className=" item accountBalance">
                  <div className="inline">验证密码 :</div>
                  <div className="inline">
                    <InputBox
                      placeholder={"请输入提款密码"}
                      type="number"
                      name="amount"
                      onChange={(value) => {
                        this.setState({ pass: value })
                      }}
                      value={this.state.pass}
                    />
                  </div>
                </div>
              )}

              <div className="tip">
                <p>牌局金额最低 2元,最高 1000元</p>
              </div>
            </div>
            <div className="submit">
              {/*<Button onClick={()=>{this.changeCard()}}>换牌</Button>*/}
              <Button
                onClick={() => {
                  this.openTable()
                }}
              >
                摆擂
              </Button>
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
