import { collection, addDoc, updateDoc, getDoc, doc, query, where, orderBy, onSnapshot, getDocs, serverTimestamp, } from 'firebase/firestore';
import { db } from '@/lib/firebase';
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
export async function createOrder(clientName, selections) {
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
export function subscribeToOrder(orderId, callback) {
    return onSnapshot(doc(db, 'orders', orderId), (snap) => {
        if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() });
        }
    });
}
export function subscribeToQueue(callback) {
    const q = query(collection(db, 'orders'), where('status', '!=', 'finalizado'), orderBy('status'), orderBy('createdAt'));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}
export async function startOrder(orderId) {
    await updateDoc(doc(db, 'orders', orderId), { status: 'em-atendimento' });
    if (WEBHOOK_URL) {
        const snap = await getDoc(doc(db, 'orders', orderId));
        const order = { id: orderId, ...snap.data() };
        await postWebhook({ event: 'order_started', order });
    }
}
export async function completeOrder(orderId) {
    const snap = await getDoc(doc(db, 'orders', orderId));
    const order = { id: orderId, ...snap.data() };
    await updateDoc(doc(db, 'orders', orderId), { status: 'finalizado' });
    if (WEBHOOK_URL) {
        await postWebhook({ event: 'order_completed', order });
    }
}
async function postWebhook(payload) {
    if (!WEBHOOK_URL)
        return;
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        console.warn('Webhook POST failed:', e);
    }
}
