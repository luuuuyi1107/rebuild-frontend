import { createRef } from "react"

import YidunVerifyCode, { CaptchaLoadingButton } from "@/components/YidunVerifyCode"
import InputBox from "@/components/InputBox"
import util from "@/magic/util"
import { apiHandler } from "@/action"
import styles from "./style.module.scss"
import { Button, Icon } from "react-onsenui"
import { useRouter } from "@/magic/withRouter"
import { getMobileVerifyCode, sendRegisterMailVerify, register as registerPost } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import questions from "@/components/SecurityInput/questions"
import VanPopup from "@/components/VanPopup"
import { reactive } from "@/magic/hook/vue"
import classNames from "classnames"
import SecureQuestionPopup from "./secure_question_popup"
import { toast } from "@/magic/toast"

export default function RegisterPopup({
  show,
  needMailVerify,
  needCaptcha,
  needMobileVerify,
  needAnswer,
  captchaId,
  switchTo,
}: {
  show: boolean
  needMailVerify: boolean
  needCaptcha: boolean
  needMobileVerify?: boolean
  needAnswer?: boolean
  captchaId?: string
  switchTo: (type: "" | "login" | "register") => void
}) {
  const { router } = useRouter()
  const yidunRef = createRef<YidunVerifyCode>()
  const initData = reactive({
    regType: "email" as "email" | "mobile",
    NECaptchaValidate: "",
    mail: "",
    code: "",
    password: "",
    confirm: "",
    nickname: "",
    mobile: "",
    mobileCode: "",
    chosen: "",
    answer: "",
    referrer: util.getUrlParam("referrer") || util.cache.get("referrer") || "",
    showSecureQuestion: false,
    question_index: -1,
    isCaptchaInit: false,
  })

  const getSmsCode = () => {
    if (!initData.mobile) {
      return toast("手机号必填！")
    }
    apiHandler(() => getMobileVerifyCode({ mobile: initData.mobile }), {
      errorHandler: (res) => {
        toast(res.Message)
      },
    }).then((res) => {
      toast(res.Message)
    })
  }
  const getMailCode = () => {
    if (!initData.mail) {
      return toast("邮箱地址必填！")
    }
    apiHandler(() => sendRegisterMailVerify({ mail: initData.mail, NECaptchaValidate: initData.NECaptchaValidate }), {
      errorHandler: (res) => {
        toast(res.Message)
      },
    }).then((res) => {
      toast(res.Message)
    })
  }
  const register = () => {
    let param: Record<string, string> = {
      masterid: initData.referrer,
      password: initData.password,
    }
    if (initData.regType == "email") {
      param.mail = initData.mail
      param.code = initData.code
    } else if (initData.regType == "mobile") {
      if (!/^(\+?86)?1\d{10}$/.test(initData.mobile)) {
        return toast("请输入有效的手机号码")
      }
      param.mobile = initData.mobile
      param.mobileCode = initData.mobileCode
    }
    if (initData.password.trim().length < 6 || initData.password.trim().length > 16) {
      return toast("密码必须是6-16位字符")
    }
    if (initData.password !== initData.confirm) {
      return toast("请确认密码一致")
    }
    if (needCaptcha) {
      param.NECaptchaValidate = initData.NECaptchaValidate
    }
    if (needAnswer) {
      if (initData.answer === "") {
        return toast("请设定安全问答")
      }
      param.answer = `${initData.question_index > -1 ? initData.question_index + 1 : ""}=${initData.answer}`
    }
    apiHandler(() => registerPost(param), {
      errorHandler: (res) => {
        toast(res.Message)
        initData.NECaptchaValidate = ""
        yidunRef.current?.refresh()
      },
    }).then((res) => {
      util.cache.set("user", res.Data)
      const account = initData.regType === "email" ? initData.mail : initData.mobile
      notificationAsync
        .confirm(`恭喜 ${account || ""} 注册成功\n是否前往设置您的专属昵称?`, {
          className: styles["register-success-dialog"],
          buttonLabels: ["前往设置", "先去逛逛"],
        })
        .then(() => {
          router.push("/site/home")
        })
        .catch(() => {
          router.replace("/site/home")
          router.push("/site/setNickName")
        })
    })
  }

  const onCustomerService = () => {
    notificationAsync
      .confirm("如果您在收件箱中未找到我们的验证码邮件，请留意查收“垃圾邮箱”或“广告邮件”文件夹，以防邮件被误拦。如需帮助，请联系客服处理。", {
        buttonLabels: ["我知道了", "联系客服"],
      })
      .then(() => {
        router.push("/chatlink.html?uid=0")
      })
  }

  return (
    <>
      <VanPopup show={show} className={classNames(styles["login-popup"], styles["bg-linear"])} position="bottom">
        <div className="py-[30px] px-[25px]">
          <div className="content">
            <img
              onClick={() => {
                switchTo("")
              }}
              className="close"
              src={util.buildAssetsPath("/assets/icons/ic_close.png")}
            />
            <div className="tab mb-[20px]">
              <div className={classNames("btn", { active: initData.regType === "email" })} onClick={() => (initData.regType = "email")}>
                邮箱注册
              </div>
              <div className={classNames("btn", { active: initData.regType === "mobile" })} onClick={() => (initData.regType = "mobile")}>
                手机注册
              </div>
            </div>
            {initData.regType === "email" && (
              <>
                <InputBox
                  placeholder="请输入邮箱地址"
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_envelope.svg")} />}
                  type="text"
                  name="email"
                  maxLength={50}
                  onChange={(value: string) => {
                    initData.mail = value
                  }}
                  value={initData.mail}
                />
                {needMailVerify && (
                  <InputBox
                    placeholder="请输入验证码"
                    name="code"
                    onChange={(value: string) => {
                      initData.code = value
                    }}
                    value={initData.code}
                    icon={<img src={util.buildAssetsPath("assets/icons/ic_shield_checked.svg")} />}
                    subfix={
                      <div className="flex items-center">
                        <span className=" text-theme text-13px" onClick={getMailCode}>
                          发送验证码
                        </span>
                        <div className="h-[0.5rem] w-[1px] bg-[#eee] mx-[0.2rem]"></div>
                        <div onClick={onCustomerService} className="text-11px flex flex-col items-center leading-none gap-y-[0.05rem] text-[#AEAEAE]">
                          <img className="w-18px h-18px" src={util.buildAssetsPath("assets/icons/ic_question_gray.svg")} />
                          帮助
                        </div>
                      </div>
                    }
                  />
                )}
              </>
            )}
            {initData.regType === "mobile" && (
              <>
                <InputBox
                  placeholder="请输入手机号"
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_mobile_screen_button.svg")} />}
                  type="text"
                  name="mobile"
                  maxLength={11}
                  onChange={(value: string) => {
                    initData.mobile = value
                  }}
                  value={initData.mobile}
                />
                {needMobileVerify && (
                  <InputBox
                    placeholder="请输入验证码"
                    name="code"
                    onChange={(value: string) => {
                      initData.mobileCode = value
                    }}
                    value={initData.mobileCode}
                    icon={<img src={util.buildAssetsPath("assets/icons/ic_shield_checked.svg")} />}
                    subfix={
                      <div className="flex items-center">
                        <span className=" text-theme text-[13px]" onClick={getSmsCode}>
                          发送验证码
                        </span>
                        <div className="h-[0.5rem] w-[1px] bg-[#eee] mx-[0.2rem]"></div>
                        <div onClick={onCustomerService} className="text-11px flex flex-col items-center leading-none gap-y-[0.05rem] text-[#AEAEAE]">
                          <img className="w-18px h-18px" src={util.buildAssetsPath("assets/icons/ic_question_gray.svg")} />
                          帮助
                        </div>
                      </div>
                    }
                  />
                )}
              </>
            )}
            <InputBox
              placeholder="6-16位登录密码"
              icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
              type="password2"
              maxLength={16}
              name="password"
              onChange={(value: string) => {
                initData.password = value
              }}
              value={initData.password}
            />
            <InputBox
              placeholder="再次确认登录密码"
              icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
              type="password2"
              maxLength={16}
              name="confirm"
              onChange={(value: string) => {
                initData.confirm = value
              }}
              value={initData.confirm}
            />
            {needAnswer && (
              <>
                <InputBox
                  placeholder="安全问题"
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_circle_question.svg")} />}
                  subfix={<Icon icon="fa-chevron-down" className="text-[15px] text-[#ccc]" />}
                  type="text"
                  name="question"
                  maxLength={50}
                  readOnly
                  onClick={() => {
                    initData.showSecureQuestion = true
                  }}
                  value={questions[initData.question_index]}
                />
                <InputBox
                  placeholder="答案"
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_answer.svg")} />}
                  type="text"
                  name="answer"
                  onChange={(value: string) => {
                    initData.answer = value
                  }}
                  value={initData.answer}
                />
              </>
            )}
            <InputBox
              disabled={util.getUrlParam("referrer") || util.cache.get("referrer")}
              placeholder="推荐人ID（可不填）"
              icon={<img className="w-[18px]" src={util.buildAssetsPath("assets/icons/ic_circle_user.svg")} />}
              type="text"
              name="referrer"
              onChange={(value: string) => {
                initData.referrer = value
              }}
              value={initData.referrer}
            />
            <div className="register-buttons mt-[20px] h-[40px] relative">
              {needCaptcha && captchaId && !initData.NECaptchaValidate && (
                <YidunVerifyCode
                  id="register-verify"
                  CaptchaId={captchaId}
                  className={`verify relative z-10`}
                  onSuccess={(res: { validate: string }) => {
                    initData.NECaptchaValidate = res.validate
                  }}
                  ref={yidunRef}
                  onLoad={() => {
                    initData.isCaptchaInit = true
                  }}
                />
              )}
              {(needCaptcha === false || initData.NECaptchaValidate) && (
                <Button className="w-full text-center relative z-10" onClick={register}>
                  立即注册
                </Button>
              )}
              {!initData.isCaptchaInit && <CaptchaLoadingButton />}
            </div>
            <div
              className="login-reminder mt-[20px] w-full text-center text-[14px]"
              onClick={() => {
                switchTo("login")
              }}
            >
              我已有帐号，立即前往
              <span className="underline text-theme " onClick={() => switchTo("login")}>
                登录
              </span>
            </div>
          </div>
        </div>
      </VanPopup>
      <SecureQuestionPopup
        show={initData.showSecureQuestion}
        onSubmit={(question_index: number) => {
          initData.question_index = question_index
          initData.showSecureQuestion = false
        }}
      />
    </>
  )
}
