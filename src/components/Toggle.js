import React, {useRef} from 'react'
import { v4 as uuid } from 'uuid'

const Toggle = props => {

  const {title, checked, onChange, ...rest} = props
  const id = useRef(uuid())

  console.log(`Toggle: title=${title}, checked=${checked}`)

  let label = null
  if (title != null) {
    label = <label htmlFor={id.current}>{title}</label>
  }

  return (
    <div className="field">
      <input type="checkbox" className="switch" id={id.current} checked={checked} onClick={onChange} onChange={onChange} {...rest}/>
      {label}
    </div>
  )
}

export default Toggle
