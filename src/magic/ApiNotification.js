import { notificationAsync } from "./notification"

/**
 * 以停止维护，请尽可能不要使用
 * Displays an alert message to the user based on the response code and message.
 *
 * @param {object} res - The response object containing code and message.
 * @param {object} [option={}] - Configuration options for the alert.
 * @param {string} [option.cancelType="back"] - The type of cancellation action, either "back" or "cancel".
 * @param {string} [option.title="提示信息"] - The title of the alert dialog.
 * @param {Function} [option.callback] - A callback function to execute after the alert is dismissed.
 * @param {object} props - Additional properties, including router and route for navigation.
 *
 * If the response code is -5, navigates to the maintenance page.
 * If the message contains "未登录", prompts the user to log in or cancel.
 * Otherwise, displays the response message or "NULL" with an "确定" button.
 */

export function alert(res, option = {}, props) {
  option = Object.assign(
    {
      cancelType: "back",
      title: "提示信息",
      class: "theme-notification",
    },
    option
  )
  if (res.Code == -5) {
    props.router.push("/site/maintain")
  } else if (res.Message && res.Message.indexOf("未登录") > -1) {
    notificationAsync
      .alert(res.Message, {
        title: "您尚未登陆",
        buttonLabels: [option.cancelType == "cancel" ? "取消" : "返回", "登陆"],
      })
      .then((index) => {
        if (index == 1) {
          props.router.push(`/site/login`, { redirect: props.route.pathname + props.route.search })
        }
        if (index == 0) {
          if (option.cancelType == "back") {
            props.router.back()
          }
        }
      })
  } else {
    notificationAsync.alert(res.Message || "NULL", { title: option == null ? "注意" : option.title }).then(() => {
      if (option.callback) {
        option.callback()
      }
    })
  }
}
