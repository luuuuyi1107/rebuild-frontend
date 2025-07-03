import { useFetch } from "@/magic/hook/useFetch"
import util from "@/magic/util"

export default function myFetch() {
  const { isApiLoading, callApi } = useFetch()
  const user = util.cache.get("user")
  const levelImgMap = {
    1: "icon_level_1-2.png",
    2: "icon_level_1-2.png",
    3: "icon_level_3-4.png",
    4: "icon_level_3-4.png",
    5: "icon_level_5-6.png",
    6: "icon_level_5-6.png",
    7: "icon_level_7-8.png",
    8: "icon_level_7-8.png",
    9: "icon_level_9-10.png",
    10: "icon_level_9-10.png",
  }

  return {
    isApiLoading,
    callApi,
    user,
    levelImgMap,
  }
}
