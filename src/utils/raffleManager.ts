import { doc, runTransaction, type Firestore } from 'firebase/firestore';

export const allocateTicketNumbers = async (db: Firestore, appId: string, quantity: number): Promise<number[]> => {
  if (quantity <= 0) {
    return [];
  }
  const cappedQuantity = Math.min(quantity, 1000);
  const metaRef = doc(db, `/artifacts/${appId}/public/data/raffles/meta`);
  return runTransaction(db, async (transaction) => {
    const metaSnap = await transaction.get(metaRef);
    let nextTicketNumber = 1;
    if (metaSnap.exists()) {
      const data = metaSnap.data() as { nextTicketNumber?: number };
      nextTicketNumber = Number(data.nextTicketNumber) || 1;
    }
    const assignedNumbers = Array.from({ length: cappedQuantity }, (_, index) => nextTicketNumber + index);
    const newNext = assignedNumbers[assignedNumbers.length - 1] + 1;
    transaction.set(metaRef, { nextTicketNumber: newNext }, { merge: true });
    return assignedNumbers;
  });
};
