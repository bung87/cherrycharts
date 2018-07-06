import { Color, LineBasicMaterial, LineSegments } from 'three'
import { createLabel } from '../utils'
import { createBufferGeometry } from '../three-helper'
import { DataSource, Bar } from '../components/bar'
import { IRect, ICartesian, ICartesianInfo } from '../interfaces'
import { IChart, IChartInteractable } from '../chart'
import CartesianChart from './cartesian-chart'

export default class BarChart extends CartesianChart implements ICartesian, IChartInteractable {
  dataSource: DataSource
  barWidth: number
  barGap: number
  bars: Bar
  type = 'BarChart'
  mainRect: IRect
  cartesian: ICartesianInfo
  protected onMouseMoveHandle
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
    this.mainRect.width = this.size.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.size.height - this.mainRect.top - this.mainRect.bottom
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
    this.bars = new Bar(
      this.dataSource,
      this.cartesian,
      this.mainRect,
      this.colors,
      this.barWidth,
      this.barGap
    )
    this.add(this.bars)
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let domElement = this.director.getDomElement()
    domElement.addEventListener('mousemove', this.onMouseMoveHandle)
    domElement.onmouseout = domElement.onmouseleave = this.onMouseLeave.bind(this)
  }

  onMouseMove(event) {
    let barsLen = this.bars.children.length
    let domElement = this.director.getDomElement()
    let rect = domElement.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    if(this.mouse.y< this.mainRect.bottom){
      this.hideTooltip()
      return 
    }
    let offsetXWithHalfWidth = this.mouse.x + this.barWidth / 2 
    let finalIndex = this.bars.children.findIndex( (x)=>{
      return offsetXWithHalfWidth >=  x.position.x && offsetXWithHalfWidth <= x.position.x  + this.barWidth
    })
    if(finalIndex === -1){
      this.hideTooltip()
      return
    }
    
    let position = this.bars.children[finalIndex].position
    const keys = Array(barsLen).keys()
    if (!(finalIndex in Array.from(keys))) {
      this.hideTooltip()
      return
    }
    this.tooltip.style.display = 'block'

    let [label, value] = this.dataSource[finalIndex]
    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${position.x - tooltipRect.width/2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`
    let html = `${label} ${value}`
    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = `${label} ${value}`
    }
  }

  onMouseLeave(event) {
    this.hideTooltip()
  }
}
