import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, getDocs, serverTimestamp, limit, } from 'firebase/firestore';
import { db } from '@/lib/firebase';
const WEBHOOK_RECIBO = 'https://kitty.n8n.ipnet.cloud/webhook/disparo-recibo-maquiagem';
const WEBHOOK_MAQUIADOR = 'https://kitty.n8n.ipnet.cloud/webhook/maquiador-trigger';
async function postWebhookRecibo(payload) {
    try {
        await fetch(WEBHOOK_RECIBO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        console.warn('Webhook recibo failed:', e);
    }
}
async function postWebhookMaquiador(payload) {
    try {
        await fetch(WEBHOOK_MAQUIADOR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        console.warn('Webhook maquiador failed:', e);
    }
}
export async function createOrder(clientName, whatsapp, selections) {
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
}
export async function completeOrder(orderId) {
    await updateDoc(doc(db, 'orders', orderId), { status: 'finalizado' });
    const nextQuery = query(collection(db, 'orders'), where('status', '==', 'aguardando'), orderBy('queuePosition'), limit(1));
    const next = await getDocs(nextQuery);
    if (!next.empty) {
        const nextOrder = { id: next.docs[0].id, ...next.docs[0].data() };
        await postWebhookMaquiador({
            whatsapp: nextOrder.whatsapp,
            clientName: nextOrder.clientName,
            selections: nextOrder.selections,
        });
    }
}
