import LayoutPage from "@/components/LayoutPage"
import styles from "./style.module.scss"
import { getOrderUserData, getOrderUserCreaditLogs } from "@/action/apis"
import { apiHandler } from "@/action"
import util from "@/magic/util"
import AvatarImg from "@/components/AvatarImg"
import myFetch from "../userData/myFetch"
import { useEffect, useState } from "react"

export default () => {
  const [orderUserData, setOrderUserData] = useState({})
  const [logs, setLogs] = useState([])
  const { isApiLoading, callApi, user, levelImgMap } = myFetch()
  const loadData = () => {
    callApi(async () => {
      const [orderUserRes, logsRes] = await Promise.all([apiHandler(() => getOrderUserData()), apiHandler(() => getOrderUserCreaditLogs())])
      setOrderUserData(orderUserRes.Data)
      setLogs(logsRes.Data.List)
    })
  }
  useEffect(() => {
    loadData()
  }, [])

  return (
    <LayoutPage
      apiLoading={isApiLoading}
      center="信用日志"
      className={styles["order-post-credit-logs"]}
      right={
        <div onClick={loadData} className="text-1.25 text-white pr-1 font-bold">
          <img style={{ width: 16 }} className="mr-0.5 relative top-[2px]" src={util.buildAssetsPath("assets/icons/ic_recheck.png")} />
          刷新
        </div>
      }
    >
      <div className="bg-theme pt-0.5">
        <div className="user-section bg-theme table w-full">
          <div className="flex justify-center">
            <div className="mr-1">
              <AvatarImg avatarLink={user.Avatar.FilePath} width={80} height={80} shape="circle" />
            </div>
            <div>
              <div className="info flex items-center mb-1">
                <div className="text-white text-1.25 mr-1">
                  <span className="mr-1">ID</span>
                  <span className="">{user.NickName}</span>
                </div>
                <div className="level flex justify-center">
                  <div className="bg-white text-theme p-0.5 px-1 rounded-full flex items-center">
                    {levelImgMap[orderUserData.Level] && (
                      <img src={util.buildAssetsPath(`assets/icons/${levelImgMap[orderUserData.Level]}`)} className="w-1.5 mr-1" />
                    )}
                    <span className="text-1.25 mr-1">LV{orderUserData.Level}</span>
                  </div>
                </div>
              </div>
              <div className="credit">
                <div className="flex-1 bg-[#D66B00] rounded-full flex text-white p-0.5 px-1 mr-1 items-center">
                  <div className="rounded-full text-theme bg-white w-1.5 h-1.5 text-1.25 mr-1 text-center">
                    <span className="ion-star"></span>
                  </div>
                  <span className="text-1.25 mr-1">信用分数</span>
                  <span className="text-1.5">{orderUserData.Credit?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="info-section p-1 text-1.25 text-center">
          <div className="bg-white rounded p-1">
            <table className="table-auto w-full" cellSpacing="0">
              <thead>
                <tr>
                  <td className="py-[0.2rem] border-solid border-0 border-b border-b-gray-300">成交金额</td>
                  <td className="py-[0.2rem] border-solid border-0 border-b border-b-gray-300">积分</td>
                  <td className="py-[0.2rem] border-solid border-0 border-b border-b-gray-300">时间</td>
                </tr>
              </thead>
              <tbody className="text-1.5">
                {logs.map((log) => (
                  <tr key={log.ID}>
                    <td className="py-[0.2rem] border-solid border-0 border-b border-b-gray-300">{log.Money}</td>
                    <td className="py-[0.2rem] border-solid border-0 border-b border-b-gray-300">{log.Credit?.toFixed(2)}</td>
                    <td className="py-[0.2rem] border-solid border-0 border-b border-b-gray-300 text-gray-400">
                      {util.date.format(util.date.toDate(log.Time), "YYYY-MM-DD hh:mm", 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutPage>
  )
}
