import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { useSprings, animated } from 'react-spring'

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
            <GlowOnHover {...this.props}></GlowOnHover>
          </div>
        </div>
        </div>
      </div>
    )
  }
}


export  function GlowOnHover (props) {
  const gemscapeRef = useRef(null);
  const pathRefs = []

  // const [opacities, setOpacities] = useState([])
  const [inside, setInside] = useState([])
  const [springs, set, stop] = useSprings(
    props.number,
    index => ({
      from: {opacity: 0.5},
      to: {opacity: 1.0},
      config: {duration: 1000}
    })
  )

  const calcCursorFactory = function () {
    return (x, y) => {
      const svg = gemscapeRef.current.svg
      const paths = props.svg.paths
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())

      let matrix = pathRefs[0].path.getCTM()
      let cursor = point.matrixTransform(matrix.inverse())

      set(idx => {
        let inside = pathRefs[idx].path.isPointInFill(cursor)
        if (inside) {
          return {opacity: 1.0}
        } else {
          return {opacity: 0.1}
        }
      })

      // let newInside = pathRefs.map((gem, idx) => {
      //   let isInside = gem.path.isPointInFill(cursor)
      //   if (isInside) {
      //     let newOp = paths[idx].__fillOpacity * 1.5
      //     if (newOp > 1.0) {
      //       newOp = 1.0
      //     }
      //     // return newOp.toString()
      //   } else {
      //     // return paths[idx].__fillOpacity
      //   }
      //   return isInside
      // })

      // setInside(newInside)
      // setOpacities(newOpacities)
      return [cursor.x, cursor.y]
    }
  }

  const calcTransformFactory = function (xScale, yScale) {
    const [width, height] = [props.svg.svg['width'], props.svg.svg['height']]
    return (x, y) => {
      let xPos = (x - width/2)
      let yPos = (y - height/2)
      let translateStr = `translate(${xPos*xScale}, ${yPos*yScale})`
      return translateStr
    }
  }

  // const [state, set] = useSpring(() => ({ xy: [0, 0], config: { mass: 10, tension: 550, friction: 140 } }))
  // const [open, toggle] = useState(true)
  // const { transform, opacity } = useSpring({
  //   reverse: open,
  //   from: { opacity: 0.5, transform: 'scale(1.0)' },
  //   to: { opacity: 1, transform: 'scale(1.2)' },
  //   config: { duration: 500 }
  // })

  let gemscape = null
  if (props.svg != null) {
    const svg = props.svg.svg
    const paths = props.svg.paths
    const calcCursor = calcCursorFactory()
    svg.onMouseMove = ({ clientX: x, clientY: y }) => calcCursor(x, y)
    // svg.onClick = ({ clientX: x, clientY: y }) => calcCursor(x, y)

    let gems = paths.map((val, idx) => {
      let {fillOpacity, ...otherKeys} = val
      // if (opacities[idx] != null) {
      //   fillOpacity = opacities[idx]
      // }
      return (<animated.g key={idx}>
        <Gem key={idx} {...otherKeys} fillOpacity={springs[idx].opacity} ref={ref => pathRefs[idx] = ref}></Gem>
      </animated.g>)
    })

    gemscape = (<Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
      {gems}
    </Gemscape>)
  }

  return gemscape
}
