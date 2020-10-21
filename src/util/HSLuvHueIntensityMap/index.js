import hsluv from "hsluv"

import params from "./params.js"
import { scale } from "./../util.js"


const paramKeys = (Object.keys(params).map(v => parseInt(v))).sort((a, b) => a - b)


export const findClosestKeys = function (hue) {
  let delta = Math.abs(hue - paramKeys[0])
  for (let idx=1; idx<paramKeys.length; idx++) {
    let deltaIdx = Math.abs(paramKeys[idx] - hue)
    if (deltaIdx > delta) {
      return [paramKeys[idx - 1], paramKeys[idx]]
    } else {
      delta = deltaIdx
    }
  }
  const size = paramKeys.length
  return [paramKeys[size - 2], paramKeys[size - 1]]
}



/**
 * Take some color and increase the degree to which that color glows.
 * @param  {[String]} color Color as hex code
 * @param  {[Number]} steps Number of steps by which to increase intensity
 * @return {[String]}       Intensified color, as hex code
 */
export const HSLuvHueIntensityMap = function (color, steps) {
  const colorHSLuv = hsluv.hexToHsluv(color)
  const hue = colorHSLuv[0]
  const closestHueKeys = findClosestKeys(hue)
  const range = closestHueKeys[1] - closestHueKeys[0]
  const diff = hue - closestHueKeys[0]

  const paramLower = params[closestHueKeys[0]]
  const paramUpper = params[closestHueKeys[1]]

  const interpSaturation = scale([0, range], [paramLower.S, paramUpper.S])
  const interpBrightness = scale([0, range], [paramLower.B, paramUpper.B])

  // set new saturation value
  colorHSLuv[1] += steps * interpSaturation(diff)
  // set new brightness value
  colorHSLuv[2] += steps * interpBrightness(diff)

  for (let idx=1; idx<2; idx++) {
    if (colorHSLuv[idx] > 100) {
      colorHSLuv[idx] = 100
    } else if (colorHSLuv[idx] < 0) {
      colorHSLuv[idx] = 0
    }
  }
  return hsluv.hsluvToHex(colorHSLuv)
}
