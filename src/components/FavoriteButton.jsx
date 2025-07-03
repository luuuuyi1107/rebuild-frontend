export default (props) => {
  return (
    <div
      className={"p-1  " + (props.className ?? "absolute right-0 top-0")}
      onClick={(event) => {
        event.stopPropagation()
        props.onClick()
      }}
    >
      <img className="w-[15px] h-[15px]" src={util.buildAssetsPath(`assets/icons/ic_heart${props.active ? "_fill" : ""}.svg`)} />
    </div>
  )
}
