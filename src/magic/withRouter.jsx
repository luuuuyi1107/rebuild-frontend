import React, { useEffect } from "react"
import { useNavigate, useParams, useLocation, useNavigationType } from "react-router-dom"
import util from "./util"
import Bus from "@/magic/EventBus"

export const withRouter = (Component) => {
  return React.forwardRef((props, ref) => {
    const { route, router } = useRouter()
    return <Component ref={ref} route={route} router={router} {...props} />
  })
}

export const useRouter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const route = {
    ...location,
    params,
    get query() {
      return location.search
        ? Object.fromEntries(
            location.search
              .substring(1)
              .split("&")
              .map((searchString) => {
                const [key, value] = searchString.split("=")
                return [key, decodeURI(value)]
              })
          )
        : {}
    },
  }
  return {
    route,
    router: {
      push(uri, params, options = {}) {
        navigate(`${uri}${params ? "?" + this.stringify({ ...route.query, ...params }) : ""}`, options)
        if (uri !== "/site/home" && uri !== "/site/login") {
          const pushCount = (parseInt(util.cache.get("pushCount")) || 0) + 1
          util.cache.set("pushCount", pushCount)
        }
      },
      back(num = -1) {
        Bus.emit("page.ProgrammaticBack", true)
        const pushCount = parseInt(util.cache.get("pushCount"))
        if (document.referrer.includes("Default.Aspx") && !pushCount) {
          util.directToOldVersion()
          return
        }
        util.cache.set("pushCount", pushCount - 1)
        navigate(num)
      },
      replace(uri, params, options = {}) {
        navigate(`${uri}${params ? "?" + this.stringify({ ...route.query, ...params }) : ""}`, { ...options, replace: true })
      },
      isLoginToOrRedirect(uri, params, redirectTo = "/site/login") {
        util.isLogin() ? this.push(uri, params) : navigate(redirectTo)
      },
      stringify(params = {}) {
        return Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&")
      },
    },
  }
}

export const redirect = (uri, params, options = {}) =>
  React.forwardRef(() => {
    const { router } = useRouter()
    useEffect(() => {
      router.replace(uri, params, options)
    }, [])
    return <></>
  })
