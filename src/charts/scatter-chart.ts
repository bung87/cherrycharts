import {
  Color,
  LineBasicMaterial,
  Vector2,
  Shape,
  ShapeBufferGeometry,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  LineDashedMaterial,
  CircleGeometry
} from 'three'

import { DataSource } from '../components/bar'
import { scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale'

import { createBufferGeometry, createLabel } from '../three-helper'
import { ISize, IRect } from '../interfaces'
import Chart, { IChartInteractable } from '../chart'
import { range } from '../utils'

export default class ScatterChart extends Chart implements IChartInteractable {
  type = 'ScatterChart'
  dataSource: Array<any>
  xScale
  yScale
  protected onMouseMoveHandle
  colorScale: any

  public get mainRect(): IRect {
    return this._mainRect
  }
  public set mainRect(value: IRect) {
    this._mainRect = { ...value }
  }
  private _mainRect: IRect

  constructor(dom: Element) {
    super(dom)
    this.mainRect = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
    this.updateMainRect()
  }

  buildScale(data?) {
    let theData = data ? data : this.dataSource
    let xMax = Math.max.apply(
      null,
      theData.map(data =>
        data.reduce(function(max, arr) {
          return Math.max(max, arr.x)
        }, -Infinity)
      )
    )

    let xMin = Math.min.apply(
      null,
      theData.map(data =>
        data.reduce(function(min, arr) {
          return Math.min(min, arr.x)
        }, Infinity)
      )
    )

    this.xScale = scaleLinear()
      .domain([xMin, xMax])
      .range([0, this.mainRect.width])
      .nice()

    let yMax = Math.max.apply(
      null,
      theData.map(data =>
        data.reduce(function(max, arr) {
          return Math.max(max, arr.y)
        }, -Infinity)
      )
    )

    let yMin = Math.min.apply(
      null,
      theData.map(data =>
        data.reduce(function(min, arr) {
          return Math.min(min, arr.y)
        }, Infinity)
      )
    )
    this.yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([0, this.mainRect.height])
      .nice()

    this.colorScale = scaleOrdinal()
      .domain(range(data.length))
      .range(this.colors)
  }

  datum(data) {
    this.dataSource = data
    this.buildScale(data)
    this.dataProcessed = true
    return this
  }

  updateMainRect(size?: ISize) {
    let theSize = size ? size : this.size
    this.size = { ...theSize }
    this.mainRect.width = this.size.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.size.height - this.mainRect.top - this.mainRect.bottom
  }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: 0x000000
    })
    let Y = this.mainRect.bottom
    let arr = []

    let xMax = this.mainRect.left + this.mainRect.width
    let ticks = this.xScale.ticks().slice(1)
    ticks.some((v, i) => {
      let x = this.xScale(v) + this.mainRect.left
      if (x > xMax) {
        return true
      }

      arr.push(x, Y, 0, x, Y - 4, 0)
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

    let xMax = this.mainRect.left + this.mainRect.width
    let ticks = this.xScale.ticks().slice(1)

    ticks.some((v, i) => {
      let x = this.xScale(v) + this.mainRect.left
      if (x > xMax) {
        return true
      }
      let mesh = createLabel(v, x, Y - tickSize - size / 2 - 2, 0, size, new Color(0x444444))
      this.add(mesh)
      return false
    })
  }

  drawYAxisLabel() {
    let ticks = this.yScale.ticks().slice(1)

    const X1 = this.mainRect.left
    let size = 10

    ticks.forEach((v, i) => {
      let h = this.yScale(v) + this.mainRect.bottom
      let mesh = createLabel(v.toString(), X1 - size, h, 0, size, new Color(0x444444))
      this.add(mesh)
    })
  }

  updateSize(size: ISize) {
    this.updateMainRect(size)

    // this.buildVectors(true)
  }

  draw() {
    this.drawAxis()
    this.dataSource.forEach((data, index) =>
      data.forEach(v => {
        let geometry = new CircleGeometry(5, 32)
        let material = new MeshBasicMaterial({ color: this.colorScale(index) })
        let circle = new Mesh(geometry, material)
        geometry.translate(
          this.xScale(v.x) + this.mainRect.left,
          this.yScale(v.y) + this.mainRect.bottom,
          0
        )
        this.add(circle)
      })
    )

    // this.drawArea()
  }

  drawAxisLine() {
    let material = new LineBasicMaterial({
      color: 0x000000
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
    let ticks = this.xScale.ticks().slice(1)

    let material = new LineDashedMaterial({
      color: '#ccc',
      dashSize: 5,
      gapSize: 5,
      fog: false,
      depthWrite: false
    })

    const Y1 = this.mainRect.bottom
    const Y2 = this.mainRect.bottom + this.mainRect.height

    let arr = ticks.reduce((accumulator, currentValue) => {
      let x = this.xScale(currentValue) + this.mainRect.bottom
      return accumulator.concat(x, Y1, 0, x, Y2, 0)
    }, [])

    let geometry = createBufferGeometry(arr, 'splitLine')
    let lines = new LineSegments(geometry, material)
    lines.computeLineDistances()
    this.add(lines)
  }

  drawYSplitLine() {
    let ticks = this.yScale.ticks().slice(1)

    let material = new LineDashedMaterial({
      color: '#ccc',
      dashSize: 5,
      gapSize: 5,
      fog: false,
      depthWrite: false
    })

    const X1 = this.mainRect.left
    const X2 = this.mainRect.left + this.mainRect.width

    let arr = ticks.reduce((accumulator, currentValue) => {
      let h = this.yScale(currentValue) + this.mainRect.bottom
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
    this.drawAxisLine()
    this.drawAxisLabel()
    this.drawAxisTick()
    this.drawSplitLine()
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

    let seriesIndex, dataIndex
    this.dataSource.some((data, index) => {
      seriesIndex = index
      let indx = data.findIndex(x => {
        let vector = new Vector2(
          this.xScale(x.x) + this.mainRect.left,
          this.yScale(x.y) + this.mainRect.bottom
        )
        let dis = vector.distanceTo(this.mouse)
        return dis <= 5
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

    let finalX = this.xScale(this.dataSource[seriesIndex][dataIndex].x) + this.mainRect.left

    this.showTooltip()

    let { x, y } = this.dataSource[seriesIndex][dataIndex]
    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${finalX - tooltipRect.width / 2}px`
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
