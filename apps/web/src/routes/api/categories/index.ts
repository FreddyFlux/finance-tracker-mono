import { createFileRoute } from '@tanstack/react-router'
import db, { categoriesTable } from '@money-saver/db'

export const Route = createFileRoute('/api/categories/')({
	server: {
		handlers: {
			GET: async () => {
				try {
					const categories = await db.select().from(categoriesTable)
					return Response.json(categories)
				} catch (error) {
					console.error('Error fetching categories:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
