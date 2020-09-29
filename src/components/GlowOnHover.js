import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { Spring, animated } from 'react-spring/renderprops'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import SpringSliders from './SpringSliders.js'
import Slider from './Slider.js'
import { scale, parseGemscapeXML, calcOffset, calcDist } from './../util.js'


export class GlowOnHoverContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scaleFactor: 1.1,
      mass: 1,
      tension: 120,
      friction: 14,
      velocity: 0.0
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
    let {scaleFactor, ...config} = this.state
    // console.log(`GlowOnHoverContainer.render: config=${JSON.stringify(config, null, 2)}`)
    config.velocity = parseFloat(config.velocity)
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
              <SpringSliders {...config} onChange={this.handleChange}/>
              <OpacityOnHover config={config}/>
              {/*<GlowOnHover
                config={config}
                scaleFactor={this.state.scaleFactor}
                {...this.props}/>*/}
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
      opacity: 1.0,
      dx: 0,
      dy: 0,
      std: 1.0,
      scaleFactor: 5.0
    }
    this.ref = React.createRef()
    this.polygonRef = React.createRef()
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    this.setState({
      'toggle': ! this.state.toggle
    })
  }

  render() {
    const onMouseMove = ({ clientX: x, clientY: y }) => {
      const bbox = this.polygonRef.current.getBBox()
      const svg = this.ref.current
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())
      // console.log(point)
      // let [xOffset, yOffset] = [
      //   calcOffset(bbox.x, bbox.width, this.state.scaleFactor),
      //   calcOffset(bbox.y, bbox.height, this.state.scaleFactor),
      // ]
      let xOffset = (bbox.x + bbox.width/2)*this.state.scaleFactor
      let yOffset = (bbox.y + bbox.height/2)*this.state.scaleFactor

      let dist = calcDist([point.x, point.y], [xOffset, yOffset])


      this.setState({
        dx: -(point.x - xOffset)/20,
        dy: -(point.y - yOffset)/20,
        std: (dist + 0.5) / 200
      })
    }

    const onClick = ({ clientX: x, clientY: y }) => {
      let newOpacity = 0.0
      if (this.state.opacity === 0.0) {
        newOpacity = 1.0
      }
      this.setState({
        'opacity': newOpacity
      })
    }

    return (
      <div onClick={onClick} onMouseMove={onMouseMove}>
        <svg ref={this.ref} width="930" height="300">
          <defs>
            <filter id="shadow" height="300%" width="300%" x="-50%" y="-50%">
              <Spring
                from={{ opacity: 0.0, dx: 0, dy: 0, std: 0.0}}
                to={{ opacity: 1.0, dx: this.state.dx, dy: this.state.dy, std: this.state.std }}
                config={this.props.config}>
                {props => (
                  <feDropShadow dx={props.dx} dy={props.dy} stdDeviation={props.std} floodOpacity={props.opacity}/>
                )}
              </Spring>
            </filter>
          </defs>
          <g transform={`scale(${this.state.scaleFactor})`}>
            <polygon fill="#6c6ba9" fillOpacity={this.state.opacity} points="100,20,140,20,140,60,100,60" />
            <Spring
              from={{ opacity: 0.0}}
              to={{ opacity: this.state.opacity }}
              config={this.props.config}>
              {props => (
                  <path ref={this.polygonRef} filter="url(#shadow)" fillOpacity={props.opacity} d="M 125.68 31.55 Q 126.86 32.48, 126.11 33.78 L 120.90 42.83 Q 120.15 44.13, 119.05 45.15 L 111.42 52.28 Q 110.32 53.30, 109.56 52.01 L 104.78 43.94 Q 104.02 42.65, 103.71 41.18 L 101.75 32.02 Q 101.44 30.55, 100.96 29.13 L 99.68 25.37 Q 99.20 23.95, 99.58 22.50 L 100.57 18.65 Q 100.95 17.20, 102.33 17.79 L 113.54 22.53 Q 114.92 23.12, 116.10 24.05 L 125.68 31.55" fill="#6187ac" label="middle" layer="1"></path>

              )}
            </Spring>

          </g>
        {/*<Spring
          from={{ opacity: 0 }}
          to={{ opacity: this.state.opacity }}
          config={this.props.config}>
          {props => <div style={props}>Hello</div>}
        </Spring>*/}
        </svg>
      </div>
    )
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
    // console.log(`GlowOnHover.render: config=${JSON.stringify(this.props.config, null, 2)}`)
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
