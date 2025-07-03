import { useEffect, useState, forwardRef, createContext, useContext } from "react"
import { getEmojiGroups, getEmjiList } from "@/action/apis"
import _ from "lodash"
const EmojiContext = createContext()

export const withEmojiContext = (Component) => {
  return forwardRef((props, ref) => {
    const emojiData = useContext(EmojiContext)
    return <Component ref={ref} emojiData={emojiData} {...props} />
  })
}

export default (props) => {
  const [emojiList, setEmojiList] = useState([])
  const [emojiGroups, setEmojiGroups] = useState([])
  useEffect(() => {
    getEmojiGroups().then((res) => {
      if (res.Code !== 1) return
      setEmojiGroups(_.orderBy(res.Data, "SortOrder", ["desc"]))
    })
    getEmjiList().then((res) => {
      if (res.Code !== 1) return
      setEmojiList(res.Data)
    })
  }, [])

  return <EmojiContext.Provider value={{ emojiGroups, emojiList }}>{props.children}</EmojiContext.Provider>
}
