import Chart, { IChart } from '../chart'
import { DataSource } from '../components/bar'
import {
  Vector2,
  Vector3,
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
  origin: Vector2
  innerRadiusPer = 0
  constructor(dom?: HTMLElement) {
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
    this.angles.forEach((v, i) => {
      let circleShape = new Shape()
      circleShape.arc(this.origin.x, this.origin.y, this.maxRadius, v.thetaStart, v.thetaEnd, false)
      circleShape.lineTo(this.origin.x, this.origin.y)
      let geometry = new ShapeGeometry(circleShape)
      let material = new MeshBasicMaterial({ color: this.colorScale(i) })
      let mesh = new Mesh(geometry, material)
      this.add(mesh)
    })
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let canvas = this.getCanvas()
    canvas.addEventListener('mousemove', this.onMouseMoveHandle)
    canvas.onmouseout = canvas.onmouseleave = this.onMouseLeave.bind(this)
  }

  isOutOfArea(vector2) {
    let isOutside =
      Math.pow(vector2.x - this.origin.x, 2) + Math.pow(vector2.y - this.origin.y, 2) >
      Math.pow(this.maxRadius, 2)
    return isOutside
  }

  onMouseMove(event) {
    let canvas = this.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    if (this.isOutOfArea(this.mouse)) {
      this.hideTooltip()
      return
    }
    let deg = angle(this.origin, this.mouse)

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

  buildColorScale() {
    let indexs = range(this.dataSource.length)

    if (this.plotOptions.clockwise) {
      indexs.reverse()
    }
    this.colorScale = scaleOrdinal()
      .domain(indexs)
      .range(this.options.colors)
  }

  buildAngles() {
    let arr = this.dataSource.map((v, i) => {
      return v[1] / this.total
    })

    let startAngleDegree = this.plotOptions.startAngle
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
      let ret = {
        thetaStart,
        thetaLength,
        thetaEnd,
        startAngleDegree,
        endAngleDegree
      }
      startPer += v
      startAngleDegree += angle
      return ret
    })
  }

  build() {
    if (this.type === 'DonutChart') {
      this.innerRadiusPer = parseInt(this.plotOptions.innerRadius, 10) / 100
    }
    this.origin = new Vector2(this.mainRect.width / 2, this.mainRect.height / 2)
    this.buildColorScale()
    this.dataSource.sort((a, b) => {
      return a[1] - b[1]
    })
    this.total = this.dataSource.reduce(function(acc, arr) {
      return acc + arr[1]
    }, 0)

    this.buildAngles()
  }

  drawTicksOutside() {
    let tickLineLength = 4
    let tickLineEndRadius = this.maxRadius + tickLineLength
    let offsetRadius = this.maxRadius
    let ticks = this.angles.reduce((accumulator, v) => {
      let cosin = Math.cos(v.thetaStart + v.thetaLength / 2)
      let sine = Math.sin(v.thetaStart + v.thetaLength / 2)
      let start = [this.origin.x + offsetRadius * cosin, this.origin.y + offsetRadius * sine]
      let endX = this.origin.x + tickLineEndRadius * cosin
      let endY = this.origin.y + tickLineEndRadius * sine
      if (endY <= 0 || endY >= this.size.height) {
        let x = start[0]
        let offsetLength = x < this.origin.x ? -v.thetaLength : v.thetaLength
        let cosin = Math.cos(v.thetaStart + offsetLength)
        let sine = Math.sin(v.thetaStart + offsetLength)
        endX = this.origin.x + tickLineEndRadius * cosin
        endY = this.origin.y + tickLineEndRadius * sine
      }
      let end = [endX, endY]
      return accumulator.concat(start, 0, end, 0)
    }, [])
    let ends = ticks.filter((v, index) => {
      return Math.floor(index / 3) % 2
    })
    let labelLines = []
    let size = this.options.labels.style.fontSize
    let color = this.options.labels.style.color
    for (let i = 0, j = 0; i < ends.length; i += 3, j++) {
      let x = ends[i]
      let y = ends[i + 1]
      let z = ends[i + 2]

      let a = Math.sin(this.angles[j].thetaLength) * this.maxRadius
      if (a < size * 2) {
        continue
      }
      let name = this.dataSource[j][0]
      let value = this.dataSource[j][1]
      let percent = ((value / this.total) * 100).toFixed(2)

      let label1 = createLabel(name, size, color)
      let label2 = createLabel(`${value} (${percent}%)`, size, color)
      let maxTextWidth = Math.max(label1.userData.textWidth, label2.userData.textWidth)
      let offsetX = x < this.origin.x ? -maxTextWidth : maxTextWidth
      label1.position.x = x + offsetX / 2
      label1.position.y = y + size / 2

      label2.position.x = x + offsetX / 2
      label2.position.y = y - size / 2

      this.add(label1, label2)
      let x2 = x < this.origin.x ? x - maxTextWidth : x + maxTextWidth
      labelLines.push(x, y, z, x2, y, 0)
    }

    let material = new LineBasicMaterial({
      color: this.options.axisTick.style.color
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

  drawTicksInside() {
    let size = this.options.labels.style.fontSize
    let color = this.options.labels.style.colorReversed

    let lastX = 0,
      lastY = 0
    let cloneAngles = Object.assign([], this.angles).reverse()
    let minPercent = this.plotOptions.label['minPercent']

    cloneAngles.forEach((v, i) => {
      let j = this.angles.length - 1 - i
      let name = this.dataSource[j][0]
      let value = this.dataSource[j][1]
      let percent = ((value / this.total) * 100).toFixed(2)

      if (minPercent && Number(percent) < parseFloat(minPercent)) {
        return
      }
      let cosin = Math.cos(v.thetaStart + v.thetaLength / 2)
      let sine = Math.sin(v.thetaStart + v.thetaLength / 2)
      let offsetRadius =
        this.maxRadius * this.innerRadiusPer + (this.maxRadius * (1 - this.innerRadiusPer)) / 2
      let x = this.origin.x + offsetRadius * cosin
      let y = this.origin.y + offsetRadius * sine
      let sameSide = Math.abs(x - lastX) <= this.maxRadius
      let interH = Math.abs(Math.round(y - lastY)) < size
      if (interH && y < lastY) {
        y -= size / 2
      } else if (interH && y > lastY) {
        y += size / 2
      }
      let interH2 = Math.abs(Math.round(y - lastY)) < size
      if (sameSide && interH2) {
        return
      }
      let label1 = createLabel(`${name} (${percent}%)`,size, color, 1, this.colorScale(j))
      label1.position.x = x
      label1.position.y = y
      label1.position.z = 0
      this.add(label1)
      lastX = x
      lastY = y
    })
  }

  drawTicks() {
    switch (this.plotOptions.label.position) {
      case 'outside':
        this.drawTicksOutside()
        break
      case 'inside':
        this.drawTicksInside()
        break
    }
  }

  draw() {
    this.drawTicks()
    this.drawPie()
  }
}
