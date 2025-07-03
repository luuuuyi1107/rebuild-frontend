import React from "react"
import LayoutPage from "@/components/LayoutPage"
import { getBank, getBankList, setUserDefaultBank, delUserBank, lockBank } from "@/action/apis"
import util from "@/magic/util"
import styles from "./style.module.scss"
import classNames from "classnames"
import { notificationAsync } from "@/magic/notification"
import { useRouter } from "@/magic/withRouter"
import { VIRTUAL_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import { apiHandler } from "@/action"
import AccountItem from "./AccountItem"
import QrcodeItem from "./QrcodeItem"
import { computed, onMounted, onUnmounted, reactive } from "@/magic/hook/vue"

export default (props) => {
  const { router } = useRouter()
  const initData = reactive({
    sourceBankCards: [],
    payments: [],
    activies: {
      [ORDER_PAYMENT.BANK.C_TYPE]: false,
      [ORDER_PAYMENT.ALIPAY.C_TYPE]: false,
      [ORDER_PAYMENT.WECHAT.C_TYPE]: false,
      [ORDER_PAYMENT.CNY.C_TYPE]: false,
      [ORDER_PAYMENT.QQ.C_TYPE]: false,
      [VIRTUAL_PAYMENT.C_TYPE]: false,
      [ORDER_PAYMENT.UNION_PAY.C_TYPE]: false,
    },
    user: util.cache.get("user"),
    settingMap: {
      [ORDER_PAYMENT.BANK.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_bank.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_bank.png"),
          icon_lock: util.buildAssetsPath("images/PaymentManage/icon_bank_lock.png"),
        },
        color: {
          primary: "#0059ad",
          bg: "#cdecff",
        },
      },
      [ORDER_PAYMENT.ALIPAY.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_alipay.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_alipay.png"),
        },
        color: {
          primary: "#06B4FD",
          bg: "#c4eafb",
        },
      },
      [ORDER_PAYMENT.WECHAT.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_wechat.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_wechat.png"),
        },
        color: {
          primary: "#00C400",
          bg: "#e6f9ea",
        },
      },
      [ORDER_PAYMENT.CNY.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_cny.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_cny.png"),
          icon_lock: util.buildAssetsPath("images/PaymentManage/icon_cny_lock.png"),
        },
        color: {
          primary: "#DC0017",
          bg: "#fde0e2",
        },
      },
      [ORDER_PAYMENT.QQ.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_qq.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_qq.png"),
        },
        color: {
          primary: "#FFAB15",
          bg: "#feedcb",
        },
      },
      [VIRTUAL_PAYMENT.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_virtual.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_virtual.png"),
          icon_lock: util.buildAssetsPath("images/PaymentManage/icon_virtual_lock.png"),
        },
        color: {
          primary: "#00C1B7",
          bg: "#d3f1f1",
        },
      },
      [ORDER_PAYMENT.UNION_PAY.C_TYPE]: {
        image: {
          title: util.buildAssetsPath("images/PaymentManage/card_unionpay.png"),
          icon: util.buildAssetsPath("images/PaymentManage/icon_unionpay.png"),
          icon_lock: util.buildAssetsPath("images/PaymentManage/icon_unionpay_lock.png"),
        },
        color: {
          primary: "#FF2B2B",
          bg: "#FFF0F0",
        },
      },
    },
  })
  const createDefaultName = computed(() => initData.sourceBankCards[0]?.Name)
  const bankCards = computed(() => {
    return initData.sourceBankCards.map((x) => {
      return {
        ...x,
        get StatusText() {
          return x.Status == -1 ? "待审核" : x.Status == 0 ? "正常" : "冻结"
        },
        get disabled() {
          return x.Status !== 0
        },
      }
    })
  })

  const datas = computed(() => {
    return [
      ORDER_PAYMENT.BANK,
      ORDER_PAYMENT.ALIPAY,
      ORDER_PAYMENT.WECHAT,
      VIRTUAL_PAYMENT,
      ORDER_PAYMENT.CNY,
      ORDER_PAYMENT.QQ,
      ORDER_PAYMENT.UNION_PAY,
    ].map((Config) => {
      return Object.assign(
        { Config, active: initData.activies[Config.C_TYPE], setting: initData.settingMap[Config.C_TYPE] },
        Config.C_TYPE == VIRTUAL_PAYMENT.C_TYPE
          ? {
              payments: initData.payments
                .filter((x) => x.CType == Config.C_TYPE)
                .map((x) => ({ ...x, card: bankCards.find((y) => y.ClassID == x.ID) }))
                .sort((a, b) => !!b.card - !!a.card),
            }
          : {
              payments: initData.payments
                .filter((x) => x.CType == Config.C_TYPE)
                .map((x) => {
                  const cards = bankCards.filter((y) => y.ClassID == x.ID)
                  return { ...x, cards: cards.length >= Config.MAXIMUM_CARD_LIMIT ? cards : cards.concat(null) }
                }),
            }
      )
    })
  })

  const checkingIslogin = () => {
    if (!util.isLogin()) {
      router.push("/site/login")
      return false
    }
    return true
  }

  const getBankData = async () => {
    if (!checkingIslogin()) return
    try {
      const res = await apiHandler(() => getBank())
      initData.sourceBankCards = res.Data
    } catch (error) {
      timer && clearInterval(timer)
      checkingIslogin()
    }
  }
  const getBankListData = async () => {
    const res = await apiHandler(() => getBankList(), { errorHandler: () => {} })
    initData.payments = res.Data
  }

  let timer
  onMounted(async () => {
    try {
      util.trialCheck()
      if (util.isLoginOrNoti(props)) {
        await Promise.all([getBankData(), getBankListData()])
        if (!initData.sourceBankCards.length) {
          await notificationAsync.alert("请先设置银行卡")
          return router.isLoginToOrRedirect("/site/setBankCard")
        }
        timer = setInterval(getBankData, 3000)
      }
    } catch (error) {
      router.back()
      throw error
    }
  })
  onUnmounted(() => {
    timer && clearInterval(timer)
  })

  const onDefaultChange = async (card) => {
    await setUserDefaultBank({ bankID: card.ID })
    initData.sourceBankCards.forEach((x) => {
      x.DefaultBank = x.ID === card.ID
    })
  }
  const onRemoveCard = async (card) => {
    await notificationAsync.confirm("确认删除吗？")
    delUserBank({ id: card.ID }).then((res) => {
      notificationAsync.alert(res.Message)
    })
  }
  const toSetBankCard = (data) => router.isLoginToOrRedirect(`/site/setBankCard`, data)
  const onFreezeClick = async (card) => {
    if (card.Status !== 1) {
      await notificationAsync.confirm("冻结后，启用需联系在线客服！")
      await apiHandler(() => lockBank({ id: card.ID }))
      initData.sourceBankCards.forEach((x) => {
        if (x.ID == card.ID) {
          x.Status = 1
          x.DefaultBank = false
        }
      })
      if (card.DefaultBank) {
        for (const x of initData.sourceBankCards.filter((x) => x.CType == card.CType)) {
          if (x.ID != card.ID) {
            onDefaultChange(x)
            break
          }
        }
      }
    }
  }

  return (
    <LayoutPage center="卡号管理" className={styles["payment-manage"]}>
      <div className="box">
        {datas.map(({ Config, active, setting, payments }) => (
          <div className={classNames("rounded-sm", "mb-1")} style={{ backgroundColor: setting.color.bg }} key={"payment_" + Config.C_TYPE}>
            <div
              className={classNames("relative", "header", { active, inactive: !active })}
              onClick={() => {
                initData.activies[Config.C_TYPE] = !active
              }}
            >
              <img src={setting.image.title} className="w-full" />
              <div className="absolute left-1/2 top-1/2 text-[17px] text-gray-50 -translate-x-1/2 -translate-y-1/2">{Config.NAME2}</div>
            </div>
            <div className={classNames("p-1", { hidden: !active })}>
              {Config.C_TYPE == VIRTUAL_PAYMENT.C_TYPE ? (
                <>
                  {payments.map((payment) => (
                    <AccountItem
                      key={"virtual_" + payment.ID}
                      card={payment.card}
                      payment={payment}
                      Config={Config}
                      setting={setting}
                      onAddClick={() => {
                        toSetBankCard({
                          Name: createDefaultName,
                          type: "addOtherPayment",
                          classid: payment.ID,
                          userId: initData.user.ID,
                          Bank: payment.Name,
                        })
                      }}
                      onFreezeClick={onFreezeClick}
                    />
                  ))}
                </>
              ) : Config.QRCODE ? (
                <>
                  {payments.map(({ cards, ...payment }) =>
                    cards.map((card) => (
                      <>
                        {ORDER_PAYMENT.WECHAT.C_TYPE === card?.CType && ORDER_PAYMENT.WECHAT.checkIsNAME3(card?.Account) ? (
                          <AccountItem
                            key={`special_${payment.ID}_${card?.ID}`}
                            card={{ ...card, Account: card?.Account.replace(ORDER_PAYMENT.WECHAT.PREFIX[0], "") }}
                            payment={payment}
                            Config={Config}
                            setting={setting}
                            onDefaultChange={onDefaultChange}
                            onAddClick={() => {
                              if (payment.CType == ORDER_PAYMENT.BANK.C_TYPE) {
                                toSetBankCard({
                                  Name: createDefaultName,
                                  classid: payment.ID,
                                  type: "addBankPayment",
                                })
                              } else {
                                toSetBankCard({
                                  Name: createDefaultName,
                                  type: "addOtherPayment",
                                  classid: payment.ID,
                                  userId: initData.user.ID,
                                  Bank: payment.Name,
                                })
                              }
                            }}
                            onFreezeClick={onFreezeClick}
                            onRemoveClick={onRemoveCard}
                          />
                        ) : (
                          <QrcodeItem
                            key={"qrcode_" + payment.ID}
                            card={card}
                            payment={payment}
                            Config={Config}
                            setting={setting}
                            onFreezeClick={onFreezeClick}
                            onAddClick={() => {
                              toSetBankCard({
                                Name: createDefaultName,
                                type: "addOtherPayment",
                                classid: payment.ID,
                                userId: initData.user.ID,
                                Bank: payment.Name,
                              })
                            }}
                            onEditClick={() => {
                              toSetBankCard({
                                ID: card.ID,
                                classid: payment.ID,
                                type: "addOtherPayment",
                                Bank: card.Bank,
                                Name: card.Name,
                                userId: initData.user.ID,
                                action: "edit",
                              })
                            }}
                            onRemoveClick={onRemoveCard}
                          />
                        )}
                      </>
                    ))
                  )}
                </>
              ) : (
                <>
                  {payments.map(({ cards, ...payment }) =>
                    cards.map((card) => (
                      <AccountItem
                        key={`others_${payment.ID}_${card?.ID}`}
                        card={card}
                        payment={payment}
                        Config={Config}
                        setting={setting}
                        onDefaultChange={onDefaultChange}
                        onAddClick={() => {
                          if (payment.CType == ORDER_PAYMENT.BANK.C_TYPE) {
                            toSetBankCard({
                              Name: createDefaultName,
                              classid: payment.ID,
                              type: "addBankPayment",
                            })
                          } else {
                            toSetBankCard({
                              Name: createDefaultName,
                              type: "addOtherPayment",
                              classid: payment.ID,
                              userId: initData.user.ID,
                              Bank: payment.Name,
                            })
                          }
                        }}
                        onFreezeClick={onFreezeClick}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutPage>
  )
}
