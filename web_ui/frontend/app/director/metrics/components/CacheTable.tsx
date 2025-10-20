import { ServerGeneral } from '@/types';
import { ReactNode, useContext, useMemo } from 'react';
import { GraphContext } from '@/components/graphs/GraphContext';
import {
  query_raw,
  replaceQueryParameters,
  SuccessResponse,
  TextSkeleton,
  VectorResponseData,
} from '@/components';
import { Box, BoxProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import humanReadableSeconds from '@/helpers/humanReadableSeconds';
import { toBytesString } from '@/helpers/bytes';
import useApiSWR from '@/hooks/useApiSWR';
import { fetchApi } from '@/helpers/api';

interface CacheTableProps {
  caches: ServerGeneral[];
}

const CacheTable = ({caches}: CacheTableProps) => {

  const { rate, time, resolution, range } = useContext(GraphContext);

  const {data: servers, isLoading: cachesLoading} = useApiSWR<ServerGeneral[]>(
    "Could not fetch servers",
    "/director_ui/servers",
    () => fetchApi(() => fetch("/api/v1.0/director_ui/servers")),
  )

  const caches = useMemo(() => {
    return servers?.filter(x => x.type === "Cache");
  }, [servers])

  const {data: oneDayAccessBytes, isLoading: oneDayAccessBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_day_access_bytes", time],
    async () => query_raw<VectorResponseData>(replaceQueryParameters("sum by (server_name,type) (increase(xrootd_cache_access_bytes[${range}]))", {range}), time.toSeconds())
  )

  const {data: oneMonthAccessBytes, isLoading: oneMonthAccessBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_month_access_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (server_name,type) (increase(xrootd_cache_access_bytes[30d]))', time.toSeconds())
  )

  const {data: filesOpened, isLoading: filesOpenedLoading} = useSWR(
    ["/director_ui/metrics/caches/files_closed", time, caches],
    async () => {
      const response = await query_raw<VectorResponseData>(replaceQueryParameters('increase(xrootd_cache_eviction_dir_files_count{dir_name="/",type="opened"}[${range}])', {range}), time.toSeconds())
      return cacheMetricMap(caches, response)
    }
  )

  const {data: filesRemoved, isLoading: filesRemovedLoading} = useSWR(
    ["/director_ui/metrics/caches/files_removed", time, caches],
    async () => {
      const response = await query_raw<VectorResponseData>(replaceQueryParameters('increase(xrootd_cache_eviction_dir_files_count{dir_name="/",type="removed"}[${range}])', {range}), time.toSeconds())
      return cacheMetricMap(caches, response)
    }
  )

  const {data: lastAccess, isLoading: lastAccessLoading} = useSWR(
    ["/director_ui/metrics/caches/last_access", time, caches],
    async () => {
      const response = await query_raw<VectorResponseData>('xrootd_cache_eviction_dir_last_access_time_seconds{dir_name="/",type="open"}', time.toSeconds())
      return cacheMetricMap(caches, response)
    }
  )

  const {data: totalBytes, isLoading: totalBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/total_bytes", time, caches],
    async () => {
      const response = await query_raw<VectorResponseData>('xrootd_cache_eviction_disk_total_bytes', time.toSeconds())
      return cacheMetricMap(caches, response)
    }
  )

  const {data: totalCachedBytes, isLoading: totalCachedBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/total_usage_bytes", time, caches],
    async () => {
      const response = await query_raw<VectorResponseData>('xrootd_cache_eviction_disk_usage_bytes', time.toSeconds())
      return cacheMetricMap(caches, response)
    }
  )



  return (
    <TableContainer>
      <Table  stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Cache Server</TableCell>
            <TableCell align="right">Cache Hit Rate ( {range.toString()} )</TableCell>
            <TableCell align="right">Cache Hit Rate ( 30d )</TableCell>
            <TableCell align="right">Files Opened</TableCell>
            <TableCell align="right">Files Removed</TableCell>
            <TableCell align="right">Time Since Access</TableCell>
            <TableCell align="right">Cached Objects Size</TableCell>
            <TableCell align="right">Total Cache Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {caches.map((c, i) => {

            const oneDayHitBytes = oneDayAccessBytes?.data?.result.find(x => x.metric.server_name === c.name && x.metric.type === "hit")?.value[1];
            const oneDayMissBytes = oneDayAccessBytes?.data?.result.find(x => x.metric.server_name === c.name && x.metric.type === "to_disk")?.value[1];

            const oneMonthHitBytes = oneMonthAccessBytes?.data?.result.find(x => x.metric.server_name === c.name && x.metric.type === "hit")?.value[1];
            const oneMonthMissBytes = oneMonthAccessBytes?.data?.result.find(x => x.metric.server_name === c.name && x.metric.type === "to_disk")?.value[1];

            const oneDayHitRate = (oneDayHitBytes && oneDayMissBytes) ? (parseFloat(oneDayHitBytes) / (parseFloat(oneDayHitBytes) + parseFloat(oneDayMissBytes))) : undefined;
            const oneMonthHitRate = (oneMonthHitBytes && oneMonthMissBytes) ? (parseFloat(oneMonthHitBytes) / (parseFloat(oneMonthHitBytes) + parseFloat(oneMonthMissBytes))) : undefined;

            return <TableRow key={c.name}>
              <TableCell component="th" scope="row">
                {c.name}
              </TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={oneDayHitRate ? (oneDayHitRate * 100).toFixed(2) + "%" : "Not Available"} isLoading={oneDayAccessBytesLoading} /></TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={oneMonthHitRate ? (oneMonthHitRate * 100).toFixed(2) + "%" : "Not Available"} isLoading={oneMonthAccessBytesLoading} /></TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={filesOpened?.[c.name] !== undefined ? parseInt(filesOpened[c.name]) : "Not Available"} isLoading={lastAccessLoading} /></TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={filesRemoved?.[c.name] !== undefined ? parseInt(filesRemoved[c.name]) : "Not Available"} isLoading={lastAccessLoading} /></TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={lastAccess?.[c.name] !== undefined ? humanReadableSeconds(time.toSeconds() - parseInt(lastAccess[c.name])) : "Not Available"} isLoading={lastAccessLoading} /></TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={totalCachedBytes?.[c.name] !== undefined ? toBytesString(totalCachedBytes[c.name]) : "Not Available"} isLoading={lastAccessLoading} /></TableCell>
              <TableCell align="right"><LoadingCell sx={{display: 'flex', justifyContent: 'end'}} value={totalBytes?.[c.name] !== undefined ? toBytesString(totalBytes[c.name]) : "Not Available"} isLoading={lastAccessLoading} /></TableCell>
            </TableRow>

          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const cacheMetricMap = (caches: ServerGeneral[], metricResponse: SuccessResponse<VectorResponseData>) => {
  return caches.reduce((acc, c) => {
    acc[c.name] = metricResponse?.data?.result.find(x => x.metric.server_name === c.name)?.value[1];
    return acc;
  }, {} as Record<string, string | undefined>);
}

export default CacheTable;
