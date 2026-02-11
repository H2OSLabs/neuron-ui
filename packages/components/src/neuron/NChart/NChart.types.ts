export type NChartType = 'bar' | 'line' | 'pie'

export interface NChartDataPoint {
  /** Data point name */
  name: string
  /** Data point value */
  value: number
}

export interface NChartProps {
  /** Chart type */
  type?: NChartType
  /** Chart data points */
  data?: NChartDataPoint[]
  /** Additional CSS class names */
  className?: string
}
