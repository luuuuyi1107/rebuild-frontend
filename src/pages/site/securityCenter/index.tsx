import { apiHandler } from "@/action"
import { getMySet, getPush } from "@/action/apis"
import LayoutPage from "@/components/LayoutPage"
import { onMounted, reactive } from "@/magic/hook/vue"
import util from "@/magic/util"
import { withLoginExceptTrial } from "@/magic/withLogin"
import { useRouter } from "@/magic/withRouter"
import { Icon } from "react-onsenui"
export default withLoginExceptTrial(function securityCenter() {
  const { router } = useRouter()
  const initData = reactive({
    user: util.cache.get("user"),
    is_mail_verified: null,
    is_mobile_verified: null,
  })
  onMounted(() => {
    apiHandler(() => getMySet()).then((res) => {
      initData.is_mail_verified = res.Data.MailVerify
      initData.is_mobile_verified = res.Data.MobileVerify
    })
  })
  const buildVerified = (is_varified: boolean | null, value: string) => {
    if (is_varified === null) return null
    if (is_varified) return value
    return <span className="text-[#AAAAAA]">{value ? "未验证" : "未绑定"}</span>
  }
  return (
    <LayoutPage center={"安全中心"} right={null}>
      {[
        {
          name: "昵称设置",
          path: "/site/setNickName",
          icon: <Icon size={26} className="w-[26px] text-center text-[#AAAAAA]" icon="ion-compose" />,
        },
        {
          name: "密码设置",
          path: "/site/setPassword",
          icon: <Icon size={26} className="w-[26px] text-center text-[#AAAAAA]" icon="ion-locked" />,
        },
        {
          name: "安全问题",
          path: "/site/securityQuestion",
          icon: <img className="w-[26px]" src={util.buildAssetsPath("assets/icons/ic_circle_question.svg")} />,
        },
        {
          name: "卡号管理",
          path: "/site/paymentManage",
          icon: <Icon size={26} className="w-[26px] text-center text-[#AAAAAA]" icon="ion-card" />,
        },
        {
          name: "绑定手机",
          path: "/site/bindMobile",
          icon: <img className="w-[26px]" src={util.buildAssetsPath("assets/icons/ic_mobile_screen_button.svg")} />,
          unbound: buildVerified(initData.is_mobile_verified, initData.user.Mobile),
        },
        {
          name: "绑定邮箱",
          path: "/site/bindMail",
          icon: <img className="w-[26px]" src={util.buildAssetsPath("assets/icons/ic_envelope.svg")} />,
          unbound: buildVerified(initData.is_mail_verified, initData.user.Mail),
        },
      ].map((item) => {
        return (
          <div
            key={item.path}
            onClick={() => {
              router.isLoginToOrRedirect(item.path)
            }}
            className="grid grid-cols-[26px_90px_1fr_20px] items-center border-b border-[#E5E5E5] py-[16px] px-[16px] border-0 border-solid"
          >
            {item.icon}
            <span className="text-[#1F1F21] text-[16px] ml-[12px]">{item.name}</span>
            <div className="text-right text-[14px] mr-[10px] truncate">{item.unbound}</div>
            <img className="w-[18px]" src={util.buildAssetsPath("assets/icons/right_arrow.svg")} />
          </div>
        )
      })}
    </LayoutPage>
  )
})
