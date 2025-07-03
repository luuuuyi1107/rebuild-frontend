const fs = require("fs")
const path = require("path")

// 支援的圖片格式
const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "gif"]

// 遞迴獲取所有檔案
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach((file, idx) => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

// 從 .webp 路徑獲取可能的替代檔案路徑
function getPossibleAlternativePaths(webpPath) {
  const paths = []
  // 移除開頭的 ./ 或 /
  const normalizedPath = webpPath.replace(/^\.?\//, "").replace(/^public\//, "")

  // 嘗試在 /public 和 /public/public 目錄下尋找
  const directories = ["public", "public/public"]

  directories.forEach((dir) => {
    SUPPORTED_EXTENSIONS.forEach((ext) => {
      // 將 .webp 替換為其他副檔名
      const alternativePath = path.join(dir, normalizedPath.replace(".webp", `.${ext}`))
      paths.push(alternativePath)
    })
  })

  return paths
}

// 檢查檔案是否存在
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (err) {
    return false
  }
}

// 在檔案內容中查找並替換 .webp 路徑
function replaceWebpPaths(fileContent, filePath, index) {
  let modified = false
  let newContent = fileContent

  // 更新正則表達式以匹配更多路徑模式
  // 匹配以單引號或雙引號開始，包含任何路徑（包括可能的 public/），以 .webp 結尾
  const webpPathRegex = /(['"])((?:\.{0,2}\/)?(?:public\/)?[^'"]*?\.webp)(['"])/g
  let match
  // 使用 exec 來獲取所有匹配
  while ((match = webpPathRegex.exec(fileContent)) !== null) {
    const [fullMatch, openQuote, webpPath, closeQuote] = match
    const possiblePaths = getPossibleAlternativePaths(webpPath)

    // 尋找第一個存在的替代檔案
    for (const alternativePath of possiblePaths) {
      if (fileExists(alternativePath)) {
        const foundExtension = path.extname(alternativePath)
        // 保持原始路徑結構，只替換副檔名
        let newPath = webpPath.replace(".webp", foundExtension)

        // 如果原始路徑不包含 public，但新路徑包含，則移除 public
        if (!webpPath.startsWith("public/") && newPath.startsWith("public/")) {
          newPath = newPath.replace("public/", "")
        }

        const replacement = `${openQuote}${newPath}${closeQuote}`
        newContent = newContent.replace(fullMatch, replacement)
        modified = true
        console.log(`在 ${filePath} 中:
                    替換 ${webpPath} 
                    為 ${newPath}
                    (對應實際檔案: ${alternativePath})`)
        break
      }
    }
  }

  return { content: newContent, modified }
}

// 主要執行函數
async function main() {
  try {
    const srcPath = path.resolve("./src")
    const files = getAllFiles(srcPath)

    let totalModified = 0
    let totalReplacements = 0
    let index = 0
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8")
      const { content: newContent, modified } = replaceWebpPaths(content, file, index)

      if (modified) {
        fs.writeFileSync(file, newContent)
        totalModified++
      }
      index++
    }

    console.log(`\n處理完成！
        總共修改了 ${totalModified} 個檔案`)
  } catch (error) {
    console.error("發生錯誤:", error)
  }
}

// 執行腳本
main()
