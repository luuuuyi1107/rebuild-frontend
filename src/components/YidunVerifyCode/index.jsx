import React from "react"
import util from "@/magic/util"
import { Button } from "react-onsenui"

export default class extends React.PureComponent {
  state = {
    id: "yidun" + Math.random(),
  }
  loadScript(src, cb) {
    let head = document.head || document.getElementsByTagName("head")[0]
    let script = document.createElement("script")

    cb = cb || function () {}

    script.type = "text/javascript"
    script.src = src

    if (!("onload" in script)) {
      script.onreadystatechange = function () {
        if (this.readyState !== "complete" && this.readyState !== "loaded") return
        this.onreadystatechange = null
        cb(script)
      }
    }
    script.onload = function () {
      this.onload = null
      cb(script)
    }

    head.appendChild(script)
  }
  refresh() {
    this.captchaIns.refresh()
  }

  componentDidMount() {
    let src = "https://cstaticdun.126.net/load.min.js?t=" + util.date.format(new Date(), "YYYYMMDDhhmm")
    let _this = this

    const defaultCaptchaId = document.location.href.indexOf("register") >= 0 ? "6349ed75865d474eb9b6d30fa5d37bb9" : "dd9528209ad94ac3bb96ec395e115ba8"

    this.loadScript(src, (script) => {
      initNECaptcha(
        {
          // config对象，参数配置
          captchaId: _this.props.CaptchaId || defaultCaptchaId,
          element: "#" + (_this.props.id || "yidun-verifycode"),
          mode: "float",
          // width: '320px',
          onVerify: function (err, data) {
            if (!err) {
              _this.props.onSuccess && _this.props.onSuccess(data)
            }
          },
          onReady(instance) {
            _this.captchaIns = instance
            _this.props.onReady && _this.props.onReady()
          },
        },
        function onload(instance) {
          // console.log(instance);
          // _this.captchaIns = instance;
          if (_this.props.onLoad) setTimeout(_this.props.onLoad, 1000)
        },
        function onerror(err) {
          // 初始化失败后触发该函数，err对象描述当前错误信息
          console.log(err)
        }
      )
    })
  }
  render() {
    return <div id={`${this.props.id || "yidun-verifycode"}`} className={`${this.props.className} yidun-verfiycode`}></div>
  }
}

export const CaptchaLoadingButton = () => {
  return (
    <Button className="absolute h-[40px] top-0 left-0 w-full text-center bg-[#f7f9fa] text-[#45494c] text-[14px] border border-[#e4e7eb] border-solid">
      验证码加载中
    </Button>
  )
}
