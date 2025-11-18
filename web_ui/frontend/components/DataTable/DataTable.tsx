import {
  Box,
  BoxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { ReactNode, useMemo, useState } from 'react';

import { ColumnConfig, SortDirection } from ".";
import LoadingRows from "./LoadingRow";
import isEmpty from "./isEmpty"
import { TextSkeleton } from '@/components';

export interface DataTableProps {
  columns: ColumnConfig<any>[];
  data: any[];
}

const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

const DataTable = ({columns: _columns, data}: DataTableProps) => {

  const columns = useMemo(() => {
    return _columns.map((col) => {
      return {
        ...defaultConfig,
        ...col
      }
    })
  }, [_columns])

  const [sortedColumn, setSortedColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_SORT_DIRECTION);

  const isTableLoading = useMemo(() => {
    return columns.every((column) => column.isLoading);
  }, [columns])

  const sortedData = useMemo(() => {
    if (!sortedColumn) return data;

    const columnConfig = columns.find((col) => col.key === sortedColumn);
    if (!columnConfig || !columnConfig.sort) return data;

    const validData = data.filter((item) => !isEmpty(item[sortedColumn]));
    if (validData.length === 0) return data;

    const invalidData = data.filter((item) => isEmpty(item[sortedColumn]));

    const validSorted = validData.sort((a, b) => columnConfig.sort(a[sortedColumn], b[sortedColumn]));

    if (sortDirection === 'asc') {
      validSorted.reverse();
    }

    return [...validSorted, ...invalidData];

  }, [data, sortedColumn, sortDirection, columns]);

  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell
                key={i}
                sortDirection={ sortedColumn === col.key ? sortDirection : false }
                title={sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                {...col.headerProps}
              >
                <TableSortLabel
                  active={ sortedColumn === col.key }
                  direction={ sortedColumn === col.key ? sortDirection : DEFAULT_SORT_DIRECTION }
                  onClick={ () => {
                    if (sortedColumn === col.key) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortedColumn(col.key);
                      setSortDirection(DEFAULT_SORT_DIRECTION);
                    }
                  }}
                >
                  {col.label}
                  {sortedColumn === col.key ? (
                    <Box component="span" sx={visuallyHidden}>
                      {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          { isTableLoading ? <LoadingRows columns={columns} rows={10} /> : (
            sortedData.map((item, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((col, colIndex) => {

                  const value = !isEmpty(item?.[col.key]) ? col.formatter(item?.[col.key]) : undefined;
                  const cellProps = typeof col.cellProps === 'function' ? col.cellProps(item?.[col.key]) : col.cellProps;

                  return (
                    <TableCell
                      key={colIndex}
                      sx={{p: 0}}
                    >
                      <LoadingCell
                        isLoading={!!col.isLoading}
                        value={value || "Not available"}
                        {...cellProps}
                        sx={{
                          p: 2,
                          backgroundColor: col.colorFormatter ? col.colorFormatter(item?.[col.key], data.map(x => x[col.key]).filter(x => !isEmpty(x))) : undefined,
                          ...cellProps?.sx
                        }}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const defaultConfig = {
  formatter: (x: any) => x,
  sort: (x: any, y: any) => {
    if(x === y) return 0;
    if(x === undefined) return 1;
    if(y === undefined) return -1;
    return x < y ? 1 : -1;
  },
}

const LoadingCell = ({value, isLoading, ...props}: {value: ReactNode, isLoading: boolean} & BoxProps) => {
  console.log(props.sx)
  return <Box {...props}>
    {isLoading ? <TextSkeleton chars={6} /> : value}
  </Box>
}

export default DataTable;
