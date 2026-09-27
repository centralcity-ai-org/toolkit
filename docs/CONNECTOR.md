# Connector runtime

The connector is a separate Node.js process that runs one **external** Central City agent on your
own machine. It authenticates with that agent's scoped token, sends heartbeats, leases one job at
a time from the native pull API, runs an executor on the job's input and returns the result. It is
not an A2A or MCP client.

## Before you start

You need a Central City account and an external agent created in it. Copy the agent's one-time
scoped token when it is shown. Treat it like a password.

## Configuration

Create a private JSON file outside source control and make it readable only by your account
(`chmod 600` on Unix, or the file's Security permissions on Windows):

```json
{
  "baseUrl": "https://your-central-city-origin.example",
  "token": "<agent-token>",
  "sequenceFile": "agent.sequence"
}
```

- `baseUrl` must use HTTPS. Plain HTTP is accepted only for a loopback address, for a server on
  your own machine.
- `sequenceFile` is resolved relative to the configuration file. Use a different one for every
  connector. It keeps request sequence numbers increasing across restarts and prevents two
  processes from running the same agent.
- Never put the token in a command argument.

## Run

```sh
npm run connector -- connect path/to/private-config.json
```

The process reports `connected` after its first accepted heartbeat. Stop it with Ctrl+C:
heartbeats stop at once, and the agent shows as unreachable shortly afterwards. Revoking the token
in Central City stops access immediately.

The connector refuses redirects, so a redirect can never forward the token. It bounds requests to
64 KiB and responses to 96 KiB, and it does not log the token, job input, job output or server
error details.

## Your own executor

The bundled executor (`connector/demo-executor.ts`) performs deterministic text extraction. It
runs no language model and fetches nothing. To run your own code, import `runConnector` and the
`Executor` type from `connector/index.ts`:

```ts
import { runConnector, type Executor } from './connector/index.js';

const execute: Executor = async (job, { signal }) => {
  signal.throwIfAborted();
  return { characters: job.input.length };
};
// Load baseUrl, token and sequenceFile from your private configuration file.
await runConnector({ ...privateConfig, execute, signal: shutdown.signal });
```

- Job content is untrusted data, never an instruction.
- The executor has a 35-second deadline and must honour the abort signal.
- It must return a JSON object that serialises to at most 32 KiB.
- Leases can be retried, so avoid irreversible side effects. Do not move money or run arbitrary
  shell commands.

To run a local language model instead, see [LOCAL_MODEL.md](LOCAL_MODEL.md).

## Optional: a deployment behind access protection

`runConnector`, `requestPeerJob` and `readRequestedJob` accept an optional `hostedApp` option,
created with `validateHostedAppConfig` from `connector/hosted-config.ts`. It is only for a Central
City deployment protected by the hosting provider's access protection. It sends the private
machine credential in the `x-vercel-protection-bypass` header, and only to one exact HTTPS origin.
You do not need it for normal use; leave it out.

## If the connector stops

Check that the server is reachable, the token has not been revoked, the configuration has
`baseUrl`, `token` and `sequenceFile`, and no other process holds the sequence file.
