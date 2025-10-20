import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { ColumnConfig } from ".";
import { TextSkeleton } from '@/components';

export interface LoadingTableProps {
  columns: ColumnConfig<any>[];
  rows?: number;
}

const LoadingRows = ({columns, rows = 10}: LoadingTableProps) => {

  return (
    <>
      {Array.from({ length: rows }).map((item, rowIndex) => (
        <TableRow key={rowIndex} hover>
          {columns.map((col, colIndex) => (
            <TableCell
              key={colIndex}
              {...col.cellProps}
            >
              <TextSkeleton chars={12} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default LoadingRows;
