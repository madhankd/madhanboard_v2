<script lang="ts" setup>
import { ref, defineProps, defineEmits, defineExpose } from 'vue';
import { useBoardStore } from '../stores/Store.js';

const { createBoard: createBoardInStore,boards_state  } = useBoardStore();
const isOpen = ref(false); 
const emit = defineEmits(['newBoardCreated']);
const boardName = ref('');
const boardDescription = ref('');
const isCreating = ref(false);
const errors = ref({ boardName: '', boardDescription: '' }); 
const isFormValid = ref(false);


const validateInput = () => {
  errors.value.boardName = boardName.value.trim() ? '' : 'Board name is required'; // Validate board name
  errors.value.boardDescription = boardDescription.value.trim() ? '' : 'Board description is required'; // Validate description
  isFormValid.value = !errors.value.boardName && !errors.value.boardDescription; // Update form validity
};

const resetForm = () =>{
    boardName.value = '';
    boardDescription.value = '';
    errors.value = { boardName: '', boardDescription: '' }; // Reset error messages
    isFormValid.value = false; // Ensuring the form is invalid on open
}

const openModal = () => {
    resetForm();
    isOpen.value = true; // Open the modal
};

const closeModal = () => {
    resetForm();
    isOpen.value = false;
};

const createBoard = async () => {
  validateInput(); // Validate inputs before proceeding
  if (!isFormValid.value) {
    return; // Exit function if form is not valid
  }
  isCreating.value = true;  
  try {
    const newBoard = {
      name: boardName.value,
      description: boardDescription.value,
    };
    await createBoardInStore(newBoard);
    emit('newBoardCreated');
    resetForm();
    closeModal();
  } catch (error) {
    console.error("Error creating board: ", error);
    throw error;
  } finally {
    isCreating.value = false; // Reset the loading state
  }
};

// Make methods accessible to parent
defineExpose({
    openModal,
    closeModal
});

</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
    <div class="bg-white p-5 rounded shadow max-w-md w-full relative">

      <div class="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-white/80" v-if="isCreating">
        <div role="status" class="flex flex-col items-center justify-center">
                <svg class="w-16 h-16 animate-bounce" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.8C100 78.2 78.2 100 50 100C21.8 100 0 78.2 0 50.8C0 23.6 21.8 1.8 50 1.8C78.2 1.8 100 23.6 100 50.8Z" fill="currentColor"/>
                    <path d="M91.7 50.8C91.7 73 73 91.7 50.8 91.7C28.6 91.7 9 73 9 50.8C9 28.6 28.6 9 50.8 9C73 9 91.7 28.6 91.7 50.8Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p class="mt-4 animate-pulse ">Creating Your New Board...</p>
            </div>
      </div>

      <h2 class="text-xl mb-2 font-semibold">Add New Board</h2>
      <input v-model="boardName" type="text" placeholder="Board Name" aria-label="Board Title" class="border border-gray-200 rounded p-2 mb-2 w-full" @input="validateInput" />
      <div v-if="errors.boardName" class="text-red-500 text-sm mb-2">{{ errors.boardName }}</div> <!-- Error message for board name -->
      <textarea v-model="boardDescription" placeholder="Board Description" aria-label="Board Description" class="border border-gray-200 rounded p-2 mb-2 w-full" @input="validateInput"></textarea>
      <div v-if="errors.boardDescription" class="text-red-500 text-sm mb-2">{{ errors.boardDescription }}</div> <!-- Error message for description -->
      <div class="flex justify-end gap-2">
        <button class="bg-gray-300 hover:bg-gray-200 text-black px-4 py-2 rounded" @click="closeModal" >
          Cancel
        </button>
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" @click="createBoard" >
          <span v-if="isCreating">Creating...</span>
          <span v-else>Create</span>
        </button>
      </div>
    </div>
  </div>
</template>

