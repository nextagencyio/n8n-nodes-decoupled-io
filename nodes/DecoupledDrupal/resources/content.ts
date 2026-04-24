import { INodeProperties } from 'n8n-workflow'

/**
 * Content resource — list, fetch, and import content items.
 *
 * Discovery operations (list/get) are pure reads via JSON:API.
 * Bulk import wraps the existing `import_content` MCP tool which
 * already handles nested paragraphs, taxonomies, and references.
 *
 * Granular create/update/delete are deliberately *not* in v0.1 —
 * `import_content` covers most real workflows and avoids the rabbit
 * hole of building a generic Drupal field-mapping UI in n8n. We can
 * add typed create/update in Phase 2 once the patterns are clearer.
 */

export const contentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['content'] } },
		options: [
			{
				name: 'List',
				value: 'list',
				description: 'List content items of a content type',
				action: 'List content',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single content item by UUID',
				action: 'Get content',
			},
			{
				name: 'Import',
				value: 'import',
				description: 'Bulk import content from a JSON payload',
				action: 'Import content',
			},
		],
		default: 'list',
	},
]

export const contentFields: INodeProperties[] = [
	// All content operations need a space first
	{
		displayName: 'Space Name or ID',
		name: 'spaceId',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getSpaces' },
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['content'] },
		},
		description:
			'The space to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── List ─────────────────────────────────────────────────────────
	{
		displayName: 'Content Type Name or ID',
		name: 'contentType',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getContentTypes',
			loadOptionsDependsOn: ['spaceId'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['content'], operation: ['list'] },
		},
		description: 'The content type machine name (e.g. <code>article</code>). Pick from the dropdown after a space is selected. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		displayOptions: {
			show: { resource: ['content'], operation: ['list'] },
		},
		description: 'Max number of results to return',
	},

	// ── Get ──────────────────────────────────────────────────────────
	{
		displayName: 'Content Type Name or ID',
		name: 'contentType',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getContentTypes',
			loadOptionsDependsOn: ['spaceId'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['content'], operation: ['get'] },
		},
		description: 'The content type the item belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'UUID',
		name: 'uuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['content'], operation: ['get'] },
		},
		description: 'The Drupal node UUID — also visible in the URL of the edit page',
	},

	// ── Import ───────────────────────────────────────────────────────
	{
		displayName: 'Payload',
		name: 'payload',
		type: 'json',
		default: '{\n  "content_types": [],\n  "content": []\n}',
		required: true,
		typeOptions: { rows: 8 },
		displayOptions: {
			show: { resource: ['content'], operation: ['import'] },
		},
		description:
			'Content payload in <code>import_content</code> shape. See <a href="https://decoupled.io/docs/content" target="_blank">the import format</a> for examples.',
	},
]
