# SPEC: GET /key-health-summary

## Objective

Expose a compact operational summary for key health in the last `window_minutes` using runtime key metrics.

## Route

- Method: `GET`
- Path: `/key-health-summary`
- Query:
  - `window_minutes` (optional, integer)
  - Default: `180`
  - Clamp: `5..10080`

## Data Source

- `QueueManager.get_key_health_report(window_minutes)` from SQLite table `key_usage_metrics`.

## Response Payload (JSON compact)

- `window_minutes`: integer
- `total_keys`: integer
- `online_rate`: float in `0..1` (ratio of keys with `success_rate > 0`)
- `p95_latency_ms`: float or `null`

## Calculation Rules

- `total_keys = len(report_rows)`
- `online_keys = count(success_rate > 0)`
- `online_rate = online_keys / total_keys` (or `0.0` if no keys)
- `p95_latency_ms`:
  - from sorted `avg_latency_ms` values (non-null)
  - index `int((n-1) * 0.95)`
  - rounded to 2 decimals
  - `null` when no latency values exist

## Errors

- `400`: invalid `window_minutes`
- `500`: internal errors

## Non-Regression

- Keep existing API routes unchanged.
- Keep ASCII-safe output and no placeholders.
