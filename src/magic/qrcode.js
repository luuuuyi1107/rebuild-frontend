import * as qrcode from "@/magic/qrcodegenerator"
import * as jsqr from "@/magic/jsqr"

const createScript = (url) => {
  const head = document.head || document.getElementsByTagName("head")[0]
  const script = document.createElement("script")
  script.type = "text/javascript"
  script.src = url
  head.appendChild(script)
  return script
}

export const useJSQR = async () => {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName("head")[0]
    const _script = head.querySelector('script[src="https://cdn.jsdelivr.net/npm/jsqr"]')
    if (!!_script || typeof jsQR === "function") {
      resolve(jsQR)
    } else {
      createScript("https://cdn.jsdelivr.net/npm/jsqr").onload = function () {
        resolve(jsQR)
      }
    }
  })
}

export const useQrCode = () => {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName("head")[0]
    const _script = head.querySelector('script[src="https://cdn.jsdelivr.net/npm/qrcode-generator/qrcode.js"]')
    if (!!_script && typeof qrcode === "function") {
      resolve(qrcode)
    } else {
      createScript("https://cdn.jsdelivr.net/npm/qrcode-generator/qrcode.js").onload = function () {
        resolve(qrcode)
      }
    }
  })
}

export const generateQRCode = (text, option = { cellSize: 3, margin: 1 }) => {
  if (!text) {
    return ""
  }

  const qr = qrcode.default(0, "L")
  qr.addData(text)
  qr.make()
  const resize = text.length > 100 ? Math.round(text.length / 100) : 0
  const cellResize = option.cellSize > 3 ? resize : Math.round(resize / 2)
  const marginResize = option.margin > 3 ? resize : Math.round(resize / 2)
  return qr.createSvgTag({
    ...option,
    cellSize: option.cellSize - cellResize,
    margin: option.margin - marginResize,
  })
}

export const useQrcodeWithPayment = (payment) => {
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = () => {
        resolve(fileReader.result)
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }
  const convertQRcodeToString = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      fileReader.onload = (e) => {
        // resolve(fileReader.result);
        const image = new Image()
        image.onload = () => {
          canvas.width = image.width
          canvas.height = image.height
          context.drawImage(image, 0, 0)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsqr.default(imageData.data, imageData.width, imageData.height)
          if (code) {
            const prefixKeys = payment?.PREFIX || []
            if (!prefixKeys.length || prefixKeys.some((key) => code.data.toLowerCase().startsWith(key))) {
              resolve(code.data)
            } else {
              reject(`请您上传${payment?.NAME2}收款码!`)
            }
          } else {
            reject("无法识别二维码！")
          }
        }
        image.src = e.target.result
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
      fileReader.readAsDataURL(file)
    })
  }

  return { convertBase64, convertQRcodeToString }
}
