import React, { useEffect, useState, useMemo } from "react"
import util from "@/magic/util"
import { findTelecomIconByName, MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import classNames from "classnames"
import Money from "../Money"

/**
 * 卖方
 * 订单详情
 */
export default (props) => {
  const { cards } = props
  const ownerPaymentTypes = cards.map((x) => x.type)
  const ownerPaymentConfigs = ORDER_PAYMENT.ALL.concat(MOBILE_PAYMENT.toJSON())
    .sort((a, b) => a.ORDER_SORT - b.ORDER_SORT)
    .filter((x) => ownerPaymentTypes.includes(x.TYPE))
  const [activeType, setActiveType] = useState(ownerPaymentConfigs.map((x) => x.TYPE)[0])

  // const activeCard = useMemo(() => cards.find((card) => card.type === activeType) || {}, [activeType])

  const activeCard = useMemo(() => {
    const card = cards.find((card) => card.type === activeType)
    if (!card) return {}
    if (card.Type !== ORDER_PAYMENT.WECHAT.TYPE || card.account.toLowerCase().replace(ORDER_PAYMENT.WECHAT.PREFIX[0], "").length !== 11) {
      return card
    }

    return { ...card, account: card.account.replace(ORDER_PAYMENT.WECHAT.PREFIX[0], "") }
  }, [activeType])

  const isOrderCancel = props.orderData.Status === -1
  const isOrderPaid = props.orderData.Status === 1
  const isOrderFinished = props.orderData.Status === 3

  return !props.orderData ? (
    <div>LOADING</div>
  ) : (
    <div className="pendpay-content pidorder">
      <div className="sub-title">订单信息</div>
      <div className="sub-content mb-1">
        <div className="bg-white rounded p-1">
          <div className="column mb-1">
            <img className="icon" src={util.buildAssetsPath("assets/icons/ic_money.png")} />
            <div className="col-title">提款金额</div>
            <div className="col-content">
              <Money value={props.orderData.Money} />
              {props.orderData.Post.OrderSplit === 0 && props.orderData?.Post.Money2 > 0 && props.orderData?.Money > props.orderData?.Post.Money2 && (
                <span className="ml-1">
                  (实际收款&nbsp;
                  <Money baseSize="text-[15px]" floatSize="text-[12px]" value={props.orderData?.Post.Money2} />)
                </span>
              )}
            </div>
          </div>

          <div className="column">
            <img className="icon" src={util.buildAssetsPath("assets/icons/ic_person.png")} />
            <div className="col-title">提款姓名</div>
            <div className="col-content">{activeCard.Name}</div>
          </div>

          {/* {props.orderData.Post.hasOwnProperty("OrderSplit") && (
            <div className="column mt-1">
              <img className="icon translate-y-[2px] mr-[10px]" src={util.buildAssetsPath("assets/icons/ic_splitmoney.svg")} />
              <div className="col-title">提款方式</div>
              <div className="col-content">{(props.orderData.Post.OrderSplit == 1 ? "" : "不") + "拆分"}</div>
            </div>
          )} */}
        </div>
      </div>

      {!isOrderCancel && !isOrderFinished && (
        <>
          <div className="sub-title">收款信息</div>
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
              {activeCard.qrcode ? (
                <div className="qr-content">
                  <span dangerouslySetInnerHTML={{ __html: activeCard.qrcode }}></span>
                </div>
              ) : activeCard.Type === MOBILE_PAYMENT.TYPE ? (
                <>
                  <div className="column mb-1">
                    <img className="icon" src={util.buildAssetsPath("assets/icons/ic_account.png")} />
                    <div className="col-title">
                      运营商<span className="invisible">商</span>
                    </div>
                    <div className="col-content left-side flex items-center">
                      <img className="mobile-icon w-[20px] mr-[4px]" src={findTelecomIconByName(activeCard.bank)} />
                      {activeCard.bank}
                    </div>
                  </div>
                  <div className="column mb-1">
                    <img className="icon" src={util.buildAssetsPath("assets/icons/ic_phone_gray.png")} />
                    <div className="col-title">手机号码</div>
                    <div className="col-content left-side">{activeCard.account}</div>
                  </div>
                </>
              ) : (
                [
                  { icon: "assets/icons/ic_account.png", key: "account", text: "收款帐号" },
                  { icon: "assets/icons/ic_person.png", key: "userName", text: "收款姓名" },
                  { icon: "assets/icons/ic_account.png", key: "bank", text: "收款银行" },
                ].map((oitem) => (
                  <div key={oitem.key} className="column mb-1">
                    <img className="icon" src={util.buildAssetsPath(oitem.icon)} />
                    <div className="col-title">{oitem.text}</div>
                    <div className="col-content left-side">{activeCard[oitem.key]}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="sub-title">提款信息</div>
      <div className="sub-content mb-1">
        <div className="bg-white rounded p-1">
          <div className="column mb-1">
            <img className="icon" src={util.buildAssetsPath("assets/icons/ic_text.png")} />
            <div className="col-title">订单状态</div>
            <div className={classNames(`col-content`, { "!text-[#E14138]": props.orderData.Status == 3 })}>{props.orderData.StatusText}</div>
          </div>

          <div className="column mb-1">
            <img className="icon" src={util.buildAssetsPath("assets/icons/ic_time.png")} />
            <div className="col-title">下单时间</div>
            <div className="col-content">{props.orderData.OrderTime}</div>
          </div>

          <div className="column mb-1">
            <img className="icon" src={util.buildAssetsPath("assets/icons/ic_dollor.png")} />
            <div className="col-title">付款时间</div>
            <div className="col-content">{props.orderData.PayTime}</div>
          </div>

          <div className="column mb-1">
            <img className="icon" src={util.buildAssetsPath("assets/icons/ic_note.png")} />
            <div className="col-title">备注信息</div>
            <div className="col-content">
              {!!props.orderData.Content ? (
                <div style={{ textAlign: "left" }} dangerouslySetInnerHTML={{ __html: props.orderData.Content }}></div>
              ) : (
                "暂无备注信息"
              )}
            </div>
          </div>

          {(!isOrderCancel || props.orderData.ImageFile.length > 0) && (
            <>
              <div className="argue-col mb-1">
                <div className="col-title">
                  <img className="icon mr-1" src={util.buildAssetsPath("assets/icons/ic_safety.png")} />
                  付款凭证
                </div>

                <div className="argue" onClick={props.showArgue}>
                  <img className="icon" src={util.buildAssetsPath("assets/icons/ic_rule.png")} />
                  <div>投诉</div>
                </div>
              </div>
              <div className="column">
                <div className="col-title"></div>
                <div className="col-content" style={{ textAlign: "left" }}>
                  <div className="previews">
                    {props.orderData.ImageFile.map((imgSrc, index) => (
                      <div
                        onClick={() => {
                          props.demoImages(index)
                        }}
                        key={props.orderData.ID + "-" + index}
                      >
                        <img className="mx-auto block" src={imgSrc} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!isOrderFinished && (
        <div className="sub-content">
          {isOrderPaid ? (
            <div className={"grid-items col-2 btns"}>
              <button style={{ width: "100%" }} onClick={props.refresh}>
                <span className="icon-refresh text-theme text-1.25 mr-0.5"></span>
                刷新
              </button>

              <button onClick={props.confirm}>确认到帐</button>
            </div>
          ) : (
            <div className={"btn"}>
              {!isOrderCancel && (
                <button style={{ width: "100%" }} onClick={props.refresh}>
                  <span className="icon-refresh text-white text-1.25 mr-0.5"></span>
                  刷新
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
