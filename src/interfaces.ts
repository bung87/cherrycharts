import { Continuous } from 'd3-scale'

export interface IRect {
  bottom: number
  left: number
  right: number
  top: number
  width?: number
  height?: number
}

export interface ICartesianInfo {
  dataMax?: number
  dataMin?: number
  yMax?: number
  yMin?: number
  xMin?: number
  xMax?: number
  xScale?: Continuous
  yScale?: Continuous
}

export interface ICartesian {
  cartesian: ICartesianInfo
  buildCartesianInfo(data: any)
}

export interface ISize {
  width: number
  height: number
}
