import { Button } from "react-onsenui"
import InputBox from "@/components/InputBox"
import { useFilter } from "./utils"
import { computed } from "@/magic/hook/vue"
import util from "@/magic/util"
import { Tutorial } from "."
import { notificationAsync } from "@/magic/notification"
import { useContext } from "react"
import { WithdrawContext } from ".."
import AlertTemplate from "./alert_template"

export default ({
  isAbleToWithdraw,
  reqBody,
  getValidateCode,
  confirmDrawMoney,
  amount,
  children,
}: {
  isAbleToWithdraw: boolean
  reqBody: Record<string, string | number>
  getValidateCode: () => void
  confirmDrawMoney: () => void
  amount: number
  children: string
}) => {
  const { filterString, filterToEnglishAndNumbers, filterNumber } = useFilter()
  const allHasValue = computed(() => reqBody.name && reqBody.account && reqBody.bank)
  const isAccountValid = computed(() => reqBody.account.toString().length >= 12)
  const showConfirm = () => {
    notificationAsync
      .confirm(
        <AlertTemplate amount={amount}>
          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">出款方式</div>
            <div className="flex-1 text-black">银行卡</div>
          </div>
          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">收款姓名</div>
            <div className="flex-1 text-black">{reqBody.name}</div>
          </div>

          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">银行帐号</div>
            <div className="flex-1 text-black">{reqBody.account}</div>
          </div>
        </AlertTemplate>,
        {
          buttonLabels: ["取消", "确认提现"],
        }
      )
      .then(() => {
        confirmDrawMoney()
      })
  }
  const { userset } = useContext(WithdrawContext)
  return (
    <>
      <div className="item !py-0">
        <div className="title">收款姓名</div>
        <InputBox
          placeholder="请输入收款姓名"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          value={reqBody.name}
          maxLength={16}
          onChange={(text: string) => {
            reqBody.name = filterString(text)
          }}
        />
      </div>

      <div className="item !py-0">
        <div className="title">银行帐号</div>
        <InputBox
          placeholder="请输入收款卡号"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          value={reqBody.account}
          onChange={(text: string) => {
            reqBody.account = filterToEnglishAndNumbers(text)
          }}
        />
      </div>
      <div className="item !py-0">
        <div className="title">收款银行</div>
        <InputBox
          placeholder="请输入收款银行"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          className="input"
          value={reqBody.bank}
          onChange={(text: string) => {
            reqBody.bank = filterString(text)
          }}
        />
      </div>

      {isAbleToWithdraw && (
        <>
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
                value={reqBody.money}
                onChange={(e) => {
                  reqBody.money = filterNumber(e.target.value)
                }}
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
                value={reqBody.dotMoney}
                onChange={(e) => {
                  reqBody.dotMoney = filterNumber(e.target.value)
                }}
              />
            </div>
          </div>
          {children}
          <div className="item">
            <div className="inline">支付密码</div>
            <div className="inline">
              <InputBox
                placeholder="请输入密码"
                autoComplete="off"
                type="password2"
                name="payPass"
                maxLength="4"
                onChange={(pass: string) => {
                  reqBody.pass = pass
                }}
                value={reqBody.pass}
              />
            </div>
          </div>
          {userset.UserMailVerify && (
            <div className="item bankCardNo">
              <div className="title">邮箱验证码</div>
              <InputBox
                placeholder="请输入验证码"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                className="input"
                value={reqBody.code}
                maxLength={4}
                onChange={(value: string) => {
                  reqBody.code = value.replace(/[^\d]/g, "")
                }}
              />
              <Button onClick={getValidateCode} disabled={!allHasValue || !isAccountValid}>
                发送验证码
              </Button>
            </div>
          )}
          <div className="bg-[#F4F5F9] tip p-1.5">
            <Tutorial />
            <Button
              onClick={() => {
                showConfirm()
              }}
              className="w-full text-center"
              disabled={!(allHasValue && isAccountValid && ((userset.UserMailVerify && reqBody.code) || !userset.UserMailVerify))}
            >
              资料已核对，确认提现
            </Button>
          </div>
        </>
      )}
    </>
  )
}
