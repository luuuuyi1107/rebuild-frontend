import { useMemo, Fragment } from "react"
import { groupBy, sortBy } from "lodash"
import util from "@/magic/util"
import FriendItem from "./FriendItem"
import Bus from "@/magic/EventBus"
import Badge from "@/components/Badge"
import { withRouter } from "@/magic/withRouter"

export default withRouter(({ friendList, router, onChat, setSubWork, scrollToKey, search, newRequestFriendLength }) => {
  const groupFriend = useMemo(() => {
    const filteredList = friendList
      .filter((friend) => !friend.IsGroup)
      .filter((friend) => friend.NickName.toUpperCase().includes(search.toUpperCase()) || friend.UID?.toString().includes(search.toUpperCase()))
    return groupBy(sortBy(filteredList, ["NickName"]), (friend) => friend.NickName.charAt(0).toUpperCase())
  }, [friendList, search])

  return (
    <div className="text-[16px]">
      <div
        onClick={() => {
          setSubWork("newFriend")
        }}
        className="border-b-[0.5px] border-[#E5E5E5] border-t-0 border-x-0 border-solid py-1 px-0 flex items-center"
      >
        <div className="bg-[#FA9D3B] w-min-[37.5px] p-0.5 rounded-sm mr-1 relative">
          <Badge count={newRequestFriendLength} className="rounded-full -top-[4px] -right-[8px]">
            <img
              className="my-[1px]"
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCAyNSAxOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNiA2QzUuNSAxIDkgMCAxMC41IDBDMTIgMCAxNSAxIDE0LjUgNkMxNC4yOTgyIDguMDE3NTIgMTMuNDExNCA5LjU4ODU3IDEyLjUgMTAuNUMxMS43IDExLjMgMTIgMTIuNSAxMyAxM0wxNC4wNzExIDEzLjUzNTVDMTQuMDI0MyAxMy44NTAyIDE0IDE0LjE3MjMgMTQgMTQuNUMxNCAxNi4yNDY1IDE0LjY4ODggMTcuODMyMSAxNS44MDk2IDE5SDEwLjVIMi41QzEgMTkgMCAxOSAwIDE4QzAgMTcgMC41IDE2LjUgMS41IDE2TDcuNSAxM0M4LjUgMTIuNSA4LjggMTEuMyA4IDEwLjVDNy4wODg1NyA5LjU4ODU3IDYuMjAxNzUgOC4wMTc1MiA2IDZaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMC41IDE5QzIyLjk4NTMgMTkgMjUgMTYuOTg1MyAyNSAxNC41QzI1IDEyLjAxNDcgMjIuOTg1MyAxMCAyMC41IDEwQzE4LjAxNDcgMTAgMTYgMTIuMDE0NyAxNiAxNC41QzE2IDE2Ljk4NTMgMTguMDE0NyAxOSAyMC41IDE5Wk0yMCAxN1YxNUgxOFYxNEgyMFYxMkgyMVYxNEgyM1YxNUgyMVYxN0gyMFoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4NCg=="
            />
          </Badge>
        </div>
        <span>新的朋友</span>
      </div>

      <div
        onClick={() => {
          setSubWork("group")
        }}
        className="border-b-[0.5px] border-[#e5e5e5] border-t-0 border-x-0 border-solid p-1  pl-0 flex items-center"
      >
        <div className="bg-[#07C160]  w-min-[37.5px] p-0.5 rounded-sm mr-1">
          <img
            className="my-[1px]"
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCAyNCAxOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xNS4wOTc1IDExLjk1MTNMMjAuNDgxMyAxNS4wNzk4QzIxLjUyMDEgMTUuODI2NCAyMS4yODU3IDE2LjM5ODEgMjEuMjQzOSAxNy4xNDY0QzIyLjU5NzUgMTcuMTQ2NCAyMy40OTk4IDE2LjcwMzUgMjMuNDk5OSAxNkMyMy40OTk5IDE1LjUgMjMuMjg0OCAxNC45ODAxIDIyLjQ5OTkgMTQuNUwxNy40OTk5IDExLjVDMTYuNzQzIDExLjA1NjQgMTUuNzc3OSAxMC42Nzk5IDE2LjQ5OTkgMTBDMTcuMzIyNCA5LjIyNTQ4IDE4LjMxNzggNy43MTQ1MyAxOC40OTk5IDYuMDAwMDJDMTguOTUxMSAxLjc1MDk5IDE1LjkwNzcgMS4yMzYwOCAxNS4wOTc1IDEuMjM2MDhDMTUuOTk5OSAyIDE2LjQwMjUgNC4zMTcxNiAxNi4zNzggNS45NzU3M0MxNi4yMDU4IDcuNjk4MDEgMTUuNDQ4OCA5LjAzOTE1IDE0LjY3MDcgOS44MTcyQzEzLjk4NzggMTAuNTAwMSAxNC4yNDM5IDExLjUyNDUgMTUuMDk3NSAxMS45NTEzWiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNSAwQzkgMCA1LjUgMSA2IDZDNi4yMDE3NSA4LjAxNzUyIDcuMDg4NTcgOS41ODg1NyA4IDEwLjVDOC44IDExLjMgOC41IDEyLjUgNy41IDEzTDEuNSAxNkMwLjUgMTYuNSAwIDE3IDAgMThDMCAxOSAxIDE5IDIuNSAxOUgxMC41SDE4QzE5LjUgMTkgMjAuNSAxOSAyMC41IDE4QzIwLjUgMTcgMjAgMTYuNSAxOSAxNkwxMyAxM0MxMiAxMi41IDExLjcgMTEuMyAxMi41IDEwLjVDMTMuNDExNCA5LjU4ODU3IDE0LjI5ODIgOC4wMTc1MiAxNC41IDZDMTUgMSAxMiAwIDEwLjUgMFoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4NCg=="
          />
        </div>
        <span>群组</span>
      </div>

      {Object.entries(groupFriend).map(([key, list]) => (
        <Fragment key={key}>
          <div key={`captal-${key}`} id={`captal-${key}`} className="text-[#737373] text-[14px] py-0.5">
            {key}
          </div>
          {list.map((friend) => (
            <FriendItem
              key={friend.ID}
              {...friend}
              onClick={() => {
                router.isLoginToOrRedirect("/interaction/FriendData", { ...friend, isExistFriend: true, Status: 3 })
              }}
            />
          ))}
        </Fragment>
      ))}
      <div className="flex flex-col items-center fixed left-full sm:left-1/2 top-1/2 -translate-y-1/2  -translate-x-full sm:translate-x-[288px]">
        <img className="w-[10px] h-[10px] brightness-0 opacity-50" src={util.buildAssetsPath("assets/icons/ic_search.svg")} />
        {Object.keys(groupFriend).map((key) => (
          <div onClick={() => scrollToKey(key)} key={key} className="py-0.25 text-[9px] text-[#555]">
            {key}
          </div>
        ))}
      </div>
    </div>
  )
})
