import { withRouter } from "@/magic/withRouter"
import { createRef, useState, useRef } from "react"
import { Button, AlertDialog } from "react-onsenui"
import { userLogin } from "@/action/apis"
import InputBox from "@/components/InputBox"
import YidunVerifyCode from "@/components/YidunVerifyCode"
import util from "@/magic/util"
import ModalPage from "@/components/ModalPage"
import questions from "@/components/SecurityInput/questions"
import { notificationAsync } from "@/magic/notification"
import { toast } from "@/magic/toast"

export default withRouter((props) => {
  const [showBindModal, setShowBindModal] = useState(false)
  const safeAnswerRef = useRef("")
  const guidRef = useRef("")
  const safeKeyRef = useRef(0)

  const yidunRef = createRef()
  function handelBindEmailEvent(directToBind) {
    setShowBindModal(false)
    if (directToBind) {
      props.router.replace("/site/home")
      props.router.push("/site/securityQuestion")
    } else {
      props.router.push("/site/home")
    }
  }

  function onVerifySuccess(data) {
    props.updateState({ verifyed: data })
  }

  function securityQuestionCancelEvent() {
    yidunRef.current?.refresh()
    guidRef.current = ""
    safeKeyRef.current = 0
    safeAnswerRef.current = ""
    props.updateState({ verifyed: false })
    document.getElementById("answerBox").getElementsByTagName("input")[0].value = ""
  }

  function check() {
    if (!props.userName) {
      return "账号/手机不能为空!"
    }
    if (!props.password) {
      return "密码不能为空!"
    }
    return ""
  }

  function login() {
    const validate = check()
    if (validate) {
      notificationAsync.alert(validate)
      return
    }

    const postObj = {
      mobile: props.userName,
      password: props.password,
      NECaptchaValidate: props.verifyed?.validate,
      ...(props.clientid ? { clientId: props.clientid } : {}),
      ...(props.loginGuid ? { login_guid: props.loginGuid } : {}),
      ...(props.loginSecrt ? { login_secret: props.loginSecrt } : {}),
      ...(!!guidRef.current ? { verifyGUID: guidRef.current } : {}),
      ...(!!safeKeyRef.current ? { key: safeKeyRef.current } : {}),
      ...(!!safeAnswerRef.current ? { answer: safeAnswerRef.current } : {}),
    }

    props.updateState({ apiLoading: true })
    userLogin(postObj)
      .then((res) => {
        if (res.Code == 1) {
          props.loginResult(res)
          util.cache.setCookie("loginUser", props.userName, "tomorrow")
          const redirect = props.route.query.redirect
          if (!res.Data.Mail && props.needCheckBindEmail && !redirect) {
            setShowBindModal(true)
          }
        } else if (res.Code === -4) {
          guidRef.current = res.Data.VerifyGUID
          safeKeyRef.current = res.Data.AnswerKeys[0]
          notificationAsync
            .prompt(questions[+res.Data.AnswerKeys[0] - 1], {
              title: res.Message,
              beforeSubmit(value) {
                if (!value.trim()) {
                  toast("答案不得为空")
                  throw new Error("answer empty")
                }
              },
            })
            .then((value) => {
              safeAnswerRef.current = value
              login()
            })
        } else {
          notificationAsync.alert(res.Message)
          securityQuestionCancelEvent()
        }
      })
      .finally(() => {
        props.updateState({ apiLoading: false })
      })
  }

  return (
    <>
      <div className="top-box">
        <div
          className="logo"
          onClick={() => {
            props.router.push("/site/home")
          }}
        >
          <img src={util.buildAssetsPath("/assets/logo.gif")} />
        </div>
      </div>

      <div className="content">
        <div className="loginBox">
          <InputBox
            placeholder="请输入账号/手机/邮箱"
            prefix="ion-android-person"
            type="text"
            name="phone"
            maxLength={50}
            onChange={(value) => {
              props.updateState({ userName: value })
            }}
            value={props.userName}
          />
          <InputBox
            placeholder="请输入密码"
            prefix="ion-ios-locked"
            type="password"
            name="password"
            onChange={(value) => {
              props.updateState({ password: value })
            }}
            value={props.password}
          />

          <div
            onClick={() => {
              props.router.push("/site/findPassword")
            }}
            className="tips"
          >
            忘记密码？点击找回
          </div>
          {!!props.userSet.CaptchaId && (
            <div className={props.showYidunButton ? "" : "hide"}>
              <YidunVerifyCode
                ref={yidunRef}
                id="login-verify"
                CaptchaId={props.userSet.CaptchaId}
                className="verify"
                onSuccess={onVerifySuccess.bind(null)}
              />
            </div>
          )}
          <div className={`buttonBox loginBtn ${!props.showYidunButton ? "" : "hide"}`}>
            <Button
              onClick={() => {
                login()
              }}
              disabled={props.apiLoading || props.showModal}
            >
              立即登录
            </Button>
          </div>
          <div
            className="buttonBox registerBtn"
            onClick={() => {
              props.router.push("/site/login", { mode: "register" })
            }}
          >
            <a>没有账号？免费注册</a>
          </div>
        </div>
      </div>

      <ModalPage isOpen={showBindModal}>
        <div className="max-w-[335px] mx-auto  text-[14px]">
          <div className="px-0.5 flex">
            <img className="w-full m-0 p-0" src={util.buildAssetsPath("images/securityQuestion/mailBindTitle.png")} />
          </div>
          <div className="bg-white rounded-sm p-1 flex flex-col justify-between">
            <div className="text-black min-h-[114px] flex flex-col justify-center items-center leading-loose">
              <div>请前往绑定邮箱</div>
              <div>
                绑定最高赠送
                <font className="text-red-600">888</font>元彩金
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div
                onClick={handelBindEmailEvent.bind(null, false)}
                className="text-theme border border-theme border-solid rounded-sm h-3.5 flex justify-center items-center"
              >
                取消
              </div>
              <div onClick={handelBindEmailEvent.bind(null, true)} className="text-white bg-theme rounded-sm h-3.5 flex justify-center items-center">
                前往绑定
              </div>
            </div>
          </div>
        </div>
      </ModalPage>
    </>
  )
})
