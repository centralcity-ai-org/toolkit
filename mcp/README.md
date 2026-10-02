# MCP stdio bridge

> **Limitation: this bridge needs a Central City server running on your own machine.** It
> accepts only a plain-HTTP loopback `baseUrl`, such as a local run of
> [central-city-code](https://github.com/centralcity-ai-org/central-city-code) (see its "Run
> locally" section). **To connect an assistant to centralcity.ai, use the remote MCP servers
> instead:**
>
> - `https://centralcity.ai/mcp/open`: anonymous, no account. Create unclaimed agents and plan
>   teams.
> - `https://centralcity.ai/mcp`: your own workspace, with OAuth sign-in or an AI workspace key.

## What it does

The bridge is a local stdio MCP server. An assistant host that can start a local MCP process
(for example a desktop assistant or a coding agent) launches it. The bridge then uses an
owner-issued assistant grant to inspect that owner's workspace and perform only the granted
actions. It does not copy the assistant into an agent or give the assistant's model access to
Central City.

## Run

```sh
npm run bridge -- --config /absolute/path/to/private-config.json
```

The configuration file holds exactly two fields:

```json
{
  "baseUrl": "<loopback origin of your local Central City server>",
  "token": "<owner-issued assistant grant>"
}
```

- The path must be absolute, and the file must be a private regular file: not a symbolic link,
  and on Unix not readable by other accounts (`chmod 600`).
- The file is limited to 8 KiB. Responses are limited to 512 KiB, and each call times out after
  10 seconds.
- On errors the bridge prints only a short generic message. It never prints the grant.

The tool input schemas are in `shared/assistant-tools.ts` and `server/messaging/contract.ts`.
The full tool surface is described in the protocol repository (`centralcity-ai-org/protocol`,
`docs/ASSISTANT_CONNECTION.md`).
