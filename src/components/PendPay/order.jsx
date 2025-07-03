import { findPaymentIconByType, findTelecomIconByName, MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import util from "@/magic/util"
import classNames from "classnames"
import React, { useState, useMemo, useEffect } from "react"
import CountDownTimer from "./CountDownTimer"
import dayjs from "dayjs"
import Money from "../Money"
import { notificationAsync } from "@/magic/notification"
import ModalPage from "../ModalPage"
import remarkOptions from "@/config/remarks"

/**
 * 买方
 * 下单详情
 */
export default (props) => {
  const { cards } = props
  const ownerPaymentTypes = cards.map((x) => x.type)
  const ownerPaymentConfigs = ORDER_PAYMENT.ALL.concat(MOBILE_PAYMENT.toJSON())
    .sort((a, b) => a.ORDER_SORT - b.ORDER_SORT)
    .filter((x) => ownerPaymentTypes.includes(x.TYPE))
  const [activeType, setActiveType] = useState(ownerPaymentConfigs.map((x) => x.TYPE)[0])

  const activeCard = useMemo(() => {
    const card = cards.find((card) => card.type === activeType)
    if (!card) return { copy: false }
    if (card.Type !== ORDER_PAYMENT.WECHAT.TYPE || card.account.toLowerCase().replace(ORDER_PAYMENT.WECHAT.PREFIX[0], "").length !== 11) {
      return { ...card, copy: false }
    }
    return { ...card, account: card.account.replace(ORDER_PAYMENT.WECHAT.PREFIX[0], ""), copy: true }
  }, [activeType])
  const isOrderCancel = props.orderData.Status === -1
  const isOrderFinished = props.orderData.Status === 3
  const isOrderPending = props.orderData.Status === 0
  const paymentNoted = props.orderData.bank_list.find((x) => x.ID == activeType)?.Noted
  const isActiveCardBank = activeType == ORDER_PAYMENT.BANK.TYPE || activeType == ORDER_PAYMENT.ALIPAY.TYPE

  const alipayAccount = useMemo(() => {
    if (activeCard.Config.C_TYPE !== ORDER_PAYMENT.ALIPAY.C_TYPE || !activeCard.account.includes("https://ds.alipay.com/")) return ""
    return util.getUrlParam("account", activeCard.account)
  })
  const [remarksShow, setRemarksShow] = useState(false)
  useEffect(() => {
    if (isOrderPending && remarkOptions.includes(props.orderData.Post?.Remarks)) {
      setRemarksShow(true)
    }
  }, [])

  return (
    <>
      {isOrderPending && (
        <>
          <CountDownTimer counterKey={props.orderData.ID} targetTime={dayjs(props.orderData.OrderTime).add(10, "minutes").toISOString()} />
          <ModalPage isOpen={remarksShow} className="image-modal">
            <div className="upload-frame">
              <div className="title">提示</div>
              <div className="content">
                <div className="py-2">
                  {props.orderData.Post?.Remarks !== remarkOptions[0] && <div>转帐时请备注</div>}
                  <div className="leading-4 text-[#E14138] text-[16px]">{props.orderData.Post?.Remarks}</div>
                </div>
                <div
                  onClick={() => {
                    setRemarksShow(false)
                  }}
                  className="bg-theme text-white w-full py-0.75 rounded-[3px]"
                >
                  确认
                </div>
              </div>
            </div>
          </ModalPage>
        </>
      )}
      <div className="pendpay-content">
        <div className="sub-title">订单信息</div>
        <div className="sub-content mb-1">
          <div className="bg-white rounded p-1">
            <div className="column mb-1">
              <img className="icon" src={util.buildAssetsPath("assets/icons/ic_money.png")} />
              <div className="col-title">订单金额</div>
              <div className="col-content flex items-center justify-between w-full">
                <div className="flex items-center">
                  {props.orderData.Post?.Money2 && props.orderData.Money > props.orderData.Post?.Money2 ? (
                    <>
                      <Money value={props.orderData.Post.Money2} />
                      <div className="bg-[#E14138] text-white rounded-[2px] px-0.5 py-0.25 leading-none ml-1 whitespace-nowrap text-[12px]">
                        加赠 ¥
                        <Money
                          textColor="text-white"
                          value={(props.orderData.Money - props.orderData.Post.Money2).toFixed(2)}
                          baseSize="text-1"
                          floatSize="text-0.75"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Money value={props.orderData.Money} />
                    </>
                  )}
                </div>

                <span
                  className="icon-copy text-gray-400 text-1.25"
                  onClick={() => {
                    const money =
                      props.orderData?.Post.Money2 && props.orderData.Money > props.orderData?.Post.Money2
                        ? props.orderData?.Post.Money2
                        : props.orderData.Money
                    util.copyToClipBoard(money)
                    props.copyEvent(money)
                  }}
                ></span>
              </div>
            </div>

            {props.orderData.Post?.Remarks && (
              <div className="column mb-1">
                <img className="icon" src={util.buildAssetsPath("assets/icons/ic_money.png")} />
                <div className="col-title">转帐备注</div>
                <div className="text-[14px] break-all flex items-center text-red-500 justify-between w-full">
                  {props.orderData.Post.Remarks}
                  <span
                    className="icon-copy text-gray-400 text-1.25"
                    onClick={() => {
                      util.copyToClipBoard(props.orderData.Post.Remarks)
                      props.copyEvent(props.orderData.Post.Remarks)
                    }}
                  ></span>
                </div>
              </div>
            )}

            <div className="column mb-1">
              <img className="icon" src={util.buildAssetsPath("assets/icons/ic_pay.png")} />
              <div className="col-title">收款方式</div>
              <div className="col-content flex items-center">
                {ownerPaymentTypes.map((type) => (
                  <img
                    key={type}
                    src={util.buildAssetsPath(findPaymentIconByType(type))}
                    style={{ maxHeight: 21, maxWidth: 20 }}
                    className="mr-0.5"
                  />
                ))}
              </div>
            </div>

            <div className="column mb-1">
              <img className="icon" src={util.buildAssetsPath("assets/icons/ic_text.png")} />
              <div className="col-title">提单状态</div>
              <div className={`col-content status-${props.orderData.Status}`}>{props.orderData.StatusText}</div>
            </div>

            <div className="column">
              <img className="icon" src={util.buildAssetsPath("assets/icons/ic_time.png")} />
              <div className="col-title">下单时间</div>
              <div className="col-content">{props.orderData.OrderTime}</div>
            </div>
          </div>
        </div>

        {!isOrderCancel && !isOrderFinished && (
          <>
            <div className="sub-title flex justify-between">
              卖家付款信息
              <div className="argue" onClick={props.showArgue}>
                <img className="icon" src={util.buildAssetsPath("assets/icons/ic_rule.png")} />
                <div>投诉</div>
              </div>
            </div>
            <div className="sub-content mb-1">
              <div className="bg-white rounded p-1">
                <div className="cards flex-wrap">
                  {ownerPaymentConfigs.map((payment, i) => (
                    <div
                      className={classNames({ active: activeType === payment.TYPE, "mr-[2.5%]": i % 3 !== 2 }, "w-[31%]", "bg-gray-100")}
                      key={payment.TYPE}
                      onClick={() => {
                        setActiveType(payment.TYPE)
                      }}
                    >
                      <img style={{ width: 20 }} src={util.buildAssetsPath(payment.ICON)} />
                      {payment.NAME2}
                    </div>
                  ))}
                </div>

                {isActiveCardBank && (
                  <div className="rounded-sm px-2 py-0.5 bg-[#F6F7FC] mb-1 text-[14px]">
                    <p className="text-[#108DE9] m-0 mb-0.5">
                      <span
                        className="border-solid border-0 border-b border-[#108DE9]"
                        onClick={() => props.buttonEvent("showAlipayReceiptRutorial")}
                      >
                        👉👉申请支付宝回单快速到账👈👈
                      </span>
                    </p>
                    <p className="m-0">
                      <span className="mr-0.75">邮箱地址</span>
                      <span
                        className="text-[#FF6700] underline"
                        onClick={() => {
                          util.copyToClipBoard("76kefu@gmail.com")
                          notificationAsync.toast("已复制")
                        }}
                      >
                        76kefu@gmail.com
                      </span>
                    </p>
                  </div>
                )}

                {!isOrderCancel && activeCard.Config.APP_NAME && (
                  <div className="mb-1 flex justify-center">
                    <div
                      className="open-app rounded bg-[#FFF2E1] text-theme px-3 py-1 w-fit text-1.25"
                      onClick={() => {
                        activeCard.Config.onAppOpen(activeCard)
                      }}
                    >
                      <span className="ion-share text-1.75 mr-0.5 relative top-[2px]"></span>
                      打开{activeCard.Config.APP_NAME}APP付款
                    </div>
                  </div>
                )}

                {activeCard.qrcode ? (
                  <>
                    <div className="column mb-1 flex justify-center">
                      <div className="col-content">
                        <div className="qr-content">
                          <div className="frame" />
                          <div className="frame" />
                          <div className="frame" />
                          <div className="frame" />
                          <span dangerouslySetInnerHTML={{ __html: activeCard.qrcode }}></span>
                        </div>
                      </div>
                    </div>
                    <div className="column mb-1">
                      <img className="icon" src={util.buildAssetsPath("assets/icons/ic_person.png")} />
                      <div className="col-title">收款姓名</div>
                      <div className="col-content flex-1">{activeCard.userName}</div>
                      <span
                        className="icon-copy text-gray-400 text-1.5"
                        onClick={() => {
                          props.copyEvent(activeCard.userName)
                        }}
                      ></span>
                    </div>
                    {alipayAccount && (
                      <div className="column mb-1">
                        <img className="icon" src={util.buildAssetsPath("assets/icons/ic_account.png")} />
                        <div className="col-title">支付宝帐号</div>
                        <div className="col-content flex-1">{alipayAccount}</div>
                        <span
                          className="icon-copy text-gray-400 text-1.5"
                          onClick={() => {
                            props.copyEvent(alipayAccount)
                          }}
                        ></span>
                      </div>
                    )}
                  </>
                ) : activeCard.Type == MOBILE_PAYMENT.TYPE ? (
                  <>
                    <div className="column mb-1">
                      <img className="icon" src={util.buildAssetsPath("assets/icons/ic_account.png")} />
                      <div className="col-title">
                        运营商<span className="invisible">商</span>
                      </div>
                      <div className="col-content flex-1 flex items-center">
                        <img className="mobile-icon w-[20px] mr-[4px]" src={findTelecomIconByName(activeCard.bank)} />
                        {activeCard.bank}
                      </div>
                    </div>
                    <div className="column mb-1">
                      <img className="icon" src={util.buildAssetsPath("assets/icons/ic_phone_gray.png")} />
                      <div className="col-title">手机号码</div>
                      <div className="col-content flex-1">{activeCard.account}</div>
                      <span
                        className="icon-copy text-gray-400 text-1.5"
                        onClick={() => {
                          props.copyEvent(activeCard.account)
                        }}
                      ></span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="column mb-1">
                      <img className="icon" src={util.buildAssetsPath("assets/icons/ic_account.png")} />
                      <div className="col-title">收款帐号</div>
                      <div className="col-content flex-1">{activeCard.account}</div>
                      {(isOrderPending || !!activeCard.copy) && (
                        <span
                          className="icon-copy text-gray-400 text-1.5"
                          onClick={() => {
                            props.copyEvent(activeCard.account)
                          }}
                        ></span>
                      )}
                    </div>
                    <div className="column mb-1">
                      <img className="icon" src={util.buildAssetsPath("assets/icons/ic_person.png")} />
                      <div className="col-title">收款姓名</div>
                      <div className="col-content flex-1">{activeCard.userName}</div>
                      <span
                        className="icon-copy text-gray-400 text-1.5"
                        onClick={() => {
                          props.copyEvent(activeCard.userName)
                        }}
                      ></span>
                    </div>
                    <div className="column mb-1">
                      <img className="icon" src={util.buildAssetsPath("assets/icons/ic_account.png")} />
                      <div className="col-title">收款银行</div>
                      <div className="col-content flex-1">{activeCard.bank}</div>
                      {isOrderPending && (
                        <span
                          className="icon-copy text-gray-400 text-1.5"
                          onClick={() => {
                            props.copyEvent(activeCard.bank)
                          }}
                        ></span>
                      )}
                    </div>
                  </>
                )}

                {!isOrderCancel && paymentNoted && (
                  <div className="supply">
                    <span dangerouslySetInnerHTML={{ __html: paymentNoted }}></span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="sub-title">买家付款信息</div>
        {/* <div>{ props.orderData.Payment.Bank }</div> */}
        {!!props.orderData.Content && (
          <div className="sub-content">
            <div className="bg-white rounded p-1">
              <div className="column mb-1" style={{ alignItems: "start" }}>
                <img className="icon" src={util.buildAssetsPath("assets/icons/ic_safety.png")} />
                <div className="col-title">收款凭证</div>
                <div className="col-content">
                  <div dangerouslySetInnerHTML={{ __html: props.orderData.Content }} />
                </div>
              </div>
              <div className="column flex justify-center">
                <div className="previews">
                  {props.orderData.ImageFile.map((imgSrc, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        props.demoImages(index)
                      }}
                    >
                      <img key={props.orderData.ID + "-" + index} src={imgSrc} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isOrderCancel && !isOrderFinished && (
          <div className="grid-items col-3 btns order">
            <button
              className="cancel"
              onClick={() => {
                props.buttonEvent("cancel")
              }}
            >
              取消订单
            </button>
            <button
              className="refresh"
              onClick={() => {
                props.buttonEvent("refresh")
              }}
            >
              <span className="ion-android-refresh mr-0.5 text-1.5 relative top-[2px]" />
              刷新
            </button>
            <button
              className="confirm"
              onClick={() => {
                props.buttonEvent("confirm", { isActiveCardBank })
              }}
            >
              确认转帐
            </button>
          </div>
        )}
      </div>
    </>
  )
}
