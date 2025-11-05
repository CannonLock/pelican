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


const CacheTable = () => {

  const { rate, time, resolution, range } = useContext(GraphContext);

  const {data: servers, isLoading: cachesLoading} = useApiSWR<ServerGeneral[]>(
    "Could not fetch servers",
    "/director_ui/servers",
    () => fetchApi(() => fetch("/api/v1.0/director_ui/servers")),
  )

  const caches = useMemo(() => {
    return servers?.filter(x => x.type === "Cache");
  }, [servers])

  const {data: variableHitBytes, isLoading: variableHitBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_day_hit_bytes", time],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="hit"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: oneMonthHitBytes, isLoading: oneMonthHitBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_month_hit_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="hit"}[30d]))', time.toSeconds())
  )

  const {data: variableMissBytes, isLoading: variableMissBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_day_miss_bytes", time],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="to_disk"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: oneMonthMissBytes, isLoading: oneMonthMissBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/one_month_miss_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (server_name,type) (increase(xrootd_cache_access_bytes{type="to_disk"}[30d]))', time.toSeconds())
  )

  const {data: filesOpened, isLoading: filesOpenedLoading} = useSWR(
    ["/director_ui/metrics/caches/files_closed", time, caches],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('increase(xrootd_cache_eviction_dir_files_count{dir_name="/",type="opened"}[${range}])', {range}), time.toSeconds())
  )

  const {data: filesRemoved, isLoading: filesRemovedLoading} = useSWR(
    ["/director_ui/metrics/caches/files_removed", time, caches],
    async () =>  query_raw<VectorResponseData>(replaceQueryParameters('increase(xrootd_cache_eviction_dir_files_count{dir_name="/",type="removed"}[${range}])', {range}), time.toSeconds())
  )

  const {data: lastAccess, isLoading: lastAccessLoading} = useSWR(
    ["/director_ui/metrics/caches/last_access", time, caches],
    async () => await query_raw<VectorResponseData>('xrootd_cache_eviction_dir_last_access_time_seconds{dir_name="/",type="open"}', time.toSeconds())
  )

  const {data: totalBytes, isLoading: totalBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/total_bytes", time, caches],
    async () => await query_raw<VectorResponseData>('xrootd_cache_eviction_disk_total_bytes', time.toSeconds())
  )

  const {data: totalCachedBytes, isLoading: totalCachedBytesLoading} = useSWR(
    ["/director_ui/metrics/caches/total_usage_bytes", time, caches],
    async () => query_raw<VectorResponseData>('xrootd_cache_eviction_disk_usage_bytes', time.toSeconds())
  )

  const columnConfig: ColumnConfig<any>[] = [
    {
      key: 'name',
      label: 'Cache Server',
      isLoading: cachesLoading,
      sort: (a: string, b: string) => a.localeCompare(b),
    },
    {
      key: 'variableHitrate',
      label: `Cache Hit Rate ( ${range.toString()} )`,
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: toPercentage,
      isLoading: variableHitBytesLoading || variableMissBytesLoading,
    },
    {
      key: 'monthHitrate',
      label: 'Cache Hit Rate ( 30d )',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: toPercentage,
      isLoading: oneMonthHitBytesLoading || oneMonthMissBytesLoading,
    },
    {
      key: 'filesOpened',
      label: 'Files Opened',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: (x: string) => parseInt(x).toLocaleString(),
      isLoading: filesOpenedLoading,
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
      key: 'cachedObjectsSize',
      label: 'Cached Objects Size',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: (x: string) => toBytesString(parseInt(x)),
      isLoading: totalCachedBytesLoading,
    },
    {
      key: 'totalCacheSize',
      label: 'Total Cache Size',
      headerProps: { sx: {textAlign: 'end'}},
      cellProps: { sx: {textAlign: 'end'}},
      formatter: (x: string) => toBytesString(parseInt(x)),
      isLoading: totalBytesLoading,
    }
  ]

  const data = useMemo(() => {
    return caches?.map(c => {

      const responseToMetric = (metricResponse?: SuccessResponse<VectorResponseData>) => serverToMetric(c.name, metricResponse);

      const variableHitRate = responseToMetric(variableHitBytes)
      const variableMissRate = responseToMetric(variableMissBytes)
      const oneMonthHitRate = responseToMetric(oneMonthHitBytes)
      const oneMonthMissRate = responseToMetric(oneMonthMissBytes)
      const filesOpenedMetric = responseToMetric(filesOpened)
      const filesRemovedMetric = responseToMetric(filesRemoved)
      const lastAccessMetric = responseToMetric(lastAccess)
      const totalCachedBytesMetric = responseToMetric(totalCachedBytes)
      const totalBytesMetric = responseToMetric(totalBytes)

      return {
        name: c.name,
        variableHitrate: variableHitRate && variableMissRate ? parseFloat(variableHitRate) / (parseFloat(variableHitRate) + parseFloat(variableMissRate)) : undefined,
        monthHitrate: oneMonthHitRate && oneMonthMissRate ? parseFloat(oneMonthHitRate) / (parseFloat(oneMonthHitRate) + parseFloat(oneMonthMissRate)) : undefined,
        filesOpened: filesOpenedMetric ? parseInt(filesOpenedMetric) : undefined,
        filesRemoved: filesRemovedMetric ? parseInt(filesRemovedMetric) : undefined,
        timeSinceAccess: lastAccessMetric ? time.toSeconds() - parseInt(lastAccessMetric) : undefined,
        cachedObjectsSize: totalCachedBytesMetric ? parseInt(totalCachedBytesMetric) : undefined,
        totalCacheSize: totalBytesMetric ? parseInt(totalBytesMetric) : undefined,
      }
    })
  }, [caches, variableHitBytes, variableMissBytes, oneMonthHitBytes, oneMonthMissBytes, filesOpened, filesRemoved, lastAccess, totalCachedBytes, totalBytes, time])

  return (
    <DataTable columns={columnConfig} data={data || []} />
  )
}

const serverToMetric = (serverName: string, metricResponse?: SuccessResponse<VectorResponseData>) => {
  return metricResponse?.data?.result.find(x => x.metric.server_name === serverName)?.value[1];
}

const serverMetricMap = (caches: ServerGeneral[], metricResponse: SuccessResponse<VectorResponseData>) => {
  return caches.reduce((acc, c) => {
    acc[c.name] = serverToMetric(c.name, metricResponse);
    return acc;
  }, {} as Record<string, string | undefined>);
}

export default CacheTable;
