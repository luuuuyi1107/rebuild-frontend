const { Client } = require("ssh2")
const SftpClient = require("ssh2-sftp-client")
const dayjs = require("dayjs")
const args = require("args-parser")(process.argv)
const path = require("path")
const axios = require("axios")
require("dotenv").config({ path: path.join(__dirname, "..", `.env.${args.mode}`) })
const { HOST: host, USERNAME: username, PASSWORD: password, PORT: port, WEB_PATH: webPath, WEB_FOLDER: webFolder } = process.env
const config = {
  host,
  port,
  username,
  password,
}
console.log("connect info: ", config)
// prod才要版本迭代
const isProd = args.mode === "prod"
let version = isProd ? `_${dayjs().format("YYYYMMDDHHmmss")}` : ""
const webZipName = `76_${args.mode}${version}.zip`
const fileMapping = {
  [webZipName]: `${webPath}/${webZipName}`,
}

const child_process = require("child_process")

const localExec = (command) =>
  new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`)
      }
      if (stderr) {
        reject(`stderr: ${stderr}`)
      }
      console.log(`local command: ${command}`)
      resolve(stdout)
    })
  })
const conn = new Client()
const remoteExec = (command) =>
  new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err)
      }
      console.log(`remote command: ${command}`)
      let res
      stream
        .on("close", () => {
          stream.end()
          resolve(res + "")
        })
        .on("data", (data) => {
          res = data
        })
        .end(["HEAD / HTTP/1.1", "User-Agent: curl/7.27.0", "Host: 127.0.0.1", "Accept: */*", "Connection: close", "", ""].join("\r\n"))
    })
  })
const uploadFile = (fileMapping) =>
  new Promise((resolve, reject) => {
    const sftp = new SftpClient()
    const start_at = dayjs()
    console.log({
      message: "upload start",
      time: start_at.format("YYYY-MM-DD HH:mm:ss"),
    })
    sftp
      .connect(config)
      .then(async () => {
        sftp.on("upload", (info) => {
          console.log(info)
        })
        for (const localPath of Object.keys(fileMapping)) {
          const targetPath = fileMapping[localPath]
          console.log({
            localPath,
            targetPath,
          })
          await sftp.put(localPath, targetPath)
        }
        console.log({
          message: "upload finished",
          time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          use_time: dayjs().diff(start_at, "seconds") + " secs",
        })
        await sftp.end()
        resolve()
      })
      .catch((err) => reject(`sftp error: ${err}`))
  })
const deleteOldFile = () =>
  new Promise((resolve, reject) => {
    const sftp = new SftpClient()
    sftp
      .connect(config)
      .then(async () => {
        const list = await sftp.list(webPath)
        const oldVersion = `_${dayjs().subtract(2, "month").format("YYYYMM")}`

        for (let f of list) {
          if (f.name.includes(oldVersion)) {
            await sftp.delete(`${webPath}/${f.name}`)
          }
        }
        await sftp.end()
        resolve()
      })
      .catch((err) => reject(`sftp error: ${err}`))
  })

// main
console.time()
conn
  .on("ready", async () => {
    console.log("Client :: ready")
    // local zip web
    await localExec(`zip -r ${webZipName} ${webFolder}`)
    // remote remove old zip
    await remoteExec(`cd ${webPath} && rm -rf ${webZipName}`)
    // upload zip
    await uploadFile(fileMapping).catch(console.log)
    // remove old file & unzip web
    let notificationMessage = `76 ${args.mode}`
    if (!isProd) {
      await remoteExec(`cd ${webPath} && rm -rf ./${webFolder}/* && unzip ${webZipName} -d ./`)
      notificationMessage += ` deployed!!`
    } else {
      await deleteOldFile()
      const tmps = webPath.split("/")
      const folderName = tmps[tmps.length - 1]
      notificationMessage += ` uploaded!!\nweb: https://76rc.35211m.com/${folderName}/${webZipName}`
    }
    await axios.post("https://api.telegram.org/bot6315424346:AAE09KpIlSfKcQTDyB_jbSJrt6sckTju9hM/", {
      method: "sendMessage",
      chat_id: "-956176218",
      text: notificationMessage,
    })
    console.timeEnd()
    conn.end()
  })
  .on("error", (err) => {
    if (err.code !== "ECONNRESET") {
      // console.log("message", err.message)
      // console.log("errno", err.errno)
      // console.log("code", err.code)
      // console.log("address", err.address)
      // console.log("port", err.port)
      // console.log("level", err.level)
      // console.log("syscall", err.syscall)
      // console.log("fatal", err.fatal)
      throw err
    }
  })
  .connect(config)
