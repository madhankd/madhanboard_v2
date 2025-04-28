import { ref } from 'vue';
import { fetchBoards as fetchBoardsfromFirebase, addBoard as addBoardToFirebase } from '../http/firebase'; // Ensure addBoard is imported

const useBoardStore = () => {
    const boards = ref([]); // Reactive reference for boards
    const isLoading = ref(false); // Loading state
    const currentBoard = ref(null);

    const getBoards = async () => {
        isLoading.value = true;
        try {
            boards.value = await fetchBoardsfromFirebase(); // Fetch boards from Firebase
        } catch (error) {
            console.error("Failed to fetch boards: ", error);
        } finally {
            isLoading.value = false; 
        }
    };

    const createBoard = async (boardData) => {
        try {
            // Add the board using the addBoard utility
            const boardId = await addBoardToFirebase(boardData);
            // After successfully adding the board, push it to the reactive boards array
            boards.value.push({ id: boardId, ...boardData }); 
        } catch (error) {
            console.error("Error creating board: ", error);
        }
    };


    //to fetch a specific board
    const fetchBoard = async (boardId) => {
        try {
            const board = await fetchBoardFromFirebase(boardId); // Fetch a specific board from Firebase
            return board;
        } catch (error) {
            console.error("Failed to fetch board: ", error);
            throw error; // Re-throw for handling in the component if needed
        }
    };

    return {
        boards,
        isLoading,
        currentBoard,
        getBoards,
        createBoard,
        fetchBoard
    };
};

export default useBoardStore;
