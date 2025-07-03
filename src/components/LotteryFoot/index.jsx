import React from "react"
import { Input, Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import util from "@/magic/util"
import * as action from "@/action"
import "./style.scss"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class LotteryFoot extends React.PureComponent {
    constructor(props) {
      super()
      let user = util.cache.get("user") || {}
      this.state = {
        unit: props.initUnit,
        KuaiMoney: user.KuaiMoney || "1,10,100,1000",
        showModalTema: false,
        mode: "normal",
      }
    }

    setUnit(unit, event) {
      let unitInt = parseInt(unit)
      if (!isNaN(unitInt) && unitInt > 0) {
        this.props.onUnitChange && this.props.onUnitChange(unitInt)
        this.setState({ unit: unitInt })
        if (event) {
          event.target.value = unitInt
        }
        this.props.onFillUnit(unitInt)
      } else {
        this.setState({ unit: "" })
        if (event) {
          event.target.value = ""
        }
      }
    }

    clear() {
      this.setUnit("")
      this.props.onClear && this.props.onClear()
    }

    submit() {
      if (!isNaN(this.state.unit) && parseFloat(this.state.unit) > 0) {
        this.props.onSubmit && this.props.onSubmit(this.state.unit)
      } else {
        notificationAsync.alert("请输入正确的金额!", { title: "金额错误" })
      }
    }
    chaseConfirm() {
      const validateResult = this.props.getValidate()
      if (!!validateResult) {
        notificationAsync.alert(validateResult, { title: "操作提示" })
        return
      }
      // 信用投注
      if (this.props.config?.specialType === "tema_area" && this.props.betMode === "quick") {
        this.props.setUnitAndChase()
        return
      }

      // 请选择投注内容
      if (!isNaN(this.state.unit) && parseFloat(this.state.unit) > 0) {
        this.props.onChase && this.props.onChase(this.state.unit)
      } else {
        notificationAsync.alert("请输入正确的金额!", { title: "金额错误" })
      }
    }

    validateUnit() {
      if (isNaN(this.state.unit)) {
        const unit = parseInt(this.state.unit) + ""
        this.setUnit(unit)
        return
      }
      this.props.onFillUnit(this.state.unit)
    }

    onModeChange(mode) {
      this.setState({
        mode: mode,
      })
    }

    editQuickMoney() {
      let user = util.cache.get("user")
      notificationAsync
        .prompt(" ", {
          title: "请设置便捷金额",
          placeholder: "请设置便捷金额",
          defaultValue: user.KuaiMoney,
          cancelable: true,
          buttonLabels: ["取消", "保存"],
          class: "quick-money-promot",
        })
        .then((value) => {
          if (value) {
            value = value.match(/\d+/g)
            if (value && value.length > 4) {
              notificationAsync.alert("快捷金额最多只能4个", { title: "信息错误" })
            }
            if (value.length <= 4) {
              this.setState({ KuaiMoney: value.join(",") })
              action.post("User/MySet", { KuaiMoney: value.join(",") })
            }
            util.cache.set("user", Object.assign({}, user, { KuaiMoney: value.join(",") }))
          }
        })
    }

    render() {
      // let user = util.cache.get("user")
      let quickMoney = this.state.KuaiMoney.split(",")
      let maxRate = this.props.maxRate()
      let betCount = this.props.betCount || 0
      let baseUnit = this.props.baseUnit || ""
      var config = this.props.config
      var isTema = config.specialType === "tema_area" || ""
      if (isNaN(maxRate)) {
        maxRate = 0
      }

      //特码专用
      if (isTema) {
        return (
          <div className={`lottery-foot-module ${baseUnit ? "rate" : "money"}`}>
            {/*正常的计算方式*/}
            {this.state.mode === "normal" && (
              <div className="top flex items-center justify-start">
                {baseUnit &&
                  ["2", "5", "10", "50", "99"].map((item) => (
                    <span key={item} className={`${this.state.unit == item ? "on" : ""}`} onClick={this.setUnit.bind(this, item)}>
                      {item}倍
                    </span>
                  ))}
                {!baseUnit && (
                  <div className="moneys">
                    {quickMoney.map((item) => {
                      return (
                        <span
                          key={item}
                          className={`${this.state.unit == item ? "on" : ""} whitespace-nowrap`}
                          onClick={this.setUnit.bind(this, item)}
                        >
                          {item}元
                        </span>
                      )
                    })}
                  </div>
                )}
                {/* {!baseUnit && <Icon icon="ion-android-create" onClick={this.editQuickMoney.bind(this)} />} */}
                {!baseUnit && (
                  <div
                    onClick={() => {
                      this.props.router.push("/site/mySet")
                    }}
                    className="bg-gray-200 rounded-lg px-1 py-[11px] font-[600] ml-1"
                  >
                    编辑金额
                  </div>
                )}
              </div>
            )}

            <div className="bottom">
              <div className="left" onClick={this.clear.bind(this)}>
                清空
              </div>
              <div className="center">
                {/*特码 - */}
                {this.state.mode === "normal" && (
                  <div className="cl">
                    {/* {baseUnit && <span>倍数</span>}
                  {!baseUnit && <span>金额</span>} */}
                    <Input
                      type="tel"
                      placeholder={baseUnit ? "倍数" : "金额"}
                      value={this.state.unit + ""}
                      onBlur={this.validateUnit.bind(this)}
                      onInput={(e) => {
                        this.setUnit(e.target.value, e)
                      }}
                    />
                  </div>
                )}

                {this.state.mode === "normal" && (
                  <div className="cr">
                    <p className="p1">
                      共{isNaN(betCount) ? "-" : betCount.toFixed(0)}注,{" "}
                      {!isNaN(this.state.unit) && !isNaN(betCount) ? (betCount * (baseUnit || 1) * this.state.unit).toFixed(0) : "0"}元
                    </p>
                    {this.state.unit && !isNaN(this.state.unit) && (
                      <p className="p2">
                        {config.customBetResultPrefix || "最高可中"}
                        {isNaN(this.state.unit) ? "-" : util.numberRoundedFix(maxRate.toFixed(2) * this.state.unit)}元
                      </p>
                    )}
                    {(!this.state.unit || isNaN(this.state.unit)) && <p className="p2">请设置{baseUnit ? "倍数" : "金额"}</p>}
                  </div>
                )}

                {this.state.mode === "quick" && (
                  <div className="cr">
                    <p className="p1">
                      共{isNaN(betCount) ? "-" : betCount.toFixed(0)}注, {this.props.temaTrustCount.toFixed(0)}元
                    </p>
                    {this.props.temaTrustCount > 0 && (
                      <p className="p2">
                        {config.customBetResultPrefix || "最高可中"}
                        {this.props.temaTrustTopWin.toFixed(0)}元
                      </p>
                    )}
                    {this.props.temaTrustCount <= 0 && <p className="p2">请设置{baseUnit ? "倍数" : "金额"}</p>}
                  </div>
                )}
              </div>
              {this.props.enableChase && (
                <div className="chase" onClick={this.chaseConfirm.bind(this)}>
                  追号
                </div>
              )}
              <div
                className="right"
                onClick={() => {
                  //回调上层，调用到 特码d的弹框2
                  if (this.state.mode === "normal") {
                    if (!betCount) {
                      notificationAsync.alert("请至少选择1个号码!", { title: "投注提示" })
                    } else if (!isNaN(this.state.unit) && parseFloat(this.state.unit) > 0) {
                      // this.props.onSubmit && this.props.onSubmit(this.state.unit);
                      this.props.showModal && this.props.showModal(true)
                    } else {
                      notificationAsync.alert("请输入正确的金额!", { title: "金额错误" })
                    }
                  } else {
                    this.props.showModal && this.props.showModal(true)
                  }
                }}
              >
                投注
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div className={`lottery-foot-module ${baseUnit ? "rate" : "money"}`}>
            <div className="top flex items-center justify-start">
              {baseUnit &&
                ["2", "5", "10", "50", "99"].map((item) => (
                  <span key={item} className={`${this.state.unit == item ? "on" : ""}`} onClick={this.setUnit.bind(this, item)}>
                    {item}倍
                  </span>
                ))}
              {!baseUnit && (
                <div className="moneys">
                  {quickMoney.map((item) => {
                    return (
                      <span key={item} className={`${this.state.unit == item ? "on" : ""} whitespace-nowrap`} onClick={this.setUnit.bind(this, item)}>
                        {item}元
                      </span>
                    )
                  })}
                </div>
              )}
              {/* {!baseUnit && <Icon icon="ion-android-create" onClick={this.editQuickMoney.bind(this)} />} */}
              {!baseUnit && (
                <div
                  onClick={() => {
                    this.props.router.push("/site/mySet")
                  }}
                  className="bg-gray-200 rounded-lg px-1 py-[11px] font-[600] ml-1"
                >
                  编辑金额
                </div>
              )}
            </div>

            <div className="bottom">
              <div className="left flex justify-center items-center" onClick={this.clear.bind(this)}>
                {/* <img src="/public/images/LotteryFooter/trash.png" /> */}
                <img src={util.buildAssetsPath("images/LotteryFooter/trash.png")} />
              </div>
              <div className="center">
                <div className="cl">
                  {/* {baseUnit && <span>倍数</span>}
                {!baseUnit && <span>金额</span>} */}
                  <Input
                    type="tel"
                    placeholder={baseUnit ? "倍数" : "金额"}
                    value={this.state.unit + ""}
                    onBlur={this.validateUnit.bind(this)}
                    onInput={(e) => {
                      this.setUnit(e.target.value, e)
                    }}
                  />
                </div>
                <div className="cr">
                  <p className="p1">
                    共{isNaN(betCount) ? "-" : betCount.toFixed(0)}注,{" "}
                    {!isNaN(this.state.unit) && !isNaN(betCount) ? (betCount * (baseUnit || 1) * this.state.unit).toFixed(0) : "0"}元
                  </p>
                  {this.props.showPredictReward && this.state.unit && !isNaN(this.state.unit) && (
                    <p className="p2">
                      {config.customBetResultPrefix || "最高可中"}
                      {isNaN(this.state.unit) ? "-" : maxRate.toFixed(2)}元
                    </p>
                  )}
                  {(!this.state.unit || isNaN(this.state.unit)) && <p className="p2">请设置{baseUnit ? "倍数" : "金额"}</p>}
                </div>
              </div>

              {this.props.enableChase && (
                <div className="chase" onClick={this.chaseConfirm.bind(this)}>
                  追号
                </div>
              )}
              <div className="right" onClick={this.submit.bind(this)}>
                投注
              </div>
            </div>
          </div>
        )
      }
    }
  }
)
