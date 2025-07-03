import { useEffect, useRef, useState } from "react"
import util from "@/magic/util"
import ModalPage from "@/components/ModalPage"
import InitPage from "./components/init"
import LoadingPage from "./components/loading"
import SuccessPage from "./components/success"
import SwitchPage from "./components/switch"
import FailturePage from "./components/failure"
import Bus from "@/magic/EventBus"
import { set } from "lodash"

// 本地存储键名
const HIDE_WEAK_NETWORK_KEY = "hide_weak_network_until"

interface WeakDetectingProps {
  slowThreshold?: number // 慢速阈值，单位：毫秒，默认 250ms
  verySlowThreshold?: number // 超慢阈值，单位：毫秒，默认 500ms
  slowCount?: number // 连续慢速次数，默认 3 次
}

export interface iLocationResult {
  location: string
  status: Network_Status
  responseTime: number
  index: number
  success: boolean
}

interface iDomainData {
  Domain: string
  UserIP: string
  Host: string
}

interface iGetPushData {
  Domain?: iDomainData
  latency: number
}

export enum NetWork_Type {
  failture = -1,
  init,
  checking,
  switch,
  success,
}

export enum Network_Status {
  none = -1,
  weak,
  normal,
  best,
}

const WeakDetecting: React.FC<WeakDetectingProps> = ({ slowThreshold = 300, verySlowThreshold = 700, slowCount = 3 }) => {
  const [showModal, setShowModal] = useState(false)
  const [skipChecking, setSkipChecking] = useState(false)
  const [userLocationData, setUserLocationData] = useState({ host: "", ip: "" })
  const [dontShowToday, setDontShowToday] = useState(false)
  const [mode, setMode] = useState(NetWork_Type.init)
  const [locationResults, setLocationResults] = useState<iLocationResult[]>([])
  const slowCountRef = useRef(slowCount) // 计数器，记录连续慢速次数
  // 检查是否应该隐藏弹窗（基于用户之前的选择）
  const shouldHideNotification = () => {
    const hideUntilTimestamp = util.cache.get(HIDE_WEAK_NETWORK_KEY)
    if (hideUntilTimestamp) {
      const hideUntil = parseInt(hideUntilTimestamp, 10)
      return Date.now() < hideUntil
    }
    return false
  }

  // 设置"今日不显示"
  const setHideUntilTomorrow = (time: number = 24 * 60 * 60 * 1000) => {
    // 设置24小时后的时间戳
    const waitTime = Date.now() + time
    util.cache.set(HIDE_WEAK_NETWORK_KEY, waitTime.toString())
  }

  // 检测网络质量并获取可用线路
  const checkNetworkQuality = async (data: iGetPushData) => {
    if (data.Domain.Domain === "" || data.Domain.Domain.split(",").filter((v) => !!v).length === 0 || !data.Domain.UserIP) {
      return
    }

    if (!skipChecking) {
      if (data.latency <= slowThreshold) {
        slowCountRef.current = slowCount // 重置计数器
        return
      }
      if (data.latency > slowThreshold && data.latency <= verySlowThreshold) {
        slowCountRef.current-- // 减少计数器
        if (slowCountRef.current > 0) {
          return
        }
      } else if (data.latency > verySlowThreshold) {
        if (slowCountRef.current > 0) {
          slowCountRef.current = 0
          return
        }
      }
    } else {
      setSkipChecking(false)
    }

    const locationResults = await handleLocationData([data.Domain.Host].concat(data.Domain.Domain.split(",")))
    setLocationResults(locationResults)
    setUserLocationData({ host: data.Domain.Host, ip: util.ipv6ToIpv4Format(data.Domain.UserIP) })
    setShowModal(true)
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    if (dontShowToday) {
      setHideUntilTomorrow() // 设置24小时后不再弹出
    } else {
      // if (mode !== NetWork_Type.success)
      setHideUntilTomorrow(30 * 1000) // 设置30秒后不再弹出
    }
    slowCountRef.current = slowCount // 重置计数器
    setShowModal(false)
    setTimeout(() => {
      setMode(NetWork_Type.init)
    }, 500)
  }

  const handleLocationData = (locations: string[], timeoutLimit: number = 2500): Promise<iLocationResult[]> => {
    return new Promise((resolveAll, rejectAll) => {
      const fetchPromises = locations.map((location, index) => {
        return new Promise<iLocationResult>((resolve) => {
          const startTime = Date.now()

          // 设置超时处理
          const timeoutId = setTimeout(() => {
            resolve({
              location,
              status: Network_Status.none, // 超时认为网络较差
              responseTime: timeoutLimit,
              index,
              success: false,
            })
          }, timeoutLimit)
          // fetch(`https://${location}/web/api/health-check.json`, {
          fetch(`https://${location}/User/GetPush?keys=domain&Authorization=null`, {
            method: "GET",
            mode: "no-cors", // 这会使回应不可读取
          })
            .then((res) => {
              // 清除超时定时器
              console.log({ res })
              clearTimeout(timeoutId)
              const endTime = Date.now()
              const responseTime = endTime - startTime
              // 根据响应时间判断网络状态
              let status: Network_Status = responseTime === timeoutLimit ? Network_Status.none : Network_Status.normal
              resolve({
                location,
                status,
                responseTime,
                index,
                success: true,
              })
            })
            .catch((error) => {
              // 清除超时定时器
              clearTimeout(timeoutId)
              resolve({
                location,
                status: Network_Status.none,
                responseTime: timeoutLimit,
                index,
                success: false,
              })
            })
        })
      })

      // 等待所有网络测试完成
      Promise.all(fetchPromises)
        .then((results) => {
          const bestTime = Math.min(...results.map(({ responseTime }) => responseTime))
          resolveAll(
            results.map((result) => ({
              ...result,
              status: result.responseTime === bestTime && result.responseTime < timeoutLimit ? Network_Status.best : result.status,
            }))
          )
        })
        .catch(rejectAll)
    })
  }

  const directionUrl = (nextLocation: string) => {
    if (userLocationData.host === nextLocation) {
      setShowModal(false)
      setTimeout(() => {
        setMode(NetWork_Type.success)
        setShowModal(true)
      }, 500)
    } else {
      const token = util.getUserByKey("Token")
      const currentLocation = new URL(location.href)
      const directUrl = `https://${nextLocation}/web${currentLocation.hash}`
      const connection = directUrl.includes("?") ? "&" : "?"
      handleCloseModal()
      location.href = `${directUrl}${connection}networkStatus=${NetWork_Type.success}&token=${token}`
    }
  }

  const getTriggerData = (res: iGetPushData) => {
    if (showModal || shouldHideNotification() || !res?.Domain) return
    checkNetworkQuality(res)
  }

  useEffect(() => {
    if (util.getUrlParam("networkStatus") === NetWork_Type.success + "") {
      setSkipChecking(true)
      setMode(NetWork_Type.success)
      return
    }
  }, [])

  useEffect(() => {
    // 初始检测
    Bus.on("getPush.trigger", getTriggerData)

    // 清理定时器
    return () => {
      Bus.off("getPush.trigger")
    }
  }, [showModal, skipChecking])

  useEffect(() => {
    if (mode !== NetWork_Type.checking) return
    handleLocationData(locationResults.map(({ location }) => location)).then((results: iLocationResult[]) => {
      setLocationResults(results)
      setMode(NetWork_Type.switch)
    })
  }, [mode])

  return (
    <>
      {showModal && (
        <ModalPage isOpen={showModal}>
          <div className="inner w-[90%] max-w-[321px] mx-auto overflow-visible pt-[11px]">
            <div className="rounded-t-[6px] bg-theme text-white font-[500] text-[16px] py-[10px] relative">
              提示
              {mode === NetWork_Type.init && (
                <div
                  className="rounded-full bg-white/80 absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex justify-center items-center cursor-pointer"
                  onClick={handleCloseModal}
                >
                  <img className="w-1 h-1" src={util.buildAssetsPath("assets/icons/ic_cross.svg")} />
                </div>
              )}
            </div>

            <div className="p-[12px] text-[16px] pt-[20px] bg-white rounded-b-[6px]">
              {mode === NetWork_Type.checking && <LoadingPage />}

              {mode === NetWork_Type.success && <SuccessPage handleNetworkDiagnose={setMode} onClose={handleCloseModal} />}

              {mode === NetWork_Type.failture && <FailturePage ip={userLocationData.ip} handleNetworkDiagnose={setMode} onClose={handleCloseModal} />}

              {mode === NetWork_Type.init && (
                <InitPage
                  handleNetworkDiagnose={setMode}
                  ip={userLocationData.ip}
                  handleDontShowChange={setDontShowToday}
                  dontShowToday={dontShowToday}
                  onConfirm={() => {
                    const nextLocation = locationResults.find((result) => result.status === Network_Status.best)?.location
                    if (!nextLocation) {
                      setMode(NetWork_Type.failture)
                      return
                    }
                    directionUrl(nextLocation)
                  }}
                />
              )}

              {mode === NetWork_Type.switch && (
                <SwitchPage
                  changeLocation={directionUrl}
                  locations={locationResults}
                  handleNetworkDiagnose={setMode}
                  onClose={handleCloseModal}
                  ip={userLocationData.ip}
                />
              )}
            </div>
          </div>
        </ModalPage>
      )}
    </>
  )
}

export default WeakDetecting
