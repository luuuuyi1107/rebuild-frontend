import { useEffect } from "react"
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom"
import loadable from "@loadable/component"
import LayoutPage from "@/components/LayoutPage"
import util from "./magic/util"
import "@/_onsen-css-base/onsenui.css"
import "@/_onsen-css-components/onsen-css-components.css"
import "@/_theme/common.scss"
import "./style/icon.scss"
import "./style/index.scss"
import Msgpopup from "@/components/Msgpopup"
import Bus from "./magic/EventBus"
import { getPush } from "./action/apis"
import { apiHandler } from "./action"
import BroadcastContext from "@/contexts/BroadcastContext"
import EmojiProvider from "@/contexts/EmojiContext"
import NewBroadcast from "@/pages/interaction/newBroadcast"
import Chatchannel from "@/pages/interaction/chatchannel"
import WeakDetecting from "@/components/WeakDetecting"

const useLazyLoad = import.meta.env.VITE_LAZY_LOAD === "true"
const modules = {}
// useLazyLoad == true
// useLazyLoad == false
// const useLazyLoad = false
// const modules = import.meta.glob("./pages/**/index.{js,jsx,tsx}", {
//   import: "default",
//   eager: true,
// })
const chats = ["interaction/newBroadcast", "interaction/chatchannel"]
const removed = chats.concat(
  import.meta.env.VITE_FORUM_ENABLE === "false"
    ? [
        "site/forum",
        "site/forumDetails",
        "site/forumDetailsNew",
        "site/forumDonateList",
        "site/forumFollowList",
        "site/forumListContent",
        "site/forumPersonal",
        "site/forumTicketList",
      ]
    : []
)

const MyReplaceNavigate = () => {
  console.warn(`route ${location.href} not found and replace to home!!`)
  return <Navigate to="/site/home" replace />
}

const APP = () => {
  const location = useLocation() // 获取当前路由的 location 对象
  return (
    <BroadcastContext currentPath={location.pathname}>
      <Routes location={location}>
        {useLazyLoad
          ? __PAGES_ROUTES__
              .filter((route) => !removed.includes(route))
              .map((route, i) => {
                const Component = loadable(() => import(`./pages/${route}`), {
                  fallback: <LayoutPage className="empty-page" center={() => ""} />,
                })
                return <Route path={route} key={i} element={<Component />} />
              })
          : Object.keys(modules)
              .filter((route) => !removed.some((path) => route.includes(path)))
              .map((route, i) => {
                const path = route.replace(/\.\/pages\/(.*)\/index.(jsx?|tsx)/, "$1")
                const Component = modules[route]
                return <Route path={path} key={i} element={<Component />} />
              })}

        <Route path="*" element={<MyReplaceNavigate />} />

        <Route
          element={
            <EmojiProvider>
              <Outlet />
            </EmojiProvider>
          }
        >
          <Route path="interaction/newBroadcast" element={<NewBroadcast />} />
          <Route path="interaction/chatchannel" element={<Chatchannel />} />
        </Route>
      </Routes>
    </BroadcastContext>
  )
}

export default () => {
  let getPushTimer: number
  useEffect(() => {
    ;(async () => {
      document.body.classList.remove("loading")
      const getPushData = async () => {
        if (util.cache.get("isJumpingThirdGame")) {
          const time = +util.cache.get("isJumpingThirdGame")
          if (time + 1000 * 60 * 5 > Date.now()) {
            return
          }
        }
        const startTime = Date.now()
        const res = await apiHandler(() => getPush({ keys: ["fristlatestmsg", "broadcast", "domain"] }), { errorHandler: () => {} })
        Bus.emit("getPush.trigger", { ...res.Data, latency: Date.now() - startTime })
        util.triggerEvent("globalMessage", res.Data)
        if (res.Data.MsgCount.Service_Msgs > 0) util.triggerEvent("fetchServiceMessage")
        if (res.Data.MsgCount.PopUpsMsg) util.triggerEvent("popupMessage", res.Data.MsgCount.PopUpsMsg)
      }
      const startCounter = () => {
        getPushData()
        getPushTimer = setInterval(getPushData, 5000)
      }
      const stopCounter = () => {
        getPushTimer && clearInterval(getPushTimer)
      }
      Bus.on("getPush.start", startCounter)
      Bus.on("getPush.stop", stopCounter)
      setTimeout(() => {
        document.body.classList.remove("broadcastchats")
      }, 1000)
      startCounter()
    })()

    return () => {
      Bus.off("getPush.start")
      Bus.off("getPush.stop")
    }
  }, [])

  return (
    <Router>
      <APP />
      <Msgpopup />
      <WeakDetecting />
    </Router>
  )
}
