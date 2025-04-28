<script setup lang="ts">
</script>

<template>
    <div class="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex justify-center items-center">
        <div role="status">
            <svg class="w-16 h-16 animate-bounce" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.8C100 78.2 78.2 100 50 100C21.8 100 0 78.2 0 50.8C0 23.6 21.8 1.8 50 1.8C78.2 1.8 100 23.6 100 50.8Z"
                    fill="currentColor" />
                <path
                    d="M91.7 50.8C91.7 73 73 91.7 50.8 91.7C28.6 91.7 9 73 9 50.8C9 28.6 28.6 9 50.8 9C73 9 91.7 28.6 91.7 50.8Z"
                    stroke="currentColor" stroke-width="2" />
            </svg>
            <span class="mt-4 animate-pulse">Loading...</span>
        </div>
    </div>
</template>

