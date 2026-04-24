import {
	ApplicationError,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow'

import { mcpTool } from './helpers/http'
import { getContentTypes, getSpaces, getTaxonomies } from './helpers/loadOptions'
import { spaceFields, spaceOperations } from './resources/space'
import { contentFields, contentOperations } from './resources/content'
import { contentTypeFields, contentTypeOperations } from './resources/contentType'

/**
 * Decoupled Drupal — primary action node.
 *
 * Resources: Space, Content, Content Type. The implementation routes
 * all calls through Decoupled.io's MCP server (same backend the
 * dashboard uses), which already enforces auth, rate limits, and
 * tier permissions.
 *
 * Adding a new resource is three files:
 *   1. resources/<name>.ts — operation + field property definitions
 *   2. A case branch in `execute()` below
 *   3. (optional) A loadOptions helper if it needs async dropdowns
 */
export class DecoupledDrupal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Decoupled Drupal',
		name: 'decoupledDrupal',
		icon: 'file:DecoupledDrupal.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read and write Drupal content via Decoupled.io',
		defaults: { name: 'Decoupled Drupal' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'decoupledIoApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Content', value: 'content' },
					{ name: 'Content Type', value: 'contentType' },
					{ name: 'Space', value: 'space' },
				],
				default: 'space',
			},
			...spaceOperations,
			...spaceFields,
			...contentOperations,
			...contentFields,
			...contentTypeOperations,
			...contentTypeFields,
		],
	}

	methods = {
		loadOptions: {
			getSpaces,
			getContentTypes,
			getTaxonomies,
		},
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		const out: INodeExecutionData[] = []

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string
			const operation = this.getNodeParameter('operation', i) as string
			try {
				const result = await dispatch.call(this, resource, operation, i)
				const rows = Array.isArray(result) ? result : [result]
				for (const row of rows) {
					out.push({ json: row ?? {}, pairedItem: { item: i } })
				}
			} catch (err) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (err as Error).message }, pairedItem: { item: i } })
					continue
				}
				throw new NodeOperationError(this.getNode(), err as Error, { itemIndex: i })
			}
		}

		return [out]
	}
}

async function dispatch(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): Promise<unknown> {
	if (resource === 'space') {
		return executeSpace.call(this, operation, i)
	}
	if (resource === 'content') {
		return executeContent.call(this, operation, i)
	}
	if (resource === 'contentType') {
		return executeContentType.call(this, operation, i)
	}
	throw new ApplicationError(`Unknown resource: ${resource}`)
}

async function executeSpace(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	if (operation === 'list') {
		const includeArchived = this.getNodeParameter('includeArchived', i, false) as boolean
		return await mcpTool.call(this, 'list_spaces', { archived: includeArchived })
	}
	const spaceId = Number(this.getNodeParameter('spaceId', i))
	if (operation === 'get') return await mcpTool.call(this, 'get_space', { space_id: spaceId })
	if (operation === 'getLoginLink')
		return await mcpTool.call(this, 'get_login_link', { space_id: spaceId })
	if (operation === 'getOAuthCredentials')
		return await mcpTool.call(this, 'get_oauth_credentials', { space_id: spaceId })
	if (operation === 'getUsage')
		return await mcpTool.call(this, 'get_space_usage', { space_id: spaceId })
	throw new ApplicationError(`Unknown space operation: ${operation}`)
}

async function executeContent(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const spaceId = Number(this.getNodeParameter('spaceId', i))

	if (operation === 'list') {
		const contentType = this.getNodeParameter('contentType', i) as string
		const limit = this.getNodeParameter('limit', i, 10) as number
		return await mcpTool.call(this, 'list_content', {
			space_id: spaceId,
			content_type: contentType,
			limit,
		})
	}

	if (operation === 'get') {
		const contentType = this.getNodeParameter('contentType', i) as string
		const uuid = this.getNodeParameter('uuid', i) as string
		return await mcpTool.call(this, 'get_content', {
			space_id: spaceId,
			content_type: contentType,
			uuid,
		})
	}

	if (operation === 'import') {
		const payloadRaw = this.getNodeParameter('payload', i)
		const payload =
			typeof payloadRaw === 'string' ? JSON.parse(payloadRaw) : (payloadRaw as object)
		return await mcpTool.call(this, 'import_content', { space_id: spaceId, ...payload })
	}

	throw new ApplicationError(`Unknown content operation: ${operation}`)
}

async function executeContentType(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const spaceId = Number(this.getNodeParameter('spaceId', i))
	if (operation === 'list')
		return await mcpTool.call(this, 'list_content_types', { space_id: spaceId })
	if (operation === 'describe') {
		const contentType = this.getNodeParameter('contentType', i) as string
		return await mcpTool.call(this, 'describe_content_type', {
			space_id: spaceId,
			content_type: contentType,
		})
	}
	throw new ApplicationError(`Unknown contentType operation: ${operation}`)
}
