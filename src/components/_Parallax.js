

// class Parallax extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       xVal: 100,
//       yVal: 100,
//       transformData: null,
//       bbox: null,
//       xy: [0, 0]
//     }
//     this.handleChange = this.handleChange.bind(this)
//     this.handleOnMouseMoveFactory = this.handleOnMouseMoveFactory.bind(this)
//   }
//
//   handleChange(evt) {
//     const target = evt.target;
//     const value = target.value;
//     const name = target.name;
//     console.log(`Parallax.handleChange: ${name}, ${value}`)
//     this.setState({
//       [name]: value
//     })
//   }
//
//   handleOnMouseMoveFactory(len) {
//     // console.log(`Parallax.handleOnMouseMoveFactory: ${len}`)
//     const [width, height] = [this.props.svg.svg['width'], this.props.svg.svg['height']]
//     return evt => {
//       const svg = this.gemscape.svg
//       let point = svg.createSVGPoint()
//       point.x = evt.clientX
//       point.y = evt.clientY
//       let cursor = point.matrixTransform(svg.getScreenCTM().inverse())
//       let transformData = new Array(len)
//       const xVal = this.state.xVal
//       const yVal = this.state.yVal
//
//       const [min, max] = [-1/xVal, 1/xVal]
//       const incre = (max - min) / len
//
//       for (let idx=0; idx<len; idx++) {
//         let val = idx*incre + min
//         transformData[idx] = {
//           scale: 1.0,
//           translate: [(cursor.x - width/2)*val, (cursor.y - height/2)*val]
//         }
//       }
//       this.setState({
//         'transformData': transformData
//       })
//     }
//   }
//
//   parseTransformData(transformData){
//     if (transformData == null) {
//       let parsed = new Array(this.props.svg.paths.len)
//       for (let idx=0; idx<parsed.length; idx++) {
//         parsed[idx] = `scale(1.0) translate(0.0, 0.0)`
//       }
//       return parsed
//     } else {
//       let parsed = new Array(transformData.length)
//       for (let idx=0; idx<transformData.length; idx++) {
//         let scale = transformData[idx].scale
//         let translate = transformData[idx].translate
//         parsed[idx] = `scale(${scale}) translate(${translate[0]}, ${translate[1]})`
//       }
//       return parsed
//     }
//   }
//
//   calcCursorFactory() {
//     const svg = this.gemscape.svg
//     return (x, y) => {
//       let point = svg.createSVGPoint()
//       point.x = x
//       point.y = y
//       let cursor = point.matrixTransform(svg.getScreenCTM().inverse())
//       return [cursor.x, cursor.y]
//     }
//   }
//
//   calcTransformFactory(idx) {
//     const [width, height] = [this.props.svg.svg['width'], this.props.svg.svg['height']]
//     const incre = 0.01
//     const start = -0.1
//     return (x, y) => {
//       let val = idx*incre + start
//       let xPos = (x - width/2)*val
//       let yPos = (y - height/2)*val
//       return `translate(${xPos*val}, ${yPos*val})`
//     }
//   }
//
//
//
//   render() {
//     let gemscape = null
//
//     if (this.props.svg != null) {
//       const [props, set] = useSpring(() => ({ xy: [0, 0], config: { mass: 10, tension: 550, friction: 140 } }))
//       // const transform = this.parseTransformData(this.state.transformData)
//       let svg = this.props.svg.svg
//       // svg.onMouseMove = this.handleOnMouseMoveFactory(this.props.svg.paths.length)
//       const calcCursor = this.calcCursorFactory()
//       svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursor(x, y) })
//
//       gemscape = (<Gemscape svg={svg} rect={this.props.svg.rect} g={this.props.svg.g} ref={(gemscape) => this.gemscape = gemscape}>
//         {this.props.svg.paths.map((val, idx) =>
//           <animated.g key={idx} style={{ transform: props.xy.interpolate(this.calcTransformFactory(idx)) }}>
//             <Gem key={idx} {...val}></Gem>
//           </animated.g>
//         )}
//       </Gemscape>)
//     }
//
//     return (
//       <div className="level">
//     		<div className="level-left">
//     		<div className="level-item">
//     			<div className="box">
//     				<h3 className="title is-3">Parallax</h3>
// 						<div className="field">
// 							<label className="label">x-direction factor</label>
// 							<input className="input" name="xVal" min="0" max="100" type="number" value={this.state.xVal} step="5" onChange={this.handleChange}></input>
// 						</div>
// 						<div className="field">
// 							<label className="label">y-direction factor</label>
// 							<input className="input" name="yVal" min="0" max="100" type="number" value={this.state.yVal} step="5" onChange={this.handleChange}></input>
// 						</div>
//     				<div>
//               {gemscape}
//     				</div>
//     			</div>
//     		</div>
//     	</div>
//     </div>
//     )
//   }
// }
