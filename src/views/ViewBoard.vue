<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { useBoardStore } from '../stores/Store.js'
import {
  fetchBoard as fetchBoardFromFirebase,
  addItemToBoardList as addItemToBoardListFromFirebase,
  deleteItemFromBoardList as deleteItemFromBoardListFromFireBase,
  addNewListToBoard as addNewListToBoardFromFirebase,
  deleteListFromBoard as deleteListFromBoardFromFirebase,
  updateListItem as updateListItemFromFirebase,
  updateListPosition as updateListPositionFromFirebase,
  updateBoardList as updateBoardListFromFirebase
} from "../http/firebase.js"

import { Board, ListItem } from "../interfaces/interfaces";
import BList from "../components/BList.vue";
import PageLoader from '../components/PageLoader.vue';
import draggable from 'vuedraggable';

const { current_board, fetchBoard, updateBoardInLocalStorage, loadBoardFromLocalStorage } = useBoardStore();
const board = ref();
const isLoading = ref(true); // Track loading state
const route = useRoute();
const boardId = route.params.id as string;
current_board.value.data = [];

const isAddingNewList = ref(false);
const newListTitle = ref('');

const boardLists = computed({
  get: () => current_board.value.data.boardList,
  set: (value) => {
    current_board.value.data.boardList = value;
    console.log('Board lists reordered:', value.map(list => list.id));
  }
});

const onListMove = async (event) => {
  const { oldIndex, newIndex } = event;
  if (oldIndex === newIndex) return; // No change in position
  const movedListId = current_board.value.data.boardList[newIndex].id;
  try {
    const updatedLists = current_board.value.data.boardList.map((list, index) => ({
      id: list.id,
      order: index
    }));

    // Update all list positions in Firebase
    await updateListPositionFromFirebase(boardId, updatedLists);
    console.log("List positions updated successfully in Firebase");
  } catch (error) {
    console.error("Failed to update list positions in Firebase:", error);
    // Revert the change in the UI
    const movedItem = current_board.value.data.boardList.splice(newIndex, 1)[0];
    current_board.value.data.boardList.splice(oldIndex, 0, movedItem);
    alert("Failed to update list positions. The changes have been reverted. Please try again.");
  }
};

const handleAddNewList = async () => {
  if (newListTitle.value.trim()) {
    // Create a temporary ID for the new list
    const tempId = 'temp-' + Date.now();

    // Optimistically add the new list to the UI
    current_board.value.data.boardList.push({
      id: tempId,
      title: newListTitle.value,
      items: []
    });

    try {
      // Attempt to add the list to Firebase
      const newListId = await addNewListToBoardFromFirebase(boardId, newListTitle.value);

      // If successful, update the temporary ID with the real one
      const listIndex = current_board.value.data.boardList.findIndex(list => list.id === tempId);
      if (listIndex !== -1) {
        current_board.value.data.boardList[listIndex].id = newListId;
      }
    } catch (error) {
      // If add fails, remove the list from the UI
      current_board.value.data.boardList = current_board.value.data.boardList.filter(list => list.id !== tempId);

      console.error("Failed to add new list. Error details:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      alert("Failed to add new list. The changes have been reverted. Please try again.");
    } finally {
      // Clear the input and close the add list form, regardless of success or failure
      newListTitle.value = '';
      isAddingNewList.value = false;
    }
  }
};


onMounted(async () => {
  try {
    await fetchBoard(boardId).then((board) => {
      console.log("record as below");
      console.log(current_board.value.data);
    });
  } catch (error) {
    console.log(error);
  }
});

const handleAddItem = async (listId: string, taskName: string) => {

  // Find the list index
  const listIndex = current_board.value.data.boardList.findIndex(list => list.id === listId);

  if (listIndex === -1) return;

  // Create a temporary ID for the new item
  const tempId = 'temp-' + Date.now();

  // Create the new item
  const newItem: ListItem = {
    id: tempId,
    title: taskName,
    created_at: new Date().toISOString()
  };

  // Optimistically update UI
  current_board.value.data.boardList[listIndex].items.push(newItem);

  // Ensure the UI updates immediately
  await nextTick();

  try {
    // Attempt to add the item to Firebase
    const newItemId = await addItemToBoardListFromFirebase(boardId, listId, taskName);

    // If successful, update the temporary ID with the real one
    const itemIndex = current_board.value.data.boardList[listIndex].items.findIndex(item => item.id === tempId);
    if (itemIndex !== -1) {
      current_board.value.data.boardList[listIndex].items[itemIndex].id = newItemId;
    }
  } catch (error) {
    // If add fails, remove the item from the UI
    current_board.value.data.boardList[listIndex].items = current_board.value.data.boardList[listIndex].items.filter(item => item.id !== tempId);

    console.error("Failed to add item. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to add item. The changes have been reverted. Please try again.");
  }
};

const handleRemoveItem = async (listId, taskId) => {

  // Find the list index
  const listIndex = current_board.value.data.boardList.findIndex(list => list.id === listId);
  if (listIndex === -1) return;

  // Find the item index
  const itemIndex = current_board.value.data.boardList[listIndex].items.findIndex(item => item.id === taskId);
  if (itemIndex === -1) return;

  // Store the original item for potential revert
  const originalItem = current_board.value.data.boardList[listIndex].items[itemIndex];

  // Optimistically remove the item from the UI
  current_board.value.data.boardList[listIndex].items.splice(itemIndex, 1);

  try {
    await deleteItemFromBoardListFromFireBase(boardId, listId, taskId);
  } catch (error) {
    // If delete fails, revert the UI change
    current_board.value.data.boardList[listIndex].items.splice(itemIndex, 0, originalItem);
    console.error("Failed to delete item. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to delete item. The changes have been reverted. Please try again.");
  }
}

const handleDeleteList = async (listId: string) => {
  // Store the current state of the board lists
  const originalBoardLists = [...current_board.value.data.boardList];

  // Optimistically update UI
  current_board.value.data.boardList = current_board.value.data.boardList.filter(list => list.id !== listId);

  try {
    // Attempt to delete from Firebase
    await deleteListFromBoardFromFirebase(boardId, listId);

    // If successful, no need to do anything else
    console.log(`List ${listId} deleted successfully`);
  } catch (error) {
    // If delete fails, revert the UI change
    current_board.value.data.boardList = originalBoardLists;

    console.error("Failed to delete list. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to delete list. The changes have been reverted. Please try again.");
  }
};

const handleEditItem = async (listId: string, itemId: string, newTitle: string) => {
  // Find the list index
  const listIndex = current_board.value.data.boardList.findIndex(list => list.id === listId);

  if (listIndex === -1) return;

  // Find the item index
  const itemIndex = current_board.value.data.boardList[listIndex].items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) return;

  // Store the original title for potential revert
  const originalTitle = current_board.value.data.boardList[listIndex].items[itemIndex].title;

  // Optimistically update the UI
  current_board.value.data.boardList[listIndex].items[itemIndex].title = newTitle;

  try {
    // Attempt to update the item in Firebase
    await updateListItemFromFirebase(boardId, listId, itemId, newTitle);

    console.log(`Item ${itemId} updated successfully in list ${listId}`);
  } catch (error) {
    // If update fails, revert the UI change
    current_board.value.data.boardList[listIndex].items[itemIndex].title = originalTitle;

    console.error("Failed to update item. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to update item. The changes have been reverted. Please try again.");
  }
};


const handleEditListTitle = async (listId: string, newTitle: string) => {
  try {
    // Optimistically update the UI
    const listIndex = current_board.value.data.boardList.findIndex(list => list.id === listId);
    if (listIndex !== -1) {
      current_board.value.data.boardList[listIndex].title = newTitle;
    }

    // Update in Firebase
    await updateBoardListFromFirebase(boardId, listId, newTitle);

    console.log(`List title updated successfully for list ${listId}`);
  } catch (error) {
    // Revert the change if there's an error
    const listIndex = current_board.value.data.boardList.findIndex(list => list.id === listId);
    if (listIndex !== -1) {
      current_board.value.data.boardList[listIndex].title = props.title;
    }

    console.error("Failed to update list title. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to update list title. The changes have been reverted. Please try again.");
  }
};

</script>

<template>

  <PageLoader v-if="current_board.loading" />

  <main class="p-5 font-sans">
    <!-- Breadcrumb -->
    <nav class="text-lg mb-5">
      <span>Boards</span> &gt;
      <span class="font-bold text-indigo-800">{{ current_board.data.name }}</span>
    </nav>

    <!-- Main Container -->
    <div class="flex gap-5 overflow-x-auto" v-if="current_board.data">
      <draggable v-model="boardLists" class="flex gap-5 overflow-x-auto" item-key="id" @end="onListMove">
        <template #item="{ element: list }">
          <BList 
            :key="list.id" :title="list.title" :items="list.items"
            :listid="list.id" @add-list-item="(taskName) => handleAddItem(list.id, taskName)"
            @remove-list-item="(taskId) => handleRemoveItem(list.id, taskId)"
            @delete-list="() => handleDeleteList(list.id)"
            @edit-list-item="(itemId, newTitle) => handleEditItem(list.id, itemId, newTitle)" 
            @edit-list-title="(listId, newTitle) => handleEditListTitle(listId, newTitle)"/>
        </template>
      </draggable>
      <!-- Add New List -->
      <div class="w-64 flex-shrink-0">
        <div v-if="isAddingNewList" class="bg-white p-2 rounded-md shadow">
          <input v-model="newListTitle" type="text" placeholder="Enter list title"
            class="border px-2 py-1 rounded-md w-full mb-2 text-sm" @keyup.enter="handleAddNewList" />
          <div class="flex justify-end space-x-2">
            <button @click="isAddingNewList = false"
              class="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-400">
              Cancel
            </button>
            <button @click="handleAddNewList"
              class="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
              Add
            </button>
          </div>
        </div>
        <button v-else @click="isAddingNewList = true"
          class="bg-gray-200 border-dashed border-2 border-gray-400 text-gray-600 hover:bg-gray-300 w-full py-4 rounded-md">
          + Add New List
        </button>
      </div>
    </div>
  </main>
</template>
