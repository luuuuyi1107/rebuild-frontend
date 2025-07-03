import React, { Fragment } from "react"
import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import "./style.scss"
import { Button } from "react-onsenui"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import { setUserBank, getBank, getPush, getBankList } from "@/action/apis"
import * as apiNotification from "@/magic/ApiNotification"
import * as jsqr from "@/magic/jsqr"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import { ORDER_PAYMENT, VIRTUAL_PAYMENT } from "@/config/payment"
import { apiHandler } from "@/action"
import _ from "lodash"

@withRouter
export default class extends React.PureComponent {
  insertTypeList = {
    0: "上传二维码",
    1: "输入帐号",
  }

  constructor(props) {
    super(props)
    this.type = this.props.route.query.type || ""
    this.state = {
      Name: this.props.route.query.Name || "",
      Pass: "",
      Bank: this.props.route.query.Bank || "",
      userId: this.props.route.query.userId || "",
      Account: "",
      City: "",
      apiLoading: false,
      loading: true,
      action: this.props.route.query.action || "new",
      userSet: {},
      classid: this.props.route.query.classid || 0,
      ID: this.props.route.query.ID,
      Base64: "",
      qrcode: null,
      currentPayment: null,
      insertType: Object.keys(this.insertTypeList)[0],
    }
  }

  // jsqr = null
  async componentDidMount() {
    this.loadData()
    // this.jsqr = await useJSQR()
  }

  get isQrcodePayment() {
    return ORDER_PAYMENT.ALL.filter((x) => x.QRCODE)
      .map((x) => x.C_TYPE)
      .includes(this.state.currentPayment?.CType)
  }

  get currentPaymentConfig() {
    if (this.state.currentPayment) {
      if (this.state.currentPayment.CType == VIRTUAL_PAYMENT.C_TYPE) {
        return VIRTUAL_PAYMENT
      } else {
        return ORDER_PAYMENT.findPaymenByCType(this.state.currentPayment.CType)
      }
    }
  }

  get isAlipayPayment() {
    return (
      _.has(this.currentPaymentConfig, "PREFIX") &&
      _.isArray(this.currentPaymentConfig.PREFIX) &&
      this.currentPaymentConfig?.PREFIX[0] === ORDER_PAYMENT.ALIPAY.PREFIX[0]
    )
  }

  get isWxpPayment() {
    return (
      _.has(this.currentPaymentConfig, "PREFIX") &&
      _.isArray(this.currentPaymentConfig.PREFIX) &&
      this.currentPaymentConfig?.PREFIX[0] === ORDER_PAYMENT.WECHAT.PREFIX[0]
    )
  }

  async loadData() {
    let [bankCardRes, bankListRes] = await Promise.all([apiHandler(() => getBank()), apiHandler(() => getBankList())])

    this.setState({ currentPayment: bankListRes.Data.find((x) => x.ID == this.state.classid) })
    const hasBankCard = bankCardRes.Data.filter((bank) => bank.CType === ORDER_PAYMENT.BANK.C_TYPE).length
    if (bankCardRes.Data.length > 0 && !this.type && hasBankCard) {
      // 没带参数
      this.setState({
        Account: bankCardRes.Data[0].Account,
        Bank: bankCardRes.Data[0].Bank,
        City: bankCardRes.Data[0].City,
        Name: bankCardRes.Data[0].Name,
        action: "edit",
      })
    } else if (bankCardRes.Data.length > 0 && this.state.action === "edit" && this.state.ID) {
      const editBank = bankCardRes.Data.find((bank) => bank.ID == this.state.ID)
      if (editBank) {
        this.setState({
          Account: editBank.Account,
          Bank: editBank.Bank,
          City: editBank.City,
          Name: editBank.Name,
        })
      }
    }
    let userSetRes = await getPush({ keys: "userset" })
    this.setState({ loading: false })
    if (userSetRes.Code == 1 && userSetRes.Data.UserSet) {
      this.setState({ userSet: userSetRes.Data.UserSet })
    } else {
      apiNotification.alert(res)
    }
  }

  fetchData() {
    // this.isAlipayPayment
    const prefix = this.isAlipayPayment
      ? "https://ds.alipay.com/?from=pc&appId=09999988&actionType=toAccount&sourceId=bill&account="
      : ORDER_PAYMENT.WECHAT.PREFIX[0]

    const Account =
      this.state.insertType == "1" &&
      this.isQrcodePayment &&
      this.currentPaymentConfig?.PREFIX &&
      !this.state.Account.includes(this.currentPaymentConfig?.PREFIX)
        ? prefix + this.state.Account
        : this.state.Account
    // const Account = this.state.Account || ""
    // if (!Account) return

    return {
      Name: this.state.Name,
      Pass: this.state.Pass,
      City: this.state.City,
      classid: this.state.classid,
      Account,
      Bank: this.state.Bank == "购宝钱包" ? this.state.userId + "_" + this.state.Bank : this.state.Bank,
      ...(this.state.action === "edit" ? { ID: this.state.ID } : {}), // for editing
    }
  }

  addBankCard() {
    util.cache.removeStartsWith("User/GetBank", "session")
    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate)
      return
    }
    this.setState({ apiLoading: true })
    const data = this.fetchData()

    setUserBank(data).then(async (res) => {
      this.setState({ apiLoading: false })
      if (res.Code == 1) {
        await notificationAsync.alert(res.Message, { title: "成功" })
        util.cache.removeStartsWith("User/GetBank", "session")
        // if (this.state.action === "edit") return
        this.props.router.back()
      } else {
        notificationAsync.alert(res.Message)
      }
    })
  }

  check() {
    if (!this.state.Name) {
      return "开户姓名不能为空"
    }

    if (!this.state.Account) {
      return "银行卡号不能为空"
    }
    if (!this.state.Bank) {
      return "开户银行不能为空"
    }
    if (this.type != "addOtherPayment" && !this.state.City) {
      return "开户城市不能为空"
    }
    if (!this.state.Pass) {
      return "提款密码不能为空"
    }
    if (this.state.insertType == 1 && !util.validateEmail(this.state.Account) && !util.validatePhone(this.state.Account)) {
      return "输入的帐号格式不正确"
    }
    return ""
  }

  cardNameDeal(name) {
    if (!name) return name
    let splitItem = ["(", "[", "{", "（", "【"]
    splitItem.map((item) => {
      let nameFlash = name.split(item)
      if (nameFlash.length > 1) {
        name = nameFlash[0]
      }
    })

    return name
  }

  convertBase64(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = () => {
        resolve(fileReader.result)
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }

  convertQRcodeToString(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      fileReader.onload = (e) => {
        const image = new Image()
        image.onload = () => {
          canvas.width = image.width
          canvas.height = image.height
          context.drawImage(image, 0, 0)

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsqr.default(imageData.data, imageData.width, imageData.height)
          if (code) {
            const prefixKeys = this.currentPaymentConfig?.PREFIX || []
            if (!prefixKeys.length || prefixKeys.some((key) => code.data.toLowerCase().startsWith(key))) {
              resolve(code.data)
            } else {
              reject(`请您上传${this.currentPaymentConfig.NAME2}收款码!`)
            }
          } else {
            reject("无法识别二维码！")
          }
        }
        image.src = e.target.result
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
      fileReader.readAsDataURL(file)
    })
  }

  async imageUploadChange(event) {
    const _target = event.target
    const file = event.target.files[0]
    try {
      const Base64 = await this.convertBase64(file)
      const Account = await this.convertQRcodeToString(file)
      this.setState({ Account, Base64 })
    } catch (error) {
      _target.value = null
      notificationAsync.alert(error)
    }
  }

  render() {
    let userSet = this.state.userSet
    let action = this.state.action
    return (
      <LayoutPage className="site-add-bank-card" center="收款信息" right={null} loading={this.state.loading}>
        <div className="content">
          <div className="item">
            <div>开户姓名</div>
            <div className="insert">
              <input
                disabled={["addOtherPayment", "addBankPayment"].includes(this.type)}
                placeholder="请输入开户人的姓名"
                value={this.cardNameDeal(this.state.Name)}
                type="text"
                name="Name"
                onChange={(e) => {
                  this.setState({ Name: e.target.value })
                }}
              />
            </div>
          </div>

          {(this.isAlipayPayment || this.isWxpPayment) && (
            <div className="item">
              <div>帐号格式</div>
              <div className="flex items-center account-format">
                {Object.entries(this.insertTypeList).map(([value, label]) => (
                  <Fragment key={value + "_" + label}>
                    <input
                      type="radio"
                      className="radio"
                      id={"radioButton" + value}
                      value={value}
                      checked={this.state.insertType === value}
                      onChange={() => {
                        // 转支付宝 this.props.route.query.Bank

                        const name3 = this.isAlipayPayment ? ORDER_PAYMENT.ALIPAY.NAME3 : ORDER_PAYMENT.WECHAT.NAME3

                        const Bank = value == "1" ? name3 : this.props.route.query.Bank || ""

                        this.setState({
                          insertType: value,
                          Account: "",
                          Bank,
                        })
                      }}
                    />
                    <label htmlFor={"radioButton" + value} key={label}>
                      {label}
                    </label>
                  </Fragment>
                ))}
              </div>
            </div>
          )}

          {/* <InputBox disabled={this.type=='addOtherPayment'?true:false} placeholder="请输入开户人的姓名" prefix="ion-android-person" type="text" name="Name" onChange={ value => {this.setState({Name: value})}} value={this.cardNameDeal(this.state.Name)}/> */}
          {this.isQrcodePayment ? null : this.type == "addOtherPayment" ? (
            <InputBox
              placeholder="请输入钱包编号"
              prefix="ion-card"
              type="text"
              name="Account"
              onChange={(value) => {
                if (this.currentPaymentConfig?.accountValidate) {
                  if (this.currentPaymentConfig.accountValidate(value)) {
                    this.setState({ Account: value })
                  }
                } else {
                  this.setState({ Account: value })
                }
              }}
              value={this.state.Account}
            />
          ) : (
            <InputBox
              placeholder="请输入银行卡的卡号"
              prefix="ion-card"
              type="tel"
              name="Account"
              onChange={(value) => {
                this.setState({ Account: value })
              }}
              value={this.state.Account}
            />
          )}

          {!this.isQrcodePayment ? null : this.state.insertType == 0 ? (
            <div className="item">
              <div>文件上传</div>
              <div>
                {this.state.Base64 ? (
                  <div className="base64-img">
                    <img src={this.state.Base64} />
                    <div
                      onClick={() => {
                        this.setState({ Base64: "", Account: "" })
                      }}
                      className="close"
                    >
                      <Icon icon="ion-close" />
                    </div>
                  </div>
                ) : (
                  <label className="uploadLabel" htmlFor="uploadBtn">
                    <img style={{ width: 20 }} src={util.buildAssetsPath("assets/icons/ic_camera.png")} />
                  </label>
                )}

                <input
                  id="uploadBtn"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  name="uploadImg"
                  onChange={this.imageUploadChange.bind(this)}
                />
              </div>
            </div>
          ) : (
            <div className="item">
              <div>输入帐号</div>
              <div>
                <input
                  placeholder="请输入帐号"
                  type="text"
                  name="CardNum"
                  onChange={(e) => {
                    this.setState({ Account: e.target.value })
                  }}
                  value={this.state.Account}
                />
              </div>
            </div>
          )}

          <div className="item">
            <div>开户银行</div>
            <div className="insert">
              <input
                disabled={this.type == "addOtherPayment"}
                placeholder="请输入开户银行"
                type="text"
                name="Bank"
                onChange={(e) => {
                  this.setState({ Bank: e.target.value })
                }}
                value={this.state.Bank}
              />
            </div>
          </div>

          {this.type != "addOtherPayment" && (
            <div className="item">
              <div>开户城市</div>
              <div className="insert">
                <input
                  placeholder="请输入开户城市"
                  prefix="ion-android-home"
                  type="text"
                  name="City"
                  onChange={(e) => {
                    this.setState({ City: e.target.value })
                  }}
                  value={this.state.City}
                />
              </div>
            </div>
          )}

          <div className="item">
            <div>提款密码</div>
            <div className="insert pws">
              <InputBox
                placeholder="请输入您4位提款密码"
                prefix="ion-android-locked"
                type="password2"
                name="payPass"
                className="my-0"
                onChange={(value) => {
                  let Pass = value
                  if (Pass.length > 4) {
                    Pass = Pass.slice(0, 4)
                  }
                  this.setState({ Pass })
                }}
                value={this.state.Pass}
              />

              {/* <input
                placeholder="请输入您4位提款密码"
                prefix="ion-android-lock"
                type="password2"
                name="payPass"
                className="pay-pwd"
                maxLength="4"
                onChange={(e) => {
                  if (e.target.value.length > 4) {
                    e.target.value = e.target.value.slice(0, 4)
                  }
                  this.setState({ Pass: e.target.value })
                }}
                value={this.state.Pass}
              /> */}
            </div>
          </div>

          <div className="tip">
            {this.state.currentPayment?.ShowMsg ? (
              <div dangerouslySetInnerHTML={{ __html: util.formatUbb(this.state.currentPayment.ShowMsg) }}></div>
            ) : (
              // bank
              <>
                <div>
                  温馨提示：每人最多可同时绑定3张银行卡，为了您的资金安全，解绑银行卡请联系
                  <b
                    onClick={() => {
                      util.callService()
                    }}
                  >
                    <u>在线客服</u>
                  </b>
                  ！
                </div>
              </>
            )}
          </div>
          <div className="submit">
            {(action == "new" || (this.isQrcodePayment && action === "edit")) && <Button onClick={this.addBankCard.bind(this)}>确认</Button>}
            {action == "edit" && userSet.AllowEditBank && <Button disabled={true}>请联系客服修改</Button>}
          </div>
        </div>
      </LayoutPage>
    )
  }
}
