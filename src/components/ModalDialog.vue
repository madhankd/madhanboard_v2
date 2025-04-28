<script lang="ts" setup>
 defineProps<{
  isOpen?: boolean
}>();

</script>

<template>
    <div  v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-center justify-center" role="dialog" aria-modal="true">
         <div class="bg-white p-5 rounded shadow max-w-md w-full">
            <h2 class="text-xl mb-2 font-semibold">Add New Card</h2>
            <input type="text" placeholder="Card Title" aria-label="Card Title" class="border border-gray-200 rounded p-2 mb-2 w-full">
            <textarea placeholder="Card Description" aria-label="Card Description" class="border border-gray-200 rounded p-2 mb-2 w-full"></textarea>
            <div class="flex justify-end gap-2">
                <button class="bg-gray-300 hover:bg-gray-200 text-black px-4 py-2 rounded">Cancel</button>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Save</button>
            </div>
         </div>
    </div>
</template>

