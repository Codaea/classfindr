<template>
    <UModal title="More Info" :close="{ onClick: () => emit('close', null)}">
            <template #content>
                <div class="p-4">
                    <h2 class="text-2xl font-bold mb-2">{{ course.code }} - {{ course.title }}</h2>
                    <p class="mb-1"><strong>Time:</strong> {{ getStartTime(course.meeting_times) }} - {{
                        getEndTime(course.meeting_times) }}</p>
                    <p class="mb-1"><strong>Location:</strong> {{ course.building }} {{ course.room }}</p>
                    <p class="mb-1"><strong>Instructor:</strong> {{ course.instructor }}</p>
                    <p class="mb-1"><strong>Description:</strong> {{ course.description }}</p>
                </div>
            </template>
        </UModal>
</template>

<script setup lang="ts">
const props = defineProps({
    course: {
        type: Object as () => {
            id: string;
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
        },
        required: true
    }
})

const emit = defineEmits({
    close: (value: null) => true
})

const now = new Date()
const jsDay = now.getDay()
const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1

interface CourseToday {
    id: string
    code: string
    title: string
    description: string
    meeting_times: {
        start_time: string
        end_time: string
        meet_day: string
    }[]
    building: string
    room: string
    instructor: string
}


function getStartTime(meeting_times: CourseToday['meeting_times']): string {
    for (const mt of meeting_times) {
        if (mt.meet_day === dayOfWeek.toString()) {
            return formatTime(mt.start_time)
        }
    }
    return ''
}

function getEndTime(meeting_times: CourseToday['meeting_times']): string {
    for (const mt of meeting_times) {
        if (mt.meet_day === dayOfWeek.toString()) {
            return formatTime(mt.end_time)
        }
    }
    return ''
}

function formatTime(timeStr: string): string {
    const hour = parseInt(timeStr.slice(0, 2), 10)
    const minute = timeStr.slice(2, 4)
    const isPM = hour >= 12
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minute} ${isPM ? 'PM' : 'AM'}`
}

function getStartTimeValue(meeting_times: CourseToday['meeting_times']): number {
    for (const mt of meeting_times) {
        if (mt.meet_day === dayOfWeek.toString()) {
            const hour = parseInt(mt.start_time.slice(0, 2), 10)
            const minute = parseInt(mt.start_time.slice(2, 4), 10)
            return hour * 60 + minute
        }
    }
    return 0
}
</script>