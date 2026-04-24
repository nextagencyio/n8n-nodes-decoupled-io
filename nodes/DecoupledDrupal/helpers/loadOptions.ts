import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow'
import { mcpTool } from './http'

interface SpaceRow {
	id: number | string
	name?: string
	machine_name?: string
	environment_tier?: string
}

interface ContentTypeRow {
	id?: string
	label?: string
	name?: string
	machine_name?: string
	description?: string
}

interface TaxonomyRow {
	id?: string
	label?: string
	name?: string
	machine_name?: string
}

function asArray<T>(data: unknown, key: string): T[] {
	if (Array.isArray(data)) return data as T[]
	if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)[key])) {
		return (data as Record<string, unknown>)[key] as T[]
	}
	return []
}

/**
 * Load all spaces in the user's organization, formatted for an n8n
 * dropdown. Tier badge is appended to the display name so users with
 * dev/test/live environments can tell them apart at a glance.
 */
export async function getSpaces(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const data = await mcpTool.call(this, 'list_spaces', { archived: false })
	const spaces = asArray<SpaceRow>(data, 'spaces')
	return spaces.map((s) => {
		const tier = s.environment_tier ? ` · ${s.environment_tier}` : ''
		const label = `${s.name ?? s.machine_name ?? `Space #${s.id}`}${tier}`
		return { name: label, value: String(s.id) }
	})
}

/**
 * Load content types for the currently-selected space. Depends on
 * spaceId — n8n re-runs this whenever spaceId changes.
 */
export async function getContentTypes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const spaceId = this.getCurrentNodeParameter('spaceId') as string
	if (!spaceId) return []
	const data = await mcpTool.call(this, 'list_content_types', { space_id: Number(spaceId) })
	const types = asArray<ContentTypeRow>(data, 'types')
	return types.map((t) => ({
		name: t.label ?? t.name ?? t.id ?? '(unnamed)',
		value: (t.id ?? t.machine_name ?? '') as string,
		description: t.description,
	}))
}

/**
 * Load taxonomy vocabularies for the currently-selected space. Same
 * dependency story as content types.
 */
export async function getTaxonomies(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const spaceId = this.getCurrentNodeParameter('spaceId') as string
	if (!spaceId) return []
	const data = await mcpTool.call(this, 'list_taxonomies', { space_id: Number(spaceId) })
	const taxonomies = asArray<TaxonomyRow>(data, 'taxonomies')
	return taxonomies.map((t) => ({
		name: t.label ?? t.name ?? t.id ?? '(unnamed)',
		value: (t.id ?? t.machine_name ?? '') as string,
	}))
}
