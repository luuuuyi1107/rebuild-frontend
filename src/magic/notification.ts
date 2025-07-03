import classNames from "classnames"
import { notification } from "onsenui/js/onsenui"
import { ReactNode } from "react"
import { renderToString } from "react-dom/server"

interface NotificationOptions {
  message?: string
  messageHTML?: string
  title?: string
  buttonLabels?: string | string[]
  primaryButtonIndex?: number
  cancelable?: boolean
  callback?: ((index: number) => void) | ((value: string) => void) | (() => void)
  modifier?: string
  animation?: string
  timeout?: number
  class?: string // Added class attribute for custom CSS classes
  className?: string // Added class attribute for custom CSS classes
}

// 转译上会有些限制，必须符合JSX规范，例如style需为物件
const convertToString = (text: string | ReactNode) => (typeof text == "string" ? text : renderToString(text))

// document https://onsen.io/v2/api/js/ons.notification.html#notification
export const notificationAsync = {
  async originAlert(content: string | ReactNode, option: Omit<NotificationOptions, "className"> = {}) {
    return notification.alert(convertToString(content), option)
  },
  async alert(content: string | ReactNode, option: NotificationOptions = {}) {
    return new Promise((resolve, reject) => {
      notification
        .alert(convertToString(content), {
          title: "提示",
          buttonLabels: ["确定"],
          class: classNames(`theme-notification`, option.className),
          ...option,
        })
        .then(() => {
          resolve(1)
        })
        .catch(() => {
          reject()
        })
    })
  },
  async alertAndReject(content: string | ReactNode, option: NotificationOptions = {}) {
    return new Promise((_resolve, reject) => {
      notification
        .alert(convertToString(content), {
          title: "提示",
          buttonLabels: ["确定"],
          class: classNames(`theme-notification`, option.className),
          ...option,
        })
        .then(() => {
          reject("alert and reject")
        })
    })
  },
  confirm(content: string | ReactNode, option: NotificationOptions = {}) {
    return new Promise((resolve, reject) => {
      notification
        .confirm(convertToString(content), {
          title: "提示",
          buttonLabels: ["取消", "确定"],
          class: classNames(`theme-notification`, option.className),
          ...option,
        })
        .then((index) => {
          index ? resolve(1) : reject()
        })
    })
  },
  toast(content: string | ReactNode, option: NotificationOptions = {}) {
    notification.toast(convertToString(content), { timeout: 1000, modifier: "middle", ...option }) // css .toast.toast--middle
  },
  prompt(content: string | ReactNode, option: NotificationOptions & { beforeSubmit?: (value: string) => void | never } = {}) {
    return new Promise<string>((resolve, reject) => {
      notification
        .prompt(convertToString(content), {
          title: "提示",
          buttonLabels: ["取消", "确定"],
          class: classNames(`theme-notification`, `prompt`, option.className),
          ...option,
        })
        .then((value) => {
          value === null ? reject() : resolve(value)
        })
      if (option.beforeSubmit) {
        const $input = document.querySelector(".theme-notification.prompt .text-input") as HTMLInputElement
        const $oriButton = document.querySelector(".theme-notification.prompt .alert-dialog-button--primal") as HTMLButtonElement
        const $newButton = $oriButton.cloneNode(true) // 复制元素，但不包含事件监听器
        $oriButton.parentNode.replaceChild($newButton, $oriButton) // 替换旧元素
        const bakOnClick = $oriButton.onclick
        $newButton.addEventListener("click", (e) => {
          option.beforeSubmit($input.value)
          bakOnClick?.call(e.target, e)
        })
      }
    })
  },
}
