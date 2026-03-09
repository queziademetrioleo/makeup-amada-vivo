import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SelectionStep, StepSelection } from '@/store/useOrderStore';

const WEBHOOK_RECIBO = 'https://kitty.n8n.ipnet.cloud/webhook/disparo-recibo-maquiagem';
const WEBHOOK_MAQUIADOR = 'https://kitty.n8n.ipnet.cloud/webhook/maquiador-trigger';

export interface Order {
  id: string;
  clientName: string;
  whatsapp: string;
  status: 'aguardando' | 'em-atendimento' | 'finalizado';
  selections: Partial<Record<SelectionStep, StepSelection>>;
  createdAt: ReturnType<typeof serverTimestamp>;
  queuePosition: number;
}

async function postWebhookRecibo(payload: object) {
  try {
    await fetch(WEBHOOK_RECIBO, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
  } catch (e) { console.warn('Webhook recibo failed:', e); }
}

async function postWebhookMaquiador(payload: object) {
  try {
    await fetch(WEBHOOK_MAQUIADOR, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
  } catch (e) { console.warn('Webhook maquiador failed:', e); }
}

export async function createOrder(
  clientName: string,
  whatsapp: string,
  selections: Partial<Record<SelectionStep, StepSelection>>,
): Promise<{ orderId: string; queuePosition: number }> {
  const q = query(collection(db, 'orders'), where('status', '!=', 'finalizado'));
  const snap = await getDocs(q);
  const position = snap.size + 1;

  const ref = await addDoc(collection(db, 'orders'), {
    clientName,
    whatsapp,
    status: 'aguardando',
    selections,
    createdAt: serverTimestamp(),
    queuePosition: position,
  });

  await postWebhookRecibo({ clientName, whatsapp, selections });

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
}

export async function completeOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status: 'finalizado' });

  const nextQuery = query(
    collection(db, 'orders'),
    where('status', '==', 'aguardando'),
    orderBy('queuePosition'),
    limit(1),
  );
  const next = await getDocs(nextQuery);
  if (!next.empty) {
    const nextOrder = { id: next.docs[0].id, ...next.docs[0].data() } as Order;
    await postWebhookMaquiador({
      whatsapp: nextOrder.whatsapp,
      clientName: nextOrder.clientName,
      selections: nextOrder.selections,
    });
  }
}
