import React, { Component } from "react"

class Gem extends Component {
  render() {
    const {data, type, fill, fillOpacity, ...otherProps} = this.props
    if (type === 'path') {
      return (<path d={data} fill={fill} fillOpacity={fillOpacity} ref={path => this.path = path}/>)
    } else if (type === 'polygon') {
      return (<polygon points={data} fill={fill} fillOpacity={fillOpacity} ref={path => this.path = path}/>)
    }
  }
}

export default Gem
