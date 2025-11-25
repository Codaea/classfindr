export default defineEventHandler(async (event) => {
    const db = useDatabase()

    const today = new Date().toISOString().split('T')[0]

    // find date looks something like 0 is monday, 1 is tuesday, ..., 6 is sunday
    let dayOfWeek = new Date().getDay()
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // adjust so monday=0, sunday=6

    console.log(`Fetching classes for today: ${today}, dayOfWeek: ${dayOfWeek}`) // type A is lecture, only fetch lectures
    const { rows} = await db.sql`SELECT code, title, description, meeting_times, building, room, instructor FROM courses WHERE TERM = '202601' AND type = 'A' AND meeting_times::jsonb @> ${JSON.stringify([{ meet_day: dayOfWeek.toString() }])};`

    interface CourseToday {
        code: string;
        title: string;
        description: string;
        meeting_times: {
            start_time: string;
            end_time: string;
            meet_day: string;
        }[];
        building: string;
        room: string;
        instructor: string;
    }




    return rows as CourseToday[];
});