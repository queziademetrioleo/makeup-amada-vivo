import { db } from '../config/firebase';
import type { FirebaseFirestore } from 'firebase-admin';

type DocumentData = FirebaseFirestore.DocumentData;

export async function createDocument(
  collection: string,
  data: DocumentData,
): Promise<string> {
  const ref = await db.collection(collection).add({
    ...data,
    createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getCollection(
  collection: string,
  filters?: { field: string; op: FirebaseFirestore.WhereFilterOp; value: unknown }[],
): Promise<(DocumentData & { id: string })[]> {
  let query: FirebaseFirestore.Query = db.collection(collection);
  if (filters) {
    for (const f of filters) {
      query = query.where(f.field, f.op, f.value);
    }
  }
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
