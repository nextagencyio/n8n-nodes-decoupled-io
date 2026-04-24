import {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow'

/**
 * Authed request to the Decoupled.io dashboard or MCP server.
 *
 * Splits on the route prefix so we don't have to thread the base URL
 * through every resource — `/mcp/...` goes to the MCP server, anything
 * else goes to the dashboard.
 *
 * All HTTP retry, rate-limit backoff, and error formatting is handled
 * by n8n's helper. We never see raw fetch errors.
 */
export async function decoupledRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: unknown,
	qs?: Record<string, string | number | boolean | undefined>,
): Promise<unknown> {
	const credentials = await this.getCredentials('decoupledIoApi')
	const dashboardUrl = (credentials.dashboardUrl as string) || 'https://dashboard.decoupled.io'
	const mcpUrl = (credentials.mcpUrl as string) || 'https://mcp.decoupled.io'

	const baseUrl = path.startsWith('/mcp/') ? mcpUrl : dashboardUrl
	const url = `${baseUrl.replace(/\/$/, '')}${path.replace(/^\/mcp\//, '/')}`

	const options: IHttpRequestOptions = {
		method,
		url,
		json: true,
		headers: { Accept: 'application/json' },
	}

	if (body !== undefined) options.body = body
	if (qs !== undefined) {
		options.qs = Object.fromEntries(
			Object.entries(qs).filter(([, v]) => v !== undefined && v !== ''),
		)
	}

	return this.helpers.httpRequestWithAuthentication.call(this, 'decoupledIoApi', options)
}

/**
 * MCP-tool wrapper for one-shot tool invocations. The MCP server
 * speaks JSON-RPC; this hides the envelope so resources can call
 * tools as if they were regular HTTP endpoints.
 */
interface McpResponse {
	error?: { message?: string }
	result?: {
		content?: Array<{ text?: string }>
		[key: string]: unknown
	}
}

export async function mcpTool(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	toolName: string,
	args: Record<string, unknown> = {},
): Promise<unknown> {
	const res = (await decoupledRequest.call(this, 'POST', '/mcp/', {
		jsonrpc: '2.0',
		method: 'tools/call',
		params: { name: toolName, arguments: args },
		id: Math.floor(Math.random() * 1_000_000),
	})) as McpResponse
	if (res?.error) {
		const msg = res.error.message ?? JSON.stringify(res.error)
		const e = new Error(`MCP error: ${msg}`)
		throw e
	}
	const text = res?.result?.content?.[0]?.text
	if (typeof text === 'string') {
		try {
			return JSON.parse(text)
		} catch {
			return text
		}
	}
	return res?.result ?? res
}
