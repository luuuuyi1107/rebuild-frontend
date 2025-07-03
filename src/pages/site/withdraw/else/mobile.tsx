import { Button } from "react-onsenui"
import InputBox from "@/components/InputBox"
import Dropdown from "@/components/Dropdown"
import classNames from "classnames"
import { computed, onMounted } from "@/magic/hook/vue"
import util from "@/magic/util"
import { useFilter } from "./utils"
import { Tutorial } from "."
import { findTelecomIconByName } from "@/config/payment"
import { notificationAsync } from "@/magic/notification"
import { useContext, useEffect } from "react"
import { WithdrawContext } from ".."
import AlertTemplate from "./alert_template"

export default ({
  payment,
  isAbleToWithdraw,
  reqBody,
  getValidateCode,
  confirmDrawMoney,
  amount,
}: {
  payment: { FixedMoney?: string }
  isAbleToWithdraw: boolean
  reqBody: Record<string, string | number>
  getValidateCode: () => void
  confirmDrawMoney: () => void
  amount: number
}) => {
  const { filterNumber } = useFilter()
  const allHasValue = computed(() => reqBody.money && reqBody.account && reqBody.bank)
  const buildMoneyClassName = (targetMoney: number) =>
    classNames("text-center rounded-[5px] border border-solid w-full py-0.75 text-[14px]", {
      "bg-[#FF9933] border-[#FF9933] text-white": reqBody.money == targetMoney,
      "text-[#FF9933] border-[#E0E0E0]": reqBody.money !== targetMoney,
    })
  const moneys = payment.FixedMoney ? payment.FixedMoney.split(",").map((x) => +x) : [10, 30, 50, 100]
  const { userset } = useContext(WithdrawContext)
  onMounted(() => {
    reqBody.money = moneys[0]
  })

  const showConfirm = () => {
    notificationAsync
      .confirm(
        <AlertTemplate amount={amount}>
          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">运营商</div>
            <div className="flex-1 text-black">{reqBody.bank}</div>
          </div>

          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">手机号码</div>
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
  return (
    <>
      <div className="item platform">
        <div className="title">运营商</div>
        <div className="grid-items">
          <Dropdown
            value={reqBody.bank}
            onChange={(value: string) => {
              reqBody.bank = value
            }}
            options={["中国移动", "中国联通", "中国电信"].map((x) => ({ value: x, label: x, icon: findTelecomIconByName(x) }))}
            placeholder="请选择运营商"
          />
        </div>
      </div>
      <div className="item !py-0">
        <div className="title">手机号码</div>
        <InputBox
          placeholder="请输入手机号码"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          value={reqBody.account}
          maxLength={11}
          onChange={(text: string) => {
            reqBody.account = filterNumber(text)
          }}
        />
      </div>
      <div className="item">
        <div className="title">充值金额</div>
        <div className="moneys grid grid-cols-4 gap-0.5">
          {moneys.map((money) => (
            <div
              className={buildMoneyClassName(money)}
              onClick={() => {
                reqBody.money = money
              }}
              key={money}
            >
              {money}
            </div>
          ))}
        </div>
      </div>
      {isAbleToWithdraw && (
        <>
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
                  reqBody.code = filterNumber(value)
                }}
              />
              <Button onClick={getValidateCode} disabled={!allHasValue}>
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
              disabled={!(allHasValue && ((userset.UserMailVerify && reqBody.code) || !userset.UserMailVerify))}
            >
              资料已核对，确认提现
            </Button>
          </div>
        </>
      )}
    </>
  )
}
