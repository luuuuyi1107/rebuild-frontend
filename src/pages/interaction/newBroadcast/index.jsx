import { useBroadcastWork } from "@/components/BroadcastWork"
import { withRouter } from "@/magic/withRouter"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import GroupRoom from "./GroupRoom"
import AddressBook from "./AddressBook"
import Six from "./Six"
import My from "./My"
import InputText from "./InputText"
import Friends from "./Friends"
import MenuFooter from "./MenuFooter"
import { withBroadcastContext } from "@/contexts/BroadcastContext"
import { withEmojiContext } from "@/contexts/EmojiContext"
import ICON_ADD_FRIEND from "@/components/BroadcastWork/icons/ic_addfriend.svg"

export default withEmojiContext(
  withBroadcastContext(
    withRouter((props) => {
      const {
        menuList,
        MENU_MAP,
        selectedMenu,
        chatRoomsFilteredRanked,
        filterText,
        setFilterText,
        setSelectedMenu,
        selectRoom,
        deleteRoom,
        friendText,
        setFriendText,
        pinnedChats,
        subWork,
        setSubWork,
        headTitle,
        getAddFriendComps,
        onPinned,
        onReaded,
        passChat,
        setPassChat,
        sendMessage,
        showToolBar,
        setShowToolBar,
        unreadTotalCount,
        requestMembers,
        newRequestFriendLength,
        isLoading,
        friendList,
        groups,
        roomsRef,
      } = useBroadcastWork(props)

      return (
        <LayoutPage
          className="broadcast-chat"
          center={headTitle}
          onBack={() => {
            setShowToolBar(true)
            if (subWork) {
              if (subWork.includes(MENU_MAP.ADDRESS)) {
                setSelectedMenu(MENU_MAP.ADDRESS)
                setSubWork("newFriend")
                return
              }

              setSubWork("")
              return
            }
            props.router.back()
          }}
          showToolBar={showToolBar}
          right={
            <>
              {/* 预加载用 */}
              <img className="hidden" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
              {!(selectedMenu === MENU_MAP.FRIEND || selectedMenu === MENU_MAP.ADDRESS || selectedMenu === MENU_MAP.MY) && getAddFriendComps()}

              {selectedMenu === MENU_MAP.ADDRESS && !subWork && (
                <ICON_ADD_FRIEND
                  onClick={() => {
                    setSelectedMenu(MENU_MAP.FRIEND)
                    setSubWork(MENU_MAP.ADDRESS)
                  }}
                  className="w-[22px] absolute right-1 top-[10px]"
                  src={util.buildAssetsPath("assets/icons/ic_addfriend.svg")}
                />
              )}
              {selectedMenu === MENU_MAP.ADDRESS && subWork === "newFriend" && (
                <div
                  onClick={() => {
                    setSelectedMenu(MENU_MAP.FRIEND)
                    setSubWork(MENU_MAP.ADDRESS + "_" + subWork) // TODO
                  }}
                  className="text-[16px] mr-1"
                >
                  新增好友
                </div>
              )}
            </>
          }
        >
          <div className="flex flex-col h-full">
            {selectedMenu === MENU_MAP.WECHAT && (
              <InputText
                className={showToolBar ? "pt-[0px]" : "pt-[10px]"}
                onFocus={() => {
                  setShowToolBar(false)
                }}
                onBlur={(text) => {
                  !text && setShowToolBar(true)
                }}
                text={filterText}
                setText={setFilterText}
              />
            )}

            {selectedMenu === MENU_MAP.FRIEND && (
              <InputText
                className={showToolBar ? "" : "pt-[10px]"}
                onFocus={() => {
                  setShowToolBar(false)
                }}
                onBlur={(text) => {
                  !text && setShowToolBar(true)
                }}
                placeholder="会员ID"
                text={friendText}
                setText={(text) => {
                  setFriendText(text)
                }}
              />
            )}

            <div className="flex-1 relative">
              <div ref={roomsRef} className="absolute inset-0 overflow-y-auto bg-[#efefef]">
                {selectedMenu === MENU_MAP.WECHAT && (
                  <GroupRoom
                    pinnedChats={pinnedChats}
                    chatGroups={chatRoomsFilteredRanked}
                    updateTime={props.broadcastData?.cacheTimes?.current?.chats}
                    onSelect={selectRoom}
                    onDelete={deleteRoom}
                    onPinned={onPinned}
                    onReaded={onReaded}
                    isSplit={!!filterText}
                    emojiList={props.emojiData?.emojiList}
                  />
                )}

                {selectedMenu === MENU_MAP.ADDRESS && (
                  <AddressBook
                    setSubWork={setSubWork}
                    subWork={subWork}
                    onSelect={(_chatroom) => {
                      setPassChat(_chatroom)
                      console.log(_chatroom)
                      setSelectedMenu(MENU_MAP.FRIEND)
                      setSubWork(MENU_MAP.ADDRESS)
                    }}
                    selectRoom={selectRoom}
                    requestMembers={requestMembers}
                    newRequestFriendLength={newRequestFriendLength}
                    friendList={friendList}
                    groups={groups}
                    showToolBar={showToolBar}
                  />
                )}

                {selectedMenu === MENU_MAP.SIX && <Six />}

                {selectedMenu === MENU_MAP.FRIEND && (
                  <Friends
                    onChat={(UID, NickName) => {
                      const _room = {
                        IsGroup: false,
                        GroupID: 0,
                        UID,
                        FID: util.cache.get("user")?.ID || "",
                        NickName,
                        FIDName: util.cache.get("user")?.NickName || "",
                      }
                      selectRoom(_room)
                      props.broadcastData.fetchRecentChats(true)
                    }}
                    onPreloadUserData={(UID) => {
                      props.broadcastData?.preloadUserData(UID)
                    }}
                    passFriend={passChat}
                    setPassChat={setPassChat}
                    setSubWork={setSubWork}
                    myId={util.cache.get("user")?.ID || ""}
                    text={friendText}
                    setText={setFriendText}
                    sendMessage={sendMessage}
                    onAddress={(type = "") => {
                      setSelectedMenu(MENU_MAP.ADDRESS)
                      setSubWork(type)
                    }}
                    friendList={friendList}
                    cacheQuery={{ selectedMenu, subWork }}
                  />
                )}

                {selectedMenu === MENU_MAP.MY && <My setSubWork={setSubWork} subWork={subWork} />}
              </div>
            </div>

            {!filterText && selectedMenu !== MENU_MAP.FRIEND && (
              <MenuFooter
                unreadTotalCount={unreadTotalCount}
                newRequestFriendLength={newRequestFriendLength}
                MENU_MAP={MENU_MAP}
                menuList={menuList.filter((menu) => menu.key !== MENU_MAP.FRIEND)}
                onLogin={() => {
                  props.router.push("/site/login")
                }}
                selectedMenu={selectedMenu}
                setSubWork={setSubWork}
                setSelectedMenu={setSelectedMenu}
              />
            )}
          </div>
        </LayoutPage>
      )
    })
  )
)
