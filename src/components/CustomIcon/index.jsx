/**
 * Created on 2017/10/17.
 */

import React from "react"

const CustomIcon = ({ type: SvgComponent, className = "", size = "md", ...restProps }) => (
  <SvgComponent className={`am-icon am-icon-${size} ${className}`} {...restProps}></SvgComponent>
)

export default CustomIcon
