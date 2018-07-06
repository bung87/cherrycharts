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
import { IChartInteractable } from '../chart'

export default class AreaChart extends CartesianChart implements ICartesian, IChartInteractable {
  dataSource: DataSource

  lines: LineSegments
  mainRect: IRect
  protected onMouseMoveHandle
  protected vectors: Array<Vector2>
  protected lineScale
  constructor(dom: Element) {
    super(dom)
  }

  drawXAxisTick() {
    let mainRect = this.getMainRect()
   
    let material = new LineBasicMaterial({
      color: 0x000000
    })
    let Y = mainRect.bottom
    let arr = []

    let xScale = scaleTime()
      .domain([
        new Date(this.dataSource[0][0]),
        new Date(this.dataSource[this.dataSource.length - 1][0])
      ])
      .range([mainRect.left, mainRect.left + mainRect.width])

    let ticks = xScale.ticks()
    let xArr = ticks.map((v, i) => {
      return xScale(v)
    })

    let xMax = mainRect.left + mainRect.width
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
    let mainRect = this.getMainRect()
    let size = 12
    let tickSize = 4
    let Y = mainRect.bottom
    let xScale = scaleTime()
      .domain([
        new Date(this.dataSource[0][0]),
        new Date(this.dataSource[this.dataSource.length - 1][0])
      ])
      .range([mainRect.left, mainRect.left + mainRect.width])

    let ticks = xScale.ticks()
    let xArr = ticks.map((v, i) => {
      return xScale(v)
    })

    let xMax = mainRect.left + mainRect.width
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
    let cartesian = this.getCartesianInfo()
    let mainRect = this.getMainRect()
    let ticks = cartesian.yScale.ticks().slice(1)

    const X1 = mainRect.left
    let size = 10

    ticks.forEach((v, i) => {
      let h = cartesian.yScale(v) + mainRect.bottom
      let mesh = createLabel(v.toString(), X1 - size, h, 0, size, new Color(0x444444))
      this.add(mesh)
    })
  }

  drawBasicLine() {
    this.buildVectors()
    let cartesian = this.getCartesianInfo()
    let mainRect = this.getMainRect()
    let material = new LineBasicMaterial({
      color: this.colors[2]
    })

    let arr = this.dataSource.reduce((accumulator, currentValue, index) => {
      let h = cartesian.yScale(currentValue[1]) + mainRect.bottom
      let x = this.lineScale(index)
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

  buildVectors() {
    let cartesian = this.getCartesianInfo()
    let mainRect = this.getMainRect();
    // if (!this.lineScale) {
      this.lineScale = scaleLinear()
        .domain([0, this.dataSource.length])
        .range([mainRect.left, mainRect.left + mainRect.width])
    // }

    // if (!this.vectors) {
      this.vectors = this.dataSource.reduce((accumulator, currentValue, index) => {
        let h = cartesian.yScale(currentValue[1]) + mainRect.bottom
        let x = this.lineScale(index)

        return accumulator.concat(new Vector2(x, h))
      }, [])
    // }
  }

  drawArea() {
    //   let colorScale = scaleOrdinal()
    //     .domain([0, this.dataSource.length])
    //     .range(colors)

    this.buildVectors()
    let mainRect = this.getMainRect();
    let shape = new Shape()
    let end = new Vector2(mainRect.left + mainRect.width, mainRect.bottom)
    let start = new Vector2(mainRect.left, mainRect.bottom)
    shape.setFromPoints(this.vectors.concat(end, start))

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

    this.drawArea()
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
    let offsetX = this.mouse.x
    const keys = Array(this.vectors.length).keys()
    let finalIndex = this.vectors.findIndex(x => {
      return offsetX === Math.floor(x.x) || offsetX === Math.round(x.x)
    })
    if (finalIndex === -1) {
      this.hideTooltip()
      return
    }

    let x = this.vectors[finalIndex].x
    if (!(finalIndex in Array.from(keys))) {
      this.hideTooltip()
      return
    }
    this.tooltip.style.display = 'block'

    let [label, value] = this.dataSource[finalIndex]
    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${x - tooltipRect.width / 2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`
    let html = `${label} ${value}`
    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = `${label} ${value}`
    }
  }

  onMouseLeave(event) {
    if(event.relatedTarget === this.tooltip ){
      return
    }
    this.hideTooltip()
  }
}
