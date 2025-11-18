"use client";

import { ServerGeneral } from '@/types';
import { useContext, useMemo } from 'react';
import { GraphContext } from '@/components/graphs/GraphContext';
import {
  query_raw,
  replaceQueryParameters,
  SuccessResponse,
  VectorResponseData,
} from '@/components';
import humanReadableSeconds from '@/helpers/humanReadableSeconds';
import { toBytesString } from '@/helpers/bytes';
import useApiSWR from '@/hooks/useApiSWR';
import { fetchApi } from '@/helpers/api';
import { ColumnConfig, DataTable, toPercentage } from '@/components/DataTable';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { linearColorScale, logColorScale } from '@/helpers/ColorScales';


const CacheTable = () => {

  const { time, range } = useContext(GraphContext);
  const router = useRouter();

  const {data: servers, isLoading: cachesLoading} = useApiSWR<ServerGeneral[]>(
    "Could not fetch servers",
    "/director_ui/servers",
    () => fetchApi(() => fetch("/api/v1.0/director_ui/servers")),
  )

  const caches = useMemo(() => {
    return servers?.filter(x => x.type === "Cache");
  }, [servers])

  const {data: variableHitBytes, isLoading: variableHitBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_day_hit_bytes", time, range],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="hit"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: oneMonthHitBytes, isLoading: oneMonthHitBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_month_hit_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="hit"}[30d]))', time.toSeconds())
  )

  const {data: variableMissBytes, isLoading: variableMissBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_day_miss_bytes", time, range],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="to_disk"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: oneMonthMissBytes, isLoading: oneMonthMissBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_month_miss_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="to_disk"}[30d]))', time.toSeconds())
  )

  const {data: filesOpened, isLoading: filesOpenedLoading} = useSWR(
    ["/director_ui/metrics/caches/files_closed", time, range, caches],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('increase(xrootd_cache_eviction_dir_files_count{dir_name="/",type="opened"}[${range}])', {range}), time.toSeconds())
  )

  const {data: lastAccess, isLoading: lastAccessLoading} = useSWR(
    ["/director_ui/metrics/caches/last_access", time, caches],
    async () => await query_raw<VectorResponseData>('xrootd_cache_eviction_dir_last_access_time_seconds{dir_name="/",type="open"}', time.toSeconds())
  )

  const {data: totalBytes} = useSWR(
    ["/director_ui/metrics/caches/total_bytes", time, caches],
    async () => await query_raw<VectorResponseData>('xrootd_cache_eviction_disk_total_bytes', time.toSeconds())
  )

  const {data: totalCachedBytes} = useSWR(
    ["/director_ui/metrics/caches/total_usage_bytes", time, caches],
    async () => query_raw<VectorResponseData>('xrootd_cache_eviction_disk_usage_bytes', time.toSeconds())
  )

  const {data: totalIoOperations, isLoading: totalIoOperationsLoading} = useSWR(
    ["/director_ui/metrics/caches/total_io_ops", time, caches],
    async () => query_raw<VectorResponseData>('xrootd_server_io_total', time.toSeconds())
  )

  const {data: ioOperationTime, isLoading: ioOperationTimeLoading} = useSWR(
    ["/director_ui/metrics/caches/io_operation_time", time, caches],
    async () => query_raw<VectorResponseData>('xrootd_server_io_wait_time', time.toSeconds())
  )

  const {data: maxConnPerSecond, isLoading: maxConnPerSecondLoading} = useSWR(
    ["/director_ui/metrics/caches/max_conn_per_second", time, range, caches],
    // Use a subquery with an explicit step so the range applies to the function result
    async () => query_raw<VectorResponseData>(replaceQueryParameters('max_over_time(rate(xrootd_server_connections_total[5m])[${range}:1m])', {range}), time.toSeconds())
  )

  const {data: schedQueuedMax, isLoading: schedQueuedMaxLoading} = useSWR(
    ["/director_ui/metrics/caches/sched_queued_max", time, range, caches],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('max_over_time(xrootd_sched_queued[${range}])', {range}), time.toSeconds())
  )

  const {data: schedThreadRunningMax, isLoading: schedThreadRunningMaxLoading} = useSWR(
    ["/director_ui/metrics/caches/sched_thread_running_max", time, range, caches],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('max_over_time(xrootd_sched_thread_count{state="running"}[${range}])', {range}), time.toSeconds())
  )

  const columnConfig: ColumnConfig<any>[] = [
    {
      key: 'name',
      label: 'Cache Server',
      isLoading: cachesLoading,
      sort: (a: string, b: string) => a.localeCompare(b),
      cellProps: (namespace: string) => ({
        onClick : () => {
          router.push(`/director/metrics/caches/view?server_name=${encodeURIComponent(namespace)}`);
        },
        sx: {
          cursor: 'pointer',
        }
      })
    },
    {
      key: 'variableHitrate',
      label: `Cache Hit Rate ( ${range.toString()} )`,
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: toPercentage,
      colorFormatter: linearColorScale(),
      isLoading: variableHitBytesLoading || variableMissBytesLoading,
    },
    {
      key: 'monthHitrate',
      label: 'Cache Hit Rate ( 30d )',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: toPercentage,
      colorFormatter: linearColorScale(),
      isLoading: oneMonthHitBytesLoading || oneMonthMissBytesLoading,
    },
    {
      key: 'filesOpened',
      label: 'Files Opened',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      colorFormatter: logColorScale(),
      formatter: (x: string) => parseInt(x).toLocaleString(),
      isLoading: filesOpenedLoading,
    },
    {
      key: 'bytesServed',
      label: 'Bytes Served (Gbps)',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      colorFormatter: linearColorScale(),
      formatter: (x: string) => x !== undefined ? `${parseFloat(x).toFixed(2)} Gbps` : '',
      isLoading: variableHitBytesLoading || variableMissBytesLoading,
    },
    // {
    //   key: 'filesRemoved',
    //   label: 'Files Removed',
    //   headerProps: { sx: {textAlign: 'end'}},
    //   cellProps: { sx: {textAlign: 'end'}},
    //   formatter: (x: string) => parseInt(x).toLocaleString(),
    //   isLoading: filesRemovedLoading,
    // },
    {
      key: 'timeSinceAccess',
      label: 'Time Since Access',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: humanReadableSeconds,
      isLoading: lastAccessLoading,
    },
    {
      key: 'secondsPerIo',
      label: 'Seconds per IO Op',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: humanReadableSeconds,
      colorFormatter: linearColorScale(),
      isLoading: totalIoOperationsLoading || ioOperationTimeLoading,
    },
    {
      key: 'maxConnectionsPerSecond',
      label: 'Max Conn/sec',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: (x: string) => parseFloat(x).toFixed(2),
      colorFormatter: linearColorScale(),
      isLoading: maxConnPerSecondLoading,
    },
    {
      key: 'schedQueuedMax',
      label: 'Max Queued',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: (x: string) => parseInt(x).toLocaleString(),
      colorFormatter: linearColorScale(),
      isLoading: schedQueuedMaxLoading,
    },
    {
      key: 'schedThreadRunningMax',
      label: 'Max Running Threads',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: (x: string) => parseInt(x).toLocaleString(),
      colorFormatter: linearColorScale(),
      isLoading: schedThreadRunningMaxLoading,
    },
    // {
    //   key: 'cachedObjectsSize',
    //   label: 'Cached Objects Size',
    //   headerProps: { sx: {textAlign: 'end'}},
    //   cellProps: { sx: {textAlign: 'end'}},
    //   formatter: (x: string) => toBytesString(parseInt(x)),
    //   colorFormatter: logColorScale(),
    //   isLoading: totalCachedBytesLoading,
    // },
    // {
    //   key: 'totalCacheSize',
    //   label: 'Total Cache Size',
    //   headerProps: { sx: {textAlign: 'end'}},
    //   cellProps: { sx: {textAlign: 'end'}},
    //   formatter: (x: string) => toBytesString(parseInt(x)),
    //   colorFormatter: logColorScale(),
    //   isLoading: totalBytesLoading,
    // }
  ]

  const data = useMemo(() => {
    return caches?.map(c => {

      const responseToMetric = (metricResponse?: SuccessResponse<VectorResponseData>) => serverToMetric(c.name, metricResponse);

      const maxConnPerSecondMetric = responseToMetric(maxConnPerSecond)
      const variableHitRate = responseToMetric(variableHitBytes)
      const variableMissRate = responseToMetric(variableMissBytes)
      const oneMonthHitRate = responseToMetric(oneMonthHitBytes)
      const oneMonthMissRate = responseToMetric(oneMonthMissBytes)
      const filesOpenedMetric = responseToMetric(filesOpened)
      const lastAccessMetric = responseToMetric(lastAccess)
      const totalCachedBytesMetric = responseToMetric(totalCachedBytes)
      const totalBytesMetric = responseToMetric(totalBytes)
      const totalIoOperationsMetric = responseToMetric(totalIoOperations)
      const ioOperationTimeMetric = responseToMetric(ioOperationTime)
      const schedQueuedMaxMetric = responseToMetric(schedQueuedMax)
      const schedThreadRunningMaxMetric = responseToMetric(schedThreadRunningMax)

      return {
        name: c.name,
        maxConnectionsPerSecond: maxConnPerSecondMetric ? parseFloat(maxConnPerSecondMetric) : undefined,
        variableHitrate: variableHitRate && variableMissRate ? parseFloat(variableHitRate) / (parseFloat(variableHitRate) + parseFloat(variableMissRate)) : undefined,
        monthHitrate: oneMonthHitRate && oneMonthMissRate ? parseFloat(oneMonthHitRate) / (parseFloat(oneMonthHitRate) + parseFloat(oneMonthMissRate)) : undefined,
        bytesServed: (variableHitRate && variableMissRate && range) ? (((parseFloat(variableHitRate) + parseFloat(variableMissRate)) * 8) / range.toDuration().as('seconds') / 1e9) : undefined,
        filesOpened: filesOpenedMetric ? parseInt(filesOpenedMetric) : undefined,
        timeSinceAccess: lastAccessMetric ? time.toSeconds() - parseInt(lastAccessMetric) : undefined,
        secondsPerIo: (ioOperationTimeMetric && totalIoOperationsMetric && parseFloat(totalIoOperationsMetric) > 0) ? (parseFloat(ioOperationTimeMetric) / parseFloat(totalIoOperationsMetric)) : undefined,
        cachedObjectsSize: totalCachedBytesMetric ? parseInt(totalCachedBytesMetric) : undefined,
        totalCacheSize: totalBytesMetric ? parseInt(totalBytesMetric) : undefined,
        schedQueuedMax: schedQueuedMaxMetric ? parseInt(schedQueuedMaxMetric) : undefined,
        schedThreadRunningMax: schedThreadRunningMaxMetric ? parseInt(schedThreadRunningMaxMetric) : undefined,
      }
    })
  }, [caches, variableHitBytes, variableMissBytes, oneMonthHitBytes, oneMonthMissBytes, filesOpened, lastAccess, totalCachedBytes, totalBytes, totalIoOperations, ioOperationTime, time, maxConnPerSecond, schedQueuedMax, schedThreadRunningMax])

  return (
    <DataTable columns={columnConfig} data={data || []} />
  )
}

const serverToMetric = (serverName: string, metricResponse?: SuccessResponse<VectorResponseData>) => {
  return metricResponse?.data?.result.find(x => x.metric.server_name === serverName)?.value[1];
}


export default CacheTable;
