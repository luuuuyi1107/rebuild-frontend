import React from "react"

export default class extends React.PureComponent {
  state = {
    id: "yidun" + Math.random(),
  }
  reloadLimit = 3
  refresh() {
    this.captchaIns.refresh()
  }

  componentDidMount() {
    const hasYidunJs = Array.from(document.getElementsByTagName("script")).some(
      (el) => el.src && el.src.startsWith("https://cstaticdun.126.net/load.min.js")
    )
    const head = document.head || document.getElementsByTagName("head")[0]
    if (hasYidunJs) {
      setTimeout(this.init.bind(this), 300)
    } else {
      const _script = document.createElement("script")
      _script.src = `https://cstaticdun.126.net/load.min.js?t=${new Date().getTime()}`
      head.appendChild(_script)
      _script.onload = this.init.bind(this)
    }
  }

  init() {
    try {
      if (!document.getElementById(this.props.id)) throw new Error()
      const defaultCaptchaId =
        document.location.href.indexOf("register") >= 0 ? "6349ed75865d474eb9b6d30fa5d37bb9" : "dd9528209ad94ac3bb96ec395e115ba8"
      initNECaptcha(
        {
          captchaId: this.props.CaptchaId || defaultCaptchaId,
          element: "#" + (this.props.id || "yidun-verifycode"),
          mode: "float",
          onVerify: (err, data) => {
            if (!err) {
              this.props.onSuccess && this.props.onSuccess(data)
            }
            //
          },
        },
        (instance) => {
          // onload
          this.captchaIns = instance

          if (!!this.props.onLoad) setTimeout(this.props.onLoad, 1000)
        },
        function onerror(err) {
          // 初始化失败后触发该函数，err对象描述当前错误信息
          console.log(err)
        }
      )
    } catch (error) {
      this.reloadLimit -= 1
      if (this.reloadLimit <= 0) return // 防止無窮callback
      setTimeout(() => {
        this.init()
      }, 300)
    }
  }

  render() {
    return <div id={`${this.props.id || "yidun-verifycode"}`} className={`${this.props.className} yidun-verfiycode`}></div>
  }
}
