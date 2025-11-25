export default defineNitroPlugin(async (nitroApp) => {
    console.log("Initializing database...")
    const db = useDatabase()

    // db.sql`DROP TABLE IF EXISTS courses;`
    db.sql`CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        crn TEXT,
        code TEXT,
        title TEXT,
        description TEXT,

        section_number TEXT,
        type TEXT,
        campus TEXT,
        status TEXT,
        fees TEXT,
        isCancelled TEXT,
        
        meeting_times JSONB,
        instructor TEXT,
        building TEXT,
        room TEXT,

        seats_aval TEXT,
        seats_total TEXT,
        credit_hours TEXT,

        registration_restrictions TEXT, -- NEED TO STRIP HTML OUT, classes are listed as prerequisites:
        prerequisites TEXT, -- we have to parse this out of registration_restrictions. comma seperated list of course codes

        start_date DATE,
        end_date DATE,
        term TEXT

        );`
    console.log("Database initialized.")
})

/*

type is lecture/lab/discussion etc
{
    "meetingTimes": [
        {
            "meet_day": "0", // week starts monday=0, sunday=6
            "start_time": "1000", // 10:00 AM
            "end_time": "1150" // 11:50 AM
        },
        {
            "meet_day": "2",
            "start_time": "1000",
            "end_time": "1150"
        }
    ]
}


registration_restrictions
: 
"<p class=\"prereq\">Prerequisites: (<a href=\"/search/?p=CS%20162\" data-action=\"result-detail\" data-group=\"code:CS 162\" >CS 162</a>, <a href=\"/search/?p=CS%20162H\" data-action=\"result-detail\" data-group=\"code:CS 162H\"  class=\"notoffered\">162H</a> or <a href=\"/search/?p=CS%20165\" data-action=\"result-detail\" data-group=\"code:CS 165\"  class=\"notoffered\">165</a>) and (<a href=\"/search/?p=CS%20225\" data-action=\"result-detail\" data-group=\"code:CS 225\" >CS 225</a>, <a href=\"/search/?p=MTH%20231\" data-action=\"result-detail\" data-group=\"code:MTH 231\" >MTH 231</a> or <a href=\"/search/?p=MTH%20231H\" data-action=\"result-detail\" data-group=\"code:MTH 231H\"  class=\"notoffered\">231H</a>).<br/>A minimum grade of C is required in <a href=\"/search/?p=CS%20162\" data-action=\"result-detail\" data-group=\"code:CS 162\" >CS 162</a>, <a href=\"/search/?p=CS%20162H\" data-action=\"result-detail\" data-group=\"code:CS 162H\"  class=\"notoffered\">CS 162H</a>, <a href=\"/search/?p=CS%20165\" data-action=\"result-detail\" data-group=\"code:CS 165\"  class=\"notoffered\">CS 165</a>, <a href=\"/search/?p=CS%20225\" data-action=\"result-detail\" data-group=\"code:CS 225\" >CS 225</a>, <a href=\"/search/?p=MTH%20231\" data-action=\"result-detail\" data-group=\"code:MTH 231\" >MTH 231</a> and <a href=\"/search/?p=MTH%20231H\" data-action=\"result-detail\" data-group=\"code:MTH 231H\"  class=\"notoffered\">MTH 231H</a>.</p><p class=\"maj\">Enrollment is limited to students with a program in Elect & Computer Engineering (039), Computer Science (307) or Biological Data Sciences (858).</p><p class=\"col\">Enrollment limited to students in the College of Agricultural Sci, College of Engineering or College of Science colleges.</p>"

*/