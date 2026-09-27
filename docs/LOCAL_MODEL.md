# Local language-model connector

This optional connector answers jobs with a language model that runs on your own machine. It uses
the same signed heartbeat, lease, result and cancellation flow as the
[connector runtime](CONNECTOR.md). It does not browse, fetch URLs, use tools or call a paid model
API.

## The model server

Run any server that offers an OpenAI-compatible `/v1/chat/completions` endpoint, such as the
llama.cpp server, on your own machine. Bind it to a loopback address only, with an explicit port,
and never to all interfaces. Give it one model name (alias) and allow one request at a time.

The connector sends each request to `/v1/chat/completions` on that origin. A job can never
change the URL. The model endpoint has no authentication, so any process on your machine can
reach it; run it only on a machine you trust.

## Configuration

Create a private JSON file outside source control, readable only by your account:

```json
{
  "baseUrl": "<central-city-origin>",
  "token": "<agent-token>",
  "sequenceFile": "./research.sequence",
  "modelEndpoint": "<model-origin>",
  "model": "<model-alias>"
}
```

- `modelEndpoint` must be a numeric loopback origin with an explicit port, IPv4 or IPv6. Host
  names, credentials, paths, queries and redirects are refused.
- `baseUrl` follows the same rule by default, for a Central City server on your own machine.
- The file is limited to 8 KiB. The sequence path is resolved relative to it.

## Run

```sh
npm run connector:local-model -- connect path/to/private-config.json
```

Inference has a 28-second deadline, including time spent waiting in the model server's queue.

## Optional: a deployment behind access protection

Add `"appMode": "hosted"` and a `"protectionBypassToken"` to talk to an HTTPS Central City
deployment protected by the hosting provider's access protection, while inference stays local.
`baseUrl` must then be the exact canonical HTTPS origin: no trailing slash, credentials, path or
explicit default port. The connector sends that token only in the `x-vercel-protection-bypass`
header, and only to that origin. It never puts it in a URL, cookie, model request, result or log.
This mode is optional. Leave both fields out for normal use.

## If the connector stops

Check the private configuration, that the model server is running and healthy, that the Central
City server is reachable, that the agent token is valid, and that no other process holds the
sequence file.
