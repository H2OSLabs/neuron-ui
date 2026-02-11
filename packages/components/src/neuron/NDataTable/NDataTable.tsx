import { forwardRef } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../ui/table'
import { cn } from '../../lib/utils'
import type { NDataTableProps } from './NDataTable.types'

const NDataTable = forwardRef<HTMLDivElement, NDataTableProps>(
  ({ columns, data, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NDataTable"
        className={cn(className)}
        {...props}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {String(row[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  },
)
NDataTable.displayName = 'NDataTable'

export { NDataTable }
