import classNames from "classnames"
import { MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import { getWithDrawValidateCode } from "@/action/apis"
import { useQrcodeWithPayment } from "@/magic/qrcode"
import ElseBank from "./bank"
import ElseAlipay from "./alipay"
import ElseMobile from "./mobile"
import { computed, onMounted, onUnmounted, reactive, watch } from "@/magic/hook/vue"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"
import { useRouter } from "@/magic/withRouter"

export default function Else(props) {
  const reqBody = reactive({
    name: "",
    money: "",
    dotMoney: "",
    method: ORDER_PAYMENT.BANK.C_TYPE,
    account: "",
    bank: "",
    pass: "",
    code: "",
  })
  const amount = computed(() => `${reqBody.money}${reqBody.dotMoney ? "." + reqBody.dotMoney : ""}`)
  const currentPayment = computed(() => props.platforms.find((x) => x.CType === reqBody.method))
  const { convertQRcodeToString } = useQrcodeWithPayment(props.platforms.find((x) => x.CType === ORDER_PAYMENT.ALIPAY.C_TYPE)?.Config)
  const imageUploadChange = async (event) => {
    try {
      const account = await convertQRcodeToString(event.target.files?.[0])
      reqBody.account = account
    } catch (error) {
      notificationAsync.alert(error || "错误")
    }
  }

  watch(reqBody.method, () => {
    props.onChangeElseMethod(reqBody.method)
  })

  onMounted(() => {
    props.onChangeElseMethod(ORDER_PAYMENT.BANK.C_TYPE)
  })

  onUnmounted(() => {
    props.onChangeElseMethod(ORDER_PAYMENT.BANK.C_TYPE)
  })

  const getValidateCode = async () => {
    const res = await getWithDrawValidateCode(reqBody.name, reqBody.account, amount)
    notificationAsync.alert(res.Message)
  }

  const confirmDrawMoney = async () => {
    const { name, account, bank, code, pass } = reqBody
    props.onWithDraw({ name, account, bank, code, pass, money: amount })
  }

  return (
    <>
      <div>
        <div className="item">
          <div className="title">出款方式</div>
          <div className="grid-items items-3">
            {props.platforms.map((platform, index) => {
              return (
                <div
                  className={classNames("platform-item relative", {
                    "border border-[#FF9933] border-solid !text-white bg-[#FF9933]": platform.CType == reqBody.method,
                    disable: !platform.Enable,
                  })}
                  onClick={() => {
                    reqBody.method = platform.CType
                    reqBody.bank = ""
                    reqBody.account = ""
                    reqBody.money = ""
                    reqBody.dotMoney = ""
                    reqBody.name = ""
                    switch (platform.CType) {
                      case ORDER_PAYMENT.ALIPAY.C_TYPE:
                        reqBody.bank = platform.Config.NAME
                        break
                      case MOBILE_PAYMENT.C_TYPE:
                        reqBody.name = platform.Config.NAME
                        break
                    }
                  }}
                  key={index}
                >
                  <img className="emoji-icon max-h-[21px] max-w-[20px] mr-[3px]" src={util.buildAssetsPath(platform.Config.ICON)} />
                  {platform.discountText && <div className="hint">{platform.discountText}</div>}
                  {platform.Config.NAME2}
                </div>
              )
            })}
          </div>
        </div>
        {reqBody.method === ORDER_PAYMENT.BANK.C_TYPE ? (
          <ElseBank
            isAbleToWithdraw={props.isAbleToWithdraw}
            reqBody={reqBody}
            getValidateCode={getValidateCode}
            confirmDrawMoney={confirmDrawMoney}
            amount={amount}
          >
            {props.children}
          </ElseBank>
        ) : reqBody.method === ORDER_PAYMENT.ALIPAY.C_TYPE ? (
          <ElseAlipay
            isAbleToWithdraw={props.isAbleToWithdraw}
            reqBody={reqBody}
            getValidateCode={getValidateCode}
            confirmDrawMoney={confirmDrawMoney}
            imageUploadChange={imageUploadChange}
            amount={amount}
          >
            {props.children}
          </ElseAlipay>
        ) : reqBody.method === MOBILE_PAYMENT.C_TYPE ? (
          <ElseMobile
            payment={currentPayment}
            isAbleToWithdraw={props.isAbleToWithdraw}
            reqBody={reqBody}
            getValidateCode={getValidateCode}
            confirmDrawMoney={confirmDrawMoney}
            amount={amount}
          />
        ) : null}
      </div>
    </>
  )
}

export const Tutorial = () => {
  const { router } = useRouter()
  return (
    <>
      <div className="mb-1">
        <div className="questionmark text-theme" onClick={() => router.push("/site/promotionContent", { id: 566, title: "帮我收教程" })}>
          使用教程
        </div>
      </div>
      <ol className="py-0 px-1.5 list-outside">
        <li className="mb-[3px]">仅限绑定邮箱的会员才能使用此提款方式。</li>
        <li className="mb-[3px]">每次使用此方式提款，都需获取邮箱验证码，验证成功后方可提款。</li>
        <li className="mb-[3px]">提交支付宝收款方式，提交姓名需与二维码实名信息一致。</li>
        <li className="mb-[3px]">暂时仅支持银行卡、支付宝、手机充值三种收款方式，提款时只能单选其一、且上一笔“帮我收”提款完结后才能再次使用。</li>
        <li>收到款项及时确认，超时未确认系统将自动判定。</li>
      </ol>
    </>
  )
}
