export default ({ options, onChange, name, ...props }) => {
  return (
    <select name={name} onChange={onChange} {...props} className="border-0 text-1.125">
      {options.map(({ value, name }) => (
        <option value={value} key={value}>
          {name}
        </option>
      ))}
    </select>
  )
}
