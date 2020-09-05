import React, { Component } from "react"

const Gem = (props) => {
  const {data, type, ...otherProps} = props
  if (type === 'path') {
    return (<path d={props.data} {...props}/>)
  } else if (type === 'polygon') {
    return (<polygon points={props.data} {...props}/>)
  }
}



export default Gem
