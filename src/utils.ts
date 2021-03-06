import { mergeWith,merge } from 'lodash'

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return objValue
  }
}

function customizer2(objValue, srcValue,key) {
  if (Array.isArray(objValue)) {
    return objValue
  }else if (typeof objValue !=="undefined"){
    merge(objValue,srcValue)
    return objValue
  }else{
    return srcValue
  }
  
}

export function keyedMerge(target,source){
  mergeWith(target,source,customizer)
}

export function keyedDefaultDeep(target,source){
  mergeWith(target,source,customizer2)
}

export function range(len) {
  let keys = Array(len).keys()
  let domain = Array.from(keys)
  return domain
}

export function angle(start, end) {
  let diffX = end.x - start.x,
    diffY = end.y - start.y

  let tan = (Math.atan(diffY / diffX) * 180) / Math.PI

  if (end.x > start.x && end.y > start.y) {
    return tan
  } else if (end.x > start.x && end.y < start.y) {
    return 360 + tan
  } else if (end.x < start.x && end.y > start.y) {
    return 180 + tan
  } else {
    return 180 + tan
  }
}

export function binarySearch(array, pred) {
  let lo = -1, hi = array.length;
  while (1 + lo < hi) {
      const mi = lo + ((hi - lo) >> 1);
      if (pred(array[mi])) {
          hi = mi;
      } else {
          lo = mi;
      }
  }
  return hi!==array.length ? hi:-1 ;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
