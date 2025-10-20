import {
  Box,
  BoxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ReactNode, useMemo } from "react";

import { ColumnConfig } from ".";
import LoadingRows from "./LoadingRow";
import { TextSkeleton } from '@/components';

export interface DataTableProps {
  columns: ColumnConfig<any>[];
  data: any[];
}

const DataTable = ({columns, data}: DataTableProps) => {

  const isTableLoading = useMemo(() => {
    return columns.some((column) => column.isLoading);
  }, [columns])

  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell
                key={i}
                {...col.headerProps}
              >
                {col.title}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          { isTableLoading ? <LoadingRows columns={columns} rows={10} /> : (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                  >
                    <LoadingCell
                      isLoading={!!col.isLoading}
                      value={col.value(item)}
                      {...col.cellProps}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const LoadingCell = ({value, isLoading, ...props}: {value: ReactNode, isLoading: boolean} & BoxProps) => {
  return <Box {...props}>
    {isLoading ? <TextSkeleton chars={6} /> : value}
  </Box>
}

export default DataTable;
