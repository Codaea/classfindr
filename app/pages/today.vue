<template>
    <div>
        <h1 class="text-4xl">Today's Classes</h1>
        <div class="space-x-2">
            <UInputTime v-model="time" />
            <UInputNumber v-model="hoursShown" label="Hours ahead" />
            <UInput v-model="search" placeholder="Search..." icon="i-lucide-search" />
            <span class="text-sm text-gray-400">Showing {{ courses.length }} results</span>
            <UButton @click="openAIPanel()" trailing-icon="prime:sparkles">Ask AI</UButton>
        </div>

        <div class="space-y-2">
            <p>Next Class:</p>
            <div v-for="(course, index) in courses" :key="index">
                <UCard @click="openCourseDetails(course)" class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div class="flex flex-row w-full space-x-4">
                        <p class="text flex-1"> {{ course.code }} - {{ course.title }}</p>
                        <p class="text-gray-400">{{ getStartTime(course.meeting_times) }} - {{
                            getEndTime(course.meeting_times) }}</p>
                    </div>
                    <p class="text-sm">{{ course.building }} {{ course.room }}</p>
                    <p class="text-sm text-gray-400">{{ course.instructor }}</p>
                    <p class="text-xs">{{ truncate(course.description, 100) }}</p>
                </UCard>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { Time } from '@internationalized/date'
import ModalDetails from '~/components/ModalDetails.vue'
import ModalAIChat from '~/components/ModalAIChat.vue'

const overlay = useOverlay()
const courseDetailsModal = overlay.create(ModalDetails)
const aiChatModal = overlay.create(ModalAIChat)

const now = new Date()
const time = shallowRef(new Time(now.getHours(), now.getMinutes(), 0))
const jsDay = now.getDay()
const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1

const search = ref('')
const hoursShown = ref(4)

const data = ref<CourseToday[]>([])

async function openCourseDetails(course: CourseToday) {
    const instance = courseDetailsModal.open({
        course: course,
    })

    const result = await instance.result
}

async function openAIPanel() {
    const instance = aiChatModal.open()

    const result = await instance.result
}

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
        const aStart = getStartTimeValue(a.meeting_times)
        const bStart = getStartTimeValue(b.meeting_times)
        return aStart - bStart
    }).sort((a, b) => {
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

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }
    return text.slice(0, maxLength) + '...'
}

</script>