type FilterCallback<T> = (value: T, index: number, array: T[]) => unknown
type MapCallback<T, U> = (value: T, index: number, array: T[]) => U

export class MapUtils {
  public static ToArray<K, V> (map: Map<K, V>): Array<[K, V]> {
    return Array.from(map)
  }

  public static Filter<K, V> (map: Map<K, V>, cb: FilterCallback<[K, V]>): Map<K, V> {
    return new Map(this.ToArray(map).filter(cb))
  }
}
