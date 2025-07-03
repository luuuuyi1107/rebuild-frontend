import React, { createRef, useEffect, useState } from "react"
import LayoutPage from "@/components/LayoutPage"
import { withRouter } from "@/magic/withRouter"
import styles from "./style.module.scss"
import InputBox from "@/components/InputBox"
import { Button, Icon, Checkbox } from "react-onsenui"
import classNames from "classnames"
import util from "@/magic/util"
import { getPush, sendCodeToMail, setNewPassword } from "@/action/apis"
import { apiHandler } from "@/action"
import YidunVerifyCode, { CaptchaLoadingButton } from "@/components/YidunVerifyCode"
import { toast } from "@/magic/toast"
import { reactive } from "@/magic/hook/vue"

export default withRouter(({ router, route }) => {
  const LOGIN_TYPE = 0
  const WITHDRAW_TYPE = 1
  const [mail, setMail] = useState("")
  const [type, setType] = useState(route.query.type ? +route.query.type : LOGIN_TYPE)
  const [step, setStep] = useState(1)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [userSet, setUserSet] = useState(null)
  const [extend, setExtend] = useState(false)

  const initData = reactive({
    NECaptchaValidate: "",
    isCaptchaInit: false,
  })

  const isLogin = type == LOGIN_TYPE
  const isWithdraw = type == WITHDRAW_TYPE
  const needVerify = userSet ? userSet.LoginVerification == 2 : null

  const yidunRef = createRef()
  const checkAndToStep2 = async () => {
    if (!mail) {
      return await toast("邮箱地址必填")
    }
    if (!util.validateEmail(mail)) {
      return await toast("邮箱格式错误")
    }
    await apiHandler(() => sendCodeToMail(Object.assign({ mail, type }, needVerify ? { NECaptchaValidate: initData.NECaptchaValidate } : {})), {
      errorHandler: (res) => {
        initData.NECaptchaValidate = ""
        initData.isCaptchaInit = false
        toast(res.Message)
        yidunRef.current?.refresh()
      },
    })
    setStep(2)
  }
  const checkAndSetNewPassword = async () => {
    if (password !== passwordConfirm) {
      return await toast("确认密码与新密码不相符")
    }
    await apiHandler(() => setNewPassword({ code, type, pass: password }))
    await toast("修改密码成功")
    router.back()
  }
  const init = async () => {
    const res = await getPush({ keys: ["servicelink", "userset"] })
    setUserSet(res.Data.UserSet)
  }

  const yidunReady = () => {
    const targetElements = document.querySelectorAll(".yidun_panel")
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          // 检查每个目标元素的display属性
          targetElements.forEach((element) => {
            const displayStyle = element.style.display
            setExtend(displayStyle === "block")
          })
        }
      }
    })

    // // 开始监听
    targetElements.forEach((element) => {
      observer.observe(element, { attributes: true })
    })
  }

  useEffect(() => {
    init()
  }, [])
  return (
    <LayoutPage
      onBack={() => {
        router.back()
      }}
      className={styles["site-findPassword"]}
      center="找回密码"
      right={null}
    >
      <div className="top-box"></div>
      <div className="content">
        {step == 1 && (
          <div className={classNames("loginBox", { extend })}>
            <InputBox
              placeholder="请输入邮箱地址"
              icon={<img src={util.buildAssetsPath("assets/icons/ic_envelope.svg")} />}
              type="text"
              name="mail"
              onChange={(value) => {
                setMail(value)
              }}
              value={mail}
            />
            <div className={classNames("input-section")}>
              <div className="w-3 flex items-center justify-center">
                <img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />
              </div>
              <div className="flex">
                <div className="h-full flex items-center text-[14px]" onClick={() => setType(LOGIN_TYPE)}>
                  <Checkbox inputId={"type"} className="login-checkbox scale-[64%] mr-0.25" checked={isLogin} />
                  <span>登录密码</span>
                </div>
                <div className="h-full flex items-center text-[14px] ml-1" onClick={() => setType(WITHDRAW_TYPE)}>
                  <Checkbox inputId={"type"} className="login-checkbox scale-[64%] mr-0.25" checked={isWithdraw} />
                  <span>提款密码</span>
                </div>
              </div>
            </div>

            <div className="register-buttons mt-[20px] h-[40px] relative">
              {needVerify && !initData.NECaptchaValidate && (
                <YidunVerifyCode
                  ref={yidunRef}
                  CaptchaId={userSet?.CaptchaId}
                  className="verify relative z-10"
                  onReady={yidunReady}
                  onSuccess={(data) => {
                    initData.NECaptchaValidate = data.validate
                    setExtend(false)
                  }}
                  onLoad={() => {
                    setTimeout(() => {
                      initData.isCaptchaInit = true
                    }, 1000)
                  }}
                />
              )}
              {needVerify && initData.NECaptchaValidate && (
                <Button className="relative z-10 w-full text-center" onClick={checkAndToStep2}>
                  验证成功, 下一步
                </Button>
              )}
              {needVerify === false && (
                <Button className="relative z-10 w-full text-center" onClick={checkAndToStep2}>
                  下一步
                </Button>
              )}
              {!initData.isCaptchaInit && <CaptchaLoadingButton />}
            </div>
          </div>
        )}
        {step == 2 && (
          <div className="loginBox">
            <InputBox
              placeholder="请输入验证码"
              icon={<img src={util.buildAssetsPath("assets/icons/ic_shield_checked.svg")} />}
              type="text"
              name="code"
              onChange={(value) => {
                setCode(value)
              }}
              value={code}
            />
            {isLogin ? (
              <>
                <InputBox
                  placeholder={`请输入新的登录密码`}
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
                  type="password"
                  name="password"
                  onChange={(value) => {
                    setPassword(value)
                  }}
                  value={password}
                />
                <InputBox
                  placeholder={`请确认登录密码`}
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
                  type="password"
                  name="passwordConfirm"
                  onChange={(value) => {
                    setPasswordConfirm(value)
                  }}
                  value={passwordConfirm}
                />
              </>
            ) : (
              <>
                <InputBox
                  placeholder={`请输入新的提款密码`}
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
                  type="text"
                  name="password"
                  maxLength={4}
                  onChange={(value) => {
                    setPassword(value)
                  }}
                  value={password}
                />
                <InputBox
                  placeholder={`请确认提款密码`}
                  icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
                  type="text"
                  name="passwordConfirm"
                  maxLength={4}
                  onChange={(value) => {
                    setPasswordConfirm(value)
                  }}
                  value={passwordConfirm}
                />
              </>
            )}

            <div className={`buttonBox loginBtn`}>
              <Button onClick={checkAndSetNewPassword}>提交</Button>
            </div>
          </div>
        )}
      </div>
      <span className="pl-[0.6rem]  text-[14px]">
        未绑定邮箱？
        <span
          className="text-theme underline"
          onClick={() => {
            util.callService()
          }}
        >
          点我找回
        </span>
      </span>
    </LayoutPage>
  )
})
