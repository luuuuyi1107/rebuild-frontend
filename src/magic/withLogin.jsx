import React, { useEffect, useState } from "react"
import util from "./util"
import { useRouter } from "./withRouter"
import Bus from "./EventBus"
import { toast } from "./toast"

// react-auth-kit
export const withLogin = (Component) =>
  React.forwardRef((props, ref) => {
    useLoginOrRedirect()
    return util.isLogin() ? <Component ref={ref} {...props} /> : <></>
  })

export const withLoginExceptTrial = (Component) =>
  React.forwardRef((props, ref) => {
    useLoginOrRedirect()
    useTrialCheck()
    return !util.isTrialAccount() ? <Component ref={ref} {...props} /> : <></>
  })

export const withTrialCheck = (Component) =>
  React.forwardRef((props, ref) => {
    useTrialCheck()
    return !util.isTrialAccount() ? <Component ref={ref} {...props} /> : <></>
  })

export const useTrialCheck = () => {
  const { router } = useRouter()
  useEffect(() => {
    if (util.isTrialAccount()) {
      toast("试玩账号不允许此操作")
      router.back()
    }
  }, [])
}
export const useLoginOrRedirect = () => {
  const { router } = useRouter()
  useEffect(() => {
    if (!util.isLogin()) {
      router.replace("/site/login")
    }
  }, [])
}
