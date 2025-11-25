export interface ScrapeClassesSchema {
    srcdb: string;
    count: number;
    results: Result[];
}

export interface Result {
    key: string;
    code: string;
    title: string;
    crn: string;
    no: string;
    total: string;
    schd: string;
    camp: string;
    stat: string;
    ssrFees: string;
    isCancelled: string;
    meets: string;
    mpkey: string;
    meetingTimes: string;
    instr: string;
    start_date: Date;
    end_date: Date;
    srcdb: string;
}

export interface ScrapeClassDetailsSchema {
    key: string;
    mpkey: string;
    stat: string;
    code: string;
    section: string;
    crn: string;
    title: string;
    session_html: string;
    hours_html: string;
    rpt_for_credit: string;
    campus: string;
    sche_type_clss_fild: string;
    inst_mthd: string;
    grade_mode: string;
    status: string;
    max_enroll: string;
    enrollment: string;
    ssbsect_seats_avail: string;
    waitlist_capacity: string;
    ssbsect_wait_count: string;
    ssbsect_wait_avail: string;
    cross_list_max_enroll: string;
    xlist_wait_cap: string;
    ssbxlst_seats_avail: string;
    dbtime: string;
    description: string;
    registration_restrictions: string;
    corequisites: string;
    department_approval_required: string;
    recommendations: string;
    fees: string;
    attribute_description: string;
    books_html: string;
    clssnotes: string;
    meeting_html: string;
    exams_html: string;
    instructordetail_html: string;
    all_sections: string;
    dept_contact: string;
    srcdb: string;
    allInGroup: AllInGroup[]; // sections in the same group
}

export interface AllInGroup {
    key: string;
    code: string;
    title: string;
    crn: string;
    no: string;
    total: string;
    schd: string;
    camp: string;
    stat: string;
    ssrFees: string;
    isCancelled: string;
    meets: string;
    mpkey: string;
    meetingTimes: string;
    instr: string;
    start_date: Date;
    end_date: Date;
    srcdb: string;
}



export async function scrapeClasses(srcdb: string = '202602'): Promise<ScrapeClassesSchema | void> {

    const url = 'https://classes.oregonstate.edu/api/?page=fose&route=search&camp=C';
    const options = {
        method: 'POST',
        body: JSON.stringify({
            other: { srcdb: srcdb },
            criteria: [{ field: 'camp', value: 'C' }]
        }),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(data);
        return data as ScrapeClassesSchema;
    } catch (error) {
        console.error(error);
    }
}

export async function scrapeClassDetails(code: string, crn: string, srcdb: string = '202602'): Promise<ScrapeClassDetailsSchema | void> {

    const url = 'https://classes.oregonstate.edu/api/?page=fose&route=details';
    const options = {
        method: 'POST',
        body: JSON.stringify({
            group: `code:${code}`,
            key: `crn:${crn}`,
            srcdb: srcdb,
            matched: `crn:${crn}`
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data as ScrapeClassDetailsSchema;
    } catch (error) {
        console.error(error);
    }

}