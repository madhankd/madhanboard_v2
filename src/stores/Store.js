import { ref } from 'vue';
import { 
    fetchBoards as fetchBoardsFromFirebase, 
    addBoard as addBoardFromFirebase, 
    deleteBoard as deleteBoardFromFirebase,
    fetchBoard as fetchBoardFromFirebase 
} from '../http/firebase';

// Global reactive state (always shared)
const boards_state = ref({
    loading: true,
    data: []
});

const current_board = ref({
    loading:true,
    data:[]
});

const STORAGE_KEY = 'madboard_current_board';

// Define BoardState
export const useBoardStore = () => {

    const getBoards = async () => {
        boards_state.value.loading = true;
        try {
            boards_state.value.data = await fetchBoardsFromFirebase(); // Fetch boards
        } catch (error) {
            console.error("Failed to fetch boards: ", error);
        } finally {
            boards_state.value.loading = false; // Set loading to false
        }
    };

    // Delete Board function
    const deleteBoard = async (boardId) => {
      try {
          // Call the deleteBoard function from Firebase
          await deleteBoardFromFirebase(boardId); // Deleting from Firestore
          console.log(`Deleted board with ID: ${boardId}`);

          // Update the local state by filtering out the deleted board
          boards_state.value.data = boards_state.value.data.filter(board => board.id !== boardId);
      } catch (error) {
          console.error("Error deleting board in store:", error);
          throw error; // Optional: rethrow for component handling
      }
    };

    const createBoard = async(board) =>{
        try {
            // Add the board using the addBoard utility
            const boardId = await addBoardFromFirebase(board);
            // After successfully adding the board, push it to the reactive boards array
            boards_state.value.data = [{ id: boardId, ...board },...boards_state.value.data];

            console.log("Boards State after addition:", boards_state.value.data); 

            //await getBoards();
        } catch (error) {
            console.error("Error creating board: ", error);
            throw error;
        }
    }

    //to fetch a specific board
    const fetchBoard = async (boardId) => {
        current_board.value.loading = true 
        try {
            const board = await fetchBoardFromFirebase(boardId);
          
            if (board) {
                current_board.value.data = board;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
            }
            console.log("Fetched board:", current_board.value.data); 
        } catch (error) {
            console.error("Failed to fetch board: ", error);
            throw error; // Re-throw for handling in the component if needed
        }finally{
            current_board.value.loading = false; // Set loading to false
        }
    };

    //create code snippet to add a item in a board
    const addItemToBoard = async (boardId, item) => {
        try {
            // Add the item using the addItem utility
            await addItemToBoardFromFirebase(boardId, item);
            // After successfully adding the item, push it to the current board's items array
            current_board.value.data.items = [...current_board.value.data.items, item];
        } catch (error) {
            console.error("Error creating item in board: ", error);
            throw error;
        }
    }

    const deactivateBoardLoading = () =>{
        boards_state.value.loading = false;
    }

    const activateBoardLoading = () =>{
        boards_state.value.loading = true;
    }

    const updateBoardInLocalStorage = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current_board.value.data));
    };

    const loadBoardFromLocalStorage = () => {
        const storedBoard = localStorage.getItem(STORAGE_KEY);
        if (storedBoard) {
            current_board.value.data = JSON.parse(storedBoard);
            current_board.value.loading = false;
        }
    };


    return {
        boards_state,
        current_board,
        getBoards,
        createBoard,
        deleteBoard,
        fetchBoard,
        updateBoardInLocalStorage,
        loadBoardFromLocalStorage
    };
};
