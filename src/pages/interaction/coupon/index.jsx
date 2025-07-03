import LayoutPage from "@/components/LayoutPage"
import styles from "./style.module.scss"
import { useState } from "react"
import { redeemCoupon } from "@/action/apis"
import { useRouter } from "@/magic/withRouter"
import { Button } from "react-onsenui"
import ModalPage from "@/components/ModalPage"
import { useTrialCheck } from "@/magic/withLogin"
import { notificationAsync } from "@/magic/notification"

export default () => {
  const { router } = useRouter()
  useTrialCheck()
  const [code, setCode] = useState("")
  const [show, setShow] = useState(false)
  const reciveCoupon = async () => {
    if (!code) {
      notificationAsync.alert("优惠码不得为空")
      return
    }

    try {
      const res = await redeemCoupon(code)
      if (res.Code === 0) throw res.Message
      await notificationAsync.alert(res.Message)
      setCode("")
    } catch (error) {
      notificationAsync.alert(typeof error === "string" ? error : error.Message).then(() => {
        setCode("")
      })
    }
  }

  return (
    <>
      <LayoutPage
        center="优惠码兑换"
        right={() => (
          <div
            className="text-1.25 mr-1 text-white"
            onClick={() => {
              router.isLoginToOrRedirect("/interaction/coupon/logs")
            }}
          >
            兑换记录
          </div>
        )}
      >
        <div className={styles.coupon}>
          <div
            onClick={() => {
              setShow(true)
            }}
            style={{ textShadow: "0 0 3px #999" }}
            className="absolute right-1 top-1 flex items-center text-white text-[14px]"
          >
            <img className="mr-0.5" src={util.buildAssetsPath("assets/icons/ic_question.svg")} />
            优惠说明
          </div>

          <div className="w-3/5 mx-auto flex-col items-center justify-center flex pt-[37.5%] mb-1">
            <input
              className="w-full mb-[20px] rounded-sm px-1 py-[9px] md:p-[16px] border-0 box-border text-[14px]"
              placeholder={"请输入邮件优惠码"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <img onClick={reciveCoupon} className="w-[45vw] max-w-[300px]" src={util.buildAssetsPath("images/interaction/coupon/button.png")} />
          </div>

          <div className="text-white bg-white/10 p-1 rounded-[5px] max-w-[500px] mx-auto w-[80vw] leading-relaxed text-[13px] sm:text-[18px]">
            <div className="flex items-center">
              <img className="sm:w-[22px]" src={util.buildAssetsPath("assets/icons/ic_tip.svg")} />
              温馨提示：
            </div>
            请留意您的邮箱收件箱，特别是已绑定邮箱的用户。
            <br />
            如邮件进入垃圾箱，请选择”这不是垃圾邮件”，
            <br />
            以免错过领取现金红包。
          </div>
        </div>
      </LayoutPage>
      <ModalPage isOpen={show} className="pop-notice-modal" animation="easeOutBounce">
        <div className="w-5/6 max-w-[334px] mx-auto bg-white rounded-sm p-1.5 pt-0">
          <div className="bg-theme text-[18px] -mx-1.5 rounded-t-sm flex justify-center items-center relative h-3">提示</div>
          <div className="text-gray-900 text-[14px] pt-3 whitespace-break-spaces text-left">
            <div className="mb-1">优惠码获取说明：</div>
            <div className="mb-1">1.需要在我们平台绑定邮箱并完成验证。我们会不定期通过邮箱发送【优惠码】。 </div>
            <div className="mb-1">2.只有在我们平台绑定邮箱并完成验证的用户才能收到我们发送的【优惠码】。 </div>
            <div className="mb-1">3.若您邮箱收到【优惠码】后，请在有效时间范围内前往入口兑换现金红包。 </div>
            <div className="mb-1">4.为避免错过优惠码，请开启邮箱APP提醒，或关注微信、QQ邮箱公众号。 </div>
            <div>5.【优惠码】过期后将无法领取，请知悉！</div>
          </div>

          <Button className="w-full mt-3" onClick={() => setShow(false)}>
            确认
          </Button>
        </div>
      </ModalPage>
    </>
  )
}
