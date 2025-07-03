import config from "@/config/config"
import util from "@/magic/util"

document.title = config.title || ""

const isMobileCheck = () => {
  return /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)
}
const deviceClassCheck = () => {
  if (!isMobileCheck()) {
    document.body.classList.add("platform-pc")
  } else {
    document.body.classList.remove("platform-pc")
  }
}
window.addEventListener("resize", deviceClassCheck)
deviceClassCheck()

window.addEventListener(
  "load",
  function () {
    document.body.style.removeProperty("width")
    document.body.style.removeProperty("max-width")
    document.body.style.removeProperty("margin")
    // document.body.style.removeProperty('visibility');
  },
  false
)

function setFontSize() {
  var docEl = document.documentElement
  //考虑以及兼容了 屏幕旋转的事件
  var resizeEvt = "orientationchange" in window ? "orientationchange" : "resize"
  var recalc = function () {
    var clientWidth = Math.min(docEl.clientWidth, docEl.clientHeight)
    if (!clientWidth) return
    if (!isMobileCheck()) {
      docEl.style.fontSize = "50px"
    } else if (clientWidth >= 750) {
      docEl.style.fontSize = "100px"
    } else {
      docEl.style.fontSize = 100 * (clientWidth / 750) + "px"
    }
  }

  if (!document.addEventListener) return
  window.addEventListener(resizeEvt, recalc, false) // 屏幕大小以及旋转变化自适应
  document.addEventListener("DOMContentLoaded", recalc, false) // 页面初次打开自适应
  recalc()
}
setFontSize()

if (util.getUrlParam("referrer")) {
  util.cache.set("referrer", util.getUrlParam("referrer"))
}
