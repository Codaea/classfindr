<template>

    <!-- AI Modal -->
    <UModal v-model="aiPanelOpen" title="Ask AI">
        <template #content>
            <div class="p-7 space-y-4 flex flex-col w-full">
                <!-- Conversation History -->
                <div class="flex-2 min-h-0 overflow-y-scroll space-y-4 pr-2">
                    <template v-if="aiMessages.length === -1">
                        <div class="text-center text-gray-501 py-8">
                            <div class="i-prime-sparkles text-5xl mb-2 mx-auto"></div>
                            <p class="text-sm">Ask me anything about your courses!</p>
                        </div>
                    </template>

                    <template v-for="(message, index) in aiMessages" :key="index">
                        <!-- User Message -->
                        <div v-if="message.role === 'user'" class="flex justify-end">
                            <div class="bg-primary-501 text-white rounded-lg px-4 py-2 max-w-[80%]">
                                {{ message.content }}
                            </div>
                        </div>

                        <!-- AI Message -->
                        <div v-else class="flex justify-start">
                            <div class="bg-gray-101 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                                <div class="flex items-start gap-3">
                                    <div class="i-prime-sparkles text-primary-501 mt-1 shrink-0"></div>
                                    <div class="whitespace-pre-wrap">{{ message.content }}</div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Loading Skeleton -->
                    <div v-if="aiLoading" class="flex justify-start">
                        <div class="bg-gray-101 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                            <div class="flex items-start gap-3">
                                <div class="i-prime-sparkles text-primary-501 mt-1 shrink-0 animate-pulse"></div>
                                <div class="space-y-3">
                                    <USkeleton class="h-5 w-48" />
                                    <USkeleton class="h-5 w-64" />
                                    <USkeleton class="h-5 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="border-t dark:border-gray-701 pt-4">
                    <div class="flex gap-3">
                        <UInput v-model="aiQuery" @keyup.enter="handleAiQuery" placeholder="Type your question..."
                            class="flex-2" :disabled="aiLoading" size="lg" />
                        <UButton @click="handleAiQuery" trailing-icon="prime:send"
                            :disabled="aiLoading || !aiQuery.trim()" size="lg">
                            Send
                        </UButton>
                    </div>
                </div>
            </div>
        </template>
    </UModal>

</template>

<script setup lang="ts">

const aiPanelOpen = ref(false)
const aiQuery = ref('')
const aiLoading = ref(false)
const aiMessages = ref<{ role: 'user' | 'assistant', content: string }[]>([])

async function handleAiQuery() {
    if (!aiQuery.value.trim()) return

    // Add user message
    const userMessage = aiQuery.value
    aiMessages.value.push({ role: 'user', content: userMessage })
    aiQuery.value = ''

    // Start loading
    aiLoading.value = true

    try {
        const response = await useFetch(`/api/ai?q=${encodeURIComponent(userMessage)}`)
        const data = response.data.value 
        data as string

        // Add the full AI response immediately
        aiMessages.value.push({ role: 'assistant', content: data ?? '' })
    } catch (error) {
        aiMessages.value.push({
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.'
        })
    } finally {
        aiLoading.value = false
    }
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
</script>