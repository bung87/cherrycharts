import { Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from 'three'
import { ICartesianInfo, IRect } from '../interfaces'

export type DataSource = Array<Array<any>>

export class Histogram extends Object3D {
  constructor(
    data: Array<any>,
    cartesian: ICartesianInfo,
    rect: IRect,
    colorScale: Function,
    barWidth: number,
    barGap: number
  ) {
    super()

    data.some((v, i) => {
      for (let k in v) {
        let x = cartesian.xScale(parseFloat(v[k].x0.toFixed(1))) + cartesian.xScale.bandwidth() / 2
        if (x > rect.left + rect.width) {
          return true
        }
        let freq = v[k].length
        let y = cartesian.yScale(freq)
        let h = y - rect.bottom
        let g = new PlaneGeometry(barWidth, h, 1)
        let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(i) }))
        m.userData.x = x
        m.userData.y = y
        m.userData.x0 = parseFloat(v[k].x0.toFixed(1))
        m.userData.x1 = parseFloat(v[k].x1.toFixed(1))
        m.userData.freq = freq
        m.translateX(x)
        m.translateY(h / 2 + rect.bottom)
        this.add(m)
      }
      return false
    })
  }
}

export class Bar extends Object3D {
  constructor(
    data: DataSource,
    cartesian: ICartesianInfo,
    rect: IRect,
    colorScale: Function,
    barWidth: number,
    barGap: number
  ) {
    super()

    data.some((v, i) => {
      let x = cartesian.xScale(i) + cartesian.xScale.bandwidth() / 2
      if (x > rect.left + rect.width) {
        return true
      }
      let h = cartesian.yScale(v[1]) - rect.bottom
      let g = new PlaneGeometry(barWidth, h, 1)
      let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(i) }))
      m.userData.x = x

      m.translateX(x)
      m.translateY(h / 2 + rect.bottom)
      this.add(m)
      return false
    })
  }
}

export class GroupedBar extends Object3D {
  constructor(
    series: DataSource,
    cartesian: ICartesianInfo,
    rect: IRect,
    colorScale: Function,
    barWidth: number,
    barGap: number
  ) {
    super()
    let bandwidth2 = cartesian.xScale2.bandwidth()
    series.forEach((oneSeries, seriesIndex) => {
      let x = cartesian.xScale(seriesIndex)
      oneSeries.slice(1).forEach((value, dataIndex) => {
        let x2 = x + cartesian.xScale2(dataIndex) + bandwidth2 / 2
        let y = cartesian.yScale(value) - rect.bottom
        let g = new PlaneGeometry(bandwidth2, y, 1)
        let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(dataIndex) }))
        m.translateX(x2)
        m.translateY(y / 2 + rect.bottom)
        this.add(m)
      })
    })
  }
}

export class StackedBar extends Object3D {
  constructor(
    series: DataSource,
    cartesian: ICartesianInfo,
    rect: IRect,
    colorScale: Function,
    barWidth: number,
    barGap: number
  ) {
    super()
    let bandwidth = cartesian.xScale.bandwidth()

    series.forEach((oneSeries, seriesIndex) => {
      let preH = 0
      let x = cartesian.xScale(seriesIndex) + bandwidth / 2
      oneSeries.slice(1).forEach((value, dataIndex) => {
        let h = cartesian.yScale2(value)
        let g = new PlaneGeometry(bandwidth, h, 1)
        let y = h / 2 + rect.bottom
        let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(dataIndex) }))
        m.userData.x = x
        m.userData.y = y + preH
        m.translateX(x)
        m.translateY(y + preH)
        preH += h //+ 1 / window.devicePixelRatio

        this.add(m)
      })
    })
  }
}
