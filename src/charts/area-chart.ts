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

import { DataSource } from '../components/bar'

import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale'
import { timeMonth, timeDay } from 'd3-time'
import CartesianChart from './cartesian-chart'
import { createBufferGeometry, createLabel } from '../three-helper'
import { ISize, ICartesian } from '../interfaces'
import { IChartInteractable } from '../chart'
import { range } from '../utils'

export default class AreaChart extends CartesianChart implements ICartesian, IChartInteractable {
  type = 'AreaChart'
  dataSource: DataSource

  protected onMouseMoveHandle

  constructor(dom: Element) {
    super(dom)
  }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: this.options.theme.axisTick.style.color
    })
    let Y = this.mainRect.bottom
    let arr = []

    let ticks = this.cartesian.xScale.ticks()
    let xArr = ticks.map((v, i) => {
      return this.cartesian.xScale(v)
    }, this)

    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      arr.push(v, Y, 0, v, Y - this.options.theme.axisTick.style.length, 0)
      return false
    })
    let geometry = createBufferGeometry(arr, 'xAxisTick')

    let lines = new LineSegments(geometry, material)
    this.add(lines)
  }

  drawXAxisLabel() {
    let size = this.options.theme.labels.style.fontSize
    let tickSize = this.options.theme.axisTick.style.length
    let Y = this.mainRect.bottom

    let ticks = this.cartesian.xScale.ticks()
    let tickFormat = this.cartesian.xScale.tickFormat("%B")
    let xArr = ticks.map((v, i) => {
      return this.cartesian.xScale(v)
    })

    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      let mesh = createLabel(
        tickFormat(ticks[i]),
        v,
        Y - tickSize - size / 2 - 2,
        0,
        size,
        this.options.theme.labels.style.color
      )
      this.add(mesh)
      return false
    })
  }

  drawYAxisLabel() {
    let ticks = this.cartesian.yScale.ticks().slice(1)

    const X1 = this.mainRect.left
    let size = this.options.theme.labels.style.fontSize

    ticks.forEach((v, i) => {
      let h = this.cartesian.yScale(v) + this.mainRect.bottom
      let mesh = createLabel(v.toString(), X1 - size, h, 0, size,  this.options.theme.labels.style.color)
      this.add(mesh)
    })
  }

  buildCartesianInfo(data?: DataSource) {
    let theData = data ? data : this.dataSource

    let yMax = Math.max.apply(
      null,
      theData.map(data =>
        data.reduce(function(max, arr) {
          return Math.max(max, arr[1])
        }, -Infinity)
      )
    )

    let yMin = Math.min.apply(
      null,
      theData.map(data =>
        data.reduce(function(min, arr) {
          return Math.min(min, arr[1])
        }, Infinity)
      )
    )
    let series1 = this.dataSource[0]
    let series2 = this.dataSource[1]

    let xScale = scaleTime()
      .domain([new Date(series1[0][0]), new Date(series2[series2.length - 1][0])])
      .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])

    let yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([0, this.mainRect.height])
      .nice()

    this.cartesian = {
      yMax,
      yMin,
      yScale,
      xScale
    }
  }

  updateSize(size: ISize) {
    this.updateMainRect(size)
    this.buildCartesianInfo()
    // this.buildVectors(true)
  }

  drawArea() {
    // this.buildVectors()

    let colorScale = scaleOrdinal()
      .domain(range(this.dataSource[0].length))
      .range(this.options.theme.colors)

    this.dataSource.forEach((v, i) => {
      let vectors = v.reduce((accumulator, currentValue, index) => {
        let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
        let x = this.cartesian.xScale(new Date(currentValue[0]))

        return accumulator.concat(new Vector2(x, h))
      }, [])
      let shape = new Shape()
      let end = new Vector2(this.mainRect.left + this.mainRect.width, this.mainRect.bottom)
      let start = new Vector2(this.mainRect.left, this.mainRect.bottom)
      shape.setFromPoints(vectors.concat(end, start))
      let geometry2 = new ShapeBufferGeometry(shape)

      let material2 = new MeshBasicMaterial({ color: colorScale(i), transparent: true })
      // let material2 = new MeshBasicMaterial({ map: texture, transparent: true })
      material2.opacity = 0.75 // for  opacity

      let m = new Mesh(
        geometry2,
        material2 // color: this.colors[0],
      )

      this.add(m)
      let color = new Color(colorScale(i))
      
      let material = new LineBasicMaterial({
        color: color
      })
  
      let arr = v.reduce((accumulator, currentValue, index) => {
        let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
        let x = this.cartesian.xScale(new Date(currentValue[0]))
        if (index > 0 && index < v.length) {
          return accumulator.concat(x, h, 0, x, h, 0)
        } else {
          return accumulator.concat(x, h, 0)
        }
      }, [])
      let geometry = createBufferGeometry(arr, 'line')
  
      let lines = new LineSegments(geometry, material)
      this.add(lines)

    })
  }

  draw() {
    this.drawAxis()
    // this.drawBasicLine()
    this.drawArea()
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let canvas = this.director.getCanvas()
    canvas.addEventListener('mousemove', this.onMouseMoveHandle)
    canvas.onmouseout = canvas.onmouseleave = this.onMouseLeave.bind(this)
  }

  onMouseMove(event) {
    let canvas = this.director.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)

    let data = this.dataSource[0]

    let finalIndex = data.findIndex(x => {
      let dateX = this.cartesian.xScale(new Date(x[0]))
      return Math.floor(dateX) === this.mouse.x || Math.round(dateX) === this.mouse.x
    })
 
    if (finalIndex === -1) {
      this.hideTooltip()
      return
    }

    // let x = this.vectors[finalIndex].x
    // if (!(finalIndex in Array.from(keys))) {
    //   this.hideTooltip()
    //   return
    // }
    this.tooltip.style.display = 'block'
    let html = ""
    this.dataSource.forEach(v => {
      let [label, value] = v[finalIndex]
      html += `${label} ${value}<br>`
    })

    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${this.mouse.x - tooltipRect.width / 2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`

    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = html
    }
  }

  onMouseLeave(event) {
    if (event.relatedTarget === this.tooltip) {
      return
    }
    this.hideTooltip()
  }
}
