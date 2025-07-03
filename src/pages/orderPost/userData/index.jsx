import LayoutPage from "@/components/LayoutPage"
import styles from "./style.module.scss"
import { getOrderUserData } from "@/action/apis"
import { apiHandler } from "@/action"
import util from "@/magic/util"
import AvatarImg from "@/components/AvatarImg"
import { useRouter } from "@/magic/withRouter"
import myFetch from "./myFetch"
import { useState, useEffect } from "react"

export default () => {
  const { router } = useRouter()
  const [orderUserData, setOrderUserData] = useState({})
  const { isApiLoading, callApi, user, levelImgMap } = myFetch()
  const loadData = () => {
    callApi(async () => {
      const [orderUserRes] = await Promise.all([apiHandler(() => getOrderUserData())])
      setOrderUserData(orderUserRes.Data)
    })
  }
  useEffect(() => {
    loadData()
  }, [])

  return (
    <LayoutPage
      apiLoading={isApiLoading}
      center="个人中心"
      className={styles["order-post-user-data"]}
      right={
        <div onClick={loadData} className="text-1.25 text-white pr-1 font-bold">
          <img style={{ width: 16 }} className="mr-0.5 relative top-[2px]" src={util.buildAssetsPath("assets/icons/ic_recheck.png")} />
          刷新
        </div>
      }
    >
      <div className="bg-theme pt-0.5">
        <div className="user-section bg-theme table w-full">
          <div className="table-cell text-center">
            <div className="mb-1">
              <AvatarImg avatarLink={user.Avatar.FilePath} width={80} height={80} shape="circle" />
            </div>
            <div className="mb-1 text-white text-1.25">
              <span className="mr-1">ID</span>
              <span className="">{user.NickName}</span>
            </div>
            <div className="level mb-1 flex justify-center">
              <div className="bg-white text-theme p-0.5 px-1 rounded-full flex items-center">
                {levelImgMap[orderUserData.Level] && (
                  <img src={util.buildAssetsPath(`assets/icons/${levelImgMap[orderUserData.Level]}`)} className="w-1.5 mr-1" />
                )}
                <span className="text-1.25 mr-1">LV{orderUserData.Level}</span>
              </div>
            </div>
            <div className="flex px-2">
              <div className="flex-1 bg-[#D66B00] rounded-full flex text-white p-0.5 px-1 mr-1 items-center">
                <div className="rounded-full text-theme bg-white w-1.5 h-1.5 text-1.25 mr-0.5 text-center">
                  <span className="ion-star"></span>
                </div>
                <span className="text-1.25 mr-0.5">信用分数</span>
                <span className="text-1.5">{orderUserData.Credit?.toFixed(2)}</span>
              </div>
              <div
                className="bg-white text-theme p-0.5 px-1 rounded-full flex items-center"
                onClick={() => {
                  router.push("/orderPost/creditLogs")
                }}
              >
                <span className="text-1.25 mr-0.5">信用日志</span>
                <img src={util.buildAssetsPath("assets/icons/icon-arrow-circle-right.png")} className="w-1.5" />
              </div>
            </div>
          </div>
        </div>
        <div className="info-section p-1 text-1.25 text-center">
          <div className="bg-white rounded p-1">
            <div className="flex justify-center mb-2">
              <div className="mr-1.5">
                <div className="bg-[#D66B00] text-white p-0.5 px-2 rounded-full mb-1">买入数量</div>
                <div className="text-1.5">{orderUserData.BuyCount}</div>
              </div>
              <div>
                <div className="bg-[#D66B00] text-white p-0.5 px-2 rounded-full mb-1">买入总额</div>
                <div className="text-1.5">{orderUserData.BuyTotal?.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="mr-0.5">
                <div className="bg-[#FFF2E1] text-theme p-0.5 px-1.5 rounded-full mb-1">卖出数量</div>
                <div className="text-1.5">{orderUserData.SellCount}</div>
              </div>
              <div className="mr-0.5">
                <div className="bg-[#FFF2E1] text-theme p-0.5 px-1.5 rounded-full mb-1">卖出总额</div>
                <div className="text-1.5">{orderUserData.SellTotal?.toFixed(2)}</div>
              </div>
              <div>
                <div className="bg-[#FFF2E1] text-theme p-0.5 px-1.5 rounded-full mb-1">确认均时</div>
                <div className="text-1.5">{orderUserData.ConfirmAvg?.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutPage>
  )
}
