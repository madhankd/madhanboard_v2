import { db } from "../firebaseConfig"; // Import your Firebase configuration
import {
  collection,
  getDoc,
  getDocs,
  where,
  orderBy,
  query,
  addDoc,
  doc,
  deleteDoc,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";
import { Board, BoardList, ListItem } from "../interfaces/interfaces"; // Adjust the import path based on your file structure
import { defaultBoardLists } from "../interfaces/defaultData";

// Fetch all boards function
export const fetchBoards = async () => {
  try {
    // Create a query to fetch and sort by created_at
    const boardsQuery = query(
      collection(db, "boards"),
      orderBy("created_at", "desc") // Change 'desc' to 'asc' for ascending order
    );

    const querySnapshot = await getDocs(boardsQuery); // Execute the query
    const boards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return boards;
  } catch (error) {
    console.error("Error retrieving boards: ", error);
    throw error; // Re-throw for handling in the component if needed
  }
};

export const addBoard = async (board: Board): Promise<string> => {
  try {
    // 1. Add the main board document
    const boardRef = await addDoc(collection(db, "boards"), {
      name: board.name,
      description: board.description,
      created_at: new Date().toISOString(), // Save the current timestamp
    });

   

    // 2. Add default boardLists (auto-generated data)
    for (const list of defaultBoardLists) {
      const listRef = await addDoc(collection(db, `boards/${boardRef.id}/boardLists`), {
        title: list.title, // Default list title (e.g., "To-Do")
        created_at: new Date().toISOString()
      });

      console.log(`List "${list.title}" added with ID: ${listRef.id}`);

      // Add default items for each list
      for (const item of list.items) {
        await addDoc(collection(db, `boards/${boardRef.id}/boardLists/${listRef.id}/items`), {
          title: item.title, // Default item title
          description: item.description || null, // Default item description,
          created_at: new Date().toISOString(), // Save the current timestamp
        });
        console.log(`Item "${item.title}" added to list "${list.title}"`);
      }
    }
    return boardRef.id;
  } catch (error) {
    console.error("Error adding board:", error);
    throw error; // Re-throw for handling in the UI
  }
};

// Delete a board from Firestore
export const deleteBoard = async (boardId) => {
  try {
    await deleteDoc(doc(db, "boards", boardId));
    console.log(`Board with ID ${boardId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error; // Re-throw for handling in the component if needed
  }
};

export const fetchBoard = async (boardId) => {
  try {
    // Fetch the main board document
    const boardRef = doc(db, "boards", boardId);
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      console.error(`No board found with ID: ${boardId}`);
      return null;
    }

    // Retrieve board metadata (name, description, created_at, etc.)
    const boardData = boardSnap.data() as Board;

    // If 'boardList' is stored inline in the board document
    if (boardData.boardList) {
      return {
        id: boardSnap.id,
        ...boardData,
      };
    }

    // If 'boardLists' are subcollections, fetch them
    const boardListsRef = collection(db, `boards/${boardId}/boardLists`);
    const listsSnapshot = await getDocs(
      query(boardListsRef, orderBy("title", "asc"))
    );

    const boardLists: BoardList[] = [];

    for (const listDoc of listsSnapshot.docs) {
      const listData = listDoc.data() as BoardList;

      // Check for 'items' subcollection under each list
      const itemsRef = collection(
        db,
        `boards/${boardId}/boardLists/${listDoc.id}/items`
      );
      const itemsSnapshot = await getDocs(itemsRef);
      const items: ListItem[] = itemsSnapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...itemDoc.data(),
      })) as ListItem[];

      // Add items to each list
      boardLists.push({
        id: listDoc.id,
        ...listData,
        items,
      });
    }
    
    // Return the complete board, including its lists and items
    return {
      id: boardSnap.id,
      ...boardData,
      boardList: boardLists, // Attach the list with their items
    };
  } catch (error) {
    console.error("Error retrieving board:", error);
    throw error;
  }
 
};


  //create the firebase function to add an item to a bordlist given listId and itemData
  export const addItemToBoardList = async (boardId,listId, itemName) => {
    try {
      const curItem: ListItem = {
        title: itemName,
        created_at: new Date().toISOString(), // Save the current timestamp,
      }
      const itemRef = await addDoc(collection(db, `boards/${boardId}/boardLists/${listId}/items`), {
       ...curItem,
      });
      console.log(`Item added with ID: ${itemRef.id}`);
      return itemRef.id;
    } catch (error) {
      console.error("Error adding item to board list:", error);
      throw error;
    }
  };


  //create the firebase function to delete an item from a boardlist given listId and itemId
  export const deleteItemFromBoardList = async (boardId, listId, itemId) => {
    try {
      await deleteDoc(doc(db, `boards/${boardId}/boardLists/${listId}/items`, itemId));
      console.log(`Item with ID ${itemId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting item from board list:", error);
      throw error;
    }
  };
