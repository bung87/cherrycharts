import { ICartesian } from '../interfaces'
import AreaChart from './area-chart'
import { scaleOrdinal } from 'd3-scale'
import { range } from '../utils'
import { Color, LineBasicMaterial, LineSegments } from 'three'
import { createBufferGeometry } from '../three-helper'
import { timeDay } from 'd3-time'

class LineChart extends AreaChart implements ICartesian {
  type = 'LineChart'
  constructor(dom?: HTMLElement) {
    super(dom)
  }
  drawBasicLine() {
    let colorScale = scaleOrdinal()
      .domain(range(this.dataSource.length))
      .range(this.options.colors)
    let useTimeRange = this.useTimeRange
    let ticks = useTimeRange ? this.cartesian.xScale.ticks(timeDay) : null
    this.dataSource.forEach((oneSeries, seriesIndex) => {
      let color = new Color(colorScale(seriesIndex))

      let material = new LineBasicMaterial({
        color: color
      })

      let arr = oneSeries['data'].reduce((accumulator, currentValue, dataIndex) => {
        let value = useTimeRange ? currentValue : currentValue[1]

        let xValue = useTimeRange ? ticks[dataIndex] : new Date(currentValue[0])
        let h = this.cartesian.yScale(value) + this.mainRect.bottom
        let x = this.cartesian.xScale(xValue)
        if (dataIndex > 0 && dataIndex < oneSeries['data'].length) {
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
