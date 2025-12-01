export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const db = useDatabase();

    const { q, limit, term } = query;
    if (!q || !term) {
        return { results: [] };
    }

    const { rows } = await db.sql`SELECT * FROM classes WHERE (title ILIKE %${q}% OR description ILIKE %${q}%) AND term = ${term} LIMIT ${limit}`;

    return { rows };
})
