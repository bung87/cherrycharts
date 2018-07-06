import {
  Color,
  LineBasicMaterial,
  Vector2,
  Shape,
  ShapeBufferGeometry,
  LineSegments,
  Mesh,
  MeshBasicMaterial
} from 'three'

import { createLabel } from '../utils'
import { DataSource } from '../components/bar'

import { scaleLinear, scaleTime } from 'd3-scale'
import { timeMonth } from 'd3-time'
import CartesianChart from './cartesian-chart'
import { createBufferGeometry } from '../three-helper'
import { IRect, ICartesian, ICartesianInfo } from '../interfaces'
import { IChart, IChartInteractable } from '../chart'

export default class AreaChart extends CartesianChart  implements ICartesian,IChartInteractable {
  dataSource: DataSource

  lines: LineSegments
  mainRect: IRect
  protected onMouseMoveHandle
  constructor(dom: Element) {
    super(dom)

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

    let xScale = scaleTime()
      .domain([
        new Date(this.dataSource[0][0]),
        new Date(this.dataSource[this.dataSource.length - 1][0])
      ])
      .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])

    let ticks = xScale.ticks()
    let xArr = ticks.map((v, i) => {
      return xScale(v)
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
    let xScale = scaleTime()
      .domain([
        new Date(this.dataSource[0][0]),
        new Date(this.dataSource[this.dataSource.length - 1][0])
      ])
      .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])

    let ticks = xScale.ticks()
    let xArr = ticks.map((v, i) => {
      return xScale(v)
    })

    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      let mesh = createLabel(
        ticks[i].getMonth() + 1,
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

  drawBasicLine() {
    let xScale = scaleLinear()
      .domain([0, this.dataSource.length])
      .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])
    //   let colorScale = scaleOrdinal()
    //     .domain([0, this.dataSource.length])
    //     .range(colors)

    let material = new LineBasicMaterial({
      color: this.colors[2]
    })

    let arr = this.dataSource.reduce((accumulator, currentValue, index) => {
      let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
      let x = xScale(index)
      if (index > 0 && index < this.dataSource.length) {
        return accumulator.concat(x, h, 0, x, h, 0)
      } else {
        return accumulator.concat(x, h, 0)
      }
    }, [])
    let geometry = createBufferGeometry(arr, 'line')

    this.lines = new LineSegments(geometry, material)
    this.add(this.lines)
  }

  drawBars() {
    let xScale = scaleLinear()
      .domain([0, this.dataSource.length])
      .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])
    //   let colorScale = scaleOrdinal()
    //     .domain([0, this.dataSource.length])
    //     .range(colors)

    let arr2 = this.dataSource.reduce((accumulator, currentValue, index) => {
      let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
      let x = xScale(index)

      return accumulator.concat(new Vector2(x, h))
    }, [])

    let shape = new Shape()
    let end = new Vector2(this.mainRect.left + this.mainRect.width, this.mainRect.bottom)
    let start = new Vector2(this.mainRect.left, this.mainRect.bottom)
    shape.setFromPoints(arr2.concat(end, start))

    let geometry2 = new ShapeBufferGeometry(shape)

    let material2 = new MeshBasicMaterial({ color: this.colors[0] })
    // let material2 = new MeshBasicMaterial({ map: texture, transparent: true })
    // material2.opacity = 0.5 // for  opacity

    let m = new Mesh(
      geometry2,
      material2 // color: this.colors[0],
    )

    this.add(m)
  }
  draw() {
    this.drawAxis()

    this.drawBars()
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let domElement = this.director.getDomElement()
    domElement.addEventListener('mousemove', this.onMouseMoveHandle)
    domElement.onmouseout = domElement.onmouseleave = this.onMouseLeave.bind(this)
  }

  onMouseMove(event) {
    let domElement = this.director.getDomElement()
    let rect = domElement.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    let indexs = this.dataSource.length - 1
    let offsetX = this.mouse.x - this.mainRect.left
    let left = Math.floor((offsetX / this.size.width) * indexs)
    let right = Math.round((offsetX / this.size.width) * indexs)

    const keys = Array(this.dataSource.length).keys()

    if (!(left in Array.from(keys))) {
      this.hideTooltip()
      return
    }
    this.tooltip.style.display = 'block'

    let [label, value] = this.dataSource[left]
    this.tooltip.style.left = `${this.mouse.x}px`
    this.tooltip.style.top = `${event.clientY - 30}px`
    let html = `${label} ${value}`
    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = `${label} ${value}`
    }
  }
  
  onMouseLeave(event) {
    this.hideTooltip()
  }
}
