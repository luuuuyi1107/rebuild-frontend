import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { withLogin } from "@/magic/withLogin"
import { orderBy } from "lodash"
import classNames from "classnames"
import { cancelDeposit, getBank, getDepositList } from "@/action/apis"
import { apiHandler, post } from "@/action"
import { notificationAsync } from "@/magic/notification"

@withLogin
@withRouter
export default class extends React.PureComponent {
  constructor() {
    super()

    this.state = {
      money: "",
      lastClick: "",
      account: null,
      loading: true,
      apiLoading: false,
      key: "",
      paymentList: orderBy(
        [
          {
            id: 11,
            title: "GoPay-APP扫码",
            name: "GoPay",
            info: "APP充值更便捷",
            key: "GoPay",
            apiUri: "Pay/GoPay",
            intro: [
              { title: "充值和提款教学", id: 345 }, //
              { title: "卖币教学", id: 346 }, //
              { title: "下载地址", id: 454 }, // 64
            ],
            order: 6,
          },
          {
            id: 12,
            title: "CGPay-APP扫码",
            name: "CGPay",
            info: "一分钟飙速充值",
            key: "CGPayCGP",
            apiUri: "Pay/CGPayCGP",
            intro: [
              { title: "充值和提款教学", id: 428 }, // 35
              { title: "卖币教学", id: 429 }, //
              { title: "下载地址", id: 455 }, // 65
            ],
            order: 1,
          },
          {
            id: 13,
            title: "OKPay-在线支付",
            name: "OKPay",
            info: "100%成功率",
            key: "OKPay",
            apiUri: "Pay/OKPay",
            intro: [
              { title: "充值和提款教学", id: 430 }, // 37
              { title: "卖币教学", id: 431 }, //
              { title: "下载地址", id: 456 }, // 66
            ],
            order: 4,
          },
          {
            id: 14,
            title: "TOPay-在线支付",
            name: "TOPay",
            info: "限额：1-50000元",
            key: "TOPay",
            apiUri: "Pay/TOPay",
            intro: [
              { title: "充值和提款教学", id: 432 }, // 39
              { title: "卖币教学", id: 433 }, //
              { title: "下载地址", id: 457 }, // 67
            ],
            order: 5,
          },
          {
            id: 15,
            title: "购宝-在线支付",
            name: "购宝",
            info: "USDT可充值",
            key: "GBPay",
            apiUri: "Pay/GBPay",
            intro: [
              { title: "充值和提款教学", id: 434 }, // 41
              { title: "卖币教学", id: 435 }, //
              { title: "下载地址", id: 458 }, // 68
            ],
            order: 2,
          },
          {
            id: 20,
            title: "K豆-在线支付",
            name: "K豆",
            info: "可兑换USDT",
            key: "KBYPay",
            apiUri: "Pay/KBYPay",
            intro: [
              { title: "充值和提款教学", id: 516 },
              { title: "卖币教学", id: 517 },
              { title: "下载地址", id: 518 },
            ],
            order: 3,
          },
        ],
        "order"
      ),
    }
  }

  get currentPayment() {
    return this.state.paymentList.find((x) => x.key == this.state.key)
  }

  componentDidMount() {
    // this.listenClipboard();
    this.loadData()
    this.setState({ loading: false })
  }

  async loadData() {
    let bankCardRes = await getBank()
    if (bankCardRes.Code == 1) {
      this.setState({ account: bankCardRes.Data[0].Account, loading: false })
    }
  }

  async deposite() {
    // let bankId = util.getUrlParam("bankId");
    await this.checkOldOrder()

    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate)
      return
    }

    this.setState({ apiLoading: true })

    const res = await post(
      this.currentPayment.apiUri,
      Object.assign(
        {
          amount: this.state.money,
          returnurl: location.href + "?back=true",
        },
        this.currentPayment.key == "GBPay" ? { uid: util.cache.get("user")?.ID } : {}
      )
    )

    this.setState({ apiLoading: false })
    if (res.Code == 1) {
      switch (this.currentPayment.key) {
        case "GoPay":
        case "OKPay":
        case "TOPay":
          util.open(res.Data.navurl, "_self")
          break
        case "CGPayCGP":
          util.open(res.Data.Qrcode, "_self")
          break
        case "KBYPay":
          util.open(res.Data.url, "_self")
          break
        case "GBPay":
          this.goQRCodePage({ ...res.Data, money: this.state.money })
          break
      }
    } else {
      notificationAsync.alert(res.Message, { title: "操作提示" })
    }
  }

  check() {
    if (!this.state.money) {
      return "汇款金额不能为空!"
    }

    return ""
  }

  goQRCodePage(info) {
    sessionStorage.setItem(
      "depositQRcode",
      JSON.stringify({
        amount: info.money,
        appLink: info.Link,
        // expTime: info.ExpTime,
        // qrcodeImgUrl: info.QRCode,
      })
    )

    this.props.router.push("/site/depositQRCodePage")
  }

  async checkOldOrder() {
    const res = await apiHandler(() => getDepositList({ type: this.currentPayment.id }))
    const pendingOrders = res.Data.filter((x) => x.Status == 2)
    if (pendingOrders.length) {
      const [order] = pendingOrders
      try {
        await notificationAsync.confirm(`您存在待支付订单［${order.Money}元］，请完成支付或取消重新下单`, {
          buttonLabels: ["取消订单", "前往支付"],
        })
        switch (this.currentPayment.key) {
          case "GBPay":
            this.goQRCodePage({
              money: order.Money,
              Link: order.Account,
            })
            break
          default:
            util.open(order.Account, "_self")
            break
        }
      } catch (e) {
        await Promise.all(pendingOrders.map((x) => cancelDeposit({ id: x.ID })))
      }
      throw new Error()
    }
  }

  render() {
    return (
      <LayoutPage
        onBack={() => {
          let back = util.getUrlParam("back")
          if (back == "true") {
            this.props.router.push("/site/my")
          } else {
            this.props.router.back()
          }
        }}
        right={
          <span
            style={{ fontSize: ".28rem", paddingRight: ".2rem", color: "#fff" }}
            onClick={() => {
              this.props.router.isLoginToOrRedirect(`/site/depositWithdrawRecord`, { tab: "快充" })
            }}
          >
            充值记录
          </span>
        }
        className="site-deposit-gopay"
        center="虚拟钱包充值"
        loading={this.state.loading}
      >
        <div className="content">
          <div className="py-1 px-1.5 font-semibold">支付方式</div>
          <div className="payBox">
            {this.state.paymentList.map((item) => {
              return (
                <div
                  key={item.key}
                  className={classNames("payItem", { active: this.currentPayment == item })}
                  onClick={() => {
                    this.setState(
                      {
                        key: item.key,
                      },
                      () => {
                        this.checkOldOrder(item)
                      }
                    )
                  }}
                >
                  <p>{item.title}</p>
                  <p>{item.info}</p>
                </div>
              )
            })}
            {this.state.paymentList.length % 2 == 1 && <span class="last"></span>}
          </div>
          <div className="h-[3px]"></div>
          <div className="bg-white pb-1 px-1.5">
            <div className="border-0 border-b border-solid border-b-gray-200 flex leading-3 mb-1 pt-0.5">
              <div className="">充值金额</div>
              <div className="flex-1 px-1">
                <input
                  placeholder="可自行填写充值金额"
                  className="money-input border-0 w-full text-1.25"
                  type="text"
                  value={this.state.money}
                  onChange={(e) => {
                    const result = e.target.value.replace(/\D/, "")
                    this.setState({
                      money: result && !isNaN(parseFloat(result)) ? parseFloat(result) : "",
                    })
                  }}
                />
              </div>
              <div className="">元</div>
            </div>
            <div className="flex flex-wrap justify-between mb-1">
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 10,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 10,
                    money: 10,
                  })
                }}
              >
                10元
              </div>
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 100,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 100,
                    money: 100,
                  })
                }}
              >
                100元
              </div>
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 500,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 500,
                    money: 500,
                  })
                }}
              >
                500元
              </div>
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 1000,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 1000,
                    money: 1000,
                  })
                }}
              >
                1000元
              </div>
            </div>
            <div className="flex flex-wrap justify-between mb-1">
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 2000,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 2000,
                    money: 2000,
                  })
                }}
              >
                2000元
              </div>
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 3000,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 3000,
                    money: 3000,
                  })
                }}
              >
                3000元
              </div>
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 5000,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 5000,
                    money: 5000,
                  })
                }}
              >
                5000元
              </div>
              <div
                className={classNames("money-btn", {
                  active: this.state.lastClick == 10000,
                })}
                onClick={() => {
                  this.setState({
                    lastClick: 10000,
                    money: 10000,
                  })
                }}
              >
                10000元
              </div>
            </div>

            {this.currentPayment && (
              <div className="border-0 border-t border-solid border-t-gray-200">
                <div className="flex mt-1">
                  <div className="mr-0.5">{this.currentPayment.name}教程</div>
                  <div className="flex">
                    {this.currentPayment.intro.map((item) => (
                      <div
                        key={item.id}
                        className="teachItem mr-0.5"
                        onClick={() => {
                          this.props.router.push(`/site/promotionContent?id=${item.id}`)
                        }}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="submit-section py-1 px-1.5">
            <div className="text-1 text-[#E14138]">
              <div>1.请先填写您需要的充值金额。</div>
              <div className="mt-0.25">2.提交后自动跳转到支付页面完成支付。</div>
            </div>
            <div className="submit text-1.25 mt-1">
              <a className="bg-theme w-full rounded-sm py-1 text-white block text-center" onClick={this.deposite.bind(this)}>
                立即存款
              </a>
            </div>
          </div>
        </div>
      </LayoutPage>
    )
  }
}
