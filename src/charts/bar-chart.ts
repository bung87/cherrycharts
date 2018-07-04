import { Color, LineBasicMaterial, LineSegments } from 'three'
import { createLabel } from '../utils'
import { createBufferGeometry } from '../three-helper'
import { DataSource, Bar } from '../components/bar'
import { IRect, ICartesian, ICartesianInfo } from '../interfaces'

import CartesianChart from './cartesian-chart'

export default class BarChart extends CartesianChart implements ICartesian {
  dataSource: DataSource
  barWidth: number
  barGap: number
  bars: Bar
  mainRect: IRect
  cartesian: ICartesianInfo

  constructor(dom: Element) {
    super(dom)
    this.barWidth = 20
    this.barGap = 10

    this.mainRect = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
    this.mainRect.width = this.rect.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.rect.height - this.mainRect.top - this.mainRect.bottom
  }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: 0x000000
    })
    let Y = this.mainRect.bottom
    let arr = []

    let offsetX = this.mainRect.left + this.barGap + this.barWidth / 2
    let stepWidth = this.barWidth + this.barGap
    let xArr = this.dataSource.map((v, i) => {
      return i * stepWidth + offsetX
    })
    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      arr.push(v, Y, 0, v, Y - 4, 0)
      return false
    })

    let geometry = createBufferGeometry(arr, 'xAxisTick')
    let lines = new LineSegments(geometry, material)
    this.add(lines)
  }

  drawXAxisLabel() {
    let size = 12
    let tickSize = 4
    let Y = this.mainRect.bottom
    let offsetX = this.mainRect.left + this.barGap + this.barWidth / 2
    let stepWidth = this.barWidth + this.barGap
    let xArr = this.dataSource.map((v, i) => {
      return i * stepWidth + offsetX
    })
    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      let mesh = createLabel(
        this.dataSource[i][0],
        v,
        Y - tickSize - size / 2 - 2,
        0,
        size,
        new Color(0x444444)
      )
      this.add(mesh)
      return false
    })
  }

  drawYAxisLabel() {
    let ticks = this.cartesian.yScale.ticks().slice(1)

    const X1 = this.mainRect.left
    let size = 10

    ticks.forEach((v, i) => {
      let h = this.cartesian.yScale(v) + this.mainRect.bottom
      let mesh = createLabel(v.toString(), X1 - size, h, 0, size, new Color(0x444444))
      this.add(mesh)
    })
  }

  draw() {
    this.drawAxis()
    let bar = new Bar(
      this.dataSource,
      this.cartesian,
      this.mainRect,
      this.colors,
      this.barWidth,
      this.barGap
    )
    this.add(bar)
  }
}
