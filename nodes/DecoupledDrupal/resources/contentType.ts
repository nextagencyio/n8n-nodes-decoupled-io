import { INodeProperties } from 'n8n-workflow'

/**
 * Content Type resource — discover the content model.
 *
 * Two operations: list (all types in a space) and describe (return the
 * field schema for one type). The describe operation is the primary
 * way an n8n workflow figures out what fields it needs to populate
 * before calling content/import.
 */

export const contentTypeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contentType'] } },
		options: [
			{
				name: 'List',
				value: 'list',
				description: 'List all content types in a space',
				action: 'List content types',
			},
			{
				name: 'Describe',
				value: 'describe',
				description: 'Get the field schema for a content type',
				action: 'Describe a content type',
			},
		],
		default: 'list',
	},
]

export const contentTypeFields: INodeProperties[] = [
	{
		displayName: 'Space Name or ID',
		name: 'spaceId',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getSpaces' },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['contentType'] } },
		description:
			'The space to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Describe ─────────────────────────────────────────────────────
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
			show: { resource: ['contentType'], operation: ['describe'] },
		},
		description: 'The content type to describe. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
]
