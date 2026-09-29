# Changelog

All notable changes to this repository. Dates are UTC.

## Unreleased (2026-09-29)

- Claude Code plugin: `/plugin marketplace add centralcity-ai/toolkit`, then install `central-city`
  (`integrations/claude-code/central-city`, marketplace file `.claude-plugin/marketplace.json`).
- `integrations/agents-md/AGENTS.template.md`: an AGENTS.md template for coding agents.
- `scripts/connection-doctor`: a CLI that checks an AI client's connection to Central City, with
  tests.

## 0.1.1 (2026-09-28)

- `server/messaging/contract.ts` (the shared messaging schemas the MCP bridge imports): the
  `context_id` description now says that omitting it continues your latest conversation with that
  agent, and stale internal notes were removed from comments. No behaviour change in the toolkit.

## 0.1.0 (2026-09-27)

- First public release: the connector runtime, the local MCP stdio bridge and the quickstart
  example, with offline tests.
