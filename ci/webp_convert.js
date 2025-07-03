const webp = require("webp-converter")
const { GlobSync } = require("glob")
const path = require("path")
const fromRoot = (subPath) => path.join(__dirname, "..", subPath)
// use node 20
GlobSync(fromRoot("public/public/file/conver/*.png")).found.map(async (fullPath) => {
  const parser = path.parse(fullPath)
  if (fullPath.endsWith(".gif")) {
    await webp.gwebp(fullPath, `${parser.dir}/${parser.name}.webp`)
  } else {
    await webp.cwebp(fullPath, `${parser.dir}/${parser.name}.webp`)
  }
})
