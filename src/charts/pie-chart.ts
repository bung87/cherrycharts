import Chart, { IChart } from '../chart'
import { DataSource } from '../components/bar'
import {
  Vector2,
  CircleGeometry,
  MeshBasicMaterial,
  Mesh,
  ShapeGeometry,
  Shape,
  LineSegments,
  LineBasicMaterial
} from 'three'
import { IRect, ISize } from '../interfaces'
import { scaleOrdinal } from 'd3-scale'
import { range, angle } from '../utils'
import { createBufferGeometry } from '../three-helper'

export default class PieChart extends Chart implements IChart {
  type = 'PieChart'
  dataSource: DataSource
  maxRadius: number
  total: number
  colorScale
  angles: Array<any>
  public get mainRect(): IRect {
    return this._mainRect
  }
  public set mainRect(value: IRect) {
    this._mainRect = { ...value }
  }
  protected onMouseMoveHandle
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

  updateMainRect(size?: ISize) {
    let theSize = size ? size : this.size
    this.size = { ...theSize }
    this.mainRect.width = this.size.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.size.height - this.mainRect.top - this.mainRect.bottom
    this.maxRadius = Math.min(this.mainRect.width, this.mainRect.height) / 2
  }

  drawPie() {
    let origin = new Vector2(this.mainRect.width / 2, this.mainRect.height / 2)
    this.angles.forEach((v, i) => {
      let circleShape = new Shape()
      circleShape.arc(origin.x, origin.y, this.maxRadius, v.thetaStart, v.thetaEnd, false)
      circleShape.lineTo(origin.x, origin.y)
      let geometry = new ShapeGeometry(circleShape)
      let material = new MeshBasicMaterial({ color: this.colorScale(i) })
      let mesh = new Mesh(geometry, material)
      this.add(mesh)
    })
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let canvas = this.director.getCanvas()
    canvas.addEventListener('mousemove', this.onMouseMoveHandle)
    canvas.onmouseout = canvas.onmouseleave = this.onMouseLeave.bind(this)
  }

  isOutOfArea(vector2) {
    let origin = new Vector2(this.mainRect.width / 2, this.mainRect.height / 2)
    let isOutside =
      Math.pow(vector2.x - origin.x, 2) + Math.pow(vector2.y - origin.y, 2) >
      Math.pow(this.maxRadius, 2)
    return isOutside
  }

  onMouseMove(event) {
    let canvas = this.director.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    if (this.isOutOfArea(this.mouse)) {
      this.hideTooltip()
      return
    }
    let origin = new Vector2(this.mainRect.width / 2, this.mainRect.height / 2)
    let deg = angle(origin, this.mouse)

    let index = this.angles.findIndex(v => {
      if (v.endAngleDegree > v.startAngleDegree) {
        return deg >= v.startAngleDegree && deg <= v.endAngleDegree
      } else {
        return deg >= v.startAngleDegree
      }
    })
    if (index === -1) {
      this.hideTooltip()
      return
    }

    let finalIndex = Math.abs(index - (this.dataSource.length - 1)) || 0
    let [label, value] = this.dataSource[finalIndex]
    let percent = ((value / this.total) * 100).toFixed(2)
    let html = `${label} ${value} (${percent}%)`
    this.tooltip.style.display = 'block'
    let offsetX = event.clientX

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

  build() {
    this.total = this.dataSource.reduce(function(acc, arr) {
      return acc + arr[1]
    }, 0)

    this.colorScale = scaleOrdinal()
      .domain(range(this.dataSource.length).reverse())
      .range(this.options.theme.colors)

    let arr = this.dataSource.map((v, i) => {
      return v[1] / this.total
      // return parseFloat((v[1]/count).toFixed(2))
    })

    arr.reverse()
    let startAngleDegree = 90
    let startPer = startAngleDegree / 360

    this.angles = arr.map(v => {
      if (startAngleDegree > 360) {
        startAngleDegree = startAngleDegree - 360
      }
      let thetaStart = startPer * Math.PI * 2
      let thetaLength = v * Math.PI * 2
      let thetaEnd = thetaStart + thetaLength
      let angle = v * 360

      let ang = startAngleDegree + angle
      let endAngleDegree = ang < 360 ? ang : ang - 360
      let ret = { thetaStart, thetaLength, thetaEnd, startAngleDegree, endAngleDegree, angle }
      startPer += v
      startAngleDegree += angle
      return ret
    })
  }

  drawTicks() {
    let origin = new Vector2(this.mainRect.width / 2, this.mainRect.height / 2)
    if (this.options.theme.plotOptions.pie.label.position === 'outside') {
      let tickLineLength = 4
      let tickLineEndRadius = this.maxRadius + tickLineLength
      let offsetRadius = this.maxRadius
      let arr = this.angles.reduce((accumulator, v) => {
        let cosin = Math.cos(v.thetaStart + v.thetaLength / 2)
        let sine = Math.sin(v.thetaStart + v.thetaLength / 2)
        let start = [origin.x + offsetRadius * cosin, origin.y + offsetRadius * sine]

        let end = [origin.x + tickLineEndRadius * cosin, origin.y + tickLineEndRadius * sine]
        return accumulator.concat(start, 0, end, 0)
      }, [])

      let material = new LineBasicMaterial({
        color: this.options.theme.axisTick.style.color
      })
      material.depthWrite = false
      material.fog = false
      let geometry = createBufferGeometry(arr, 'tickLine')
      let lines = new LineSegments(geometry, material)
      this.add(lines)
    }
  }

  draw() {
    this.drawTicks()
    this.drawPie()
  }
}
