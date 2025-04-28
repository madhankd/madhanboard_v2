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
  runTransaction,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { Board, BoardList, ListItem } from "../interfaces/interfaces"; // Adjust the import path based on your file structure
import { defaultBoardLists } from "../interfaces/defaultData";

/**
 * Fetches a list of boards from Firestore.
 * 
 * This function performs the following operations:
 * 1. Creates a query to fetch boards, sorted by creation date in descending order.
 * 2. Executes the query and retrieves the board documents.
 * 3. Maps the retrieved documents to an array of board objects.
 * 
 * @returns {Promise<Array<Board>>} A promise that resolves with an array of board objects.
 *          Each board object contains an id and all other fields from the Firestore document.
 * @throws {Error} If there's an issue fetching the boards from Firestore.
 */

export const fetchBoards = async () => {
  try {
    // Create a query to fetch and sort by created_at
    const boardsQuery = query(
      collection(db, "boards"),
      orderBy("created_at", "desc") // latest will be at the top
    );
    const querySnapshot = await getDocs(boardsQuery); // Execute the query
    const boards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return boards;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to add item. Please check the console for more details.");
  }
};

// Ceate a board on firestore
export const addBoard = async (board: Board): Promise<string> => {
  try {
    // 1. Add the main board document
    const boardRef = await addDoc(collection(db, "boards"), {
      name: board.name,
      description: board.description,
      created_at: new Date().toISOString(), // Save the current timestamp
    });

    for (let listIndex = 0; listIndex < defaultBoardLists.length; listIndex++) {
      const list = defaultBoardLists[listIndex];
      const listRef = await addDoc(
        collection(db, `boards/${boardRef.id}/boardLists`),
        {
          title: list.title,
          created_at: new Date().toISOString(),
          order: listIndex, // Use the index as the order for lists
        }
      );

      // Add default items for each list
      for (let itemIndex = 0; itemIndex < list.items.length; itemIndex++) {
        const item = list.items[itemIndex];
        await addDoc(
          collection(
            db,
            `boards/${boardRef.id}/boardLists/${listRef.id}/items`
          ),
          {
            title: item.title,
            description: item.description || null,
            created_at: new Date().toISOString(),
            order: itemIndex, // Use the index as the order for items
          }
        );
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

export const fetchBoard = async (boardId: string) => {
  try {
    const boardRef = doc(db, "boards", boardId);
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      console.error(`No board found with ID: ${boardId}`);
      return null;
    }
    const boardData = boardSnap.data() as Board;
    // Fetch all lists for this board in a single query
    const listsQuery = query(
      collection(db, `boards/${boardId}/boardLists`),
      orderBy("order", "asc")
    );
    const listsSnapshot = await getDocs(listsQuery);
    const boardLists: BoardList[] = [];
    for (const listDoc of listsSnapshot.docs) {
      const listData = listDoc.data() as BoardList;
      // Fetch items for each list
      const itemsQuery = query(
        collection(db, `boards/${boardId}/boardLists/${listDoc.id}/items`),
        orderBy("created_at", "asc")
      );
      const itemsSnapshot = await getDocs(itemsQuery);

      const items: ListItem[] = itemsSnapshot.docs.map(itemDoc => ({
        id: itemDoc.id,
        ...itemDoc.data() as ListItem
      }));

      boardLists.push({
        id: listDoc.id,
        ...listData,
        items: items
      });
    }

    return {
      id: boardSnap.id,
      ...boardData,
      boardList: boardLists,
    };
  } catch (error) {
    console.error("Error retrieving board:", error);
    throw error;
  }
};


//create the firebase function to add an item to a bordlist given listId and itemData
export const addItemToBoardList = async (boardId, listId, itemName) => {
  const itemRef = doc(collection(db, `boards/${boardId}/boardLists/${listId}/items`));
  
  try {
    await runTransaction(db, async (transaction) => {
      const curItem: ListItem = {
        title: itemName,
        created_at: new Date().toISOString(),
      };
      
      transaction.set(itemRef, curItem);
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
    await deleteDoc(
      doc(db, `boards/${boardId}/boardLists/${listId}/items`, itemId)
    );
    console.log(`Item with ID ${itemId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting item from board list:", error);
    throw error;
  }
};

export const addNewListToBoard = async (boardId, listTitle) => {
  try {
    // First, get the current count of lists to determine the new order
    const listsRef = collection(db, `boards/${boardId}/boardLists`);
    const listsSnapshot = await getDocs(listsRef);
    const newOrder = listsSnapshot.size; // New list will be added at the end

    // Now add the new list with the order field
    const newListRef = await addDoc(listsRef, {
      title: listTitle,
      created_at: new Date().toISOString(),
      order: newOrder, // Add this line,
      items:[]
    });

    console.log(`New list "${listTitle}" added with ID: ${newListRef.id} and order: ${newOrder}`);
    return newListRef.id;
  } catch (error) {
    console.error("Error adding new list to board:", error);
    throw error;
  }
};

export const deleteListFromBoard = async (boardId, listId) => {
  try {
    // Delete the list document
    await deleteDoc(doc(db, `boards/${boardId}/boardLists`, listId));

    // Delete all items in the list
    const itemsRef = collection(db, `boards/${boardId}/boardLists/${listId}/items`);
    const itemsSnapshot = await getDocs(itemsRef);
    const deletePromises = itemsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(`List with ID ${listId} and all its items deleted successfully.`);
  } catch (error) {
    console.error("Error deleting list from board:", error);
    throw error;
  }
};

export const updateListItem = async (boardId: string, listId: string, itemId: string, newTitle: string) => {
  try {
    const itemRef = doc(db, `boards/${boardId}/boardLists/${listId}/items`, itemId);
    await updateDoc(itemRef, {
      title: newTitle,
      updated_at: new Date().toISOString()
    });
    console.log(`Item ${itemId} updated successfully in list ${listId}`);
    return itemId;
  } catch (error) {
    console.error("Error updating item in board list:", error);
    throw error;
  }
};

export const updateListPosition = async (boardId: string, updatedLists: { id: string, order: number }[]) => {
  try {
    const batch = writeBatch(db);
    updatedLists.forEach((list) => {
      const listRef = doc(db, `boards/${boardId}/boardLists/${list.id}`);
      batch.update(listRef, { order: list.order });
    });
    await batch.commit();
    console.log("All list positions updated successfully");
  } catch (error) {
    console.error("Error updating list positions:", error);
    throw error;
  }
};



/****export const updateListPosition = async (boardId: string, listId: string, newPosition: number) => {
  try {
    // Fetch all lists for this board, ordered by the 'order' field
    const listsQuery = query(
      collection(db, `boards/${boardId}/boardLists`),
      orderBy("order", "asc")
    );
    const listsSnapshot = await getDocs(listsQuery);

    let boardLists = listsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Current board lists:", boardLists);

    // Find the current index of the list
    const currentIndex = boardLists.findIndex((list) => list.id === listId);
    
    if (currentIndex === -1) {
      throw new Error("List not found in board");
    }
    
    // Remove the list from its current position
    const [movedList] = boardLists.splice(currentIndex, 1);
    
    // Insert the list at the new position
    boardLists.splice(newPosition, 0, movedList);
    
    // Update the order of lists in Firestore
    const batch = writeBatch(db);
    boardLists.forEach((list, index) => {
      const listRef = doc(db, `boards/${boardId}/boardLists/${list.id}`);
      batch.update(listRef, { order: index });
    });
    await batch.commit();

    console.log(`List ${listId} moved to position ${newPosition}`);
    return boardLists; // Return the updated list order
  } catch (error) {
    console.error("Error updating list position:", error);
    throw error;
  }
};*****/

export const updateBoardList = async (boardId: string, listId: string, newTitle: string) => {
  try {
    const listRef = doc(db, `boards/${boardId}/boardLists`, listId);
    await updateDoc(listRef, {
      title: newTitle,
      updated_at: new Date().toISOString()
    });
    console.log(`BoardList ${listId} title updated successfully in board ${boardId}`);
    return listId;
  } catch (error) {
    console.error("Error updating BoardList title:", error);
    throw error;
  }
};