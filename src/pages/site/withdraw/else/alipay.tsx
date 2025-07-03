import { generateQRCode } from "@/magic/qrcode"
import util from "@/magic/util"
import { Button } from "react-onsenui"
import InputBox from "@/components/InputBox"
import classNames from "classnames"
import { useFilter } from "./utils"
import { computed } from "@/magic/hook/vue"
import { Tutorial } from "."
import { notificationAsync } from "@/magic/notification"
import { useContext } from "react"
import { WithdrawContext } from ".."
import AlertTemplate from "./alert_template"

export default ({
  isAbleToWithdraw,
  reqBody,
  getValidateCode,
  imageUploadChange,
  confirmDrawMoney,
  amount,
  children,
}: {
  isAbleToWithdraw: boolean
  reqBody: Record<string, string | number>
  getValidateCode: () => void
  imageUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  confirmDrawMoney: () => void
  amount: number
  children: string
}) => {
  const { filterString, filterNumber } = useFilter()
  const allHasValue = computed(() => reqBody.name && reqBody.account && reqBody.money)
  const showConfirm = () => {
    notificationAsync
      .confirm(
        <AlertTemplate amount={amount}>
          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">出款方式</div>
            <div className="flex-1 text-black">支付宝</div>
          </div>
          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">收款姓名</div>
            <div className="flex-1 text-black">{reqBody.name}</div>
          </div>

          <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
            <div className="text-[#aeaeae] mr-1 w-6">收款二维码</div>
            <div className="flex-1 text-black">
              {reqBody.account && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: generateQRCode(reqBody.account, {
                      cellSize: 6,
                      margin: 4,
                    }),
                  }}
                />
              )}
            </div>
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
        <div className="title">收款二维码</div>

        <label className={classNames({ "bg-[#F5F6FB] text-white rounded-sm p-[40px] m-0.5": !reqBody.account })} htmlFor="uploadBtn">
          {reqBody.account ? (
            <span
              dangerouslySetInnerHTML={{
                __html: generateQRCode(reqBody.account, {
                  cellSize: 6,
                  margin: 4,
                }),
              }}
            />
          ) : (
            <img style={{ width: 20 }} src={util.buildAssetsPath("assets/icons/ic_camera.png")} />
          )}
        </label>

        <input
          className="invisible"
          id="uploadBtn"
          type="file"
          accept="image/png, image/gif, image/jpeg"
          name="uploadImg"
          onChange={imageUploadChange}
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
