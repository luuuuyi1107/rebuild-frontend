export default ({ text }) => {
  const isImage = (url) => {
    // 判断是否是图片链接
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
  }

  return isImage(text) ? (
    <img src={text} alt="image" style={{ maxWidth: "100%", height: "auto" }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: text }}></span>
  )
}
