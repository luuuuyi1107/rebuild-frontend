import util from "@/magic/util"
import styles from "./style.module.scss"
import VanPopup from "@/components/VanPopup"
import { useRouter } from "@/magic/withRouter"
import { apiHandler } from "@/action"
import { createTrialAccount } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default function BasicPopup({ show, switchTo }: { show: boolean; switchTo: (type: "" | "login" | "register") => void }) {
  const { router } = useRouter()
  return (
    <VanPopup show={show} className={styles["login-popup"]} position="bottom">
      <div className="py-[20px] px-[30px]">
        <div className="basic">
          <div
            className="login font-medium"
            onClick={() => {
              switchTo("login")
            }}
          >
            登录
          </div>
          <div
            className="register font-medium"
            onClick={() => {
              switchTo("register")
            }}
          >
            注册
          </div>
          <div className="others">
            <div
              className="section"
              onClick={() => {
                apiHandler(() => createTrialAccount(), { useToast: true })
                  .then((res) => {
                    util.cache.set("user", res.Data.Data)
                    return notificationAsync.alert(
                      `<div className="text-center text-gray-500">
                        <div>您的试玩帐号为: ${res.Data.TrialAccount}</div>
                        <div>初始密码为: ${res.Data.TrialPassword}</div>
                      </div>`,
                      { title: "温馨提示", buttonLabels: ["我知道了"] }
                    )
                  })
                  .then(() => {
                    router.push("/site/home")
                  })
              }}
            >
              <img src={util.buildAssetsPath("/assets/icons/ic_game.svg")} alt="" />
              <span>一键试玩</span>
            </div>
            <div className="section" onClick={() => router.push("/site/home")}>
              <img className="icon" src={util.buildAssetsPath("/assets/icons/ic_play.svg")} alt="" />
              <span>先去逛逛</span>
            </div>
            <div
              className="section"
              onClick={() => {
                util.callService()
              }}
            >
              <img className="icon" src={util.buildAssetsPath("/assets/icons/ic_customer.svg")} alt="" />
              <span>在线客服</span>
            </div>
          </div>
        </div>
      </div>
    </VanPopup>
  )
}
