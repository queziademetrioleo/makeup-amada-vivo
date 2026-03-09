import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SelectionStep, StepSelection } from '@/store/useOrderStore';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL as string | undefined;

export interface Order {
  id: string;
  clientName: string;
  status: 'aguardando' | 'em-atendimento' | 'finalizado';
  selections: Partial<Record<SelectionStep, StepSelection>>;
  createdAt: ReturnType<typeof serverTimestamp>;
  queuePosition: number;
}

export async function createOrder(
  clientName: string,
  selections: Partial<Record<SelectionStep, StepSelection>>,
): Promise<{ orderId: string; queuePosition: number }> {
  const q = query(collection(db, 'orders'), where('status', '!=', 'finalizado'));
  const snap = await getDocs(q);
  const position = snap.size + 1;

  const ref = await addDoc(collection(db, 'orders'), {
    clientName,
    status: 'aguardando',
    selections,
    createdAt: serverTimestamp(),
    queuePosition: position,
  });

  return { orderId: ref.id, queuePosition: position };
}

export function subscribeToOrder(
  orderId: string,
  callback: (order: Order) => void,
): () => void {
  return onSnapshot(doc(db, 'orders', orderId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Order);
    }
  });
}

export function subscribeToQueue(callback: (orders: Order[]) => void): () => void {
  const q = query(
    collection(db, 'orders'),
    where('status', '!=', 'finalizado'),
    orderBy('status'),
    orderBy('createdAt'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
  });
}

export async function startOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status: 'em-atendimento' });
  if (WEBHOOK_URL) {
    const snap = await getDoc(doc(db, 'orders', orderId));
    const order = { id: orderId, ...snap.data() } as Order;
    await postWebhook({ event: 'order_started', order });
  }
}

export async function completeOrder(orderId: string): Promise<void> {
  const snap = await getDoc(doc(db, 'orders', orderId));
  const order = { id: orderId, ...snap.data() } as Order;
  await updateDoc(doc(db, 'orders', orderId), { status: 'finalizado' });
  if (WEBHOOK_URL) {
    await postWebhook({ event: 'order_completed', order });
  }
}

async function postWebhook(payload: object): Promise<void> {
  if (!WEBHOOK_URL) return;
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('Webhook POST failed:', e);
  }
}
