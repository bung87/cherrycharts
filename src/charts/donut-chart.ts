import Chart, { IChart } from '../chart'
import { DataSource } from '../components/bar'
import { RingGeometry, Vector2, MeshBasicMaterial, Mesh } from 'three'
import { IRect, ISize } from '../interfaces'
import { scaleOrdinal } from 'd3-scale'
import {range,angle} from '../utils'

export default class DonutChart extends Chart implements IChart {
  type = 'DonutChart'
  dataSource: DataSource
  maxRadius: number
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

  drawDonut() {
    let colorScale = scaleOrdinal()
      .domain(range(this.dataSource.length).reverse())
      .range(this.options.theme.colors)
    let count = this.dataSource.reduce(function(acc, arr) {
      return acc + arr[1]
    }, 0)

    let arr = this.dataSource.map(function(v, i) {
      return v[1] / count
      // return parseFloat((v[1]/count).toFixed(2))
    })

    arr.reverse()
    let startAngleDegree = 90
    let startPer = startAngleDegree / 360
    let innerRadiusPer = 0.5
    this.angles = arr.map(v => {
      if (startAngleDegree > 360) {
        startAngleDegree = startAngleDegree - 360
      }
      let thetaStart = startPer * Math.PI * 2
      let thetaLength = v * Math.PI * 2
      let angle = Math.floor(v * 360)

      let ang = startAngleDegree + angle
      let endAngleDegree = ang < 360 ? ang : ang - 360
      let ret = { thetaStart, thetaLength, startAngleDegree, endAngleDegree }
      startPer += v
      startAngleDegree += angle
      return ret
    })

    this.angles.forEach((v, i) => {
      let geometry = new RingGeometry(
        this.maxRadius * innerRadiusPer,
        this.maxRadius,
        this.maxRadius,
        1,
        v.thetaStart,
        v.thetaLength
      )
      let material = new MeshBasicMaterial({ color: colorScale(i) })
      let mesh = new Mesh(geometry, material)
      geometry.translate(this.mainRect.width / 2, this.mainRect.height / 2, 0)
      this.add(mesh)
    })
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
    this.tooltip.style.display = 'block'

    let [label, value] = this.dataSource[finalIndex]
    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${origin.x - tooltipRect.width / 2}px`
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

  build(){
    
  }
  
  draw() {
    this.drawDonut()
  }

 
}
