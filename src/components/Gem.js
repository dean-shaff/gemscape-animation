import React, { Component } from "react"

class Gem extends Component {
  render() {
    const {data, type, __fillOpacity, ...otherProps} = this.props
    // console.log(`Gem: style=${JSON.stringify(style, null, 2)}`)
    // console.log(`Gem: transform=${otherProps.transform}`)
    if (type === 'path') {
      return (<path d={data} {...otherProps} ref={path => this.path = path}/>)
    } else if (type === 'polygon') {
      return (<polygon points={data} {...otherProps} ref={path => this.path = path}/>)
    }
  }
}

export default Gem
