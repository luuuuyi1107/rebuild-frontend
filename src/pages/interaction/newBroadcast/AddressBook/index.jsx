import { getFriendList, getRequestFriendList2 } from "@/action/apis"
import { useEffect, useState, useMemo } from "react"
import { managerSrc } from "@/components/BroadcastWork/constants.ts"
import InputText from "../InputText"
import Book from "./Book"
import NewFriends from "./New"
import Groups from "./Group"
import Bus from "@/magic/EventBus"

export default ({
  onSelect,
  onSelectFriend,
  setSubWork,
  subWork,
  selectRoom,
  requestMembers,
  newRequestFriendLength,
  friendList: members,
  groups,
  showToolBar,
}) => {
  const [search, setSearch] = useState("")

  const friendList = useMemo(() => {
    return (members || [])
      .filter((friend) => {
        // return subWork === "newFriend" ? friend.UID.toString().includes(search) : friend.NickName.toUpperCase().includes(search.toUpperCase())
        return friend.UID.toString().includes(search) || friend.NickName.toUpperCase().includes(search.toUpperCase())
      })
      .map((friend) => ({ ...friend, ID: friend.UID, IsGroup: false }))
  }, [members, subWork, search])

  const checkedRequestMembers = useMemo(() => {
    return requestMembers.map((member) => {
      if (member.Status === 3) {
        const friendId = member.From_UID === util.getUserId() ? member.To_UID : member.From_UID
        if (!friendList.some((friend) => friend.UID === friendId)) {
          delete member.Status
        }
      }
      return member
    })
  }, [friendList, requestMembers])

  const groupList = useMemo(() => {
    const unbookedList = util.cache.get("unbooked") || []
    const Avatar = managerSrc

    const defaultRoom = {
      ID: 0,
      Name: "网站广播",
    }

    return (groups || [])
      .concat(defaultRoom)
      .filter((group) => !unbookedList.includes(group.ID))
      .filter((group) => {
        return subWork === "newFriend" ? group.ID.toString().includes(search) : group.Name.toUpperCase().includes(search.toUpperCase())
      })
      .map((group) => ({ AddTime: "", Avatar, NickName: group.Name, ID: group.ID, IsGroup: true }))
  }, [groups, subWork, search])

  const checkingFriend = (friend) => {
    const UID = friend.UID || friend.ID
    const base = {
      Status: friend.Status,
      isAsking: friend.isAsking || false,
      Note: friend.Note || "",
      RID: friend.RID || null,
    }

    const chatRoom = friend.IsGroup
      ? {
          IsGroup: true,
          GroupID: UID,
          Title: friend.NickName,
          Avatar: "https://76shangchuan.com/touxiang/girl01.png",
        }
      : {
          IsGroup: false,
          IsExisted: friend.IsExisted ?? true,
          UID,
          NickName: friend.NickName,
          Avatar: friend.Avatar,
          AddTime: friend.AddTime,
        }

    onSelect({ ...base, ...chatRoom })
  }

  const scrollToKey = (key) => {
    document.getElementById(`captal-${key}`).scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (subWork === "newFriend") {
      setSearch("")
    }
  }, [subWork])

  return (
    <>
      <InputText
        className={showToolBar ? "" : "pt-[10px]" + (search ? " pr-0" : "")}
        inputHeight="h-[35px]"
        onFocus={() => {
          Bus.emit("broadcast.showToolBar", false)
        }}
        onBlur={(_text) => {
          if (_text) return
          Bus.emit("broadcast.showToolBar", true)
        }}
        placeholder={subWork === "newFriend" ? "会员ID" : "搜索"}
        text={search}
        setText={setSearch}
        // keepHeight
      />

      <div className="p-1 pt-0 bg-white">
        {!subWork && (
          <Book
            newRequestFriendLength={newRequestFriendLength}
            setSubWork={setSubWork}
            friendList={friendList.concat(groupList)}
            onChat={(chat) => {
              if (chat.IsGroup) {
                selectRoom({ Title: chat.NickName, GroupID: chat.ID, IsGroup: true })
              } else {
                checkingFriend(chat)
              }
            }}
            scrollToKey={scrollToKey}
            search={search}
          />
        )}

        {subWork === "newFriend" && <NewFriends onUpdate={() => {}} checkingFriend={checkingFriend} friendList={checkedRequestMembers} />}

        {subWork === "group" && (
          <Groups
            onChat={(chat) => {
              selectRoom(chat)
            }}
            groups={groupList}
          />
        )}
      </div>
    </>
  )
}
