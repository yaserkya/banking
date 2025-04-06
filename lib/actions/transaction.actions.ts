import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

// Destructuring environment variables
const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

// Create Transaction function
export const createTransaction = async (transaction: CreateTransactionProps) => {
  try {
    const { database } = await createAdminClient();

    // Ensure senderBankId and receiverBankId are provided
    if (!transaction.senderBankId || !transaction.receiverBankId) {
      console.error('Sender or receiver bank ID is missing');
      return null;  // or return some default error response
    }

    // Create the new transaction document in the database
    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        channel: 'online',
        category: 'Transfer',
        ...transaction
      }
    );

    return parseStringify(newTransaction);  // Ensure proper serialization if needed
  } catch (error) {
    console.error("Error creating transaction:", error);
    return null;  // Or handle error as per your requirements
  }
}

// Get Transactions by Bank ID function
export const getTransactionsByBankId = async ({ bankId }: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    // Fetch sender transactions
    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('senderBankId', bankId)],
    );

    // Fetch receiver transactions
    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('receiverBankId', bankId)],
    );

    // Fallback to empty arrays if documents are undefined
    const senderDocs = senderTransactions.documents || [];
    const receiverDocs = receiverTransactions.documents || [];

    // Combine both sender and receiver transactions into a single object
    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderDocs,
        ...receiverDocs,
      ]
    };

    // Return the combined transactions, ensuring proper serialization if needed
    return parseStringify(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return null;  // Return null or default value in case of error
  }
}
