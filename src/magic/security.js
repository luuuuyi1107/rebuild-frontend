import { getMySet } from "@/action/apis"

export function checkIsBindedDevice(path = null, show = { device: true, question: true }) {
  return new Promise((resolve, reject) => {
    getMySet()
      .then((res) => {
        if (res.Code == 1) {
          resolve({
            hasQuestion: res.Data.Answer.length > 0, // 有設置問題,
            deviceIds: res.Data.Devices, // 目前有綁定的裝置,
            deviceId: localStorage.getItem("cur-device-id"), // 取得目前的裝置,
            code: 1,
            answers: res.Data.Answer,
            id_mail_verified: res.Data.MailVerify,
          })
        } else {
          reject()
        }
      })
      .catch(() => {
        reject()
      })
  })
}
