import { ICartesian } from '../interfaces'
import AreaChart from './area-chart'
import { scaleOrdinal } from 'd3-scale'
import { range } from '../utils'
import { Vector2, Shape, Color, LineBasicMaterial, LineSegments } from 'three'
import { createBufferGeometry } from '../three-helper'
import { timeMonth, timeDay } from 'd3-time'

class LineChart extends AreaChart implements ICartesian {
  type = 'LineChart'
  constructor(dom?: Element) {
    super(dom)
  }
  drawBasicLine() {
    let colorScale = scaleOrdinal()
      .domain(range(this.dataSource[0].length))
      .range(this.options.colors)
    let useTimeRange = this.useTimeRange
    let ticks = useTimeRange ? this.cartesian.xScale.ticks(timeDay) : null
    this.dataSource.forEach((v, i) => {
      let color = new Color(colorScale(i))

      let material = new LineBasicMaterial({
        color: color
      })

      let arr = v.reduce((accumulator, currentValue, index) => {
        
        let value = useTimeRange ? currentValue : currentValue[1]

        let xValue = useTimeRange ? ticks[index] : new Date(currentValue[0])
        let h = this.cartesian.yScale(value) + this.mainRect.bottom
        let x = this.cartesian.xScale(xValue)
        if (index > 0 && index < v.length) {
          return accumulator.concat(x, h, 0, x, h, 0)
        } else {
          return accumulator.concat(x, h, 0)
        }
      }, [])
      let geometry = createBufferGeometry(arr, 'basicLine')

      let lines = new LineSegments(geometry, material)
      this.add(lines)
    })
  }
  draw() {
    this.drawAxis()
    this.drawBasicLine()
  }
}

export default LineChart
