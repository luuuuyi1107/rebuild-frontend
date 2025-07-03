import React, { useEffect, useState, useMemo } from "react"
import { get } from "lodash"
import classNames from "classnames"
import Dropdown from "@/components/Dropdown"
import { ORDER_PAYMENT, USDT_NAME, VIRTUAL_PAYMENT } from "@/config/payment"
import { useRouter } from "@/magic/withRouter"
import remarkOptions from "@/config/remarks"

export default (props) => {
  const { router } = useRouter()
  const [bankcardId, setBankcardId] = useState("")
  const [remarks, setRemarks] = useState("")
  const [platformIndex, setPlatformIndex] = useState(0)
  const platform = useMemo(() => props.platforms[platformIndex], [props.platforms, platformIndex])
  const currentBankcard = platform?.bankcards.find((x) => x.ID == bankcardId)
  const currentPayment = currentBankcard ? currentBankcard.payment : {}
  const [money, setMoney] = useState("")
  const [dotMoney, setDotMoney] = useState("")
  const currentMoney = isNaN(parseFloat(`${money}.${dotMoney}`)) ? 0 : parseFloat(`${money}.${dotMoney}`)

  useEffect(() => {
    props.onCardChange(bankcardId)
  }, [bankcardId])
  useEffect(() => {
    setBankcardId(
      get(
        platform.bankcards.filter((card) => card.Status !== 1),
        "0.ID"
      )
    )
  }, [props.platforms[0].bankcards.length, platformIndex])
  useEffect(() => {
    props.setMoney(currentMoney)
  }, [currentMoney])

  return (
    <div>
      <div className="item platform">
        <div className="title">收款方式</div>
        <div className="grid-items items-3">
          {props.platforms.map((item, index) => {
            return (
              <div
                className={classNames("platform-item", item.Name, { "fill-active": index == platformIndex, disable: !item.Enable })}
                key={"platform-item" + index + item.ID}
                onClick={async () => {
                  await props.checkPlatform(item)
                  if (item.Config.WITHDRAW_ORDER) {
                    props.switchMethod(item)
                  } else {
                    setPlatformIndex(index)
                  }
                }}
              >
                <img
                  className="emoji-icon w-[18px] mr-[3px]"
                  src={util.buildAssetsPath(ORDER_PAYMENT.findPaymenByCType(item.CType)?.ICON || VIRTUAL_PAYMENT.ICON)}
                />
                {item.Config.NAME2}
              </div>
            )
          })}
        </div>
      </div>

      {currentBankcard && platform.Config.C_TYPE === ORDER_PAYMENT.BANK.C_TYPE && (
        <div className="item bankCardNo" key={currentBankcard.ID + "_account"}>
          <div className="title">收款姓名</div>
          <div style={{ fontSize: "0.3rem", color: "#f77e04" }}>{currentBankcard.Name}</div>
        </div>
      )}

      <div className="item platform">
        <div className="title">收款账户</div>
        <div className="grid-items">
          <Dropdown
            value={bankcardId}
            onChange={(value) => {
              if (value.toString().startsWith("add_")) {
                if (platform.CType === ORDER_PAYMENT.BANK.C_TYPE) {
                  const hasBankcard = platform.bankcards.filter((card) => card.ID).length > 0
                  const type = hasBankcard ? "addBankPayment" : "addFirstBankPayment"
                  const Name = hasBankcard ? props.platforms[0].bankcards[0].Name : ""
                  props.goAddBankcard({
                    type,
                    classid: props.platforms[0].bankcards[+value.substring(4)].payment.ID,
                    Name,
                  })
                } else {
                  const payment = platform.bankcards[+value.substring(4)].payment
                  props.goAddBankcard({
                    type: "addOtherPayment",
                    Name: props.platforms[0].bankcards[0].Name,
                    classid: payment.ID,
                    userId: props.user.ID,
                    Bank: payment.Name,
                  })
                }
              } else {
                setBankcardId(value)
              }
            }}
            options={platform.bankcards.map((bankcard, index) => {
              return bankcard.ID
                ? {
                    value: bankcard.ID,
                    label: `${bankcard.Bank} ${bankcard.Account}`,
                    className: `platform-item ${bankcard.payment.Name} ${bankcardId === bankcard.ID ? "active" : ""}`,
                    disabled: bankcard.Status !== 0,
                  }
                : { value: `add_${index}`, label: `新增${bankcard.payment.Name}`, className: `add platform-item ${bankcard.payment.Name}` }
            })}
            onClickDisabled={({ label, value }) => {
              const _card = platform.bankcards.find((card) => card.ID === value)
              if (!_card) return
              props.onDisabledCard(_card.Status, label.split(" ")[0])
            }}
          ></Dropdown>
        </div>
        <div className="icon pl-0.75 pr-0.25">
          <i
            className="ion-android-settings text-1.5"
            onClick={() => {
              router.push(`/site/paymentManage`)
            }}
          ></i>
        </div>
      </div>

      {props.isAbleToWithdraw && (
        <div className="item">
          <div className="title">提现金额</div>
          <div className="withdraw-money">
            <input
              placeholder="可小数点提款"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              name="amount"
              type="tel"
              maxLength={6}
              className="input int-money"
              value={money}
              onChange={(e) => setMoney(e.target.value.replace(/[^\d]/g, ""))}
            />
            <span className="dot">.</span>
            <input
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              name="amount"
              type="tel"
              maxLength={2}
              className="input dot-money"
              value={dotMoney}
              onChange={(e) => setDotMoney(e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
        </div>
      )}

      {currentPayment.Usdt && (
        <div className="item">
          <div className="title">提现个数</div>
          <div className="inline text-1.25 text-red-500 pl-0.5">≈ {(props.money / props.drawmoneyset.Usdt).toFixed(2)} U币</div>
        </div>
      )}
    </div>
  )
}
