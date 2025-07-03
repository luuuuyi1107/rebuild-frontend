import React, { useState } from "react"
import AvatarImg from "@/components/AvatarImg"

export default (props) => {
  const [commentText, setComentText] = useState("")
  const [row, setRow] = useState(1)
  function handleTextEvent(e) {
    setComentText(e.target.value)

    const lineBreaks = (e.target.value.match(/\n/g) || []).length
    setRow(lineBreaks + 1)
  }
  function sendingMessage() {
    props.sendingMessage(commentText)
    setComentText("")
    document.getElementById("commentMessageInput").value = ""
  }

  function countLineBreaks(event) {
    console.log(event.target)
    // var textarea = document.getElementById("myTextarea");
    // var content = textarea.value;
    // var lineBreaks = (content.match(/\n/g) || []).length;
    // console.log("Number of line breaks: " + lineBreaks);
  }

  return (
    <div className="comment-input-area">
      {!!props.children && props.children}
      <AvatarImg avatarLink={props.avatar.startsWith("http") ? props.avatar : null} width={"38px"} height={"38px"} icSize={"38px"} shape={"round"} />

      <textarea rows={row} id="commentMessageInput" type="text" placeholder="说点什么…" onChange={handleTextEvent} />

      <div className="combo">
        <img style={{ width: 20, height: 20 }} className="icon" src={util.buildAssetsPath("assets/icons/like-color.svg")} />
        1,000
      </div>

      <div className="combo">
        <img style={{ width: 20, height: 20 }} className="icon" src={util.buildAssetsPath("assets/icons/message.svg")} />
        1.2万
      </div>

      <img style={{ width: 20, height: 20 }} className="icon" src={util.buildAssetsPath("assets/icons/heart.svg")} />

      {!!commentText && (
        <div className="sending" onClick={sendingMessage}>
          传送
        </div>
      )}
    </div>
  )
}
