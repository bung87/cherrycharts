import {
  Color,
  LineBasicMaterial,
  Vector2,
  Shape,
  ShapeBufferGeometry,
  LineSegments,
  Mesh,
  LineDashedMaterial,
  MeshBasicMaterial
} from 'three'

import { createLabel } from '../utils'
import { DataSource } from '../components/bar'

import { scaleLinear, scaleTime } from 'd3-scale'
import { timeMonth } from 'd3-time'
import CartesianChart from './cartesian-chart'
import { createBufferGeometry } from '../three-helper'
import { IRect, ISize, ICartesian, ICartesianInfo } from '../interfaces'
import { IChartInteractable } from '../chart'

export default class AreaChart extends CartesianChart implements ICartesian, IChartInteractable {
  type = "AreaChart"
  dataSource: DataSource

  protected onMouseMoveHandle
  private _vectors: Array<Vector2>;
  protected get vectors(): Array<Vector2> {
    return this._vectors;
  }
  protected set vectors(value: Array<Vector2>) {
    this._vectors = value;
  }

  protected get lineScale() {
    return this._lineScale
  }
  protected set lineScale(value) {
    this._lineScale = value
  }
  public get lines(): LineSegments {
    return this._lines
  }
  public set lines(value: LineSegments) {
    this._lines = value
  }
  private _lineScale
  private _lines: LineSegments

  constructor(dom: Element) {
    super(dom)
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
    this.buildVectors()

    let material = new LineBasicMaterial({
      color: this.colors[2]
    })

    let arr = this.dataSource.reduce((accumulator, currentValue, index) => {
      let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
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

  updateSize(size: ISize) {
    this.updateMainRect(size)
    this.buildCartesianInfo()
    this.buildVectors(true)
  }


  buildVectors(force?:Boolean) {
    if (force || !this.lineScale) {
      this.lineScale = scaleLinear()
        .domain([0, this.dataSource.length])
        .range([this.mainRect.left, this.mainRect.left + this.mainRect.width])
    }

    if (force || !this.vectors) {
      this.vectors = this.dataSource.reduce((accumulator, currentValue, index) => {
        let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
        let x = this.lineScale(index)

        return accumulator.concat(new Vector2(x, h))
      }, [])
    }
  }

  drawArea() {
    this.buildVectors()
    let shape = new Shape()
    let end = new Vector2(this.mainRect.left + this.mainRect.width, this.mainRect.bottom)
    let start = new Vector2(this.mainRect.left, this.mainRect.bottom)
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
    this.drawBasicLine()
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
    if (event.relatedTarget === this.tooltip) {
      return
    }
    this.hideTooltip()
  }
}
