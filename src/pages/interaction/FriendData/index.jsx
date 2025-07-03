import { useState, useEffect, useCallback, useMemo } from "react"
import { withRouter } from "@/magic/withRouter"
import { getUserDataById } from "@/action/apis"
import util from "@/magic/util"
import SimpleLayout from "@/components/SimpleLayout"
import AcceptFriend from "./accept"
import AddFriend from "./add"
import Entr from "./entr"

export default withRouter((props) => {
  const FRIEND_MODE = {
    NORMAL: 0,
    SENDING: 1,
    ACCEPT: 2,
  }
  const ID = util.getUrlParam("ID")
  const RID = util.getUrlParam("RID")
  const Note = util.getUrlParam("Note")

  const NickName = util.getUrlParam("NickName")
  const Avatar = util.getUrlParam("Avatar")
  const [isExistFriend, setIsExistFriend] = useState(JSON.parse(util.getUrlParam("isExistFriend") || "false"))
  const [Status, setStatus] = useState(parseInt(util.getUrlParam("Status") || "1"))
  const [isAsking, setIsAsking] = useState(JSON.parse(util.getUrlParam("isAsking") || "false"))
  const [mode, setMode] = useState(FRIEND_MODE.NORMAL)

  const onFriendEvent = () => {
    if (isExistFriend) {
      props.router.isLoginToOrRedirect("/interaction/chatchannel", { groupId: 0, toId: ID, title: NickName })
    } else if (Status === 0 && isAsking) {
      // setMode(FRIEND_MODE.SENDING)
    } else if (Status === 0 && !isAsking) {
      setMode(FRIEND_MODE.ACCEPT)
    } else {
      setMode(FRIEND_MODE.SENDING)
    }
  }

  useEffect(() => {
    preloadUserData()
  }, [])

  const title = useMemo(() => {
    return mode === FRIEND_MODE.SENDING ? "新增朋友" : mode === FRIEND_MODE.ACCEPT ? "通过朋友验证" : ""
  }, [mode])

  function preloadUserData() {
    if (!ID) return
    const { Time } = util.cache.get(`UserRecordData_${ID}`) ?? {}
    if (Time && Date.now() - Time < 1000 * 60 * 5) return

    getUserDataById(ID).then((res) => {
      if (res.Code !== 1) return
      util.cache.set(`UserRecordData_${ID}`, { Data: res.Data, Time: Date.now() }, "session")
    })
  }

  function onBetInfo() {
    props.router.isLoginToOrRedirect("/interaction/userBetInfo", {
      ID,
      Name: NickName,
      Avatar,
    })
  }

  return (
    <SimpleLayout
      center={title}
      onBack={() => {
        if (mode === FRIEND_MODE.ACCEPT) {
          setMode(FRIEND_MODE.NORMAL)
          return
        }
        props.router.back()
      }}
      className="bg-broadcast min-h-svh"
      headerClassName="bg-white px-[15px] py-[9px]"
    >
      {mode === FRIEND_MODE.NORMAL && (
        <Entr
          isExistFriend={isExistFriend}
          ID={ID}
          Note={Note}
          NickName={NickName}
          Avatar={Avatar}
          Status={Status}
          isAsking={isAsking}
          onBetInfo={onBetInfo}
          onFriendEvent={onFriendEvent}
        />
      )}

      {mode === FRIEND_MODE.ACCEPT && (
        <AcceptFriend
          RID={RID}
          NickName={NickName}
          callback={() => {
            setStatus(3)
            setIsExistFriend(true)
            setMode(FRIEND_MODE.NORMAL)
          }}
        />
      )}

      {mode === FRIEND_MODE.SENDING && (
        <AddFriend
          ID={ID}
          Avatar={Avatar}
          NickName={NickName}
          onClose={() => {
            setStatus(0)
            setIsAsking(true)
            setMode(FRIEND_MODE.NORMAL)
          }}
        />
      )}
    </SimpleLayout>
  )
})
