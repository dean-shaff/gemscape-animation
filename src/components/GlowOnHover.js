import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

// import { useSpring, animated } from 'react-spring'
import { Spring, animated } from 'react-spring/renderprops'
// import { motion } from 'framer-motion'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import { scale, parseGemscapeXML } from './../util.js'


export class GlowOnHoverContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 100,
      yVal: 100,
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(evt) {
    const target = evt.target;
    const value = target.value;
    const name = target.name;
    console.log(`ParallaxContainer.handleChange: ${name}, ${value}`)
    this.setState({
      [name]: value
    })
  }

  render(){
    return (
      <div className="level">
        <div className="level-left">
        <div className="level-item">
          <div className="box">
            <h3 className="title is-3">GlowOnHover</h3>
            {/*<OpacityOnHover mass={1} tension={120}  {...this.props}></OpacityOnHover>*/}
            <GlowOnHover config={{mass: 1.0, tension: 280, friction:120}} {...this.props}></GlowOnHover>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

class OpacityOnHover extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      toggle: true,
      opacity: 1
    }
    this.ref = React.createRef()
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    this.setState({
      'toggle': ! this.state.toggle
    })
  }

  render() {
    if (this.props.svg != null) {
      const onMouseMove = ({ clientX: x, clientY: y }) => {
        this.setState({
          'opacity': x / this.ref.current.offsetWidth
        })
      }

      return (
        <div ref={this.ref} onMouseMove={onMouseMove} className="title">
          <Spring
            from={{ opacity: 0 }}
            to={{ opacity: this.state.opacity }}
            config={this.props.config}>
            {props => <div style={props}>Hello</div>}
          </Spring>
        </div>
      )
    }
    return null
  }
}



export class GlowOnHover extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      opacities: new Array()
    }
    this.pathRefs = new Array()
    this.gemscapeRef = React.createRef()
    this.calcOpacities = this.calcOpacities.bind(this)
  }

  // componentDidMount() {
  //   const paths = this.props.svg.paths
  //   console.log(`GlowOnHover.componentDidMount: ${paths.length}`)
  // }

  calcOpacities (x, y) {
    const svg = this.gemscapeRef.current.svg
    const paths = this.props.svg.paths
    let point = svg.createSVGPoint()
    point.x = x
    point.y = y
    point = point.matrixTransform(svg.getScreenCTM().inverse())

    if (this.pathRefs[0] !== undefined) {
      let matrix = this.pathRefs[0].path.getCTM()
      let cursor = point.matrixTransform(matrix.inverse())

      const newOpacities = this.pathRefs.map((path, idx) => {
        let inside = path.path.isPointInFill(cursor)
        let fillOpacity = parseFloat(paths[idx]['__fillOpacity'])
        if (inside) {
          return fillOpacity * 1.5
        } else {
          return fillOpacity * 0.5
        }
      })
      return newOpacities
    } else {
      return (new Array(this.props.svg.paths.length)).fill(1.0)
    }
  }

  render() {
    if (this.props.svg != null) {
      const svg = this.props.svg.svg
      const paths = this.props.svg.paths
      const onMouseMove = ({ clientX: x, clientY: y }) => {
        // console.log(`onMouseMove`)
        const opacities = this.calcOpacities(x, y)
        this.setState({
          'opacities': opacities
        })
      }
      svg.onMouseMove = onMouseMove
      let gems = paths.map((val, idx) => {
        return (
          <g key={idx}>
            <Spring config={this.props.config} from={{opacity: 1}} to={{opacity: this.state.opacities[idx]}}>
              {props => (
                <Gem {...val} fillOpacity={props.opacity} ref={ref => this.pathRefs[idx] = ref}/>
              )}
            </Spring>
          </g>
        )
      })
      return (
        <Gemscape svg={svg} rect={this.props.svg.rect} g={this.props.svg.g} ref={this.gemscapeRef}>
          {gems}
        </Gemscape>
      )

      // svg.onMouseMove = onMouseMove
      // return (
      //   <Gemscape svg={svg} rect={this.props.svg.rect} g={this.props.svg.g} ref={this.gemscapeRef}>
      //     {/*<Spring config={this.props.config} to={{ 'opacities': this.state.opacities }}>*/}
      //     <Spring config={this.props.config} to={{interpolate: this.state.opacities}}>
      //       {props => {
      //         console.log(props.interpolate)
      //         return paths.map((val, idx) => (
      //           <g key={idx}>
      //             <Gem {... val} fillOpacity={props.interpolate[idx]} ref={ref => this.pathRefs[idx] = ref}/>
      //           </g>
      //         ))
      //       }}
      //     </Spring>
      //   </Gemscape>
      // )
    } else {
      return null
    }


  }


}
