import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow'

/**
 * Decoupled.io credential.
 *
 * One field is required: a Personal Access Token (`dc_tok_...`)
 * generated at https://dashboard.decoupled.io/organization/tokens.
 *
 * Two optional fields are surfaced as advanced options for self-hosted
 * or staging instances:
 *   - dashboardUrl  — defaults to https://dashboard.decoupled.io
 *   - mcpUrl        — defaults to https://mcp.decoupled.io
 *
 * Tokens never leave the n8n instance — n8n encrypts credentials at
 * rest and only decrypts them inside the node's request flow.
 */
export class DecoupledIoApi implements ICredentialType {
	name = 'decoupledIoApi'

	displayName = 'Decoupled.io API'

	icon: Icon = 'file:DecoupledIoApi.svg'

	documentationUrl = 'https://decoupled.io/docs/integrations/n8n'

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'dc_tok_...',
			description:
				'Personal access token from <a href="https://dashboard.decoupled.io/organization/tokens" target="_blank">Settings → API Tokens</a> in the Decoupled.io dashboard.',
		},
		{
			displayName: 'Dashboard URL',
			name: 'dashboardUrl',
			type: 'string',
			default: 'https://dashboard.decoupled.io',
			description:
				'Override only if you run a self-hosted or staging Decoupled.io dashboard. Most users should leave this as the default.',
		},
		{
			displayName: 'MCP URL',
			name: 'mcpUrl',
			type: 'string',
			default: 'https://mcp.decoupled.io',
			description:
				'Override only if you run a self-hosted or staging MCP server. Most users should leave this as the default.',
		},
	]

	/**
	 * Inject the bearer token on every authenticated request the node
	 * fires. n8n's `httpRequestWithAuthentication` handles the rest
	 * (retries, rate-limit awareness, error formatting).
	 */
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
				Accept: 'application/json',
			},
		},
	}

	/**
	 * Credential test — hits the MCP server's `tools/list` JSON-RPC
	 * method. Validates that the PAT is accepted by the server (server
	 * returns 401 with a JSON-RPC error envelope on bad tokens, 200
	 * with the tool list on good ones — both are valid JSON, which n8n
	 * needs for the credential test to surface a clean error). The
	 * dashboard side has no auth-validating JSON endpoint exposed
	 * publicly, so MCP is the right target.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.mcpUrl}}',
			url: '/',
			method: 'POST',
			body: {
				jsonrpc: '2.0',
				method: 'tools/list',
				params: {},
				id: 1,
			},
			json: true,
		},
	}
}
