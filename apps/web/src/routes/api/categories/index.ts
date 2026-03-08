import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import db from '@/db'
import { categoriesTable } from '@/db/schema'

export const Route = createAPIFileRoute('/api/categories')({
	GET: async () => {
		try {
			const categories = await db.select().from(categoriesTable)
			return json(categories)
		} catch (error) {
			console.error('Error fetching categories:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
