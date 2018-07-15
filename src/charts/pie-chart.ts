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
import { createBufferGeometry, createLabel } from '../three-helper'

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

    // let finalIndex = Math.abs(index - (this.dataSource.length - 1)) || 0
    let [label, value] = this.dataSource[index]
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
    this.dataSource.sort((a, b) => {
      return a[1] - b[1]
    })
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

    // arr.sort()
    let startAngleDegree = 90
    let startPer = startAngleDegree / 360

    this.angles = arr.map(v => {
      let percent = v
      if (startAngleDegree > 360) {
        startAngleDegree = startAngleDegree - 360
      }
      let thetaStart = startPer * Math.PI * 2
      let thetaLength = v * Math.PI * 2
      let thetaEnd = thetaStart + thetaLength
      let angle = v * 360

      let ang = startAngleDegree + angle
      let endAngleDegree = ang < 360 ? ang : ang - 360
      let ret = {
        thetaStart,
        thetaLength,
        percent,
        thetaEnd,
        startAngleDegree,
        endAngleDegree,
        angle
      }
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
      let ticks = this.angles.reduce((accumulator, v) => {
        let cosin = Math.cos(v.thetaStart + v.thetaLength / 2)
        let sine = Math.sin(v.thetaStart + v.thetaLength / 2)
        let start = [origin.x + offsetRadius * cosin, origin.y + offsetRadius * sine]
        let endX = origin.x + tickLineEndRadius * cosin
        let endY = origin.y + tickLineEndRadius * sine
        if (endY <= 0 || endY >= this.size.height) {
          let x = start[0]
          let offsetLength = x < origin.x ? -v.thetaLength : v.thetaLength
          let cosin = Math.cos(v.thetaStart + offsetLength)
          let sine = Math.sin(v.thetaStart + offsetLength)
          endX = origin.x + tickLineEndRadius * cosin
          endY = origin.y + tickLineEndRadius * sine
        }
        let end = [endX, endY]
        return accumulator.concat(start, 0, end, 0)
      }, [])
      let ends = ticks.filter((v, index) => {
        return Math.floor(index / 3) % 2
      })
      let labelLines = []
      let size = this.options.theme.labels.style.fontSize
      let color = this.options.theme.labels.style.color
      for (let i = 0, j = 0; i < ends.length; i += 3, j++) {
        let x = ends[i]
        let y = ends[i + 1]
        let z = ends[i + 2]

        // let finalIndex = Math.abs(j - (this.dataSource.length - 1)) || 0
        // let arcLength = Math.PI * 2 * this.maxRadius * this.angles[j].percent
        let a = Math.sin(this.angles[j].thetaLength) * this.maxRadius
        if (a < size * 2) {
          continue
        }
        let name = this.dataSource[j][0]
        let value = this.dataSource[j][1]
        let label1 = createLabel(name, x, y + size / 2, 0, size, color)
        let percent = ((value / this.total) * 100).toFixed(2)
        let label2 = createLabel(`${value} (${percent}%)`, x, y - size / 2, 0, size, color)
        let maxTextWidth = Math.max(label1.userData.textWidth, label2.userData.textWidth)
        // let textWidth1 = label1.userData.textWidth
        let offsetX = x < origin.x ? -maxTextWidth : maxTextWidth
        label1.translateX(offsetX / 2)
        label2.translateX(offsetX / 2)
        this.add(label1, label2)
        let x2 = x < origin.x ? x - maxTextWidth : x + maxTextWidth
        labelLines.push(x, y, z, x2, y, 0)
      }

      let material = new LineBasicMaterial({
        color: this.options.theme.axisTick.style.color
      })
      material.depthWrite = false
      material.fog = false
      let geometry = createBufferGeometry(
        ticks.slice(-labelLines.length).concat(labelLines),
        'tickLine'
      )
      let lines = new LineSegments(geometry, material)
      this.add(lines)
    }
  }

  draw() {
    this.drawTicks()
    this.drawPie()
  }
}
