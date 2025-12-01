import OpenAI from "openai"

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const db = useDatabase()
    console.log("API KEY:", process.env.GEMINIAPIKEY)
    const client = new OpenAI({
        apiKey: process.env.GEMINIAPIKEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    })


    const today = new Date().toISOString().split('T')[0]

    // find date looks something like 0 is monday, 1 is tuesday, ..., 6 is sunday
    let dayOfWeek = new Date().getDay()
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // adjust so monday=0, sunday=6

    const { rows } = await db.sql`SELECT code, title, description, meeting_times, building, room, instructor FROM courses WHERE TERM = '202601' AND type = 'A' AND meeting_times::jsonb @> ${JSON.stringify([{ meet_day: dayOfWeek.toString() }])};`

    const { q } = query;

    const response = await client.chat.completions.create({
        messages: [{
            role: "developer",
            content: "You are a expert search agent with access to a list of classes taking place during the day. Find a class that most closely matches their natural language search, taking liberties to rephrase and clarify the query, returning the fields title, building, room, and time in natural language. If no good match is found, redirect by showing related classes they might be interested in. Do not use markdown formatting in your response. Make sure the time hasn't already occured today.",
        },
        {
            role: "user",
            content: `CURRENT TIME: ${new Date().toString}`
        },
        {
            role: "user",
            content: `DATABASE INFO ${rows}`,
        },
        {
            role: "user",
            content: `QUERY: ${q}`
        }
        ],
        model: "gemini-2.5-flash-lite"
    })

    
    return response.choices[0].message.content
})