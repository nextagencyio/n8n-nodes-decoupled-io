import { INodeProperties } from 'n8n-workflow'

/**
 * Space resource — manage Drupal sites.
 *
 * Operations are intentionally narrow in v0.1: list, get, get login
 * link, get OAuth credentials. Create/Delete are dangerous and gated
 * to Phase 2 so users don't fat-finger a `delete_space` call from a
 * misconfigured workflow.
 */

export const spaceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['space'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get details for a single space',
				action: 'Get a space',
			},
			{
				name: 'Get Login Link',
				value: 'getLoginLink',
				description:
					'Generate a one-time login URL into the Drupal admin for this space',
				action: 'Get a login link',
			},
			{
				name: 'Get OAuth Credentials',
				value: 'getOAuthCredentials',
				description:
					'Get OAuth client_id + client_secret for the space (for frontend .env files)',
				action: 'Get oauth credentials',
			},
			{
				name: 'Get Usage',
				value: 'getUsage',
				description: 'Get usage statistics for a space',
				action: 'Get space usage',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all spaces in the organization',
				action: 'List spaces',
			},
		],
		default: 'list',
	},
]

export const spaceFields: INodeProperties[] = [
	// ── List ─────────────────────────────────────────────────────────
	{
		displayName: 'Include Archived',
		name: 'includeArchived',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['space'], operation: ['list'] },
		},
		description: 'Whether to include archived spaces in the result',
	},

	// ── Get / Get Login Link / Get OAuth / Get Usage ─────────────────
	{
		displayName: 'Space Name or ID',
		name: 'spaceId',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getSpaces' },
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['get', 'getLoginLink', 'getOAuthCredentials', 'getUsage'],
			},
		},
		description:
			'The space to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
]
