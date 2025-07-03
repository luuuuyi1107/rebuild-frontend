import { Button } from "react-onsenui"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import { onMounted, reactive } from "@/magic/hook/vue"
import { withLoginExceptTrial } from "@/magic/withLogin"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import { getPush, getMySet, sendMailVerify, verifyMailCode } from "@/action/apis"
import { apiHandler } from "@/action"
import { useRouter } from "@/magic/withRouter"

export default withRouter(
  withLoginExceptTrial(function BindMailPage(props) {
    const { router } = useRouter()
    const initData = reactive({
      loading: true,
      mail: "",
      verify_code: "",
      user: util.cache.get("user"),
      is_verified: false,
      need_verify: false,
    })
    const checkEmailFormat = () => {
      if (!initData.mail || !util.validateEmail(initData.mail)) {
        notificationAsync.alert("邮箱格式错误")
        throw new Error("email format error")
      }
    }

    const sendVerifyCodeToMail = () => {
      checkEmailFormat()
      apiHandler(() => sendMailVerify(initData.mail)).then((res) => {
        notificationAsync.alert(res.Message)
      })
    }

    const onBindEmail = () => {
      checkEmailFormat()
      apiHandler(() => verifyMailCode(initData.verify_code))
        .then((res) => {
          getPush({})
          return notificationAsync.alert(res.Message)
        })
        .then(() => {
          router.push("/site/securityCenter")
        })
    }

    onMounted(() => {
      Promise.all([apiHandler(() => getMySet()), apiHandler(() => getPush({ keys: ["userset"] }))])
        .then(([mySet, push]) => {
          initData.is_verified = mySet.Data.MailVerify
          initData.need_verify = push.Data.UserSet.UserMailVerify
          initData.mail = initData.user.Mail
        })
        .finally(() => {
          initData.loading = false
        })
    })

    return (
      <LayoutPage loading={initData.loading} className="bind-mail" center="绑定邮箱" right={null}>
        <div className="content px-[0.4rem]">
          <div className="col-item flex justify-center items-center relative border-0 border-b border-gray-200 border-solid h-[48px] mt-[10px]">
            <div className="title text-[14px] min-w-[78px]">邮箱绑定</div>
            <div className="flex-1">
              <input
                disabled={!!initData.user.Mail || !initData.need_verify}
                value={initData.mail}
                className="email-input border-0 bg-transparent w-full text-[14px] text-[#1F1F21] placeholder:text-[#aeaeae]"
                type="text"
                placeholder={initData.need_verify ? "请输入邮箱地址" : "目前关闭设置"}
                onChange={(e) => {
                  initData.mail = e.target.value
                }}
              />
            </div>
          </div>
          {initData.need_verify && !initData.is_verified && (
            <div className="col-item flex justify-center items-center relative border-0 border-b border-gray-200 border-solid h-[48px]">
              <div className="title text-[14px] min-w-[78px]">验证码</div>
              <div className="flex-1">
                <input
                  value={initData.verify_code}
                  className="verify-code border-0 bg-transparent w-full text-[14px] text-[#1F1F21] placeholder:text-[#aeaeae]"
                  type="text"
                  placeholder="请输入验证码"
                  onChange={(e) => {
                    initData.verify_code = e.target.value
                  }}
                />
              </div>
              <div className="text-theme title text-[14px]" onClick={sendVerifyCodeToMail}>
                发送验证码
              </div>
            </div>
          )}
          <div className="mt-1" style={{ fontSize: 13 }}>
            {!!initData.user.Mail ? (
              <div className="text-right text-theme" onClick={() => props.router.push("/site/adminService")}>
                如需变更请联系客服
              </div>
            ) : !initData.need_verify ? (
              <div className="text-[#DC2626]">*如需绑定邮箱，请联系客服</div>
            ) : (
              <div className="text-[#DC2626]">*推荐使用微信邮箱、QQ邮箱、网易邮箱等国内邮箱!</div>
            )}
          </div>
          {!initData.is_verified && (
            <Button
              disabled={!initData.need_verify}
              onClick={onBindEmail}
              className="submit_email mt-[20px] w-full text-[16px] rounded-[6px] h-[44px] flex items-center justify-center"
            >
              确认
            </Button>
          )}
        </div>
        <div className="px-1 flex mt-[20px]">
          <img className="w-full m-0 p-0 leading-none" src={util.buildAssetsPath("images/securityQuestion/mailBindBanner.png")} />
        </div>
      </LayoutPage>
    )
  })
)
