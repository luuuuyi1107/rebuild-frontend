import { apiHandler } from "@/action"
import { getMobileVerifyCode, bindMobile, getPush, getMySet } from "@/action/apis"
import LayoutPage from "@/components/LayoutPage"
import { onMounted, reactive } from "@/magic/hook/vue"
import { notificationAsync } from "@/magic/notification"
import { toast } from "@/magic/toast"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import { withLoginExceptTrial } from "@/magic/withLogin"
import { useRouter } from "@/magic/withRouter"
import { Button } from "react-onsenui"

export default withRouter(
  withLoginExceptTrial(function BindMobilePage(props) {
    const { router } = useRouter()
    const initData = reactive({
      loading: true,
      mobile: "",
      code: "",
      user: util.cache.get("user"),
      is_verified: false,
      need_verify: false,
    })
    const onBindMobile = () => {
      apiHandler(() => bindMobile({ mobile: initData.mobile, code: initData.code }))
        .then((res) => {
          getPush({})
          return notificationAsync.alert(res.Message)
        })
        .then(() => {
          router.push("/site/securityCenter")
        })
    }
    const sendVerifyCodeToMobile = () => {
      if (!initData.mobile) {
        return toast("手机号必填！")
      }
      apiHandler(() => getMobileVerifyCode({ mobile: initData.mobile })).then((res) => {
        toast(res.Message)
      })
    }
    onMounted(() => {
      Promise.all([apiHandler(() => getMySet()), apiHandler(() => getPush({ keys: ["userset"] }))])
        .then(([mySet, push]) => {
          initData.is_verified = mySet.Data.MobileVerify
          initData.need_verify = push.Data.UserSet.MobileVerify
          initData.mobile = initData.user.Mobile
        })
        .finally(() => {
          initData.loading = false
        })
    })

    return (
      <LayoutPage center={"绑定手机"} right={null} loading={initData.loading}>
        <div className="content px-[0.4rem]">
          <div className="col-item flex justify-center items-center  relative border-0 border-b border-gray-200 border-solid mt-[10px] h-[48px]">
            <div className="title text-[14px] min-w-[78px]">手机号码</div>
            <div className="flex-1">
              <input
                disabled={!!initData.user.Mobile || !initData.need_verify}
                value={initData.mobile}
                className="email-input border-0 bg-transparent w-full text-[14px] placeholder:text-[#aeaeae]"
                type="text"
                placeholder={initData.need_verify ? "请输入手机号码" : "目前关闭设置"}
                onChange={(e) => {
                  initData.mobile = e.target.value.replace(/[^0-9]/g, "")
                }}
              />
            </div>
          </div>
          {initData.need_verify && !initData.is_verified && (
            <div className="col-item flex justify-center items-center relative border-0 border-b border-gray-200 border-solid h-[48px]">
              <div className="title text-[14px] min-w-[78px]">验证码</div>
              <div className="flex-1">
                <input
                  value={initData.code}
                  className="verify-code border-0 bg-transparent w-full text-[14px] placeholder:text-[#aeaeae]"
                  type="text"
                  placeholder="请输入验证码"
                  onChange={(e) => {
                    initData.code = e.target.value
                  }}
                />
              </div>
              <div className="text-theme title text-[14px]" onClick={() => sendVerifyCodeToMobile()}>
                发送验证码
              </div>
            </div>
          )}
          <div style={{ fontSize: 13 }}>
            {!!initData.is_verified ? (
              <div className="py-1 text-right text-theme" onClick={() => props.router.push("/site/adminService")}>
                如需变更请联系客服
              </div>
            ) : !initData.need_verify ? (
              <div className="py-1 text-[#DC2626]">*如需绑定手机，请联系客服</div>
            ) : null}
          </div>
          {!initData.is_verified && (
            <Button
              disabled={initData.is_verified || !initData.need_verify}
              onClick={onBindMobile}
              className="submit_email mt-[20px] w-full text-[16px] rounded-[6px] h-[44px] flex items-center justify-center"
            >
              确认
            </Button>
          )}
        </div>
      </LayoutPage>
    )
  })
)
