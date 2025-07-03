import platform from "platform"

export const isIos = () => {
  return /(iPhone|iPad|iPod)/.test(window.navigator.userAgent)
}

export const isChrome = () => {
  return !!window.chrome || window.navigator.userAgent.includes("CriOS")
}

export const isSafari = () => {
  return platform.name == "Safari"
}

export const appOpen = (target) => {
  if (isIos() && isChrome()) {
    // location.href = target
    // window.location.assign(target)
    window.location.replace(target)
  } else {
    window.open(target, "_blank")
  }
}
