import React, { createContext } from "react"
import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import Dropdown from "@/components/Dropdown"

import "./style.scss"
import { Button } from "react-onsenui"
import { checkIsBindedDevice } from "@/magic/security"
import { getBank, getBankList, getPush, userDrawMoney, getUserBindData, getMySet } from "@/action/apis"
import NormalWay from "./normal"
import OrderWay from "./order"
import ElseWay from "./else"
import Bindgather from "./bindgather"
import classNames from "classnames"
import _ from "lodash"
import { useRouter } from "@/magic/withRouter"
import { Link } from "react-router-dom"
import { withLoginExceptTrial } from "@/magic/withLogin"
import { VIRTUAL_PAYMENT, ORDER_PAYMENT, MOBILE_PAYMENT } from "@/config/payment"
import { computed, onMounted, reactive, onUnmounted } from "@/magic/hook/vue"
import { apiHandler } from "@/action"
import { notificationAsync } from "@/magic/notification"
import util from "@/magic/util"
import remarkOptions from "@/config/remarks"
import Env from "@/magic/env"

export const WithdrawContext = createContext()

export default withLoginExceptTrial(() => {
  const { route, router } = useRouter()
  const initData = reactive({
    user: "",
    money: "",
    discountedMoney: "",
    pass: "",
    remarks: "",
    loading: true,
    method: route.query.method || "normal", // "order"
    elseMethod: ORDER_PAYMENT.BANK.C_TYPE,
    bankCard: [],
    bankID: "",
    drawmoneyset: false,
    withdrawList: [],
    AnswerRecMoney: null,
    EnableDevice: null,
    orderSplit: 0,
    security: {
      device: "",
      devices: "",
      question: false,
      get isBinding() {
        return !this.devices || !this.device ? false : this.devices.indexOf(this.device) >= 0
      },
    },
    userBindData: null,
    userset: null,
  })

  const isAbleToWithdraw = computed(() => {
    if (!initData.userBindData) return false
    return initData.userBindData?.EndMoney === 0 || initData.userBindData?.BetMoney >= initData.userBindData?.EndMoney
  })

  const disabledRemarks = computed(() => {
    if (initData.method === "else") {
      return initData.elseMethod === ORDER_PAYMENT.ALIPAY.C_TYPE
    }
    if (!initData.bankID) return true
    const bankList = initData.bankID.toString().split(",")
    const hasBank = bankList.some((bankId) => initData.bankCard.some((item) => item.ID == bankId && item.CType === ORDER_PAYMENT.BANK.C_TYPE))
    // const hasAliPay = bankList.some((bankId) => initData.bankCard.some((item) => item.ID == bankId && item.CType === ORDER_PAYMENT.ALIPAY.C_TYPE))
    return !hasBank
  })

  const remarkDataSorce = computed(() => {
    const showRemarks =
      !disabledRemarks &&
      !!initData.bankID &&
      initData.bankID
        .toString()
        .split(",")
        .some((bankId) => initData.bankCard.some((item) => item.ID == bankId && item.CType === ORDER_PAYMENT.BANK.C_TYPE))
    return showRemarks ? { remarks: initData.remarks || remarkOptions[0] } : {}
  })

  const tabComputed = computed(() => (initData.method == "normal" ? "一般提现" : initData.method === "else" ? "帮我收款" : "挂单提现"))
  onMounted(async () => {
    const [bankCardRes, withdrawList, pushRes, userBindRes, mySet] = await Promise.all([
      apiHandler(() => getBank()),
      apiHandler(() => getBankList()),
      apiHandler(() => getPush({ keys: ["drawmoneyset", "userset"] })),
      apiHandler(() => getUserBindData()),
      apiHandler(() => getMySet()),
    ])

    if (bankCardRes.Data.length == 0) {
      return notificationAsync
        .confirm("请先设置银行卡")
        .then(() => {
          router.isLoginToOrRedirect("/site/setBankCard")
        })
        .catch(() => {
          router.back()
        })
    }

    withdrawList.Data.forEach((item) => {
      item.Name = item.Name === ORDER_PAYMENT.BANK.NAME ? ORDER_PAYMENT.BANK.NAME2 : item.Name
    })

    Object.assign(initData, {
      bankCard: bankCardRes.Data,
      user: pushRes.Data.UserData,
      drawmoneyset: pushRes.Data.DrawMoneySet,
      withdrawList: withdrawList.Data,
      EnableDevice: pushRes.Data.UserSet.EnableDevice,
      AnswerRecMoney: pushRes.Data.UserSet.AnswerRecMoney,
      userBindData: userBindRes.Data,
      mailVerify: mySet.Data.MailVerify,
      loading: false,
      userset: pushRes.Data.UserSet,
    })

    checkIsBindedDevice().then(async (data) => {
      if (!data.hasQuestion) {
        notificationAsync
          .confirm("为了保护您的账户资金安全，请设置安全问题！", {
            buttonLabels: ["回首页", "前往绑定"],
          })
          .then(() => router.push("/site/securityQuestion"))
          .catch(() => router.replace("/site/home"))
      }
    })
    // confirmAsync("请注意：提款金额需大于等于100元，且小于等于5000000元")
    // notificationAsync.confirm(<div>请注意：提款金额需大于等于100元，且小于等于5000000元</div>) // element not work
    // notificationAsync.confirm("", { class: "theme-notification", messageHTML: "<div>请注意：提款金额需大于等于100元，且小于等于5000000元</div>" }) // html message
    // await notificationAsync.confirm("请注意：提款金额需大于等于100元，且小于等于5000000元")
    // console.log("pass")
  })

  const buildPaymentDataByCType = (paymentConfig) => {
    const payment = initData.withdrawList.find((x) => x.CType === paymentConfig.C_TYPE)
    if (!payment) return { bankcards: [] }
    const bankcards = initData.bankCard.filter((x) => x.ClassID == payment.ID)
    return Object.assign(
      {
        bankcards: (bankcards.length >= paymentConfig.MAXIMUM_CARD_LIMIT ? bankcards : bankcards.concat(null)).map((x) => {
          return x ? Object.assign({ payment }, x) : { payment }
        }),
        get hasCard() {
          return !!this.bankcards.filter((x) => x.ID).length
        },
        get workcards() {
          return this.bankcards.filter((x) => x.Status === 0)
        },
        Config: ORDER_PAYMENT.findPaymenByCType(payment.CType),
      },
      payment
    )
  }
  const cryptoPlatform = computed(() => ({
    Name: VIRTUAL_PAYMENT.NAME,
    Enable: true,
    bankcards: _.orderBy(
      initData.withdrawList
        .filter((x) => x.CType === VIRTUAL_PAYMENT.C_TYPE)
        .map((payment) => {
          const res = initData.bankCard.find((x) => x.ClassID == payment.ID)
          return res
            ? Object.assign({ payment }, res)
            : {
                payment,
              }
        }),
      "ID"
    ),
    get hasCard() {
      return !!this.bankcards.filter((x) => x.ID).length
    },
    get workcards() {
      return this.bankcards.filter((x) => x.Status === 0)
    },
    Config: VIRTUAL_PAYMENT,
  }))
  const mobileChargePlatform = computed(() => ({
    ...(initData.withdrawList.find((x) => x.CType === MOBILE_PAYMENT.C_TYPE) ?? {}),
    discountText: "赠4.0%",
    Config: MOBILE_PAYMENT,
  }))
  const normalWayPlatforms = computed(() =>
    [
      buildPaymentDataByCType(ORDER_PAYMENT.BANK),
      buildPaymentDataByCType(ORDER_PAYMENT.WECHAT),
      buildPaymentDataByCType(ORDER_PAYMENT.ALIPAY),
      cryptoPlatform,
      buildPaymentDataByCType(ORDER_PAYMENT.CNY),
      buildPaymentDataByCType(ORDER_PAYMENT.QQ),
      buildPaymentDataByCType(ORDER_PAYMENT.UNION_PAY),
    ].filter((x) => x.Name)
  )
  const orderWayPlatforms = computed(() =>
    [
      buildPaymentDataByCType(ORDER_PAYMENT.BANK),
      buildPaymentDataByCType(ORDER_PAYMENT.WECHAT),
      buildPaymentDataByCType(ORDER_PAYMENT.ALIPAY),
      buildPaymentDataByCType(ORDER_PAYMENT.CNY),
      buildPaymentDataByCType(ORDER_PAYMENT.QQ),
      buildPaymentDataByCType(ORDER_PAYMENT.UNION_PAY),
    ].filter((x) => x.Name)
  )
  const elsePlatforms = computed(() =>
    [buildPaymentDataByCType(ORDER_PAYMENT.BANK), buildPaymentDataByCType(ORDER_PAYMENT.ALIPAY), mobileChargePlatform].filter((x) => x.Name)
  )

  const withdraw = async (type, elseData) => {
    const hasDiscount = parseFloat(initData.discountedMoney) != initData.money && type === 2
    const Money2 = _.round(parseFloat(initData.discountedMoney) * 100 * 0.01, 2)
    const data = {
      type,
      money: initData.money,
      pass: initData.pass,
      ...(hasDiscount ? { Money2 } : {}),
      ...(initData.method !== "else" ? { bankID: initData.bankID } : elseData), // 帮我收款不需要传bankID
      ...(initData.method === "order" ? { orderSplit: initData.orderSplit } : {}),
      ...remarkDataSorce,
    }

    await validate(data)

    if (hasDiscount) {
      await notificationAsync.confirm(
        <div>
          <div className="text-center mb-[14px] font-medium flex items-center justify-center">
            <img className="w-[18px] mr-0.25" src={util.buildAssetsPath("assets/icons/ic_warning.svg")} />
            降价提醒
          </div>
          <div>
            您申请提现 <span className="text-[#E14138]">{initData.money}</span>
            元，实际到帐为 <span className="text-[#E14138]">{Money2}</span> 元
          </div>
        </div>
      )
    }

    const res = await apiHandler(() => userDrawMoney(data), {
      errorHandler: async ({ Message }) => {
        await notificationAsync.alert(Message)
        if (Message?.indexOf("有未确认记录") > -1) {
          toWithdrawRecord()
        }
      },
    })

    await notificationAsync.alert(res.Message)
    toWithdrawRecord()
  }

  const toWithdrawRecord = () => {
    router.isLoginToOrRedirect("/site/depositWithdrawRecord", { tab: tabComputed })
  }

  const validate = (data) => {
    if (!data.money) {
      return notificationAsync.alertAndReject("提现金额不能为空")
    }
    if (!data.pass) {
      return notificationAsync.alertAndReject("安全密码不能为空")
    }
    if (initData.EnableDevice && initData.security.question && !initData.security.isBinding) {
      // 后台开启且有设置问题且没有绑定该装置
      return notificationAsync.alertAndReject("非常用设备禁止登录")
    }

    if (initData.orderSplit === 1 && data.money !== data.Money2) {
      return notificationAsync.alertAndReject("降价时不支持拆分挂单，请修改为不拆分后再试")
    }
  }

  const goAddBankcard = (params) => {
    router.isLoginToOrRedirect(`/site/setBankCard`, params)
  }

  const checkPlatform = (item) => {
    return new Promise(async (resolve, reject) => {
      if (!item.Enable) {
        await notificationAsync.alert(item.CloseShow)
        reject()
      }
      if (item.Config.C_TYPE !== VIRTUAL_PAYMENT.C_TYPE && !item.hasCard) {
        await notificationAsync.alert("请先绑定" + item.Name + "账户")
        goAddBankcard({
          classid: item.ID,
          type: "addOtherPayment",
          Bank: item.Name,
          Name: initData.bankCard[0].Name,
          userId: initData.user.ID,
        })
        reject()
      }
      resolve()
    })
  }

  const realTimeCheckPassword = (e) => {
    if (initData.pass.length >= 4 && e.keyCode != 8) {
      e.preventDefault?.()
      e.stopPropagation?.()
    }
  }

  const onClickDisabledCard = (Status, CardName) => {
    notificationAsync.toast(Status === 1 ? "卡号已冻结，启用需联系在线客服！" : `您的[${CardName}]提款方式审核中。`, {
      timeout: 1200,
      class: "withdraw-toast",
    })
  }

  const RemarkOptions = (
    <div className="item platform">
      <div className="title">转帐备注</div>
      <div className="grid-items">
        <Dropdown
          value={initData.remarks}
          onChange={(value) => {
            initData.remarks = value
          }}
          options={remarkOptions.map((value) => ({
            value,
            label: value,
            className: `platform-item ${value === initData.remarks ? "active" : ""}`,
            disabled: false,
          }))}
          placeholder="请选择 (可不填)"
          disabled={disabledRemarks}
        />
      </div>
    </div>
  )

  return (
    <WithdrawContext.Provider value={{ userset: initData.userset }}>
      <LayoutPage
        loading={initData.loading}
        className="site-withdraw"
        onBack={() => {
          router.push("/site/home")
        }}
        center="提现"
        right={
          <span
            className="text-1.25 mr-1 text-white"
            onClick={() => {
              router.isLoginToOrRedirect("/site/depositWithdrawRecord", { tab: tabComputed })
            }}
          >
            提款记录
          </span>
        }
      >
        <div className="content h-full">
          <Bindgather {...initData.userBindData} isAbleToWithdraw={isAbleToWithdraw} />
          <div className="withdraw">
            <div className="item accountBalance">
              <div className="title">账户余额</div>
              <div className="inline money">&yen; {util.formatMoney(initData.user.Money)}</div>
            </div>

            <div className="item accountBalance">
              <div className="title">提款方式</div>
              <div
                className={classNames("inline grid-items", { "items-3": initData.drawmoneyset.ElseBank, "items-2": !initData.drawmoneyset.ElseBank })}
              >
                <div
                  onClick={() => {
                    initData.method = "normal"
                    router.replace(route.pathname, { method: "normal" })
                  }}
                  className={classNames({ active: initData.method === "normal" })}
                >
                  一般提款
                </div>
                <div
                  onClick={() => {
                    initData.method = "order"
                    router.replace(route.pathname, { method: "order" })
                  }}
                  className={classNames({ active: initData.method === "order" }, "orderpost")}
                >
                  挂单提款
                  <div className="hint">赠0.5%</div>
                </div>
                {initData.drawmoneyset.ElseBank && (
                  <div
                    onClick={() => {
                      if (!initData.user?.Mail || !initData.mailVerify) {
                        return notificationAsync
                          .confirm(
                            <div>
                              使用此功能需绑定邮箱并验证通过
                              <br />
                              是否进行绑定？
                            </div>,
                            {
                              buttonLabels: ["取消", "前往绑定"],
                            }
                          )
                          .then(() => router.push("/site/bindMail"))
                      }
                      initData.method = "else"
                    }}
                    className={classNames("elsepay", { active: initData.method === "else" })}
                  >
                    帮我收款
                    <div className="hint">赠4.0%</div>
                    <div className="absolute right-0 top-0 italic text-[#FF483B] text-[10px] bg-white rounded-full border-[#FF483B] border border-solid px-[3px] pt-[1px] pb-[2px] font-700 -translate-y-1/2">
                      New
                    </div>
                  </div>
                )}
              </div>
            </div>
            {initData.method === "normal" && normalWayPlatforms.length ? (
              <div>
                <NormalWay
                  remarks={initData.remarks}
                  money={initData.money}
                  drawmoneyset={initData.drawmoneyset}
                  platforms={normalWayPlatforms}
                  user={initData.user}
                  checkPlatform={(platform) => checkPlatform(platform)}
                  switchMethod={() => {
                    initData.method = "order"
                  }}
                  setMoney={(money) => {
                    initData.money = money
                  }}
                  setRemarks={(value) => (initData.remarks = value)}
                  goAddBankcard={(payment) => goAddBankcard(payment)}
                  onCardChange={(bankID) => {
                    initData.bankID = bankID
                  }}
                  onDisabledCard={onClickDisabledCard}
                  isAbleToWithdraw={isAbleToWithdraw}
                />

                {isAbleToWithdraw && (
                  <>
                    {RemarkOptions}
                    <div className="item">
                      <div className="inline">支付密码</div>
                      <div className="inline">
                        <InputBox
                          placeholder="请输入密码"
                          autoComplete="off"
                          type="password2"
                          name="payPass"
                          maxLength="4"
                          onKeyDown={realTimeCheckPassword}
                          onChange={(value) => {
                            initData.pass = value
                          }}
                          value={initData.pass}
                        />
                      </div>
                    </div>
                    <div className="px-1 pt-1">
                      <div className="tip">
                        <p>
                          <Link to="/site/findPassword?type=1">提款密码忘记？点我找回</Link>
                        </p>
                        <p>1.可提现金额：您的充值本金需要消费满100%方可提款； 投注中奖奖金+活动彩金+返点佣金可直接提款</p>
                        <p>2.单笔可提现：最低100元，最高5000000元</p>
                        <p>
                          <Link to="/site/promotionContent?id=264">提款转充值介绍说明</Link>
                        </p>
                      </div>
                    </div>
                    <div className="pb-1">
                      <div className={initData.drawmoneyset.TurnRec ? "submit drawmoneyset" : "submit"}>
                        <Button onClick={() => withdraw(0)}>提现</Button>
                      </div>
                      <div className="submit drawmoneyset">
                        <Button onClick={() => withdraw(1)}>提转充</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : initData.method === "order" && orderWayPlatforms.length ? (
              <div>
                <OrderWay
                  user={initData.user}
                  platforms={orderWayPlatforms}
                  orderSplit={initData.orderSplit}
                  setMoney={(money) => {
                    initData.money = money
                  }}
                  setDiscountedMoney={(money) => {
                    initData.discountedMoney = money
                  }}
                  checkPlatform={(platform) => checkPlatform(platform)}
                  onCardChange={(bankID) => {
                    console.log({ bankID })
                    initData.bankID = bankID
                  }}
                  goAddBankcard={(payment) => goAddBankcard(payment)}
                  onDisabledCard={onClickDisabledCard}
                  isAbleToWithdraw={isAbleToWithdraw}
                />
                {isAbleToWithdraw && (
                  <>
                    {RemarkOptions}
                    <div className="item">
                      <div className="inline">支付密码</div>
                      <div className="inline">
                        <InputBox
                          placeholder="请输入密码"
                          autoComplete="off"
                          type="password2"
                          name="payPass"
                          maxLength="4"
                          onKeyDown={realTimeCheckPassword}
                          onChange={(value) => {
                            initData.pass = value
                          }}
                          value={initData.pass}
                        />
                      </div>
                    </div>
                    {/* <div className="item">
                    <div className="title">提款方式</div>
                    <div className="grid-items items-2">
                      <div
                        className={initData.orderSplit === 0 ? "active" : ""}
                        onClick={() => {
                          initData.orderSplit = 0
                        }}
                      >
                        不拆分
                      </div>
                      <div
                        className={initData.orderSplit === 1 ? "active" : ""}
                        onClick={() => {
                          initData.orderSplit = 1
                        }}
                      >
                        拆分
                      </div>
                    </div>
                  </div> */}
                    <div className="p-1.5">
                      <div className="tip">
                        <div
                          className="questionmark text-theme"
                          onClick={() => router.push("/site/promotionContent", { id: Env.isDev() ? 96 : 507, title: "挂单教程" })}
                        >
                          挂单教程
                        </div>

                        <ol className="py-0 px-1.5 list-outside">
                          <li className="mb-[3px]">最低挂单金额10元起!</li>
                          <li className="mb-[3px]">挂单提款每天不限次数,免手续费!</li>
                          <li className="mb-[3px]">挂单24小时没人吃单,可联系在线客服处理!</li>
                          <li className="mb-[3px]">
                            挂单成功,请注意收款账号余额变动,到账第一时间确认, 超时不确认系统会强制确认,并禁止您使用挂单功能!
                          </li>
                        </ol>

                        <div className="text-red-500"></div>
                      </div>
                    </div>
                    <div className="px-1 pb-1">
                      <Button className="w-full text-center" onClick={() => withdraw(2)}>
                        我以了解，确认出售
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : initData.method === "else" ? (
              <ElseWay
                platforms={elsePlatforms}
                isAbleToWithdraw={isAbleToWithdraw}
                onChangeElseMethod={(value) => {
                  initData.elseMethod = value
                }}
                onWithDraw={(elseData) => withdraw(3, elseData)}
              >
                {RemarkOptions}
              </ElseWay>
            ) : null}
          </div>
          {!isAbleToWithdraw && (
            <div className="p-1">
              <div className="text-white bg-gray-600 h-[60px] flex items-center justify-center text-[16px] font-bold rounded-sm">您暂时无法提现</div>
            </div>
          )}
        </div>
      </LayoutPage>
    </WithdrawContext.Provider>
  )
})
