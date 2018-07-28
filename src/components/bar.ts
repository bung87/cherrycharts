import { Object3D, MeshBasicMaterial, PlaneGeometry, Mesh } from 'three'
import { IRect, ICartesianInfo } from '../interfaces'
import { scaleOrdinal, scaleLinear } from 'd3-scale'
import { range } from '../utils'

export type DataSource = Array<Array<any>>

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
      // let x = i * (barWidth + barGap) + rect.left + barGap + barWidth / 2
      let x = cartesian.xScale(i) + cartesian.xScale.bandwidth() / 2
      if (x > rect.left + rect.width) {
        return true
      }
      let h = cartesian.yScale(v[1]) - rect.bottom
      let g = new PlaneGeometry(barWidth, h, 1)
      // let color = new Color(colorScale(i))
      let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(i) }))
      // m.translateX( xScale(i) )

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
      // let x = i * (barWidth + barGap) + rect.left + barGap + barWidth / 2
      let x = cartesian.xScale(seriesIndex) // + cartesian.xScale.bandwidth() / 2
      if (x > rect.left + rect.width) {
        return true
      }
      oneSeries.slice(1).forEach((value, dataIndex) => {
        let x2 = x + cartesian.xScale2(dataIndex) + bandwidth2 / 2
        let y = cartesian.yScale(value) - rect.bottom
        let g = new PlaneGeometry(bandwidth2, y, 1)
        // let color = new Color(colorScale(i))
        let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(dataIndex) }))
        // m.translateX( xScale(i) )

        m.translateX(x2)
        m.translateY(y / 2 + rect.bottom)
        this.add(m)
      })

      return false
    })
  }
}

export class StackedBar extends Object3D {
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
      // let x = i * (barWidth + barGap) + rect.left + barGap + barWidth / 2
      let x = cartesian.xScale(i) + cartesian.xScale.bandwidth() / 2
      if (x > rect.left + rect.width) {
        return true
      }
      let h = cartesian.yScale(v[1]) - rect.bottom
      let g = new PlaneGeometry(barWidth, h, 1)
      // let color = new Color(colorScale(i))
      let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(i) }))
      // m.translateX( xScale(i) )

      m.translateX(x)
      m.translateY(h / 2 + rect.bottom)
      this.add(m)
      return false
    })
  }
}
