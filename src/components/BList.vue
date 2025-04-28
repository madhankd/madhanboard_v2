<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  listid: string;
  title: string;
  items: { id: string; name: string }[];
}>();

const emit = defineEmits(['add-list-item', 'remove-list-item', 'delete-list', 'edit-list-item', 'edit-list-title']);
const newTaskName = ref('');
const deletingItemId = ref<string | null>(null);
const deletingListId = ref<string | null>(null);
const editingItemId = ref<string | null>(null);
const editedTitle = ref('');

const isEditingListTitle = ref(false);
const editedListTitle = ref('');

// Custom directive for auto-focus
const vFocus = {
  mounted: (el) => el.focus()
}

/**Editing a Item */
const addTask = () => {
  if (newTaskName.value.trim()) {
    emit('add-list-item', newTaskName.value);
    newTaskName.value = '';
  }
};

const showDeleteConfirmation = (itemId: string) => {
  deletingItemId.value = itemId;
};

const cancelDelete = () => {
  deletingItemId.value = null;
};

const removeTask = (taskId: string) => {
  emit('remove-list-item', taskId);
};

const confirmDelete = () => {
  if (deletingItemId.value) {
    emit('remove-list-item', deletingItemId.value);
    deletingItemId.value = null;
  }
};

const startEditing = (item: { id: string; title: string }) => {
  editingItemId.value = item.id;
  editedTitle.value = item.title;
};

const saveEdit = (item: { id: string; title: string }) => {
  if (editedTitle.value.trim() && editedTitle.value !== item.title) {
    emit('edit-list-item', item.id, editedTitle.value);
  }
  editingItemId.value = null;
  editedTitle.value = '';
};

const cancelEdit = () => {
  editingItemId.value = null;
};

/**Editing a List */

const startEditingListTitle = () => {
  editedListTitle.value = props.title;
  isEditingListTitle.value = true;
};

const saveListTitleEdit = () => {
  if (editedListTitle.value.trim() && editedListTitle.value !== props.title) {
    emit('edit-list-title', props.listid, editedListTitle.value);
  }
  isEditingListTitle.value = false;
};

const cancelListTitleEdit = () => {
  isEditingListTitle.value = false;
  editedListTitle.value = props.title; // Reset to original title
};

const deleteList = () => {
  if (confirm('Are you sure you want to delete this entire list?')) {
    emit('delete-list');
  }
};

const showDeleteListConfirmation = () => {
  deletingListId.value = props.listid;
};

const cancelDeleteList = () => {
  deletingListId.value = null;
};

const confirmDeleteList = () => {
  if (deletingListId.value) {
    emit('delete-list', deletingListId.value);
    deletingListId.value = null;
  }
};
</script>

<template>
  <div class="bg-white shadow-md rounded-md w-64 flex-shrink-0">
    <div class="p-4 border-b relative">
      <button @click="showDeleteListConfirmation"
        class="absolute top-2 right-2 cursor-pointer font-bold px-2 py-1 rounded-full hover:bg-red-200 transition duration-200"
        title="Delete List" v-if="!isEditingListTitle">
        &#x2715;
      </button>
      <div v-if="!isEditingListTitle" @dblclick="startEditingListTitle" class="cursor-pointer">
        <h3 class="text-lg font-semibold space-y-2 break-words overflow-wrap-anywhere">{{ title }}</h3>
      </div>
      <div v-else class="flex flex-col w-full">
        <input v-model="editedListTitle" @keyup.enter="saveListTitleEdit" @keyup.esc="cancelListTitleEdit"
          @blur="cancelListTitleEdit" class="border rounded px-2 py-1 w-full text-lg font-semibold" v-focus>
          <span class="text-gray-600 text-xs text-left mt-1">Press Enter to save, Esc to cancel</span>
      </div>
    </div>
    <div class="p-4 space-y-2">
      <!-- Card Items -->
      <div v-for="item in items" :key="item.id"
        class="bg-gray-100 rounded-md px-4 py-2 flex justify-between items-center">
        <span v-if="editingItemId !== item.id" @dblclick="startEditing(item)" class="cursor-pointer flex-grow">
          {{ item.title }}
        </span>
        <div v-else class="flex flex-col w-full">
          <input v-model="editedTitle" @keyup.enter="saveEdit(item)" @keyup.esc="cancelEdit" @blur="cancelEdit"
            class="border px-2 py-1 rounded-md w-full text-sm" ref="editInput" v-focus />
          <span class="text-gray-600 text-xs text-left mt-1">Press Enter to save, Esc to cancel</span>
        </div>


        <!-- Delete Confirmation Button -->

        <button v-if="editingItemId !== item.id" @click="showDeleteConfirmation(item.id)"
          class="cursor-pointer font-bold px-2 py-1 rounded-full hover:bg-red-200 transition duration-200 ml-2">
          &#x2716;
        </button>
      </div>

      <!-- Add Card Input -->
      <div>
        <input v-model="newTaskName" type="text" placeholder="Add new card"
          class="border px-2 py-1 rounded-md w-full mb-2 text-sm" @keyup.enter="addTask" />
        <button @click="addTask"
          class="bg-blue-500 text-white w-full py-1 rounded-md text-sm cursor-pointer hover:bg-blue-600">
          Add
        </button>
      </div>

      <!-- Delete Confirmation Overlay -->
      <div v-if="deletingItemId" class="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white p-4 rounded-md">
          <p class="text-sm mb-4">Are you sure you want to delete this item?</p>
          <div class="flex justify-end space-x-2">
            <button @click="cancelDelete"
              class="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-400">
              Cancel
            </button>
            <button @click="confirmDelete" class="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Overlay for List -->
      <div v-if="deletingListId"
        class="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white p-4 rounded-md">
          <p class="text-sm mb-4">Are you sure you want to delete this entire list?</p>
          <div class="flex justify-end space-x-2">
            <button @click="cancelDeleteList"
              class="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-400">
              Cancel
            </button>
            <button @click="confirmDeleteList"
              class="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
              Delete List
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
