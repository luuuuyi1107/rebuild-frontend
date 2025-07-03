const fs = require("fs")
const path = require("path")

const removeWebpFiles = (dir) => {
  console.log(dir)
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err)
      return
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for file ${filePath}:`, err)
          return
        }

        if (stats.isDirectory()) {
          removeWebpFiles(filePath) // 遞歸處理子目錄
        } else if (path.extname(file) === ".webp") {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err)
            } else {
              console.log(`Deleted file: ${filePath}`)
            }
          })
        }
      })
    })
  })
}

// 開始移除 .webp 檔案，從當前目錄開始
removeWebpFiles(path.resolve(__dirname, ".."))
