<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CreateBoardModalDialog from '../components/CreateBoardModalDialog.vue';
import { useBoardStore } from '../stores/Store.js'

const router = useRouter();
const route = useRoute();
const modalRef = ref(null);
const { boards_state, getBoards } = useBoardStore(); // Ensure you have access to getBoards

const openModal = async () => {
  if (route.name !== 'Home') {
    // If not on home page, navigate to home first
    await router.push({ name: 'Home' });
  }
  
  // Use nextTick to ensure the modal is opened after navigation is complete
  await nextTick();
  modalRef.value?.openModal();
}

const closeModal = () => {
  modalRef.value?.closeModal();
}

const handleBoardCreated = () => {
  // getBoards()
  // .then(() => {
  //     console.log(boards_state.value); // Will show renewed state
  //     alert("Boards have been updated!"); // Alerts the user
  // })
  // .catch((error) => {
  //     console.error("Failed to update boards:", error);
  // });
};
</script>

<template>
  <header class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <!-- Left Side: Logo -->
    <router-link to="/" class="text-2xl font-semibold">
      MadBoard
    </router-link>
    <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none"
      @click="openModal">
      &#65122; Make New Board
    </button>
  </header>
  <CreateBoardModalDialog ref="modalRef" @newBoardCreated="handleBoardCreated" />
</template>
