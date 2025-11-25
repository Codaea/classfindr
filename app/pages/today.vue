<template>
    <div>
        <h1 class="text-4xl">Today's Classes</h1>
        <div class="space-x-2">
            <UInputTime v-model="time" />
            <UInputNumber v-model="hoursShown" label="Hours ahead" />
            <UInput v-model="search" placeholder="Search..." icon="i-lucide-search" />
            <span class="text-sm text-gray-400">Showing {{ courses.length }} results</span>
        </div>
    </div>
    <div class="space-y-2"">
        <p>Next Class:</p>
        <div v-for="course in courses" :key="course.code">
        <UModal title="More Info">
            <UCard>
                <div class="flex flex-row w-full space-x-4">
                    <p class="text flex-1"> {{ course.code }} - {{ course.title }}</p>
                    <p class="text-gray-400">{{ getStartTime(course.meeting_times) }} - {{
                        getEndTime(course.meeting_times) }}</p>
                </div>
                <p class="text-sm">{{ course.building }} {{ course.room }}</p>
                <p class="text-sm text-gray-400">{{ course.instructor }}</p>
                <p class="text-xs">{{ truncate(course.description, 100) }}</p>
            </UCard>
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
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { Time } from '@internationalized/date'

const now = new Date()
const time = shallowRef(new Time(now.getHours(), now.getMinutes(), 0))
const jsDay = now.getDay()
const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1

const search = ref('')
const hoursShown = ref(4)

const data = ref<CourseToday[]>([])

interface CourseToday {
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

// fetch data (server likely returns today's classes already)
const v = await useFetch<CourseToday[]>('/api/today')
data.value = (v.data.value || []) as CourseToday[]

const courses = computed(() => {
    const list = Array.isArray(data.value) ? data.value : []

    const selectedHour = time.value.hour
    const selectedMinute = time.value.minute

    const selectedMinutes = (selectedHour ?? 0) * 60 + (selectedMinute ?? 0)

    return list.filter(course => {
        if (!course.meeting_times) return false
        for (const mt of course.meeting_times) {
            if (mt.meet_day !== dayOfWeek.toString()) {
                continue
            }

            const startHour = mt.start_time.slice(0, 2)
            const startMinute = mt.start_time.slice(2, 4) // "HHMM"
            const endHour = mt.end_time.slice(0, 2)
            const endMinute = mt.end_time.slice(2, 4)
            // make these all into dates and compare
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(startHour, 10), parseInt(startMinute, 10))
            const selected = new Date(now.getFullYear(), now.getMonth(), now.getDate(), selectedHour ?? 0, selectedMinute ?? 0)
            const selectedPlusHours = new Date(selected.getTime() + (hoursShown.value * 60 * 60 * 1000))

            if (selected <= start && start <= selectedPlusHours) {
                if (search.value) {
                    const searchLower = search.value.toLowerCase()
                    if (
                        course.code.toLowerCase().includes(searchLower) ||
                        course.title.toLowerCase().includes(searchLower) ||
                        course.description.toLowerCase().includes(searchLower) ||
                        course.instructor.toLowerCase().includes(searchLower) ||
                        course.building.toLowerCase().includes(searchLower) ||
                        course.room.toLowerCase().includes(searchLower)
                    ) {
                        return true
                    }
                } else {
                    return true
                }
            }
        }
        return false
    }).sort((a, b) => {

        const aStart = getStartTime(a.meeting_times)
        const bStart = getStartTime(b.meeting_times)

        if (aStart < bStart) return -1
        if (aStart > bStart) return 1
        return 0
    }).sort((a,b) => {
        // secondary sort by search match position if search is set
        if (!search.value) return 0
        const searchLower = search.value.toLowerCase()
        const aIndex = Math.min(
            a.code.toLowerCase().indexOf(searchLower),
            a.title.toLowerCase().indexOf(searchLower),
            a.description.toLowerCase().indexOf(searchLower),
            a.instructor.toLowerCase().indexOf(searchLower),
            a.building.toLowerCase().indexOf(searchLower),
            a.room.toLowerCase().indexOf(searchLower)
        )
        const bIndex = Math.min(
            b.code.toLowerCase().indexOf(searchLower),
            b.title.toLowerCase().indexOf(searchLower),
            b.description.toLowerCase().indexOf(searchLower),
            b.instructor.toLowerCase().indexOf(searchLower),
            b.building.toLowerCase().indexOf(searchLower),
            b.room.toLowerCase().indexOf(searchLower)
        )
        if (aIndex !== bIndex) return aIndex - bIndex
        return 0
    })
})

function getStartTime(meeting_times: CourseToday['meeting_times']): string {
    for (const mt of meeting_times) {
        if (mt.meet_day === dayOfWeek.toString()) {
            return mt.start_time.slice(0, 2) + ':' + mt.start_time.slice(2, 4)
        }
    }
    return ''
}

function getEndTime(meeting_times: CourseToday['meeting_times']): string {
    for (const mt of meeting_times) {
        if (mt.meet_day === dayOfWeek.toString()) {
            return mt.end_time.slice(0, 2) + ':' + mt.end_time.slice(2, 4)
        }
    }
    return ''
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }
    return text.slice(0, maxLength) + '...'
}

</script>