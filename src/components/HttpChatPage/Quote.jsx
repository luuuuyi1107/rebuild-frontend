export default ({ text, time, name, children }) => (
  <>
    <span className="quote block p-[8px] mb-[8px] border-x-0 border-t-0 border-b-[1px] border-solid border-[#eee] italic whitespace-pre-line">
      <span className="quote-content">{text}</span>
      <span className="quote-info mt-[8px] block text-[#bbb] text-[0.22rem]">
        {time}
        <span className="mr-[8px]" />
        {name}
      </span>
    </span>
    {children}
  </>
)
