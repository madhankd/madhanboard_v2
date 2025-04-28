<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'; // Importing onMounted
import { useBoardStore } from '../stores/Store.js'
import BoardCard from '../components/BoardCard.vue';
import { Board } from '../interfaces/interfaces';
import PageLoader from '../components/PageLoader.vue';

const { boards_state, getBoards, deleteBoard } = useBoardStore();

onMounted(() => {
  getBoards().then(() => {
    console.log('Store reference in home:', boards_state.value);
  }); // Call to fetch boards
});


const handleBoardDelete = async (boardId: string) => {
  // Store the current state of the boards
  const originalBoards = [...boards_state.value.data];

  // Optimistically update UI
  boards_state.value.data = boards_state.value.data.filter(board => board.id !== boardId);

  try {
    // Attempt to delete from the store (which should also delete from Firebase)
    await deleteBoard(boardId);

    // If successful, no need to do anything else
    console.log(`Board ${boardId} deleted successfully`);
  } catch (error) {
    // If delete fails, revert the UI change
    boards_state.value.data = originalBoards;

    console.error("Failed to delete the board. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to delete the board. The changes have been reverted. Please try again.");
  }
};
</script>

<template>
  <PageLoader v-if="boards_state.loading" />
  <main class="p-5 font-sans">
    <h1 class="text-2xl font-bold mb-4">Personal boards</h1>
    <transition-group name="fade" tag="div" class="flex flex-wrap">
      <BoardCard v-for="board in boards_state.data as Board[]" :key="board.id" :board="board"
        @boardCardDeleted="handleBoardDelete" />
    </transition-group>
  </main>
</template>