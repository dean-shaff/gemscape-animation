import React, { Component } from "react"

class Gem extends Component {
  render() {
    const {data, type, fill, fillOpacity, style, ...otherProps} = this.props
    // console.log(`Gem: style=${JSON.stringify(style, null, 2)}`)
    // console.log(`Gem: fillOpacity=${fillOpacity}`)
    if (type === 'path') {
      return (<path d={data} fill={fill} fillOpacity={fillOpacity} style={style} ref={path => this.path = path}/>)
    } else if (type === 'polygon') {
      return (<polygon points={data} fill={fill} fillOpacity={fillOpacity} style={style} ref={path => this.path = path}/>)
    }
  }
}

export default Gem
