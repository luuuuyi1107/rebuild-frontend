export default ({ src, className = "", color = "" }) => {
  const extractPattern = (url) => {
    const match = url.match(/\/touxiang\/(.*)\.png/)
    return match ? match[1] : null
  }

  const BG_COLORS = {
    boy01: "A9D2FE",
    boy02: "FFE6A6",
    boy03: "A9D2FE",
    boy04: "FFE6A6",
    girl01: "A9D2FE",
    girl02: "FFE6A6",
    girl03: "FCE3A4",
    girl04: "A9D2FE",
    girl05: "FFE6A6",
    girl06: "A9D2FE",
  }

  let bgColor = color || BG_COLORS[extractPattern(src)]
  if (bgColor) {
    bgColor = bgColor.replace("#", "")
  }

  return (
    <div className={`${className}`} style={{ backgroundColor: `#${bgColor}` }}>
      <img className="w-full block" src={src} />
    </div>
  )
}
