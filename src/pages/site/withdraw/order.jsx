import React from "react"
import classNames from "classnames"
import { generateQRCode } from "@/magic/qrcode"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"
import { useRouter } from "@/magic/withRouter"
import { ORDER_PAYMENT } from "@/config/payment"
import Dropdown from "@/components/Dropdown"
import { computed, onMounted, reactive, watch } from "@/magic/hook/vue"
import _ from "lodash"
import RangeSlider from "@/components/RangeSlider"

export default (props) => {
  const { router } = useRouter()

  const initData = reactive({
    bankcardId: "",
    platformId: 0,
    usePlatforms: [],
    money: "",
    dotMoney: "",
    pickUpIds: {},
    discoutValue: 0,
  })
  const platform = computed(() => props.platforms.find((x) => x.ID == initData.platformId))
  const displayName = computed(
    () => props.platforms.find((x) => x.ID == initData.platformId)?.bankcards.find((x) => x.ID == initData.bankcardId)?.Name || ""
  )
  const currentMoney = computed(() =>
    isNaN(parseFloat(`${initData.money}.${initData.dotMoney}`)) ? 0 : parseFloat(`${initData.money}.${initData.dotMoney}`)
  )

  const discountedMoney = computed(() => {
    if (!currentMoney) return "0.00"
    return _.round(currentMoney * (100 - initData.discoutValue) * 0.01, 2).toFixed(2)
  })
  const currentBankIndex = computed(() => {
    if (!initData.bankcardId) return 0
    return platform.bankcards.findIndex((x) => x.ID == initData.bankcardId) || 0
  })
  // initData.bankcardId
  const bankID = computed(() =>
    initData.usePlatforms
      .map((platform) => {
        return initData.pickUpIds[platform.CType]
      })
      .filter((x) => x)
      .join(",")
  )
  watch(bankID, () => {
    props.onCardChange(bankID)
  })
  watch(platform.bankcards[0]?.ID, () => {
    initData.bankcardId = platform.workcards[0]?.ID
  })
  watch(currentMoney, () => {
    props.setMoney(currentMoney)
  })

  watch(discountedMoney, () => {
    props.setDiscountedMoney(discountedMoney)
  })
  onMounted(() => {
    const usePlatforms = props.platforms.filter((x) => x.hasCard)
    Object.assign(initData, {
      bankcardId: props.platforms[0]?.workcards[0]?.ID,
      usePlatforms,
      pickUpIds: usePlatforms.reduce((result, platform) => {
        result[platform.CType] = platform.workcards[0]?.ID
        return result
      }, {}),
    })
  })

  const AlipayAccount = (props) => {
    const account = props.value.includes("https://ds.alipay.com/")
      ? util.getUrlParam("account", props.value)
      : props.value.replace(platform.Config.PREFIX, "")
    return util.validateEmail(account) || util.validatePhone(account) ? <div className="platform-alipay">{`帐号 ${account}`}</div> : null
  }

  return (
    <div>
      <div className="item">
        <div className="title">出款方式</div>
        <div className="grid-items items-3 payments method">
          {props.platforms.map((platform) => (
            <div
              className={classNames({ active: initData.usePlatforms.map((x) => x.ID).includes(platform.ID) })}
              key={"payment_method_" + platform.ID}
              onClick={async () => {
                if (initData.usePlatforms.map((x) => x.ID).includes(platform.ID)) {
                  if (platform.CType == ORDER_PAYMENT.BANK.C_TYPE) {
                    await notificationAsync.confirm("<div>银行卡可以增加提款成功率<br />您确认删除银行卡收款？</div>")
                  }
                  initData.usePlatforms = initData.usePlatforms.filter((x) => x.ID !== platform.ID)
                } else {
                  await props.checkPlatform(platform)
                  initData.usePlatforms = initData.usePlatforms.concat(platform)
                }
              }}
            >
              <img className="emoji-icon" src={util.buildAssetsPath(ORDER_PAYMENT.findPaymenByCType(platform.CType)?.ICON)} />
              {platform.Config.NAME2}
            </div>
          ))}
        </div>
      </div>
      <div className="item">
        <div className="title">收款帐户</div>
        <div className="grid-items">
          <Dropdown
            value={initData.platformId}
            onChange={(value) => {
              initData.platformId = value
            }}
            options={props.platforms
              .filter((x) => x.hasCard)
              .map((x) => {
                return { value: x.ID, label: x.Config.NAME2, className: `platform-item ${initData.platformId === x.ID ? "active" : ""}` }
              })}
          ></Dropdown>
        </div>
      </div>

      {platform.Config.QRCODE &&
        platform.bankcards[currentBankIndex]?.ID &&
        !(
          platform.bankcards[currentBankIndex].CType === ORDER_PAYMENT.WECHAT.C_TYPE &&
          ORDER_PAYMENT.WECHAT.checkIsNAME3(platform.bankcards[currentBankIndex].Account)
        ) && (
          <div className="item bankCardNo">
            {/* <div>{platform.bankcards[currentBankIndex].Account.replace(ORDER_PAYMENT.WECHAT.PREFIX[0], "").length}</div> */}
            <div className="title"></div>
            <div className="flex">
              <div className={classNames("flex items-center flex-col bg-[#FFF2E1] px-2 py-1 rounded-sm")}>
                <div className="previews-content">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: generateQRCode(platform.bankcards[currentBankIndex].Account, {
                        cellSize: 6,
                        margin: 4,
                      }),
                    }}
                  ></span>
                </div>

                {platform.CType === 2 && <AlipayAccount value={platform.bankcards[currentBankIndex]?.Account} />}

                {platform.bankcards[0]?.EditBank &&
                  ![ORDER_PAYMENT.ALIPAY, ORDER_PAYMENT.WECHAT, , ORDER_PAYMENT.QQ].some((payment) => platform.CType === payment.C_TYPE) && (
                    <div
                      onClick={() => {
                        const [item] = platform.bankcards
                        router.isLoginToOrRedirect(`/site/setBankCard`, {
                          ID: item.ID,
                          classid: item.ClassID,
                          type: "addOtherPayment",
                          Bank: item.Name,
                          Name: props.platforms[0].bankcards.length ? props.platforms[0].bankcards[0].Name : "",
                          userId: props.user.ID,
                          action: "edit",
                        })
                      }}
                      className="line-btn"
                    >
                      修改
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

      {platform.Config.MULTIPLE && (
        <>
          <div className="item platform">
            <div className="title">预览姓名</div>
            <div style={{ fontSize: "0.3rem" }}>{displayName}</div>
          </div>
          <div className="item platform">
            <div className="title">收款卡号</div>
            <div className="grid-items">
              <Dropdown
                value={initData.bankcardId}
                onChange={(value) => {
                  if (value.toString().startsWith("add_")) {
                    if (platform.CType === ORDER_PAYMENT.BANK.C_TYPE) {
                      props.goAddBankcard({
                        type: "addBankPayment",
                        classid: props.platforms[0].bankcards[+value.substring(4)].payment.ID,
                        Name: props.platforms[0].bankcards[0].Name,
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
                    initData.pickUpIds[platform.CType] = initData.bankcardId = value
                  }
                }}
                options={platform.bankcards.map((x, index) => {
                  let account = platform.CType !== ORDER_PAYMENT.ALIPAY.C_TYPE ? x.Account : ""
                  if (account && platform.CType === ORDER_PAYMENT.WECHAT.C_TYPE) {
                    account = ORDER_PAYMENT.WECHAT.checkIsNAME3(account) ? account.replace(ORDER_PAYMENT.WECHAT.PREFIX[0], "") : ""
                    console.log({ account })
                  }
                  return x.ID
                    ? {
                        value: x.ID,
                        label: `${x.Bank} ${account}`,
                        className: `platform-item ${x.payment.Name} ${initData.bankcardId === x.ID ? "active" : ""}`,
                        disabled: x.Status !== 0,
                      }
                    : { value: `add_${index}`, label: `新增${x.payment.Name}`, className: `add platform-item ${x.payment.Name}` }
                })}
                onClickDisabled={({ label, value }) => {
                  const _card = platform.bankcards.find((card) => card.ID === value)
                  if (!_card) return
                  props.onDisabledCard(_card.Status, label.split(" ")[0])
                }}
              ></Dropdown>
            </div>
            <div className="icon pl-0.75">
              <i
                className="ion-android-settings text-1.5"
                onClick={() => {
                  router.push(`/site/paymentManage`)
                }}
              ></i>
            </div>
          </div>
        </>
      )}
      <div className="item">
        <div className="title">出售金额</div>
        <div className="withdraw-money">
          <input
            placeholder="可小数点提款"
            autoCapitalize="off"
            autoCorrect="off"
            name="amount"
            type="tel"
            maxLength={6}
            className="input int-money"
            value={initData.money}
            onChange={(e) => {
              initData.money = e.target.value.replace(/[^\d]/g, "")
            }}
          />
          <span className="dot">.</span>
          <input
            autoComplete="withdraw-money"
            autoCapitalize="off"
            autoCorrect="off"
            name="amount"
            type="tel"
            maxLength={2}
            className="input dot-money"
            value={initData.dotMoney}
            onChange={(e) => {
              initData.dotMoney = e.target.value.replace(/[^\d]/g, "")
            }}
          />
        </div>
      </div>

      {true && (
        <div className="item">
          <div className="title">降价比例</div>
          <div className="mt-[12px]">
            <RangeSlider value={initData.discoutValue} onChange={(v) => (initData.discoutValue = v)} max={5} step={0.1} />
            <div className="bg-[#f7f7f7] text-[12px] text-center rounded-[3px] py-[2px] mt-[5px]">
              您实际会收到  <span className="text-[#E14138]">{discountedMoney}</span>  元
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
