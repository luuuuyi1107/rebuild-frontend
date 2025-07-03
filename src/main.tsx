import { createRoot } from "react-dom/client"
import App from "@/App"
import "@/magic/init.js"
import "./style/index.scss"
import util from "./magic/util"
import { getPush } from "./action/apis"
import { OrderPostFetcher } from "./action/fetcher"
;(async () => {
  // entry from old site
  if (util.getUrlParam("token")) {
    await getPush({})
  }
  OrderPostFetcher.getOrderPostOrigin()
  const root = createRoot(document.getElementById("root")!)
  root.render(<App />)
})()

if (import.meta.env.DEBUT === "true" || util.getUrlParam("debug") === "true") {
  document.title = `debug-${document.title}`
  window.onload = function () {
    const $console = document.createElement("div")
    $console.className = "fixed w-full h-screen hidden bg-white z-10 text-red-500 overflow-y-auto"
    $console.addEventListener("click", function () {
      $console.classList.add("hidden")
      $console.innerHTML = ""
    })
    document.body.appendChild($console)

    console.error = (...params) => {
      $console.innerHTML = $console.innerHTML + params.join("<br>") + "<br>--------------------------------------<br>"
      $console.classList.remove("hidden")
    }
  }
}






