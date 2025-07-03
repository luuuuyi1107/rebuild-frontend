import { useLayoutEffect } from "react"
import { Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { useMessageWork } from "./messageWork.jsx"
import { withEmojiContext } from "@/contexts/EmojiContext"
import { withBroadcastContext } from "@/contexts/BroadcastContext"
import ModalPage from "@/components/ModalPage"
import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"

import Messages from "./Messages"
import ObsverComp from "@/components/ObsverComp"
import _ from "lodash"
import MoreShare from "./MoreShare"
import ShareBet from "./ShareBet"
import Ranks from "./Ranks"
import Header from "@/components/Header"
import ModelHeader from "@/components/ModelHeader"
import ChatFooter from "./ChatFooter"
import util from "@/magic/util"
import SimpleLayout from "@/components/SimpleLayout"
import AvatarIcon from "@/components/AvatarIcon"
import ChatManager from "./ChatManager"
// import
import "./style.scss"
import { notificationAsync } from "@/magic/notification.js"

export default withEmojiContext(
  withBroadcastContext(
    withRouter((props) => {
      const {
        text,
        setText,
        quoteData,
        setQuoteData,
        actionData,
        setActionData,
        setActionDataAndCalculate,
        sendText,
        chatContentBoxRef,
        chatListRef,
        isloadMoreMessage,
        setIsLoadingHistory,
        followBetData,
        followBetModals,
        setFollowBetData,
        setEffecMenuData,
        followBetMoney,
        setFollowBetMoney,
        keepPosition,
        messageEffect,
        setFollowBetModal,
        setFollowBetModals,
        confirmFollowBet,
        uploadFile,
        sendMessage,
        scrollByValue,
        checkIsBottom,
        reachBottom,
        showShare,
        setShowShare,
        messageList,
        managerList,
        showModal,
        setShowModal,
        startAT,
        moveAT,
        endAT,
        onEmojiEvent,
        scrollTopToReadMore,
        moreFuncRef,
        roomInfo,
        announce,
        showAnnounce,
        setShowAnnounce,
        scrollToBottom,
        hasScrolledToBottom,
        isBottomRef,
        isLoading,
        setIsLoading,
        showManagerModal,
        setShowManagerModal,
        lastChatId,
        userDetailModal,
        setUserDetailModal,
        userDetailData,
        setUserDetailData,
        adjustChatListHeight,
        sendingMessage,
      } = useMessageWork(props)

      useLayoutEffect(() => {
        if (keepPosition.current === 0) return
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight - keepPosition.current
        setTimeout(() => {
          chatListRef.current.scrollTop = chatListRef.current.scrollHeight - keepPosition.current
          keepPosition.current = 0
        }, 0)
      }, [props.broadcastData?.messages, isloadMoreMessage])

      const RightSide = () => (
        <div
          onClick={() => {
            const ChatId =
              props.broadcastData?.messages?.length > 0
                ? props.broadcastData?.messages?.reduce((max, obj) => (obj.ID > max ? obj.ID : max), -Infinity)
                : 0

            util.cache.set(`roomData_${roomInfo?.groupId}`, { announce, managerList, time: Date.now() }, "session")
            setShowManagerModal(true)
          }}
          className="flex items-center justify-end gap-[4px] h-[44px] w-full pr-1 box-border"
        >
          <div className="w-[4px] h-[4px] bg-black rounded-full" />
          <div className="w-[4px] h-[4px] bg-black rounded-full" />
          <div className="w-[4px] h-[4px] bg-black rounded-full" />
        </div>
      )

      return (
        <LayoutPage center={props.center} className="broadcast-chat-room" right={RightSide}>
          <div className="chat-content" ref={chatContentBoxRef}>
            {announce?.text && (
              <div
                onClick={() => setShowAnnounce(true)}
                className="text-[14px] font-[400] pl-1 py-[12px] box-border bg-white rounded-[8px] absolute top-1 w-[95%] left-1/2 -translate-x-1/2 max-w-[570px] z-10 flex items-center"
              >
                <img src={util.buildAssetsPath("/images/Broadcast/alert.svg")} />
                <div className="flex-1 truncate px-[8px]">{announce?.text}</div>
                <img className="mr-0.5 w-[12px] h-[12px] ml-auto" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
              </div>
            )}
            <div
              className="chat-list"
              ref={chatListRef}
              onClick={(event) => {
                if (actionData) {
                  event.stopPropagation()
                  setActionDataAndCalculate("")
                }
              }}
            >
              {isloadMoreMessage && (
                <div className="loading absolute w-full z-20 bg-broadcast">
                  <span>
                    <Icon icon="ion-load-d" /> 正在加载...
                  </span>
                </div>
              )}
              {messageList.length > 0 && (
                <ObsverComp
                  onVisible={() => {
                    if (messageList.length > 0) scrollTopToReadMore()
                  }}
                />
              )}
              <Messages
                value={messageList}
                managerList={managerList}
                setFollowBetModal={setFollowBetModal.bind(null)}
                setEffecMenuData={(value) => {
                  if (value.content.startsWith("http")) return
                  setEffecMenuData(value)
                }}
                startAT={startAT.bind(null)}
                endAT={endAT.bind(null)}
                moveAT={moveAT.bind(null)}
                showUserInfo={(data) => {
                  props.router.push("/interaction/userBetInfo", data)
                }}
                onVisibled={props.broadcastData?.preloadUserData}
              />
              {messageList.length === 0 && <div className="h-[600px]" />}
            </div>
            <ChatFooter
              text={text}
              uploadFile={uploadFile}
              quoteData={quoteData}
              setQuoteData={setQuoteData}
              mode={moreFuncRef.current?.mode}
              setActionData={setActionDataAndCalculate}
              actionData={actionData}
              setText={setText}
              sendText={sendText}
              sendingMessage={sendingMessage}
              sendMessage={sendMessage}
              setShowModal={setShowModal}
              setShowShare={setShowShare}
              moreFuncRef={moreFuncRef}
              adjustChatListHeight={adjustChatListHeight}
            />
          </div>
          <ModalPage className="bg-black/80 flex justify-center items-center" isOpen={followBetModals} animation="lift">
            <div className="follow-bets-modal">
              <div
                className="follow-bet-window"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <div className="follow-bet-title">{followBetData?.GameTitle}</div>
                <div className="follow-bet-content">
                  <div className="follow-bet-list">
                    <span className="follow-bet-rule">{followBetData?.BetName}</span>
                    <span className="follow-bet-ball max-w-[200px] break-words whitespace-normal">{followBetData?.BetText}</span>
                    <span className="follow-bet-maoney">{followBetData?.BetMoney}元</span>
                  </div>
                  <div className="follow-bet-all-amount">
                    <div className="betAmount">
                      每注：
                      <InputBox
                        placeholder="输入金额"
                        type="number"
                        name="amount"
                        onChange={(value) => {
                          setFollowBetMoney(value)
                        }}
                        value={followBetMoney}
                      />
                      元
                    </div>
                    <div className="allAmount">总额：{followBetMoney * followBetData?.shareBetLength * followBetData?.baseUnit}元</div>
                  </div>
                </div>
                <div className="follow-bet-btn">
                  <div
                    className="cancel"
                    onClick={() => {
                      setFollowBetModals(false)
                    }}
                  >
                    取消
                  </div>
                  <div
                    className="submit"
                    onClick={() => {
                      confirmFollowBet()
                    }}
                  >
                    跟注
                  </div>
                </div>
              </div>
            </div>
          </ModalPage>

          <ModalPage className="bg-white flex flex-col text-black" isOpen={showAnnounce} animation="lift">
            <SimpleLayout
              headerClassName="bg-broadcast"
              className="bg-white"
              center="群组公告"
              onBack={() => {
                setShowAnnounce(false)
              }}
            >
              <div className="p-2 text-left">
                <div className="flex items-center mb-1 border-b border-b-[#f6f6f6] border-solid border-x-0 border-t-0 pb-1">
                  <AvatarIcon
                    color="#FF8F8F"
                    className="rounded-[5px] w-[46px] h-[46px] mr-1 font-[400]"
                    src={util.buildAssetsPath("/images/HttpChatPage/service.png")}
                  />
                  <div className="flex-1 text-[14px]">
                    <div className="text-[#E10004]">管理员</div>
                    <div className="text-[#737373]">{announce?.time}</div>
                  </div>
                </div>
                <div className="text-[16px] whitespace-pre-wrap">{announce?.text}</div>
              </div>
            </SimpleLayout>
          </ModalPage>

          <ChatManager
            isOpen={showManagerModal}
            roomData={{ ...roomInfo, managerList, announce, chatId: lastChatId }}
            onClose={() => setShowManagerModal(false)}
            onPageBack={() => {
              props.router.back()
            }}
            onRemoveGroupById={props.broadcastData?.removeGroupRoomById}
            onRemovePrivateById={props.broadcastData?.removePrivateRoomById}
          />

          <ModalPage
            className={showShare === "bet" || showShare === "moreWin" ? "bg-white text-black" : "bg-black/80 flex justify-center items-center"}
            isOpen={showModal}
            animation="lift"
          >
            {showShare === "ranks" ? (
              <ModelHeader
                title="今日盈利排行榜"
                maxHeight="h-[590px]"
                onClose={() => {
                  setShowModal(false)
                }}
              >
                <Ranks />
              </ModelHeader>
            ) : (
              <Header
                className="bg-broadcast"
                onBack={() => {
                  setShowModal(false)
                }}
                right={
                  <div
                    className="w-5 text-[16px]"
                    onClick={() => {
                      props.router.isLoginToOrRedirect(`/lottery/nav?to=betHistory`)
                    }}
                  >
                    {showShare === "bet" && <div>选择</div>}
                  </div>
                }
                center={showShare === "moreWin" ? "更多战绩" : "投注记录"}
              >
                {showShare === "moreWin" && (
                  <MoreShare
                    onShare={(text) => {
                      sendMessage({ text, quote: "" }, 2).then((res) => {
                        notificationAsync.alert("分享成功", { class: "broadcast" }).then(() => {
                          setShowModal(false)
                        })
                      })
                    }}
                    setIsLoading={setIsLoading}
                  />
                )}
                {showShare === "bet" && (
                  <ShareBet
                    onShare={(text) => {
                      sendMessage({ text, quote: "" }, 1).then(() => {
                        notificationAsync.alert("分享成功")
                      })
                      setShowModal(false)
                    }}
                  />
                )}
              </Header>
            )}
          </ModalPage>

          <ModalPage className="bg-black/30 flex justify-center items-center z-50" isOpen={isLoading} animation="lift">
            <Icon icon="ion-load-d" className="mr-0.5 text-[18px] animate-spin" /> loading...
          </ModalPage>

          {/* <ModalPage className="flex justify-center items-center z-50" isOpen={userDetailModal} animation="lift">
            <UserInfoData
              {...(userDetailData ?? {})}
              onBack={() => {
                setUserDetailModal(false)
                setUserDetailData(null)
              }}
            />
          </ModalPage> */}
        </LayoutPage>
      )
    })
  )
)
