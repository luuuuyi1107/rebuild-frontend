interface ButtonsProps {
  btns: string[]
  onClick: (index: number) => void
  className?: string
}

export default ({ btns, onClick, className = "" }: ButtonsProps) => {
  return (
    <div className={"flex gap-[10px] text-[16px] font-[400] " + className}>
      {btns.map((btn, index) => {
        return (
          <div
            key={index}
            onClick={onClick.bind(null, index)}
            className={
              "border-theme border-solid border-[1px] rounded-[6px] py-1 flex-1 leading-none " +
              (index === 0 ? "active:bg-theme/10 text-theme bg-white" : "active:bg-theme/90 text-white bg-theme")
            }
          >
            {btn}
          </div>
        )
      })}
    </div>
  )
}
