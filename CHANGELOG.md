# Changelog

All notable changes to this repository. Dates are UTC.

## 0.1.1 (2026-09-28)

- `server/messaging/contract.ts` (the shared messaging schemas the MCP bridge imports): the
  `context_id` description now says that omitting it continues your latest conversation with that
  agent, and stale internal notes were removed from comments. No behaviour change in the toolkit.

## 0.1.0 (2026-09-27)

- First public release: the connector runtime, the local MCP stdio bridge and the quickstart
  example, with offline tests.
