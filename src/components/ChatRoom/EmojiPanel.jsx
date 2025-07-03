import { useState, useMemo, useEffect } from "react"
import classNames from "classnames"
import emojiIconList from "@/magic/emojiList"
import _ from "lodash"
import { withEmojiContext } from "@/contexts/EmojiContext"
import "./emojipanel.scss"

export default withEmojiContext(({ onEmojiText, emojiData, setText, text }) => {
  console.log({ emojiData })
  const [selectGroup, setSelectGroup] = useState(0)
  const emojiListByGroup = useMemo(() => {
    return selectGroup === -1 ? [] : emojiData?.emojiList?.filter((emoji) => emoji.GID === selectGroup)
  }, [emojiData?.emojiList, selectGroup])

  const defaultGroup = { ID: 0, Name: "", Description: "Smile", SortOrder: 0, ICON: util.buildAssetsPath("assets/icons/emoji.svg") }
  const emojiGroupsWithDefault = useMemo(() => [defaultGroup].concat(emojiData?.emojiGroups || []), [emojiData?.emojiGroups])
  const selectGroupData = useMemo(() => {
    return selectGroup === -1 || emojiData?.emojiGroups.length === 0 ? null : emojiData?.emojiGroups?.find((group) => group.ID == selectGroup)
  }, [selectGroup, selectGroup])
  function onEmoji(emoji) {
    onEmojiText(emoji.Code)
  }

  return (
    <>
      <div id="emojiPanel" className="flex p-1 bg-[#f1f1f1] gap-[12px]">
        {emojiGroupsWithDefault.map((group) => {
          return (
            <div
              key={group.ID}
              className={classNames("w-3 h-3 flex justify-center items-center rounded-sm", { "bg-white": selectGroup === group.ID })}
              onClick={() => setSelectGroup(group.ID)}
            >
              {group.ICON ? <img className="w-[24px]" src={group.ICON} /> : group.Name[0]}
            </div>
          )
        })}
      </div>

      {selectGroup > -1 && (
        <div className="bg-[#f1f1f1] p-1 pt-0 relative">
          <div className="h-16 overflow-y-auto box-content">
            {selectGroup === 0 ? (
              <>
                <div className="grid sm:grid-cols-10 grid-cols-8 pb-3.5">
                  {emojiIconList.map((emoji) => (
                    <div
                      key={emoji}
                      className="p-0.5 text-[21px] text-center"
                      onClick={() => {
                        setText((prev) => prev + emoji)
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-5 gap-1">
                {emojiListByGroup.map((emoji) => {
                  return (
                    <div key={emoji.ID} onClick={onEmoji.bind(null, emoji)}>
                      <img className="w-full aspect-square" src={emoji.ImagePath} />
                      {/* <span className="text-[12px]">{emoji.Name}</span> */}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {selectGroup === 0 && (
            <div className="absolute right-0 bottom-0 flex justify-center items-center p-[25px] pr-[12px] bg-broadcast emoji-panel">
              <div
                onClick={() => {
                  if (text.length === 0) return
                  setText((prev) => {
                    const chars = Array.from(prev)
                    chars.pop()
                    return chars.join("")
                  })
                }}
                className="bg-white text-white w-[48px] h-[38px] rounded-[4px] flex justify-center items-center mr-0.5"
              >
                <img className={!text ? "opacity-10" : ""} src={util.buildAssetsPath("assets/icons/ic_backspace.svg")} />
              </div>
              <div
                onClick={() => {
                  onEmojiText(text, "showEmoji").then(() => {
                    setText("")
                  })
                }}
                className="w-[48px] h-[38px] text-[14px] font-[500] rounded-[4px] flex justify-center items-center bg-[#07C160] text-white"
              >
                发送
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
})
