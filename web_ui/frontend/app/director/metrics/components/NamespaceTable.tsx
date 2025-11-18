"use client";

import { DirectorNamespace, ServerGeneral } from '@/types';
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
import { linearColorScale, logColorScale, normalDistColorScale } from '@/helpers/ColorScales';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';


const NamespaceTable = () => {

  const { rate, time, resolution, range } = useContext(GraphContext);
  const router = useRouter();

  const {data: namespaces, isLoading: namespacesLoading} = useApiSWR<DirectorNamespace[]>(
    "Could not fetch servers",
    "/director_ui/namespaces",
    () => fetchApi(() => fetch("/api/v1.0/director_ui/namespaces")),
  )

  const {data: variableHitBytes, isLoading: variableHitBytesLoading} = useSWR(
    ["/director_ui/metrics/namespaces/one_day_hit_bytes", time, rate],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (path,type) (increase(xrootd_cache_access_bytes{type="hit"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: oneMonthHitBytes, isLoading: oneMonthHitBytesLoading} = useSWR(
    ["/director_ui/metrics/namespaces/one_month_hit_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (path,type) (increase(xrootd_cache_access_bytes{type="hit"}[30d]))', time.toSeconds())
  )

  const {data: variableMissBytes, isLoading: variableMissBytesLoading} = useSWR(
    ["/director_ui/metrics/namespaces/one_day_miss_bytes", time],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (path,type) (increase(xrootd_cache_access_bytes{type="to_disk"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: oneMonthMissBytes, isLoading: oneMonthMissBytesLoading} = useSWR(
    ["/director_ui/metrics/namespaces/one_month_miss_bytes", time],
    async () => query_raw<VectorResponseData>('sum by (path,type) (increase(xrootd_cache_access_bytes{type="to_disk"}[30d]))', time.toSeconds())
  )

  const {data: filesOpened, isLoading: filesOpenedLoading} = useSWR(
    ["/director_ui/metrics/namespaces/files_closed", time, caches],
    async () => query_raw<VectorResponseData>(replaceQueryParameters('sum by (dir_name) (increase(xrootd_cache_eviction_dir_files_count{type="opened"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: filesRemoved, isLoading: filesRemovedLoading} = useSWR(
    ["/director_ui/metrics/namespaces/files_removed", time, caches],
    async () =>  query_raw<VectorResponseData>(replaceQueryParameters('sum by (dir_name) (increase(xrootd_cache_eviction_dir_files_count{type="removed"}[${range}]))', {range}), time.toSeconds())
  )

  const {data: lastAccess, isLoading: lastAccessLoading} = useSWR(
    ["/director_ui/metrics/namespaces/last_access", time, caches],
    async () => await query_raw<VectorResponseData>('max by (dir_name) (xrootd_cache_eviction_dir_last_access_time_seconds{type="open"})', time.toSeconds())
  )

  const {data: totalCachedBytes, isLoading: totalCachedBytesLoading} = useSWR(
    ["/director_ui/metrics/namespaces/total_usage_bytes", time, caches],
    async () => query_raw<VectorResponseData>('sum by (dir_name) (xrootd_cache_eviction_dir_st_block_bytes)', time.toSeconds())
  )

  const columnConfig: ColumnConfig<any>[] = [
    {
      key: 'name',
      label: 'Namespace',
      isLoading: namespacesLoading,
      sort: (a: string, b: string) => a.localeCompare(b),
      cellProps: (namespace: string) => ({
        onClick : () => {
          router.push(`/director/metrics/namespaces/view?namespace=${encodeURIComponent(namespace)}`);
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
      colorFormatter: logColorScale(),
      isLoading: totalCachedBytesLoading,
    }
  ]

  const data = useMemo(() => {
    return namespaces?.map(c => {

      const responseToMetric = (prefixKey: string, metricResponse?: SuccessResponse<VectorResponseData>) => namespaceToMetric(c.path, prefixKey, metricResponse);

      const variableHitRate = responseToMetric('path', variableHitBytes)
      const variableMissRate = responseToMetric('path', variableMissBytes)
      const oneMonthHitRate = responseToMetric('path', oneMonthHitBytes)
      const oneMonthMissRate = responseToMetric('path', oneMonthMissBytes)
      const filesOpenedMetric = responseToMetric('dir_name', filesOpened)
      const filesRemovedMetric = responseToMetric('dir_name', filesRemoved)
      const lastAccessMetric = responseToMetric('dir_name', lastAccess)
      const totalCachedBytesMetric = responseToMetric('dir_name', totalCachedBytes)

      return {
        name: c.path,
        variableHitrate: variableHitRate && variableMissRate ? parseFloat(variableHitRate) / (parseFloat(variableHitRate) + parseFloat(variableMissRate)) : undefined,
        monthHitrate: oneMonthHitRate && oneMonthMissRate ? parseFloat(oneMonthHitRate) / (parseFloat(oneMonthHitRate) + parseFloat(oneMonthMissRate)) : undefined,
        filesOpened: filesOpenedMetric ? parseInt(filesOpenedMetric) : undefined,
        filesRemoved: filesRemovedMetric ? parseInt(filesRemovedMetric) : undefined,
        timeSinceAccess: lastAccessMetric ? time.toSeconds() - parseInt(lastAccessMetric) : undefined,
        cachedObjectsSize: totalCachedBytesMetric ? parseInt(totalCachedBytesMetric) : undefined,
      }
    })
  }, [namespaces, variableHitBytes, variableMissBytes, oneMonthHitBytes, oneMonthMissBytes, filesOpened, filesRemoved, lastAccess, totalCachedBytes, time])

  return (
    <DataTable columns={columnConfig} data={data || []} />
  )
}

/**
 * Iterate metrics returning the sum for the given prefix
 * @param namespacePrefix - the namespace prefix to filter on
 * @param prefixKey - the key in the metric to check the prefix against (e.g., 'path', or 'dir_name')
 * @param metricResponse - the prometheus metric response
 */
const namespaceToMetric = (namespacePrefix: string, prefixKey: string, metricResponse?: SuccessResponse<VectorResponseData>) => {
  return metricResponse?.data?.result.find(x => x.metric?.[prefixKey] === namespacePrefix)?.value[1];
}

export default NamespaceTable;
