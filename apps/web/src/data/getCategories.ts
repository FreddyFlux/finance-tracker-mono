import { createServerFn } from "@tanstack/react-start";
import db, { categoriesTable } from "@money-saver/db";

export const getCategories = createServerFn({
	method: "GET",
}).handler(async () => {
	const categories = await db.select().from(categoriesTable);
	return categories;
});
