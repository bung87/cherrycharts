import Chart, { IChart } from '../chart'
import { DataSource } from '../components/bar'
import { RingGeometry, Vector2, MeshBasicMaterial, Mesh } from 'three'
import { IRect, ISize } from '../interfaces'
import { scaleOrdinal } from 'd3-scale'
import { range, angle } from '../utils'
import { createLabel } from '../three-helper'

export default class DonutChart extends Chart implements IChart {
  type = 'DonutChart'
  dataSource: DataSource
  maxRadius: number
  total: number
  colorScale
  angles: Array<any>
  centerLabel: Mesh
  isCenterLabel: boolean
  innerRadiusPer: number
  origin: Vector2;
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

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let canvas = this.director.getCanvas()
    canvas.addEventListener('mousemove', this.onMouseMoveHandle)
    canvas.onmouseout = canvas.onmouseleave = this.onMouseLeave.bind(this)
  }

  isOutOfArea(vector2) {
    let radius = this.maxRadius * this.innerRadiusPer
    let vpow = Math.pow(vector2.x - this.origin.x, 2) + Math.pow(vector2.y - this.origin.y, 2)
    let isInside = vpow < Math.pow(radius, 2)
    let isOutside = vpow > Math.pow(this.maxRadius, 2)
    return isInside || isOutside
  }

  onMouseMove(event) {
    let canvas = this.director.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    if (this.isOutOfArea(this.mouse)) {
      if (this.centerLabel) {
        this.remove(this.centerLabel)
        this.director._render()
      }
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
    let size = this.options.theme.labels.style.fontSize

    if (this.options.theme.plotOptions.donut.label.position === 'center') {
      if (this.centerLabel) {
        this.remove(this.centerLabel)
      }
      this.centerLabel = createLabel(
        `${label} ${value} (${percent}%)`,
        this.origin.x,
        this.origin.y,
        0,
        size,
        this.options.theme.labels.style.color
      )
      this.add(this.centerLabel)
      this.director._render()
    }

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

    if (this.options.theme.plotOptions.donut.clockwise) {
      indexs.reverse()
    }
    this.colorScale = scaleOrdinal()
      .domain(indexs)
      .range(this.options.theme.colors)
  }

  buildAngles() {
    let arr = this.dataSource.map(v => {
      return v[1] / this.total
    })
    let startAngleDegree = this.options.theme.plotOptions.donut.startAngle
    let startPer = startAngleDegree / 360

    this.angles = arr.map(v => {
      if (startAngleDegree > 360) {
        startAngleDegree = startAngleDegree - 360
      }
      let thetaStart = startPer * Math.PI * 2
      let thetaLength = v * Math.PI * 2
      let angle = v * 360

      let ang = startAngleDegree + angle
      let endAngleDegree = ang < 360 ? ang : ang - 360
      let ret = { thetaStart, thetaLength, startAngleDegree, endAngleDegree }
      startPer += v
      startAngleDegree += angle
      return ret
    })
  }

  build() {
    this.origin = new Vector2(this.mainRect.width / 2, this.mainRect.height / 2)
    this.innerRadiusPer = parseInt(this.options.theme.plotOptions.donut.innerRadius, 10) / 100
    this.buildColorScale()
    this.dataSource.sort((a, b) => {
      return a[1] - b[1]
    })
    if (!this.options.theme.plotOptions.donut.clockwise) {
      this.dataSource.reverse()
    }

    this.total = this.dataSource.reduce(function(acc, arr) {
      return acc + arr[1]
    }, 0)
    this.buildAngles()
  }

  drawDonut() {
    this.angles.forEach((v, i) => {
      let geometry = new RingGeometry(
        this.maxRadius * this.innerRadiusPer,
        this.maxRadius,
        this.maxRadius,
        1,
        v.thetaStart,
        v.thetaLength
      )
      let material = new MeshBasicMaterial({ color: this.colorScale(i) })
      let mesh = new Mesh(geometry, material)
      geometry.translate(this.mainRect.width / 2, this.mainRect.height / 2, 0)
      this.add(mesh)
    })
  }

  draw() {
    this.drawDonut()
  }
}
