// refreshes db with classes from registrar
import { scrapeClasses } from "#imports"

export default defineEventHandler(async (event) => {
    console.log("Refreshing classes database...")

    const db = useDatabase()

    const classesData = await scrapeClasses("202601")


    if (!classesData) {
        return { success: false, message: "Failed to scrape classes." }
    }

    // Clear existing classes
    // await db.sql`DELETE * FROM courses;`

    for (const c of classesData.results) {
        console.log(`Processing class CRN: ${c.crn}, Code: ${c.code} Title: ${c.title}`)
        const processedMeetingTimes = processMeetingTimes(c.meetingTimes);
        console.log(processedMeetingTimes)
        await db.sql`INSERT INTO courses
        (crn, code, title, section_number, type, campus, status, fees, isCancelled, meeting_times, instructor, start_date, end_date, term
        ) VALUES (
            ${c.crn},
            ${c.code},
            ${c.title},
            ${c.no},
            ${c.schd},
            ${c.camp},
            ${c.stat},
            ${c.ssrFees},
            ${c.isCancelled},
            ${JSON.stringify(processedMeetingTimes)},
            ${c.instr},
            ${new Date(c.start_date).toISOString()},
            ${new Date(c.end_date).toISOString()},
            ${c.srcdb}
        );`
    }
})

interface MeetingTime {
    meet_day: string; // week starts monday=0, sunday=6
    start_time: string; // 10:00 AM
    end_time: string; // 11:50 AM
}[]



function processMeetingTimes(meets: string): MeetingTime[] {
    const meetingTimes: MeetingTime[] = [];
    meets.replaceAll('\\', '').slice(1, -1).split('},{').forEach(mt => {
        const cleanMt = mt.replaceAll('{', '').replaceAll('}', '');
        const mtObj: any = {};
        cleanMt.split(',').forEach(pair => {
            const [key, value] = pair.split(':');
            if (key && value) {
                mtObj[key.trim().replaceAll('"', '')] = value.trim().replaceAll('"', '');
            }
        });
        meetingTimes.push(mtObj as MeetingTime);
    });
    return meetingTimes;

}