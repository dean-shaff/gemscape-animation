import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

// import { useSpring, animated } from 'react-spring'
import { Spring } from 'react-spring/renderprops'

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
            <GlowOnHover mass={1} tension={120}  {...this.props}></GlowOnHover>
          </div>
        </div>
        </div>
      </div>
    )
  }
}


export class GlowOnHover extends React.Component {

  constructor(props) {
    super(props)
  }

  calcOpacityFactory () {
    console.log(`calcOpacityFactory`)
    return (x, y) => {
      console.log(`calcOpacityFactory.anonymous`)
      const svg = gemscapeRef.current.svg
      const paths = props.svg.paths
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())

      let matrix = pathRefs[0].path.getCTM()
      let cursor = point.matrixTransform(matrix.inverse())

      let newOpacities = pathRefs.map((path, idx) => {
        let inside = path.path.isPointInFill(cursor)
        if (inside) {
          return 1.0
        } else {
          return 0.1
        }
      })
      return newOpacities
    }
  }



  render() {
    let gemscape = null
    if (props.svg != null) {
      const svg = props.svg.svg
      const paths = props.svg.paths
      // const calcCursor = calcCursorFactory()
      const calcOpacity = calcOpacityFactory()
      // svg.onMouseMove = ({ clientX: x, clientY: y }) => calcCursor(x, y)
      svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ opacity: calcOpacity(x, y) })
      console.log(state.opacity)
      // svg.onClick = ({ clientX: x, clientY: y }) => calcCursor(x, y)

      let gems = paths.map((val, idx) => {
        let {fillOpacity, ...otherKeys} = val
        // if (opacities[idx] != null) {
        //   fillOpacity = opacities[idx]
        // }
        console.log(state.opacity[idx])
        return (<animated.g key={idx}>
          <Gem key={idx} {...otherKeys} fillOpacity={state.opacity[idx]} ref={ref => pathRefs[idx] = ref}></Gem>
        </animated.g>)
      })

      gemscape = (<Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
        {gems}
      </Gemscape>)
    }

    return gemscape
  }


}

// export  function GlowOnHover (props) {
//   console.log(`GlowOnHover: number=${props.number}`)
//   const gemscapeRef = useRef(null);
//   const pathRefs = []
//
//   // const [opacities, setOpacities] = useState([])
//   // const [inside, setInside] = useState([])
//   // const [springs, set, stop] = useSprings(
//   //   props.number,
//   //   index => ({
//   //     from: {opacity: 0.5},
//   //     to: {opacity: 1.0},
//   //     config: {duration: 1000}
//   //   })
//   // )
//
//   const calcOpacityFactory = function () {
//     console.log(`calcOpacityFactory`)
//     return (x, y) => {
//       console.log(`calcOpacityFactory.anonymous`)
//       const svg = gemscapeRef.current.svg
//       const paths = props.svg.paths
//       let point = svg.createSVGPoint()
//       point.x = x
//       point.y = y
//       point = point.matrixTransform(svg.getScreenCTM().inverse())
//
//       let matrix = pathRefs[0].path.getCTM()
//       let cursor = point.matrixTransform(matrix.inverse())
//
//       let newOpacities = pathRefs.map((path, idx) => {
//         let inside = path.path.isPointInFill(cursor)
//         if (inside) {
//           return 1.0
//         } else {
//           return 0.1
//         }
//       })
//       return newOpacities
//
//       // let newInside = pathRefs.map((gem, idx) => {
//       //   let isInside = gem.path.isPointInFill(cursor)
//       //   if (isInside) {
//       //     let newOp = paths[idx].__fillOpacity * 1.5
//       //     if (newOp > 1.0) {
//       //       newOp = 1.0
//       //     }
//       //     // return newOp.toString()
//       //   } else {
//       //     // return paths[idx].__fillOpacity
//       //   }
//       //   return isInside
//       // })
//
//       // setInside(newInside)
//       // setOpacities(newOpacities)
//       // return [cursor.x, cursor.y]
//     }
//   }
//
//   const calcTransformFactory = function (xScale, yScale) {
//     const [width, height] = [props.svg.svg['width'], props.svg.svg['height']]
//     return (x, y) => {
//       let xPos = (x - width/2)
//       let yPos = (y - height/2)
//       let translateStr = `translate(${xPos*xScale}, ${yPos*yScale})`
//       return translateStr
//     }
//   }
//   const configObj = {
//     mass: props.mass, tension: props.tension, friction: props.friction
//   }
//
//   // const [state, set] = useSpring(() => ({ xy: [0, 0], opacity: new Array(props.number), config: configObj }))
//   const [state, set] = useSpring(() => ({ opacity: new Array(props.number), config: configObj }))
//   console.log(`state.opacity=${state.opacity}`)
//
//   // const [open, toggle] = useState(true)
//   // const { transform, opacity } = useSpring({
//   //   reverse: open,
//   //   from: { opacity: 0.5, transform: 'scale(1.0)' },
//   //   to: { opacity: 1, transform: 'scale(1.2)' },
//   //   config: { duration: 500 }
//   // })
//
//   let gemscape = null
//   if (props.svg != null) {
//     const svg = props.svg.svg
//     const paths = props.svg.paths
//     // const calcCursor = calcCursorFactory()
//     const calcOpacity = calcOpacityFactory()
//     // svg.onMouseMove = ({ clientX: x, clientY: y }) => calcCursor(x, y)
//     svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ opacity: calcOpacity(x, y) })
//     console.log(state.opacity)
//     // svg.onClick = ({ clientX: x, clientY: y }) => calcCursor(x, y)
//
//     let gems = paths.map((val, idx) => {
//       let {fillOpacity, ...otherKeys} = val
//       // if (opacities[idx] != null) {
//       //   fillOpacity = opacities[idx]
//       // }
//       console.log(state.opacity[idx])
//       return (<animated.g key={idx}>
//         <Gem key={idx} {...otherKeys} fillOpacity={state.opacity[idx]} ref={ref => pathRefs[idx] = ref}></Gem>
//       </animated.g>)
//     })
//
//     gemscape = (<Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
//       {gems}
//     </Gemscape>)
//   }
//
//   return gemscape
// }
