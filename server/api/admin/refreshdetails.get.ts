import { scrapeClassDetails } from "#imports"
export default defineEventHandler(async (event) => {
    console.log("Refreshing classes details database...")

    const db = useDatabase()

    const { rows } = await db.sql`SELECT * FROM courses WHERE description IS NULL;`
    
    if (!rows || rows.length === 0) {
        console.log("No courses found in database to refresh details for.")
        return
    }
    for (let i = 0; i < rows.length; i++) {
        const course = rows[i];
        console.log(`Fetching details for CRN: ${course.crn}, Code: ${course.code}, Title: ${course.title}`)
        if ( !course.code || !course.crn ) {
            console.log(`Skipping course with missing code or crn: Code: ${course.code}, CRN: ${course.crn}`)
            continue
        }
        // await scrapeClassDetails(course.code, course.crn, course.term)
        const d = await scrapeClassDetails(course.code, course.crn, course.term)
        if (!d) {
            console.log(`No details found for CRN: ${course.crn}, Code: ${course.code}`)
            continue
        }
        db.sql`UPDATE courses SET 
        description = ${d.description},
        fees = ${d.fees},
        building = ${parseMeetingLocation(d.meeting_html).building},
        room = ${parseMeetingLocation(d.meeting_html).room},
        seats_aval = ${d.ssbsect_seats_avail},
        seats_total = ${d.cross_list_max_enroll},
        credit_hours = ${d.attribute_description},
        registration_restrictions = ${d.registration_restrictions},
        prerequisites = ${parsePrerequisites(d.registration_restrictions)}


        WHERE crn = ${course.crn} AND code = ${course.code} AND term = ${course.term};`
        console.log(`Updated details for CRN: ${course.crn}, Code: ${course.code}`)
        console.log(`${rows.length - i - 1} courses left to process.`)
        await new Promise(resolve => setTimeout(resolve, 10)); // wait 1 second between requests to avoid rate limiting
    }
    return { success: true } 
})

function parsePrerequisites(regRestrictions: string): string {
    const re = /code:([A-Z].. [0-9]..)/g
    const prereqs: string[] = []
    let match;
    while ((match = re.exec(regRestrictions)) !== null) {
        prereqs.push(match[1])
    }
    return prereqs.join(',')

}

function parseMeetingLocation(meetingHtml: string): {building: string, room: string} {
    const re = /blank">([A-Z]*) ([0-9]*)/g
    const match = re.exec(meetingHtml)
    if (match && match.length === 3) {
        return {building: match[1], room: match[2]}
    }
    return {building: '', room: ''}
}
