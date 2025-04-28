<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Board } from '../interfaces/interfaces';;


const router = useRouter();
const props = defineProps<{
    board: Board
}>();

// Define the emits for component
const emit = defineEmits(['boardCardDeleted']);
const showDeleteConfirmation = ref(false);

const confirmDelete = (event: Event) => {
   event.stopPropagation();
  showDeleteConfirmation.value = true;
};

const cancelDelete = () => {
    showDeleteConfirmation.value = false;
};

const deleteBoard = () => {
    emit('boardCardDeleted', props.board.id);
   showDeleteConfirmation.value = false;
};

const navigateToBoard = () => {
    router.push(`/board/${props.board.id}`);
};
</script>

<template>
    <div class="bg-white shadow-lg rounded-lg p-4 m-4 transition transform hover:scale-105 min-w-[350px] relative cursor-pointer"
        @click="navigateToBoard">
        <div class="absolute top-2 right-2">
            <button @click="confirmDelete" class="text-red-100 hover:text-red-700 transition">
                <span class="material-icons" aria-hidden="true">delete</span>
            </button>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">{{ board.name }}</h2>
        <p class="text-gray-600 mb-4 text-sm">{{ board.description }}</p>
    </div>


     <!-- Delete Confirmation Overlay -->
     <div v-if="showDeleteConfirmation"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-4 rounded-md">
                <p class="mb-4">Are you sure you want to delete this board?</p>
                <div class="flex justify-end space-x-2">
                    <button @click.stop="cancelDelete" class="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
                    <button @click="deleteBoard" class="px-4 py-2 bg-red-500 text-white rounded-md">Delete</button>
                </div>
            </div>
        </div>
</template>