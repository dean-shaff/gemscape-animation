import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { Spring } from 'react-spring/renderprops'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import SpringSliders from './SpringSliders.js'
import Slider from './Slider.js'
import { scale, parseGemscapeXML, calcOffset } from './../util.js'


export class GlowOnHoverContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scaleFactor: 1.1,
      mass: 1,
      tension: 120,
      friction: 14
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
            <div className="level">
              <h3 className="title is-3">GlowOnHover</h3>
            </div>
            <div className="box">
              <div className="columns">
                <div className="column is-one-third">
                  <Slider val={this.state.scaleFactor} onChange={this.handleChange} min={1.0} max={2.0} step={0.1} name="scaleFactor" title="Scale Factor"/>
                </div>
              </div>
              <SpringSliders mass={this.state.mass} tension={this.state.tension} friction={this.state.friction} onChange={this.handleChange}/>
              <GlowOnHover
                config={{mass: this.state.mass, tension: this.state.tension, friction:this.state.friction}}
                scaleFactor={this.state.scaleFactor}
                {...this.props}/>
            </div>
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
      opacities: new Array(),
      transforms: new Array()
    }
    this._pathRefs = new Array()
    // this.pathRefs = new Map()
    this.gemscapeRef = React.createRef()
    this.calcOpacity = this.calcOpacity.bind(this)
    this.calcTransform = this.calcTransform.bind(this)
    this.calcAttributeFactory = this.calcAttributeFactory.bind(this)
  }

  componentDidUpdate (prevProps) {
    // console.log(`GlowOnHover.componentDidUpdate: ${prevProps.svg}, ${this.props.svg}`)
    if (prevProps.svg === null && this.props.svg !== null) {
      this.reset()
      return
    }
    if (this.props.svg !== null) {
      if (prevProps.fileName !== this.props.fileName) {
        // console.log(`GlowOnHover.componentDidUpdate: ${prevProps.fileName}, ${this.props.fileName}`)
        // console.log(this.props.svg.paths.length)
        this.reset()
        return
      }
    }
  }

  reset() {
    this.setState({
      'opacities': this.defaultOpacities(),
      'transforms': this.defaultTransforms()
    })
  }

  defaultOpacities() {
    return this.props.svg.paths.map(p => parseFloat(p['__fillOpacity']))
  }

  defaultTransforms () {
    return this.props.svg.paths.map(p => 'scale(1.0) translate(0.0, 0.0)')
  }


  calcOpacity (cursor, ref, path, idx) {
    let fillOpacity = parseFloat(path['__fillOpacity'])
    let inside = ref.isPointInFill(cursor)
    if (inside) {
      return fillOpacity * 1.5
    } else {
      return fillOpacity
    }
  }

  calcTransform (cursor, ref, path, idx) {
    let inside = ref.isPointInFill(cursor)
    if (inside) {
      let bbox = ref.getBBox()
      let [xOffset, yOffset] = [
        calcOffset(bbox.x, bbox.width, this.props.scaleFactor),
        calcOffset(bbox.y, bbox.height, this.props.scaleFactor),
      ]
      return `scale(${this.props.scaleFactor}) translate(${-xOffset}, ${-yOffset})`
    } else {
      return 'scale(1.0) translate(0.0, 0.0)'
    }
  }

  getPathsFromSVG (svg) {
    let paths = []
    for (let node of svg.childNodes[1].childNodes) {
      paths.push(node.childNodes[0])
    }
    return paths
  }


  calcAttributeFactory (cb) {
    return (x, y) => {
      const svg = this.gemscapeRef.current.svg
      const pathRefs = this._pathRefs.filter(ref => ref != null).map(ref => ref.path)
      // const pathRefs = this.getPathsFromSVG(svg)
      const paths = this.props.svg.paths
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())
      let first = pathRefs[0]
      if (first !== undefined) {
        let matrix = first.getCTM()
        let cursor = point.matrixTransform(matrix.inverse())
        const result = pathRefs.map((ref, idx) => {
          return cb(cursor, ref, paths[idx], idx)
        })
        return result
      } else {
        return null
      }
    }
  }


  render() {
    if (this.props.svg != null) {
      const svg = this.props.svg.svg
      const paths = this.props.svg.paths
      // console.log(`GlowOnHover.render: ${paths.length} ${this._pathRefs.length}`)
      const calcOpacities = this.calcAttributeFactory(this.calcOpacity)
      const calcTransforms = this.calcAttributeFactory(this.calcTransform)
      const onMouseMove = ({ clientX: x, clientY: y }) => {
        let opacities = calcOpacities(x, y)
        if (opacities === null) {
          opacities = this.defaultOpacities()
        }
        let transforms = calcTransforms(x, y)
        if (transforms === null) {
          transforms = this.defaultTransforms()
        }
        this.setState({
          'opacities': opacities,
          'transforms': transforms
        })
      }
      const defaultTransforms = this.defaultTransforms()
      const defaultOpacities = this.defaultOpacities()

      svg.onMouseMove = onMouseMove
      let gems = paths.map((val, idx) => {
        return (
          <g key={idx}>
            <Spring
              config={this.props.config}
              from={{'fillOpacity': defaultOpacities[idx], 'transform': defaultTransforms[idx]}}
              to={{'fillOpacity': this.state.opacities[idx], 'transform': this.state.transforms[idx]}}>
              {props => (
                <Gem {...val} {...props} ref={ref => this._pathRefs[idx] = ref}/>
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
