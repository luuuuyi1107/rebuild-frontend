import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Button, Select } from "react-onsenui"
import util from "@/magic/util"
import "./style.scss"
import InputBox from "@/components/InputBox"
import * as apiNotification from "@/magic/ApiNotification"
import citieList from "@/config/cities"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import { getPush, sendingEmailVerifyCode, getMySet, postBuyingItem } from "@/action/apis"
import ModalPage from "@/components/ModalPage"
import EmailVerify from "./emailverify"
import { toast } from "@/magic/toast"

const cities = util.cityToAntPickerView(citieList)

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        user: null,
        name: null,
        mobile: null,
        province: null,
        city: null,
        area: null,
        address: null,
        commodity: null,
        loading: true,
        apiLoading: false,
        isShowModal: false,
        myMailVerify: false,
        userset: null,
      }
    }

    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      action.post("User/GetBank", {}, (bankCardRes) => {
        if (bankCardRes.Data.length > 0) {
          this.setState({ name: bankCardRes.Data[0].Name })
        }
      })

      getPush({ keys: ["userset"] }).then((userRes) => {
        if (userRes.Data) {
          this.setState({ user: userRes.Data.UserData, mobile: userRes.Data.UserData.Mobile, userset: userRes.Data.UserSet })
        }
      })
      getMySet().then((res) => {
        this.setState({ myMailVerify: res.Data.MailVerify })
      })

      let areaID = this.props.route.query.areaID
      let commodityIndex = this.props.route.query.index

      let res = await action.post("Shop/GetList", { id: areaID, PageIndex: 1, PageSize: 100 })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      const commodity = res.Data[commodityIndex]
      if (commodity) {
        if (!!commodity.RecipientInfoSetting) {
          commodity.RecipientInfoSetting = JSON.parse(commodity.RecipientInfoSetting).filter((setting) => !!setting.Name)
        }
        this.setState({ commodity, loading: false })
        console.log({ commodity })
      }
    }

    buyShop() {
      if (this.state.userset?.UserMailVerify && this.state.commodity.IsEmailVerify && !this.state.commodity.mailCode) {
        return toast("请输入邮箱验证码", { class: "baccarat-toast", timeout: 1200 })
      }
      if (this.state.commodity.RecipientMode === 1 || this.state.commodity.RecipientMode === 0) {
        this.buyShopByStaticForm()
      } else if (this.state.commodity.RecipientMode === 2) {
        this.buyShopByDynamicForm()
      }
    }

    buyShopByStaticForm() {
      if (this.state.commodity.Mailing) {
        let validate = this.check()
        if (validate) {
          notificationAsync.alert(validate, { title: "信息错误" })
          return
        }
      }

      this.setState({ apiLoading: true })
      action.post(
        "Shop/BuyShop",
        {
          id: this.state.commodity.ID,
          ...(this.state.commodity.RecipientMode === 1
            ? {
                mobile: this.state.mobile,
                name: this.state.name,
                address: this.state.province + this.state.city + this.state.area + this.state.address,
              }
            : {}),
          ...(this.state.commodity.IsEmailVerify ? { mailCode: this.state.commodity.mailCode || "" } : {}),
          ...this.computedTotal,
        },
        (res) => {
          this.setState({ apiLoading: false })
          if (res.Code != 1) {
            apiNotification.alert(res, {}, this.props)
            return
          }
          this.props.onUpdate?.()
          notificationAsync.alert(res.Message, { title: "成功" })
        }
      )
    }

    buyShopByDynamicForm() {
      const data = (this.state.commodity.RecipientInfoSetting || []).reduce(
        (sum, item) => {
          sum[`select${item.ColumnId}`] = item.Value ? item.Value : ""
          return sum
        },
        {
          id: this.state.commodity.ID,
          ...(this.state.commodity.IsEmailVerify ? { mailCode: this.state.commodity.mailCode || "" } : {}),
          ...this.computedTotal,
        }
      )

      postBuyingItem(data)
        .then((res) => {
          if (res.Code !== 1) throw res.Message
          notificationAsync.alert(res.Message, { title: "成功" })
          this.props.onUpdate?.()
        })
        .catch((err) => {
          notificationAsync.alert(err, { title: "错误" })
        })
    }

    check() {
      if (!this.state.name) {
        return "姓名不能为空!"
      }
      if (!this.state.mobile) {
        return "手机不能为空!"
      }
      if (!this.state.province || !this.state.city) {
        return "省市区不能为空!"
      }
      if (!this.state.address) {
        return "地址不能为空"
      }

      return ""
    }

    async sendEmailVerifyCode() {
      if (!this.state.myMailVerify) {
        this.setState({ isShowModal: true })
        // notification
        //   .alert("使用此功能需要绑定邮箱并验证通过是否进行绑定？", { title: "提示", buttonLabels: ["取消", "前往绑定"] })
        //   .then((resIndex) => {
        //     if (resIndex === 0) return
        //     this.props.router.push("/site/securityQuestion")
        //   })
        return
      }
      const emailVerifyRes = await sendingEmailVerifyCode()
      toast(emailVerifyRes.Message)
    }

    get computedTotal() {
      if (!this.state.commodity?.Bonus) return {}
      const bonusAmount = this.state.commodity?.RecipientInfoSetting?.find((setting) => setting.Name === "积分数量")
      if (!bonusAmount || !bonusAmount.Value || +bonusAmount.Value === 0) return { totalBonus: 0, amount: 0 }
      const amount = +bonusAmount.Value
      const totalBonus = (+this.state.commodity?.Bonus * amount).toFixed(2)

      return { totalBonus, amount }
    }

    render() {
      let commodity = this.state.commodity
      const getProvince = (province) => {
        let arr = cities.filter((item) => {
          return item.value == province
        })
        if (arr.length > 0) {
          return arr[0].children
        }
        return []
      }
      return (
        <LayoutPage
          className="shop-item-record"
          title={(this.state.commodity && this.state.commodity.Title) || "订购商品"}
          right={null}
          loading={this.state.loading}
          apiLoading={this.state.apiLoading}
        >
          {commodity && (
            <div className="commodityInfo">
              {/*<div className="pic">*/}
              {/*<img src={commodity.Logo} alt=""/>*/}
              {/*</div>*/}
              <div className="title">商品介绍</div>
              <div className="txt" dangerouslySetInnerHTML={{ __html: commodity.Text }}></div>
              <div className="info">
                <div className="item price">
                  商品价格: <b style={{ color: "#c30202" }}>{commodity.Price} </b>分
                </div>
                <div className="item num">
                  订购数量: <b style={{ color: "#c30202" }}>1</b>&nbsp;件
                </div>
              </div>

              <div className="flex items-center">
                <div className="title">订购资料</div>

                <div className="bg-theme p-[0.13rem] rounded-l-full text-white leading-none ml-auto text-14px flex items-center translate-x-[0.2rem]">
                  <svg
                    className="-translate-y-[1px] mr-[0.05rem]"
                    width="16"
                    height="15"
                    viewBox="0 0 16 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.2973 14.9296C12.1734 14.9301 12.0511 14.9015 11.9408 14.8463L7.98837 12.8237L4.03592 14.8463C3.90758 14.9122 3.76288 14.9417 3.61826 14.9313C3.47365 14.9209 3.33493 14.871 3.21787 14.7873C3.10081 14.7037 3.0101 14.5896 2.95607 14.4581C2.90203 14.3266 2.88683 14.1828 2.91219 14.0433L3.68718 9.77837L0.494223 6.74823C0.394604 6.65105 0.323935 6.5292 0.289802 6.39574C0.255668 6.26228 0.259358 6.12226 0.300475 5.99069C0.345394 5.85606 0.42802 5.73643 0.538978 5.64538C0.649937 5.55432 0.784784 5.4955 0.928217 5.47557L5.34566 4.84681L7.29088 0.960658C7.35434 0.832581 7.45342 0.724567 7.57678 0.648989C7.70014 0.57341 7.84278 0.533325 7.98837 0.533325C8.13396 0.533325 8.2766 0.57341 8.39996 0.648989C8.52332 0.724567 8.6224 0.832581 8.68586 0.960658L10.6543 4.83924L15.0718 5.46799C15.2152 5.48792 15.3501 5.54675 15.461 5.6378C15.572 5.72885 15.6546 5.84848 15.6995 5.98312C15.7406 6.11468 15.7443 6.25471 15.7102 6.38817C15.6761 6.52163 15.6054 6.64348 15.5058 6.74065L12.3128 9.77079L13.0878 14.0357C13.1155 14.1777 13.101 14.3245 13.0461 14.4588C12.9911 14.593 12.898 14.7091 12.7778 14.7933C12.6375 14.8894 12.4685 14.9373 12.2973 14.9296Z"
                      fill="#FFD035"
                    />
                  </svg>
                  当前积分: {this.props.userCredit}
                </div>
              </div>

              {commodity.RecipientMode === 1 && (
                <>
                  <div className="mailInfo">
                    <div className="item name">
                      <div className="inline">姓名:</div>
                      <InputBox
                        placeholder="请输入姓名"
                        type="text"
                        name="amount"
                        onChange={(value) => {
                          this.setState({ name: value })
                        }}
                        value={this.state.name}
                      />
                    </div>
                    <div className="item">
                      <div className="inline">电话号码:</div>
                      <InputBox
                        placeholder="请输入电话"
                        type="text"
                        name="phone"
                        onChange={(value) => {
                          this.setState({ mobile: value })
                        }}
                        value={this.state.mobile}
                      />
                    </div>
                    <div className="item address-group">
                      <div className="address a1">
                        <div className="inline">省:</div>
                        <Select
                          modifier="light"
                          value={this.state.province}
                          onChange={(e) => {
                            this.setState({ province: e.target.value })
                          }}
                          placeholder="省"
                          class={this.state.province == "" ? "unselect" : ""}
                        >
                          <option key="p" value="">
                            选择省份
                          </option>
                          {cities.map((province, i) => (
                            <option key={province.label} value={province.value}>
                              {province.label}
                            </option>
                          ))}
                        </Select>
                        {/*<InputBox  placeholder="请输入省" type="text" name="amount" onChange={ value => {this.setState({province: value})}} value={this.state.province}/>*/}
                      </div>
                      <div className="address a2">
                        <div className="inline">市:</div>
                        <Select
                          value={this.state.city}
                          onChange={(e) => {
                            this.setState({ city: e.target.value })
                          }}
                          placeholder="市"
                          class={this.state.city == "" ? "unselect" : ""}
                        >
                          <option key="c" value="">
                            选择城市
                          </option>
                          {getProvince(this.state.province).map((city, i) => (
                            <option key={city.label} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </Select>
                        {/*<InputBox  placeholder="请输入市" type="text" name="amount" onChange={ value => {this.setState({city: value})}} value={this.state.city}/>*/}
                      </div>
                    </div>
                    <div className="item">
                      <div className="inline">详细地址:</div>
                      <InputBox
                        placeholder="请输入详细地址"
                        type="text"
                        name="amount"
                        onChange={(value) => {
                          this.setState({ address: value })
                        }}
                        value={this.state.address}
                      />
                    </div>

                    {/* <div className="item">
                      <div className="inline">预计兑换:</div>
                      <div className="leading-[0.84rem] w-full flex-1 pl-[0.1rem]">
                        <span className="text-red-600">{this.computedTotal?.totalBonus || 0} </span>元
                      </div>
                    </div> */}
                    <div className="px-1">
                      {this.state.userset?.UserMailVerify && commodity.IsEmailVerify && (
                        <EmailVerify
                          textcolor="text-[#999999]"
                          value={commodity.mailCode}
                          onChange={(mailCode) => {
                            // 更新 state
                            this.setState((prevState) => ({
                              commodity: {
                                ...prevState.commodity,
                                mailCode,
                              },
                            }))
                          }}
                          sendEmailVerifyCode={this.sendEmailVerifyCode.bind(this)}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {(commodity.RecipientMode === 2 || commodity.RecipientMode === 0) && (
                <div className="bg-[#FFFCF2] rounded-[8px] px-[6px] mt-1 text-14px">
                  {(commodity.RecipientInfoSetting || []).map((setting, index) => {
                    return (
                      <div
                        key={index + "_" + setting.Name}
                        className="border-b border-[#E9E9E7] border-solid border-x-0 border-t-0 last:border-b-0 box-border flex items-center h-[46px]"
                      >
                        <div className="min-w-[1.28rem] font-[400] text-black">
                          {/* <span className="text-red-600">*</span> */}
                          {setting.Name}
                        </div>
                        <div className="flex-1">
                          <input
                            placeholder={`请输入${setting.Name}`}
                            value={setting.Value || ""}
                            onChange={(event) => {
                              let newValue = event.target.value
                              if (setting.Name === "积分数量") {
                                // 只保留数字字符
                                newValue = Math.min(+newValue.replace(/\D/g, ""), commodity.Total)
                              }
                              // 创建新的 RecipientInfoSetting 数组
                              const updatedSettings = [...this.state.commodity.RecipientInfoSetting]
                              updatedSettings[index] = { ...updatedSettings[index], Value: newValue }

                              // 更新 state
                              this.setState((prevState) => ({
                                commodity: {
                                  ...prevState.commodity,
                                  RecipientInfoSetting: updatedSettings,
                                },
                              }))
                            }}
                            className="w-full border-none bg-transparent placeholder:text-[#AEAEAE] text-14px p-0"
                            type="text"
                          />
                        </div>
                      </div>
                    )
                  })}
                  {Object.keys(this.computedTotal).length > 0 && (
                    <div className="item flex items-center">
                      <div className="inline min-w-[1.28rem]">预计兑换</div>
                      <div className="leading-[0.84rem] w-full flex-1 ">
                        <span className="text-red-600">{this.computedTotal?.totalBonus || 0} </span>元
                      </div>
                    </div>
                  )}

                  {this.state.userset?.UserMailVerify && commodity.IsEmailVerify && (
                    <EmailVerify
                      value={commodity.mailCode}
                      onChange={(mailCode) => {
                        // 更新 state
                        this.setState((prevState) => ({
                          commodity: {
                            ...prevState.commodity,
                            mailCode,
                          },
                        }))
                      }}
                      sendEmailVerifyCode={this.sendEmailVerifyCode.bind(this)}
                    />
                  )}
                </div>
              )}
              <div className="clickBtn">
                <Button
                  className="text-16px w-full text-center p-0 leading-[0.88rem] rounded-[0.12rem]"
                  onClick={() => {
                    this.buyShop()
                  }}
                >
                  确认
                </Button>
              </div>
            </div>
          )}

          <ModalPage isOpen={this.state.isShowModal} animation="fade" shouldCloseOnOverlayClick>
            <div className="max-w-[335px] mx-auto text-14px">
              <div className="px-0.5 text-white bg-theme rounded-t-[8px] h-[44px] flex justify-center items-center text-16px">提示</div>
              <div className="bg-white rounded-b-[8px] p-1 flex flex-col justify-between">
                <div className="text-black min-h-[92px] flex flex-col justify-center items-center leading-loose">
                  <div>
                    使用此功能需要绑定邮箱并验证通过
                    <br />
                    是否进行绑定？
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div
                    onClick={() => {
                      this.setState({ isShowModal: false })
                    }}
                    className="text-theme border border-theme border-solid rounded-sm h-3.5 flex justify-center items-center"
                  >
                    取消
                  </div>
                  <div
                    onClick={() => {
                      this.props.router.push("/site/bindMail")
                    }}
                    className="text-white bg-theme rounded-sm h-3.5 flex justify-center items-center"
                  >
                    前往绑定
                  </div>
                </div>
              </div>
            </div>
          </ModalPage>
        </LayoutPage>
      )
    }
  }
)
