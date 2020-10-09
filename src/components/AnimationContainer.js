import React from "react"

const AnimationContainer = (props) => {
  return (
    <div className="level">
      <div className="level-left">
      <div className="level-item">
        <div className="box">
          <div className="level">
            <h3 className="title is-3">{props.title}</h3>
          </div>
          {props.children}
        </div>
      </div>
      </div>
    </div>
  )
}

export default AnimationContainer
