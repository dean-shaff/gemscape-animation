import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring/renderprops'
import { useSprings, animated } from 'react-spring'

import convert from 'color-convert'

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
              <GlowOnHoverFunctional {...this.props} config={config}/>
              {/*<OpacityOnHover config={config} hslScale={this.state.scaleFactor}/>*/}
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
      std: 0.0,
      blur: 0,
      scaleFactor: 5.0,
      fill: "#6187ac",
      __fill: "#6187ac"
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
      const path = this.polygonRef.current
      const bbox = path.getBBox()
      const svg = this.ref.current
      const { width, height } = svg.getBoundingClientRect()
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())

      const matrix = path.getCTM()
      const cursor = point.matrixTransform(matrix.inverse())

      let opacity = 0.5
      let fill = this.state.__fill
      let std = 0.0
      let blur = 0
      if (path.isPointInFill(cursor)) {
        opacity = 1.0
        let hsl = convert.hex.hsl(fill)
        let delta = this.props.hslScale - 1.0
        hsl[1] = this.props.hslScale*hsl[1]
        hsl[2] = 1.05*hsl[2]
        fill = `#${convert.hsl.hex(hsl)}`
        std = 2.0
        blur = 5
      }

      // console.log(convert.hex.hsl(fill))

      const xOffset = (bbox.x + bbox.width/2)*this.state.scaleFactor
      const yOffset = (bbox.y + bbox.height/2)*this.state.scaleFactor

      // const xMax = Math.max(xOffset, width - xOffset)
      // const yMax = Math.max(yOffset, height - yOffset)
      // const maxDist = calcDist([0, 0], [xMax, yMax])
      const dist = calcDist([point.x, point.y], [xOffset, yOffset])
      // const opacity = 1.0 - 0.5*(dist / maxDist)


      this.setState({
        // 'dx': -(point.x - xOffset)/20,
        // 'dy': -(point.y - yOffset)/20,
        // 'std': (dist + 0.5) / 200,
        'std': std,
        'blur': blur,
        'opacity': opacity,
        // 'fill': fill
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

    const config = Object.assign({clamp: true}, this.props.config)

    return (
      <div onMouseMove={onMouseMove}>
        <svg ref={this.ref} width="930" height="300">
          <defs>
            <filter id="shadow" height="300%" width="300%" x="-50%" y="-50%">
              <Spring
                // from={{ opacity: 0.0, dx: 0, dy: 0, std: 0.0}}
                // to={{ opacity: this.state.opacity, dx: this.state.dx, dy: this.state.dy, std: this.state.std }}
                from={{ opacity: 0.0, std: 0.0 }}
                to={{ opacity: this.state.opacity, std: this.state.std }}
                config={config}>
                {props => (
                  <feDropShadow dx={0} dy={0} stdDeviation={props.std} floodOpacity={props.opacity} floodColor={this.state.__fill}/>
                )}
              </Spring>
            </filter>
            {/*<filter id="displacementFilter" height="300%" width="300%">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="1" result="turbulence"/>
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/>
            </filter>*/}
          </defs>
          <g transform={`scale(${this.state.scaleFactor})`}>
            {/*<polygon fill="#6c6ba9" points="100,20,140,20,140,60,100,60" />*/}
            <Spring
              // from={{ opacity: 0.0, fill: this.state.fill}}
              // to={{ opacity: this.state.opacity, fill: this.state.fill }}
              from={{ opacity: 0.0, blur: 0.0 }}
              to={{ opacity: this.state.opacity, blur: this.state.blur }}

              config={config}>
              {props => (
                  <path
                    ref={this.polygonRef}
                    // filter="url(#shadow)"
                    // filter="url(#displacementFilter)"
                    filter={`drop-shadow(0px 0px ${props.blur}px ${this.state.fill})`}
                    fillOpacity={props.opacity}
                    d="M 125.68 31.55 Q 126.86 32.48, 126.11 33.78 L 120.90 42.83 Q 120.15 44.13, 119.05 45.15 L 111.42 52.28 Q 110.32 53.30, 109.56 52.01 L 104.78 43.94 Q 104.02 42.65, 103.71 41.18 L 101.75 32.02 Q 101.44 30.55, 100.96 29.13 L 99.68 25.37 Q 99.20 23.95, 99.58 22.50 L 100.57 18.65 Q 100.95 17.20, 102.33 17.79 L 113.54 22.53 Q 114.92 23.12, 116.10 24.05 L 125.68 31.55"
                    fill={this.state.fill}
                    label="middle"
                    layer="1"/>
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


const GlowOnHoverFunctional = (props) => {
  console.log(`GlowOnHoverFunctional: props.number=${props.number}`)

  const gemscapeRef = useRef(null)
  const pathRefs = []

  const [toggle, setToggle] = useState(false)
  const [opacities, setOpacities] = useState(new Array(props.number))
  const [fills, setFills] = useState(new Array(props.number))
  const [blurs, setBlurs] = useState(new Array(props.number))
  const [transforms, setTransforms] = useState(new Array(props.number))

  const [springs, set, stop] = useSprings(props.number, index => ({opacity: 1, config: props.config}))

  useEffect(() => {
    const parsed = props.parsedSVG
    if (parsed === null) {
      return
    }
    const [initOpacities, initFills, initBlurs, initTransforms] = parsed.paths.reduce((acc, cur) => {
      acc[0].push(parseFloat(cur['__fillOpacity']))
      acc[1].push(cur.fill)
      acc[2].push(0)
      acc[3].push('scale(1.0) translate(0.0, 0.0)')
      return acc
    }, [[], [], [], []])

    setOpacities(initOpacities)
    setFills(initFills)
    setBlurs(initBlurs)
    setTransforms(initTransforms)
  }, [props.parsedSVG])

  useEffect(() => {
    const config = Object.entries(props.config).reduce((acc, [key, val]) => {
      acc[key] = parseInt(val)
      return acc
    }, {})
    set(idx => ({'config': config}))
  }, [props.config])

  const getDefault = (paths) => {
    return paths.reduce((acc, cur) => {
      acc[0].push(parseFloat(cur['__fillOpacity']))
      acc[1].push(cur.fill)
      acc[2].push(0)
      acc[3].push('scale(1.0) translate(0.0, 0.0)')
      return acc
    }, [[], [], [], []])
  }


  const onClick = (evt) => {
    console.log(`onClick`)
    evt.preventDefault()
    // setOpacities(opacities.map(val => (Math.random())))
    let arr = opacities.map(val => (Math.random()))
    set(index => ({opacity: arr[index]}))
    // set(index => ({opacity: opacities[index]}))
  }

  const onMouseMove = ({ clientX: x, clientY: y }) => {
    // setOpacities(opacities.map(val => (Math.random())))
    let arr = opacities.map(val => (Math.random()))
    set(index => ({opacity: arr[index]}))
  }

  const parsed = props.parsedSVG

  if (parsed === null) {
    return null
  } else {
    // return (
    //   <div onMouseMove={onMouseMove}>
    //     {/*{springs.map((prop, idx) => <animated.div key={idx}>{prop.opacity}</animated.div>)}*/}
    //     {springs.map((props, idx) => {
    //       let result = props.opacity.interpolate(o => o)
    //       return (<animated.div key={idx}>{props.opacity.interpolate(o => o)}</animated.div>)
    //     })}
    //   </div>
    // )
    parsed.svg.onMouseMove = onMouseMove
    return (
      <Gemscape svg={parsed.svg} rect={parsed.rect} g={parsed.g} ref={gemscapeRef}>
        {springs.map((props, idx) => {
          return (
            <g key={idx}>
              <Gem {...parsed.paths[idx]} ref={ref => pathRefs[idx] = ref} fillOpacity={props.opacity} {...props}/>
            </g>
        )})}
      </Gemscape>
    )
  }
}



export class GlowOnHover extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      opacities: new Array(),
      transforms: new Array(),
      fills: new Array(),
      blurs: new Array()
    }
    this._pathRefs = new Array()
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
      'transforms': this.defaultTransforms(),
      'blurs': this.defaultBlurs(),
      'fills': this.defaultFills()
    })
  }

  defaultOpacities() {
    return this.props.svg.paths.map(p => parseFloat(p['__fillOpacity']))
  }

  defaultTransforms () {
    return this.props.svg.paths.map(p => 'scale(1.0) translate(0.0, 0.0)')
  }

  defaultBlurs () {
    return this.props.svg.paths.map(p => 0.0)
  }

  defaultFills () {
    return this.props.svg.paths.map(p => p.fill)
  }


  calcBlur (cursor, ref, path, idx) {
    let inside = ref.isPointInFill(cursor)
    if (inside) {
      return 10
    } else {
      return 0
    }
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
      // const defs = (
      //   <filter id="displacementFilter" height="300%" width="300%" x="-50%" y="-50%">
      //     <feTurbulence type="turbulence" baseFrequency="0.1" numOctaves="1" result="turbulence"/>
      //     <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/>
      //   </filter>
      // )

      const svg = this.props.svg.svg
      const paths = this.props.svg.paths
      // console.log(`GlowOnHover.render: ${paths.length} ${this._pathRefs.length}`)
      const calcOpacities = this.calcAttributeFactory(this.calcOpacity)
      const calcTransforms = this.calcAttributeFactory(this.calcTransform)
      const calcBlurs = this.calcAttributeFactory(this.calcBlur)
      const onMouseMove = ({ clientX: x, clientY: y }) => {
        let opacities = calcOpacities(x, y)
        if (opacities === null) {
          opacities = this.defaultOpacities()
        }
        let transforms = calcTransforms(x, y)
        if (transforms === null) {
          transforms = this.defaultTransforms()
        }
        let blurs = calcBlurs(x, y)
        if (blurs === null) {
          blurs = this.defaultBlurs()
        }
        this.setState({
          'opacities': opacities,
          'transforms': transforms,
          'blurs': blurs
        })
      }
      const defaultTransforms = this.defaultTransforms()
      const defaultOpacities = this.defaultOpacities()
      const defaultBlurs = this.defaultBlurs()


      svg.onMouseMove = onMouseMove
      let gems = paths.map((val, idx) => {
        return (
          <g key={idx}>
            <Spring
              config={this.props.config}
              from={{'fillOpacity': defaultOpacities[idx], 'transform': defaultTransforms[idx], 'blur': defaultBlurs[idx] }}
              to={{'fillOpacity': this.state.opacities[idx], 'transform': this.state.transforms[idx], 'blur': this.state.blurs[idx] }}>
              {props => (
                <Gem {...val} {...props} ref={ref => this._pathRefs[idx] = ref} filter={`drop-shadow(0px 0px ${props.blur}px ${this.state.fills[idx]})`}/>
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
