import ClipboardJS from "clipboard"
import { notificationAsync } from "./notification"

export default function (text) {
  const fakeElement = document.createElement("button")
  let clipboard = new ClipboardJS(fakeElement, {
    text: function () {
      return text
    },
    action: function () {
      return "copy"
    },
    container: typeof container === "object" ? container : document.body,
  })
  clipboard.on("success", function (e) {
    clipboard.destroy()
    notificationAsync.alert("已成功复制到剪贴板", {
      title: "复制成功",
    })
  })
  clipboard.on("error", function (e) {
    clipboard.destroy()
    //alert(JSON.stringify(e));
    notificationAsync.alert({
      title: "浏览器不支持，请手动复制",
      messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
    })
  })
  document.body.appendChild(fakeElement)
  fakeElement.click()
  document.body.removeChild(fakeElement)
}
