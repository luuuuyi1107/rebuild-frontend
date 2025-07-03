import { onMounted, reactive } from "@/magic/hook/vue"
import util from "@/magic/util"
import styles from "./style.module.scss"
import classNames from "classnames"
import VanPopup from "@/components/VanPopup"
import { AlertDialog, Button, Checkbox } from "react-onsenui"
import YidunVerifyCode, { CaptchaLoadingButton } from "@/components/YidunVerifyCode"
import { createRef } from "react"
import InputBox from "@/components/InputBox"
import { useRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import { getMailVerifyCode, userLogin } from "@/action/apis"
import { apiHandler } from "@/action"
import questions from "@/components/SecurityInput/questions"
import ModalPage from "@/components/ModalPage"
import { toast } from "@/magic/toast"

export default function LoginPopup({
  show,
  needMailVerify,
  needCaptcha,
  captchaId,
  switchTo,
}: {
  show: boolean
  needMailVerify: boolean
  needCaptcha: boolean
  captchaId?: string
  switchTo: (type: "" | "login" | "register") => void
}) {
  const initData = reactive({
    loginType: "normal" as "normal" | "fast",
    mobile: "",
    password: "",
    NECaptchaValidate: "",
    mail: "",
    code: "",
    answer: "",
    key: "",
    VerifyGUID: "",
    showBindMail: false,
    savePassword: true,
    isCaptchaInit: false,
  })
  const yidunRef = createRef<YidunVerifyCode>()
  const { router, route } = useRouter()

  const login = () => {
    let param: Record<string, string> = {
      answer: initData.answer,
      key: initData.key,
      verifyGUID: initData.VerifyGUID,
    }
    if (initData.loginType == "fast") {
      if (!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(initData.mail)) {
        return toast("请输入有效的信箱")
      }
      param.mail = initData.mail
      param.vertifyCode = initData.code
    } else {
      if (!initData.mobile) {
        return toast("请输入有效的帐号或者手机号码")
      }
      if (!initData.password) {
        return toast("请输入6-16位有效的密码")
      }
      param.mobile = initData.mobile
      param.password = initData.password
    }
    if (needCaptcha) {
      param.NECaptchaValidate = initData.NECaptchaValidate
    }
    apiHandler(() => userLogin(param, initData.loginType), {
      errorHandler: (res) => {
        initData.answer = ""
        if (res.Code == -4) {
          initData.key = res.Data.AnswerKeys[0]
          initData.VerifyGUID = res.Data.VerifyGUID
          // initData.showAnswer = true
          notificationAsync
            .prompt(questions[+initData.key - 1], {
              title: res.Message,
              beforeSubmit(value) {
                if (!value.trim()) {
                  toast("答案不得为空")
                  throw new Error("answer empty")
                }
              },
            })
            .then((value) => {
              initData.answer = value
              login()
            })
        } else {
          notificationAsync.alert(res.Message)
          initData.NECaptchaValidate = ""
          yidunRef.current?.refresh()
        }
      },
    }).then((res) => {
      util.cache.set("loginInfo", {
        mobile: initData.mobile,
        password: initData.savePassword ? initData.password : "",
        mail: initData.mail,
        savePassword: initData.savePassword,
      })
      if (res.Data.Mail) {
        setTimeout(() => {
          router.replace(route.query.redirect ? route.query.redirect : "/site/home")
        }, 1000)
      } else {
        initData.showBindMail = true
      }
    })
  }

  const getMailCode = () => {
    if (!initData.mail) {
      return toast("邮箱地址必填！")
    }
    apiHandler(() => getMailVerifyCode({ mail: initData.mail, NECaptchaValidate: initData.NECaptchaValidate }), {
      errorHandler: (res) => {
        toast(res.Message)
      },
    }).then((res) => {
      toast(res.Message)
    })
  }

  onMounted(() => {
    const { mobile, password, mail, savePassword } = util.cache.get("loginInfo") || {}
    initData.mobile = mobile
    initData.mail = mail
    initData.password = password
    initData.savePassword = typeof savePassword == "boolean" ? savePassword : true
    // notificationAsync.confirm(`恭喜 注册成功\n是否前往设置您的专属昵称?`, {
    //   className: styles["register-success-dialog"],
    //   buttonLabels: ["前往设置", "先去逛逛"],
    // })
    // setTimeout(() => notificationAsync.toast("seresrsdfsd", { timeout: 400000 }), 2000)
    // setTimeout(() => notificationAsync.toast("seresrsdfsd", { timeout: 50000 }), 1000)
    // notificationAsync.toast("seresrsdfsd", { timeout: 50000 })
    // notificationAsync.prompt("seresrsdfsd")
    // setTimeout(() => toast("test", { duration: 5000 }), 3000)
  })
  // notificationAsync.confirm("您目前解决性需求的方式是?", { title: "快捷登录" })
  return (
    <>
      <VanPopup show={show} className={classNames(styles["bg-linear"], styles["login-popup"])} position="bottom">
        <div className="py-[30px] px-[25px]">
          <div className="content">
            <img
              onClick={() => {
                switchTo("")
              }}
              className="close w-[20px] absolute right-[10px] top-[10px]"
              src={util.buildAssetsPath("/assets/icons/ic_close.png")}
            />
            {needMailVerify && (
              <div className="tab">
                <div className={classNames("btn", { active: initData.loginType === "normal" })} onClick={() => (initData.loginType = "normal")}>
                  一般登录
                </div>
                <div className={classNames("btn", { active: initData.loginType === "fast" })} onClick={() => (initData.loginType = "fast")}>
                  快捷登录
                </div>
              </div>
            )}
            <div className="form mt-[20px]">
              {initData.loginType === "normal" && (
                <>
                  <div className="loginBox">
                    <InputBox
                      placeholder="请输入会员ID/手机/邮箱"
                      icon={<img src={util.buildAssetsPath("assets/icons/ic_user.svg")} />}
                      type="text"
                      name="phone"
                      maxLength={50}
                      onChange={(value: string) => {
                        initData.mobile = value
                      }}
                      value={initData.mobile}
                    />
                    <InputBox
                      placeholder="请输入登录密码"
                      icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
                      type="password"
                      name="password"
                      onChange={(value: string) => {
                        initData.password = value
                      }}
                      value={initData.password}
                    />
                  </div>
                </>
              )}
              {initData.loginType === "fast" && (
                <>
                  <div className="loginBox fast">
                    <InputBox
                      placeholder="请输入绑定邮箱地址"
                      icon={<img src={util.buildAssetsPath("assets/icons/ic_envelope.svg")} />}
                      type="text"
                      name="email"
                      onChange={(value: string) => {
                        initData.mail = value
                      }}
                      value={initData.mail}
                    />
                    <InputBox
                      placeholder="请输入验证码"
                      name="code"
                      onChange={(value: string) => {
                        initData.code = value
                      }}
                      value={initData.code}
                      icon={<img src={util.buildAssetsPath("assets/icons/ic_shield_checked.svg")} />}
                      subfix={
                        <span className=" text-theme text-[13px]" onClick={getMailCode}>
                          发送验证码
                        </span>
                      }
                    />
                  </div>
                </>
              )}
              <div className="flex justify-between px-[9px]">
                <div className="flex items-center">
                  <Checkbox
                    inputId={"remember"}
                    className="login-checkbox scale-[64%] mr-0.25"
                    onChange={() => {
                      initData.savePassword = !initData.savePassword
                    }}
                    checked={initData.savePassword}
                  />
                  记住密码
                </div>
                <div className="flex items-center">
                  忘记密码？
                  <span
                    className="tips"
                    onClick={() => {
                      if (needMailVerify) {
                        router.push("/site/findPassword")
                      } else {
                        router.push("/site/adminService")
                      }
                    }}
                  >
                    点击找回
                  </span>
                </div>
              </div>
              <div className="login-btn mt-1.5 h-[40px] relative">
                {needCaptcha && captchaId && !initData.NECaptchaValidate && (
                  <YidunVerifyCode
                    ref={yidunRef}
                    id="login-verify"
                    CaptchaId={captchaId}
                    className="verify relative z-10"
                    onSuccess={(res: { validate: string }) => {
                      initData.NECaptchaValidate = res.validate
                    }}
                    onLoad={() => {
                      initData.isCaptchaInit = true
                    }}
                  />
                )}
                {(needCaptcha === false || initData.NECaptchaValidate) && (
                  <Button className="w-full text-center relative z-10 text-[16px]" onClick={login}>
                    立即登录
                  </Button>
                )}
                {!initData.isCaptchaInit && <CaptchaLoadingButton />}
              </div>

              <div
                className="buttonBox registerBtn"
                onClick={() => {
                  switchTo("register")
                }}
              >
                没有帐号？
                <span>免费注册</span>
              </div>
            </div>
          </div>
        </div>
      </VanPopup>
      <ModalPage isOpen={initData.showBindMail}>
        <div className="max-w-[335px] mx-auto  text-[14px]">
          <div className="px-0.5 flex">
            <img className="w-full m-0 p-0" src={util.buildAssetsPath("images/securityQuestion/mailBindTitle.png")} />
          </div>
          <div className="bg-white rounded-sm p-1 flex flex-col justify-between">
            <div className="text-black min-h-[114px] flex flex-col justify-center items-center leading-loose">
              <div>请前往绑定邮箱</div>
              <div>
                绑定最高赠送
                <span className="text-red-600">888</span>元彩金
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div
                onClick={() => {
                  router.push("/site/home")
                }}
                className="text-theme border border-theme border-solid rounded-sm h-3.5 flex justify-center items-center"
              >
                取消
              </div>
              <div
                onClick={() => {
                  router.push("/site/bindMail")
                }}
                className="text-white bg-theme rounded-sm h-3.5 flex justify-center items-center"
              >
                前往绑定
              </div>
            </div>
          </div>
        </div>
      </ModalPage>
    </>
  )
}
