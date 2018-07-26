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
// import { timeMonth, timeDay } from 'd3-time'

import CartesianChart from './cartesian-chart'
import { createBufferGeometry, createLabel } from '../three-helper'
import { ISize, ICartesian } from '../interfaces'
import { IChartInteractable } from '../chart'
import { range, binarySearch } from '../utils'

export default class AreaChart extends CartesianChart implements ICartesian, IChartInteractable {
  type = 'AreaChart'
  dataSource: DataSource
  protected onMouseMoveHandle

  constructor(dom?: HTMLElement) {
    super(dom)
  }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: this.options.axisTick.style.color
    })
    let Y = this.mainRect.bottom
    let arr = []

    let ticks
    if (this.useTimeRange) {
      ticks = this.cartesian.xScale.ticks(this.labelUnit.every(this.labelInterval))
    } else {
      ticks = this.cartesian.xScale.ticks()
    }

    let xArr = ticks.map((v, i) => {
      return this.cartesian.xScale(v)
    }, this)

    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      arr.push(v, Y, 0, v, Y - this.options.axisTick.style.length, 0)
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

    let ticks, tickFormat
    if (this.useTimeRange) {
      ticks = this.cartesian.xScale.ticks(this.labelUnit.every(this.labelInterval))
      tickFormat = this.cartesian.xScale.tickFormat(this.labelFormat)
    } else {
      ticks = this.cartesian.xScale.ticks()
      tickFormat = this.cartesian.xScale.tickFormat('%B')
    }

    let xArr = ticks.map((v, i) => {
      return this.cartesian.xScale(v)
    })

    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      let mesh = createLabel(tickFormat(ticks[i]), size, this.options.labels.style.color)
      mesh.position.x = v
      mesh.position.y = Y - tickSize - size / 2 - 2
      this.add(mesh)
      return false
    })
  }

  buildCartesianInfo(data?: DataSource) {
    let series = data ? data : this.dataSource

    let series1 = this.dataSource[0]
    let series2 = this.dataSource[1]
    let xScale, yMax, yMin

    if (this.useTimeRange) {
      yMax = Math.max.apply(
        null,
        series.map(oneSeries =>
          oneSeries["data"].reduce(function(max, arr) {
            return Math.max(max, arr)
          }, -Infinity)
        )
      )

      yMin = Math.min.apply(
        null,
        series.map(oneSeries =>
          oneSeries["data"].reduce(function(min, arr) {
            return Math.min(min, arr)
          }, Infinity)
        )
      )
      // xScale.ticks(timeDay)
      xScale = scaleTime()
        .domain([this.timeStart, this.timeEnd])
        .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])
    } else {
      yMax = Math.max.apply(
        null,
        series.map(oneSeries =>
          oneSeries["data"].reduce(function(max, arr) {
            return Math.max(max, arr[1])
          }, -Infinity)
        )
      )

      yMin = Math.min.apply(
        null,
        series.map(oneSeries =>
          oneSeries["data"].reduce(function(min, arr) {
            return Math.min(min, arr[1])
          }, Infinity)
        )
      )
      xScale = scaleTime()
        .domain([new Date(series1["data"][0][0]), new Date(series1["data"][series1["data"].length - 1][0])])
        .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])
    }

    let yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([this.mainRect.bottom, this.mainRect.bottom + this.mainRect.height])
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
      .domain(range(this.dataSource.length))
      .range(this.options.colors)
    let useTimeRange = this.useTimeRange
    let ticks = useTimeRange ? this.cartesian.xScale.ticks(this.xUnit.every(this.xInterval)) : null
    this.dataSource.forEach((oneSeries, seriesIndex) => {
      let vectors = oneSeries["data"].reduce((accumulator, currentValue, dataIndex) => {
        let value = useTimeRange ? currentValue : currentValue[1]
        let xValue = useTimeRange ? ticks[dataIndex] : new Date(currentValue[0])
        let h = this.cartesian.yScale(value)
        let x = this.cartesian.xScale(xValue)

        return accumulator.concat(new Vector2(x, h))
      }, [])
      let shape = new Shape()
      let end = new Vector2(this.mainRect.left + this.mainRect.width, this.mainRect.bottom)
      let start = new Vector2(this.mainRect.left, this.mainRect.bottom)
      shape.setFromPoints(vectors.concat(end, start))
      let geometry2 = new ShapeBufferGeometry(shape)

      let material2 = new MeshBasicMaterial({ color: colorScale(seriesIndex), transparent: true })
      // let material2 = new MeshBasicMaterial({ map: texture, transparent: true })
      material2.opacity = 0.75 // for  opacity

      let m = new Mesh(
        geometry2,
        material2 // color: this.colors[0],
      )

      this.add(m)
      let color = new Color(colorScale(seriesIndex))

      let material = new LineBasicMaterial({
        color: color
      })
    

      let arr = oneSeries["data"].reduce((accumulator, currentValue, dataIndex) => {
        let value = useTimeRange ? currentValue : currentValue[1]
        let xValue = useTimeRange ? ticks[dataIndex] : new Date(currentValue[0])
        let h = this.cartesian.yScale(value)
        let x = this.cartesian.xScale(xValue)
    
        if (dataIndex > 0 && dataIndex < oneSeries["data"].length) {
          return accumulator.concat(x, h, 0, x, h, 0)
        } else {
          return accumulator.concat(x, h, 0)
        }
      }, [])
      let geometry = createBufferGeometry(arr, 'areaLine')

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
    let canvas = this.getCanvas()
    canvas.addEventListener('mousemove', this.onMouseMoveHandle)
    canvas.onmouseout = canvas.onmouseleave = this.onMouseLeave.bind(this)
  }

  onMouseMove(event) {
    let canvas = this.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    if (this.mouse.y < this.mainRect.bottom || this.mouse.x < this.mainRect.left) {
      this.hideTooltip()
      return
    }
    let oneSeries = this.dataSource[0]

    let finalIndex
    let ticks
    if (this.useTimeRange) {
      ticks = this.cartesian.xScale.ticks(this.xUnit.every(this.xInterval))
      finalIndex = binarySearch(ticks, x => {
        let dateX = this.cartesian.xScale(x)
        return Math.floor(dateX) >= this.mouse.x || Math.round(dateX) >= this.mouse.x
      })
    } else {
      finalIndex = binarySearch(oneSeries["data"], x => {
        let dateX = this.cartesian.xScale(new Date(x[0]))
        return Math.floor(dateX) >= this.mouse.x || Math.round(dateX) >= this.mouse.x
      })
    }

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
    let html = ''
    if (this.useTimeRange) {
      let tickFormat = this.cartesian.xScale.tickFormat(this.xUnit, this.xFormat)
      this.dataSource.forEach((v, i) => {
        let label = tickFormat(ticks[finalIndex])
        let value = v["data"][finalIndex]
        html += `${label} ${value}<br>`
      })
    } else {
      this.dataSource.forEach(v => {
        let [label, value] = v["data"][finalIndex]
        html += `${label} ${value}<br>`
      })
    }

    let offsetX = rect.left + this.mouse.x
    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${offsetX - tooltipRect.width / 2}px`
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
