import {
  LineBasicMaterial,
  Vector2,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  LineDashedMaterial,
  CircleGeometry
} from 'three'

import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { createBufferGeometry, createLabel } from '../three-helper'
import { ISize } from '../interfaces'
import { IChartInteractable } from '../chart'
import CartesianChart from './cartesian-chart'
import { range } from '../utils'
import { Legend } from './../components/legend'
const xIndex  = 0
const yIndex  = 1
export default class ScatterChart extends CartesianChart implements IChartInteractable {
  type = 'ScatterChart'
  colorScale
  readonly xIndex = 0

  buildCartesianInfo(data?) {
    let series = data ? data : this.dataSource
    let xMax = Math.max.apply(
      null,
      series.map(oneSeries =>
        oneSeries.data.reduce(function(max, arr) {
          return Math.max(max, arr[xIndex])
        }, -Infinity)
      )
    )

    let xMin = Math.min.apply(
      null,
      series.map(oneSeries =>
        oneSeries.data.reduce(function(min, arr) {
          return Math.min(min, arr[xIndex])
        }, Infinity)
      )
    )

    let xScale = scaleLinear()
      .domain([xMin, xMax])
      .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])
      .nice()

    let yMax = Math.max.apply(
      null,
      series.map(oneSeries =>
        oneSeries.data.reduce(function(max, arr) {
          return Math.max(max, arr[yIndex])
        }, -Infinity)
      )
    )

    let yMin = Math.min.apply(
      null,
      series.map(oneSeries =>
        oneSeries.data.reduce(function(min, arr) {
          return Math.min(min, arr[yIndex])
        }, Infinity)
      )
    )
    let yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([this.mainRect.bottom, this.mainRect.bottom + this.mainRect.height])
      .nice()

    this.colorScale = scaleOrdinal()
      .domain(range(data.length))
      .range(this.options.colors)

    this.cartesian = {
      xMin,
      xMax,
      yMin,
      yMax,
      yScale,
      xScale
    }
  }

  // build(data?: any) {
  //   let theData = data ? data : this.dataSource
  //   this.buildScale(theData)
  // }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: this.options.axisTick.style.color
    })
    let Y = this.mainRect.bottom
    let arr = []

    let xMax = this.mainRect.left + this.mainRect.width
    let ticks = this.cartesian.xScale.ticks().slice(1)
    ticks.some((v, i) => {
      let x = this.cartesian.xScale(v)
      if (x > xMax) {
        return true
      }

      arr.push(x, Y, 0, x, Y - this.options.axisTick.style.length, 0)
      return false
    })
    let geometry = createBufferGeometry(arr, 'xAxisTick')

    let lines = new LineSegments(geometry, material)
    this.add(lines)
  }

  drawXAxisLabel() {
    let size = this.options.labels.style.fontSize
    let tickSize = this.options.axisTick.style.length
    let Y = this.mainRect.bottom

    let xMax = this.mainRect.left + this.mainRect.width
    let ticks: Array<number> = this.cartesian.xScale.ticks().slice(1)
    let hasNegative = ticks.some(v => {
      return v < 0
    })
    let negativeSignWidth = 0
    if (hasNegative) {
      let canvas = document.createElement('canvas')
      let context = canvas.getContext('2d')
      context.font = size + 'px Arial'
      negativeSignWidth = Math.round(context.measureText('-').width)
    }

    ticks.some((v, i) => {
      let x = this.cartesian.xScale(v)
      if (x > xMax) {
        return true
      }
      let mesh = createLabel(v, size, this.options.labels.style.color)
      mesh.position.x = v < 0 ? x + negativeSignWidth / 2 : x + negativeSignWidth
      mesh.position.y = Y - tickSize - size / 2 - 2
      this.add(mesh)
      return false
    })
  }

  updateSize(size: ISize) {
    this.updateMainRect(size)
  }

  draw() {
    let radius = this.plotOptions["radius"]
    this.drawAxis()
    this.dataSource.forEach((oneSeries, index) =>
    oneSeries.data.forEach(v => {
        let geometry = new CircleGeometry(radius, 32)
        let material = new MeshBasicMaterial({ color: this.colorScale(index) })
        let circle = new Mesh(geometry, material)
        circle.name = "scatter"
        geometry.translate(this.cartesian.xScale(v[xIndex]), this.cartesian.yScale(v[yIndex]), 0)
        this.add(circle)
      })
    )
 
  }

  drawLegends() {
    let names = this.dataSource.map( v=> v.name)
    this.add(new Legend(this.size,names, this.colorScale, this.legendOptions))
  }

  drawAxisLine() {
    let material = new LineBasicMaterial({
      color: this.options.axisLine.style.color
    })
    let lineWidth = 1 / window.devicePixelRatio

    let hStart = [this.mainRect.left, this.mainRect.bottom - lineWidth, 0]
    let hEnd = [this.mainRect.left + this.mainRect.width, this.mainRect.bottom - lineWidth, 0]
    let vEnd = [this.mainRect.left, this.mainRect.bottom - lineWidth + this.mainRect.height, 0]
    let arr = hStart.concat(hEnd, hStart, vEnd)

    let geometry = createBufferGeometry(arr, 'axisLine')
    let lines = new LineSegments(geometry, material)
    this.add(lines)
  }

  drawXSplitLine() {
    let ticks = this.cartesian.xScale.ticks().slice(1)

    let material = new LineDashedMaterial({
      color: this.options.splitLine.style.color,
      dashSize: this.options.splitLine.style.dashSize,
      gapSize: this.options.splitLine.style.gapSize,
      fog: false,
      depthWrite: false
    })

    const Y1 = this.mainRect.bottom
    const Y2 = this.mainRect.bottom + this.mainRect.height

    let arr = ticks.reduce((accumulator, currentValue) => {
      let x = this.cartesian.xScale(currentValue)
      return accumulator.concat(x, Y1, 0, x, Y2, 0)
    }, [])

    let geometry = createBufferGeometry(arr, 'splitLine')
    let lines = new LineSegments(geometry, material)
    lines.computeLineDistances()
    this.add(lines)
  }

  drawYSplitLine() {
    let ticks = this.cartesian.yScale.ticks().slice(1)

    let material = new LineDashedMaterial({
      color: this.options.splitLine.style.color,
      dashSize: this.options.splitLine.style.dashSize,
      gapSize: this.options.splitLine.style.gapSize,
      fog: false,
      depthWrite: false
    })

    const X1 = this.mainRect.left
    const X2 = this.mainRect.left + this.mainRect.width

    let arr = ticks.reduce((accumulator, currentValue) => {
      let h = this.cartesian.yScale(currentValue)
      return accumulator.concat(X1, h, 0, X2, h, 0)
    }, [])

    let geometry = createBufferGeometry(arr, 'splitLine')
    let lines = new LineSegments(geometry, material)
    lines.computeLineDistances()
    this.add(lines)
  }

  drawAxisLabel(): void {
    this.drawXAxisLabel()
    this.drawYAxisLabel()
  }
  drawAxisTick(): void {
    this.drawXAxisTick()
  }
  drawSplitLine(): void {
    this.drawXSplitLine()
    this.drawYSplitLine()
  }

  drawAxis() {
    this.drawAxisLabel()
    this.drawAxisLine()

    this.drawAxisTick()
    this.drawSplitLine()
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let canvas = this.getCanvas()
    canvas.addEventListener('mousemove', this.onMouseMoveHandle)
    canvas.onmouseout = canvas.onmouseleave = this.onMouseLeave.bind(this)
  }

  onMouseMove(event) {
    let radius = this.plotOptions["radius"]
    let canvas = this.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)

    let seriesIndex, dataIndex
    this.dataSource.some((oneSeries, index) => {
      seriesIndex = index
      let indx = oneSeries.data.findIndex(x => {
        let vector = new Vector2(this.cartesian.xScale(x[xIndex]), this.cartesian.yScale(x[yIndex]))
        let dis = vector.distanceTo(this.mouse)
        return dis <= radius
      }, this)
      dataIndex = indx
      if (indx !== -1) {
        return true
      }

      return false
    }, this)
    if (dataIndex === -1) {
      this.hideTooltip()
      return
    }

    let finalX = this.cartesian.xScale(this.dataSource[seriesIndex].data[dataIndex][xIndex])
    let offsetX = rect.left + finalX
    this.showTooltip()

    let [ x, y ] = this.dataSource[seriesIndex].data[dataIndex]
    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${offsetX - tooltipRect.width / 2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`
    let html = `${x} ${y}`
    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = `${x} ${y}`
    }
  }

  onMouseLeave(event) {
    if (event.relatedTarget === this.tooltip) {
      return
    }
    this.hideTooltip()
  }
}
