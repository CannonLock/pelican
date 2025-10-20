import { TableCellProps } from '@mui/material';

export interface ColumnConfig<T> {
  title: React.ReactNode;
  headerProps?: TableCellProps;
  value: ((item: T) => React.ReactNode);
  cellProps?: TableCellProps;
  toNumber?: (item: T) => number | undefined;
  sort?: (itemA: T, itemB: T) => number;
  isLoading?: boolean;
}
