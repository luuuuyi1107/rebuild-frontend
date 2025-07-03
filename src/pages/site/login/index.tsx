// import * as action from "@/action"
// import { getPush } from "@/action/apis"
import LayoutPage from "@/components/LayoutPage"

// import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { useRouter } from "@/magic/withRouter"
// import FingerprintJS from "@fingerprintjs/fingerprintjs"
// import React, { useState, useEffect, useRef } from "react"
import "./style.scss"
// import ModalPage from "@/components/ModalPage"
// import questions from "@/components/SecurityInput/questions"
// import { Button, AlertDialog } from "react-onsenui"
// import InputBox from "@/components/InputBox"
// import { Sheet } from "react-modal-sheet"
import { onMounted, reactive } from "@/magic/hook/vue"
import LoginPopup from "./popup/login_popup"
import BasicPopup from "./popup/basic_popup"
import RegisterPopup from "./popup/register_popup"
import { getPush } from "@/action/apis"
import { apiHandler } from "@/action"
import { UserSetInteface } from "@/interface/get_push"

export default function LoginPage() {
  const { router, route } = useRouter()

  const initData = reactive({
    mode: route.query.mode || "",
    apiLoading: false,
    userset: null as null | UserSetInteface,
  })

  onMounted(() => {
    apiHandler(() => getPush({ keys: ["userset"] })).then((res) => {
      initData.userset = res.Data.UserSet
    })
  })

  const switchTo = (mode: "" | "login" | "register") => {
    initData.mode = mode
    router.replace(`/site/login`, { mode })
  }

  return (
    <LayoutPage
      onBack={() => {
        const redirect = util.getUrlParam("redirect")
        if (redirect) {
          router.replace(redirect)
        } else {
          router.replace("/site/home")
        }
      }}
      apiLoading={initData.apiLoading}
      className="site-login"
      center=""
      right={null}
    >
      <div className="relative">
        <div className="top-box">
          <div className="logo relative">
            <div className="flex justify-center relative z-10 -top-[10px]">
              <img className="title w-[80%]" src={util.buildAssetsPath("/assets/login_title.png")} />
            </div>
            <img className="bg w-[100%] relative -top-[58px]" src={util.buildAssetsPath("/assets/login_bg.png")} />
          </div>
        </div>
        <BasicPopup show={initData.mode === ""} switchTo={switchTo} />
        <LoginPopup
          show={initData.mode === "login"}
          needMailVerify={initData.userset ? initData.userset.UserMailVerify : false}
          needCaptcha={initData.userset ? initData.userset.LoginVerification == 2 : null}
          captchaId={initData.userset?.CaptchaId}
          switchTo={switchTo}
        />
        <RegisterPopup
          show={initData.mode === "register"}
          needMailVerify={initData.userset ? initData.userset.UserMailVerify : false}
          needAnswer={initData.userset?.RegAnswer}
          needCaptcha={initData.userset ? initData.userset.LoginVerification == 2 : null}
          captchaId={initData.userset?.CaptchaId2}
          needMobileVerify={initData.userset?.MobileVerify}
          switchTo={switchTo}
        />
      </div>
    </LayoutPage>
  )
}
