import { getForumUrl, getOauthCode } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import { useEffect, useMemo, useState } from "react"
export default () => {
  const [forumUrl, setForumUrl] = useState("")
  const [code, setCode] = useState("")
  const codedForumUrl = useMemo(() => (code && forumUrl ? util.oauthCodeBuilder(forumUrl, code) : forumUrl), [forumUrl, code])

  useEffect(() => {
    getForumUrl().then((res) => {
      if (res.Code !== 1) return
      setForumUrl(res.Url)
    })
  }, [])

  useEffect(() => {
    if (!util.isLogin()) return
    getOauthCode().then((res) => {
      if (res.Code !== 1) {
        notificationAsync.alert(res.Message, { title: "操作提示" })
        return
      }
      setCode(res.Data)
    })
  }, [util.isLogin()])

  const getSixForumPage = () => {
    window.open(codedForumUrl, "_blank")
  }

  return (
    forumUrl && (
      <div
        className="p-0.5 bg-gray-200"
        onClick={() => {
          getSixForumPage()
        }}
      >
        <img className="w-full rounded-sm" src={util.buildAssetsPath("images/Home/sixforum-banner.png")} />
      </div>
    )
  )
}
