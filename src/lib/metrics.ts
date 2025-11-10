export type DmxMetrics = Partial<{
  dmx_core_cmds_total: number
  dmx_core_queue_depth: number
  dmx_core_ws_clients: number
  dmx_core_apply_latency_ms_last: number
  dmx_engine_processed_total: number
  dmx_engine_queue_depth: number
  dmx_ws_clients: number
  dmx_engine_last_latency_ms: number
}>

export function parseDmxMetrics(text: string): DmxMetrics {
  const out: DmxMetrics = {}
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const [name, value] = line.split(/\s+/)
    if (!name || !value) continue
    const numeric = Number(value)
    if (Number.isNaN(numeric)) continue
    if (name.includes('dmx_core_cmds_total')) out.dmx_core_cmds_total = numeric
    else if (name.includes('dmx_core_queue_depth')) out.dmx_core_queue_depth = numeric
    else if (name.includes('dmx_core_ws_clients')) out.dmx_core_ws_clients = numeric
    else if (name.includes('dmx_core_apply_latency_ms_last')) out.dmx_core_apply_latency_ms_last = numeric
    else if (name.includes('dmx_engine_processed_total')) out.dmx_engine_processed_total = numeric
    else if (name.includes('dmx_engine_queue_depth')) out.dmx_engine_queue_depth = numeric
    else if (name.includes('dmx_ws_clients')) out.dmx_ws_clients = numeric
    else if (name.includes('dmx_engine_last_latency_ms')) out.dmx_engine_last_latency_ms = numeric
  }
  return out
}
