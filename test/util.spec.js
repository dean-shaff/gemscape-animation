const assert = require('assert');

const hsluv = require('hsluv')

const util = require("./../src/util")



describe("HSLuvHueIntensityMap", function() {
  describe("findClosestKeys", function() {
    it("should find closest key", function() {
      const hueVal = 254
      const closestKeys = util.findClosestKeys(hueVal)
      assert.equal(closestKeys[0], 250)
      assert.equal(closestKeys[1], 260)
    })
  })


  it('should increase intensity', function() {
    const colorHSLuv = [254, 78, 66]
    const color = hsluv.hsluvToHex(colorHSLuv)
    const adjustedColor = util.HSLuvHueIntensityMap(color, 10)
    const adjustedColorHSLuv = hsluv.hexToHsluv(adjustedColor)
    assert.equal(colorHSLuv[0], Math.floor(adjustedColorHSLuv[0]))
  })
})
