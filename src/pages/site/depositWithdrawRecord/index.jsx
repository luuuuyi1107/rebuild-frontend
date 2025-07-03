import React, { createRef } from "react"
import RecordPage from "@/components/RecordPage"
import util from "@/magic/util"
import { MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"

import "./style.scss"
import * as action from "@/action"
import { withRouter } from "@/magic/withRouter"
import { Icon } from "react-onsenui"
import classNames from "classnames"
import Money from "@/components/Money"
import { cancelDeposit } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import Bus from "@/magic/EventBus"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        apiLoading: false,
      }
      this.recordPageRef = createRef()
    }

    depositStatusParse(status) {
      // 订单状态（0处理中，1成功，2正在支付，3失败，4审核中）
      switch (status) {
        case 0:
          return ["text-gray-400", "处理中"]
        case 1:
          return ["text-green-400", "成功"]
        case 2:
          return ["text-green-400", "支付中"]
        case 3:
          return ["text-gray-400", "失败"]
        case 4:
          return ["text-gray-400", "审核中"]
        default:
          return ["text-gray-400", ""]
      }
    }

    withdrawStatusParse(status) {
      switch (status) {
        case 0:
          return ["text-gray-400", "处理中"]
        case 1:
          return ["text-gray-400", "已汇出"]
        case 2:
          return ["text-green-400", "已确认"]
        case 3:
          return ["text-gray-400", "已撤销"]
        default:
          return ["text-gray-400", ""]
      }
    }

    //总配置
    totalCofig = {
      defaultTabName: util.getUrlParam("tab") || "线下充值",
      tabs: [
        {
          name: "线下充值",
          filter: [{ key: "index", type: "hidden", defaultValue: 0 }],
          listApi: "Pay/GetFunPayList",
          listApiMethod: "get",
          renderRow: (row, data) => {
            const [statusColor, statusTxt] = this.depositStatusParse(row.Status)
            return (
              <div className="text-1.25 p-1" key={"offline" + row.ID}>
                <DisplayItem className="mb-0.5" iconElement={<span className="icon-wallet text-gray-300 text-1.25"></span>} title="提现金额">
                  <Money value={row.Money} />
                </DisplayItem>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-document-text" className="align-middle  text-gray-300" />}
                  title="交易状态"
                >
                  <span className={classNames(statusColor, "text-1.25")}>{statusTxt}</span>
                </DisplayItem>

                <DisplayItem
                  iconElement={<Icon icon="ion-ios-timer" className="align-middle text-gray-300" />}
                  title="提交时间"
                  content={util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}
                ></DisplayItem>
              </div>
            )
          },
        },
        {
          name: "快充",
          filter: [{ key: "index", type: "hidden", defaultValue: 2 }],
          listApi: "Pay/GetPayApiList",
          listApiMethod: "get",
          renderRow: (row, data) => {
            const [statusColor, statusTxt] = this.depositStatusParse(row.Status)
            const isPending = row.Status === 2
            return (
              <div className="text-1.25 p-1" key={"fast" + row.ID}>
                <DisplayItem className="mb-0.5" iconElement={<span className="icon-wallet text-gray-300 text-1.25"></span>} title="充值金额">
                  <Money value={row.Money} />
                </DisplayItem>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-document-text" className="align-middle  text-gray-300" />}
                  title="交易状态"
                >
                  <span className={classNames(statusColor, "text-1.25")}>{statusTxt}</span>
                </DisplayItem>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-card" className="align-middle text-gray-300" />}
                  title="支付方式"
                  content={row.Bank}
                ></DisplayItem>
                <DisplayItem
                  iconElement={<Icon icon="ion-ios-timer" className="align-middle text-gray-300" />}
                  title="提交时间"
                  content={util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}
                ></DisplayItem>
                {isPending ? (
                  <div
                    className="mt-0.5 rounded-sm bg-[#B3BABE] text-white py-0.75 text-center"
                    onClick={async () => {
                      await notificationAsync.confirm("确定取消该笔订单？")
                      await cancelDeposit({ id: row.ID })
                      Bus.emit("tab.reload.快充")
                    }}
                  >
                    取消订单
                  </div>
                ) : null}
              </div>
            )
          },
        },
        {
          name: "一般提现",
          filter: [
            { key: "index", type: "hidden", defaultValue: 3 },
            { key: "type", type: "hidden", defaultValue: 0 },
          ],
          listApi: "User/GetDrawMoneyList",
          listApiMethod: "get",
          renderRow: (row) => {
            const typeTransfer = {
              0: "一般提现",
              1: "提款转充值",
            }
            const [statusColor, statusTxt] = this.withdrawStatusParse(row.Status)

            return (
              <div className="text-1.25 p-1" key={"fast" + row.ID} onClick={this.recordItemClickEvent.bind(this, { ...row, type: row.Status })}>
                <div className="mb-0.5 flex">
                  <div className="w-3/5">
                    <DisplayItem iconElement={<span className="icon-wallet text-gray-300 text-1.25"></span>} title="提现金额">
                      <Money value={row.Money} />
                    </DisplayItem>
                  </div>
                  <div className="w-2/5">
                    <DisplayItem
                      iconElement={<span className="icon-yen-circle text-gray-300 text-1.25"></span>}
                      title="扣除手续"
                      content={row.Tax}
                    ></DisplayItem>
                  </div>
                </div>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-document-text" className="align-middle  text-gray-300" />}
                  title="交易状态"
                >
                  <span className={classNames(statusColor, "text-1.25")}>{statusTxt}</span>
                </DisplayItem>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-card" className="align-middle text-gray-300" />}
                  title="提款渠道"
                  content={row.Banks.map((bank) => bank.Bank).join(",")}
                ></DisplayItem>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-briefcase" className="align-middle text-gray-300" />}
                  title="提现类型"
                  content={typeTransfer[row.Type]}
                ></DisplayItem>
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-ios-timer" className="align-middle text-gray-300" />}
                  title="提交时间"
                  content={util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}
                ></DisplayItem>

                {row.Status == 0 && (
                  <div
                    className="w-full bg-theme rounded-sm text-center py-1 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      this.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
                    }}
                  >
                    撤销
                  </div>
                )}
                {row.Status == 1 && (
                  <div
                    className="w-full bg-theme rounded-sm text-center py-1 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      this.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
                    }}
                  >
                    确认到帐
                  </div>
                )}
              </div>
            )
          },
        },
        {
          name: "挂单提现",
          filter: [
            { key: "index", type: "hidden", defaultValue: 3 },
            { key: "type", type: "hidden", defaultValue: 2 },
          ],
          listApi: "User/GetDrawMoneyList",
          listApiMethod: "get",
          renderRow: (row) => {
            const [statusColor, statusTxt] = this.withdrawStatusParse(row.Status)
            return (
              <div className="text-1.25 p-1" key={"fast" + row.ID} onClick={this.recordItemClickEvent.bind(this, row)}>
                <DisplayItem className="mb-0.5" iconElement={<span className="icon-wallet text-gray-300 text-1.25"></span>} title="提现金额">
                  <div className="inline-flex items-center">
                    <Money value={row.Money} />
                    {row.OrderSplit == 0 && row.Money2 > 0 && row.Money > row.Money2 && (
                      <span className="ml-1">
                        (实际收款&nbsp;
                        <Money baseSize="text-[15px]" floatSize="text-[12px]" value={row.Money2} />)
                      </span>
                    )}
                  </div>
                </DisplayItem>
                <DisplayItem className="mb-0.5" iconElement={<span className="icon-yen-circle text-gray-300 text-1.25"></span>} title="失败金额">
                  <Money baseSize="text-1.25 font-light" textColor="text-gray-400" value={row.FailMoney} />
                </DisplayItem>
                {/* <ion-icon name="car-outline"></ion-icon> */}
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-document-text" className="align-middle  text-gray-300" />}
                  title="提款状态"
                >
                  <span className={classNames(statusColor, "text-1.25")}>{statusTxt}</span>
                </DisplayItem>
                {/* <img src={util.buildAssetsPath("images/LotteryFooter/trash.png")} /> */}
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<img className=" translate-y-[3px]" src={util.buildAssetsPath("assets/icons/ic_account.svg")} />}
                  title="收款方式"
                  content={
                    <div className="inline-flex items-center">
                      {row.Banks.map((bank) => (
                        <img
                          key={bank.ID}
                          className="mr-0.5 last:mr-0"
                          style={{ width: 20 }}
                          src={util.buildAssetsPath(ORDER_PAYMENT.findPaymenByType(bank.CType + "")?.ICON)}
                        />
                      ))}
                    </div>
                  }
                ></DisplayItem>

                {/* {row.hasOwnProperty("OrderSplit") && (
                  <DisplayItem
                    className="mb-0.5"
                    iconElement={<img className="translate-y-[3px]" src={util.buildAssetsPath("assets/icons/ic_splitmoney.svg")} />}
                    title="提款方式"
                    content={(row.OrderSplit == 1 ? "" : "不") + "拆分"}
                  ></DisplayItem>
                )} */}

                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-ios-timer" className="align-middle text-gray-300" />}
                  title="提交时间"
                  content={util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}
                ></DisplayItem>
                {row.Status == 0 && (
                  <div
                    className="w-full bg-theme rounded-sm text-center py-1 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      this.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
                    }}
                  >
                    撤销
                  </div>
                )}
                {row.Status == 1 && (
                  <div
                    className="w-full bg-theme rounded-sm text-center py-1 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      this.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
                    }}
                  >
                    {row.Type == 2 ? "查看详情" : "确认到帐"}
                  </div>
                )}
              </div>
            )
          },
        },
        {
          name: "帮我收款",
          filter: [
            { key: "index", type: "hidden", defaultValue: 3 },
            { key: "type", type: "hidden", defaultValue: 3 },
          ],
          listApi: "User/GetDrawMoneyList",
          listApiMethod: "get",
          renderRow: (row) => {
            const [statusColor, statusTxt] = this.withdrawStatusParse(row.Status)

            return (
              <div className="text-1.25 p-1" key={"fast" + row.ID} onClick={this.recordItemClickEvent.bind(this, { ...row, Type: row.Status })}>
                <DisplayItem className="mb-0.5" iconElement={<span className="icon-wallet text-gray-300 text-1.25"></span>} title="提现金额">
                  <Money value={row.Money} />
                </DisplayItem>

                <DisplayItem className="mb-0.5" iconElement={<span className="icon-yen-circle text-gray-300 text-1.25"></span>} title="失败金额">
                  <Money baseSize="text-1.25 font-light" textColor="text-gray-400" value={row.FailMoney} />
                </DisplayItem>
                {/* <ion-icon name="car-outline"></ion-icon> */}
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-document-text" className="align-middle  text-gray-300" />}
                  title="提款状态"
                >
                  <span className={classNames(statusColor, "text-1.25")}>{statusTxt}</span>
                </DisplayItem>
                {/* <img src={util.buildAssetsPath("images/LotteryFooter/trash.png")} /> */}
                <DisplayItem
                  className="mb-0.5"
                  iconElement={<img className=" translate-y-[3px]" src={util.buildAssetsPath("assets/icons/ic_account.svg")} />}
                  title="收款方式"
                  content={
                    <div className="inline-flex items-center">
                      {row.Banks.map((bank) => (
                        <img
                          key={bank.ID}
                          className={classNames("mr-0.5 last:mr-0", {
                            "translate-y-[5px]": bank.Bank === ORDER_PAYMENT.ALIPAY.NAME || bank.Name == MOBILE_PAYMENT.NAME,
                            "w-[14px]": bank.Name == MOBILE_PAYMENT.NAME,
                            "w-[20px]": bank.Name !== MOBILE_PAYMENT.NAME,
                          })}
                          src={util.buildAssetsPath(
                            bank.Bank === ORDER_PAYMENT.ALIPAY.NAME
                              ? ORDER_PAYMENT.ALIPAY.ICON
                              : bank.Name == MOBILE_PAYMENT.NAME
                              ? MOBILE_PAYMENT.ICON
                              : ORDER_PAYMENT.BANK.ICON
                          )}
                        />
                      ))}
                    </div>
                  }
                ></DisplayItem>

                {row.hasOwnProperty("OrderSplit") && (
                  <DisplayItem
                    className="mb-0.5"
                    iconElement={<img className="translate-y-[3px]" src={util.buildAssetsPath("assets/icons/ic_splitmoney.svg")} />}
                    title="提款方式"
                    content={(row.OrderSplit == 1 ? "" : "不") + "拆分"}
                  ></DisplayItem>
                )}

                <DisplayItem
                  className="mb-0.5"
                  iconElement={<Icon icon="ion-ios-timer" className="align-middle text-gray-300" />}
                  title="提交时间"
                  content={util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}
                ></DisplayItem>
                {![2, 3].some((status) => row.Status === status) && (
                  <div
                    className="w-full bg-theme rounded-sm text-center py-1 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      this.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
                    }}
                  >
                    {row.Status === 0 ? "撤销" : "查看详情"}
                  </div>
                )}
              </div>
            )
          },
        },
      ],
    }

    recordItemClickEvent(row) {
      if (row.Type !== 2 || !row.OrderID) return
      this.props.router.push("/orderPost/self", { pid: row.OrderID })
    }

    async withdrawSubmit(event, Status, id, pid) {
      if (Status == 0 || Status == 2) this.setState({ apiLoading: true })
      event.classList.add("none")
      if (Status == 0) {
        let res = await action.post("User/RevokeokDrawMoney", { id, reply: 0 })
        this.setState({ apiLoading: false })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message || "您好, 当前结算高峰期，为避免出错, 暂时不允许撤销提款!", { title: "操作提示" })
          return
        }
        document.getElementById("withdrawStatus" + id).innerHTML = "提款状态：已撤销"
        notificationAsync.alert(res.Message, { title: "成功" })
      } else if (Status == 1) {
        if (!!pid) {
          this.props.router.push(`/orderPost/self?pid=${pid}`)
          return
        }

        let res = await action.post("User/ConfirmDrawMoney", { id, reply: 1 })
        this.setState({ apiLoading: false })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message, { title: "操作提示" })
          return
        }
        // document.getElementById("withdrawStatus"+id).innerHTML = '提款状态：已确认';
        this.recordPageRef.current?.reload()
        notificationAsync.alert(res.Message, { title: "成功" })
      } else if (Status == 2) {
        let res = await action.post("User/ConfirmDrawMoney", { id: id, reply: 1 })
        this.setState({ apiLoading: false })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message, { title: "操作提示" })
          return
        }
        document.getElementById("withdrawStatus" + id).innerHTML = "提款状态：已确认"
        notificationAsync.alert(res.Message, { title: "成功" })
      }
    }

    componentDidMount() {}

    render() {
      return (
        <div className="depositWithdrawRecord">
          <RecordPage
            ref={this.recordPageRef}
            apiLoading={this.state.apiLoading}
            config={this.totalCofig}
            className="site-deposit-withdraw-record"
            center="充值/提现记录"
          />
        </div>
      )
    }
  }
)

const DisplayItem = ({ className, iconElement, title, content, children }) => {
  return (
    <div className={className}>
      <div className="w-1.5 text-center text-1.75 mr-0.5 inline-block">{iconElement}</div>
      <span className="mr-1 font-bold">{title}</span>
      {children || <span className={classNames("text-gray-400", "text-1.25")}>{content}</span>}
    </div>
  )
}
