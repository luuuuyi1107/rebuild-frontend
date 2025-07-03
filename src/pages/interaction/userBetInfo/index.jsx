import SimpleLayout from "@/components/SimpleLayout"
import FriendRecords from "@/pages/interaction/newBroadcast/Friends/records"
import SendingFriend from "@/pages/interaction/newBroadcast/Friends/sending"
import { getFriendList } from "@/action/apis"
import { useEffect, useState, useMemo } from "react"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  let { Avatar = "", ID = -1, Name = "" } = props.route.query || {}
  if (Avatar.includes("%")) {
    Avatar = decodeURIComponent(Avatar)
  }

  const DEFAULT_NAME = "玩家资料"
  const [NickName, setNickName] = useState(Name)
  const [existFriends, setExistFriends] = useState(null)
  const [displayMode, setDisplayMode] = useState("records")
  const [friendBet, setFriendBet] = useState(null)
  const [headerName, setHeaderName] = useState(DEFAULT_NAME)

  const isExistFriend = useMemo(() => {
    return existFriends?.find((friend) => {
      return friend.UID == ID
    })
  }, [existFriends])

  useEffect(() => {
    fetchFriendList()
  }, [])

  useEffect(() => {
    if (!friendBet) {
      setHeaderName(DEFAULT_NAME)
      return
    }
    setHeaderName(friendBet.Name)
  }, [friendBet])

  async function fetchFriendList() {
    const res = await getFriendList()
    if (res.Code !== 1) return
    setExistFriends(res.Data)
  }

  if (!ID) {
    return null
  }
  return (
    <SimpleLayout
      headerClassName={(headerName === DEFAULT_NAME ? "bg-white" : "bg-broadcast text-black") + " px-[15px] py-[9px]"}
      className="bg-white text-black min-h-svh"
      center={headerName}
      onBack={() => {
        props.router.back()
      }}
      right={null}
    >
      {displayMode === "records" ? (
        <FriendRecords
          ID={ID}
          Avatar={Avatar}
          NickName={NickName}
          isExistFriend={isExistFriend}
          onInvite={(data) => {
            setNickName(data.NickName)
            setDisplayMode("sending")
          }}
          onRecord={(bet) => {
            console.log({ bet, ID })
            // setFriendBet(bet)
            // setDisplayMode("record")
            switch (bet.LotteryID) {
              case 11:
                props.router.isLoginToOrRedirect(`/interaction/baccaratBetRecord`, { userID: ID })
                break
              default:
                props.router.isLoginToOrRedirect(`/lottery/betRecord`, { id: bet.LotteryID, userID: ID })
                break
            }
          }}
        />
      ) : (
        <SendingFriend
          ID={ID}
          NickName={NickName}
          onClose={() => {
            setDisplayMode("record")
          }}
        />
      )}
    </SimpleLayout>
  )
})
