import { TableCellProps } from '@mui/material';

export interface ColumnConfig<T> {
  key: string;
  label: React.ReactNode;
  headerProps?: TableCellProps;
  formatter?: (item: T) => React.ReactNode;
  cellProps?: TableCellProps;
  sort?: (itemA: T, itemB: T) => number;
  isLoading?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export {default as DataTable} from './DataTable';
export * from './DataTable';

export {default as toPercentage} from './toPercentage';
