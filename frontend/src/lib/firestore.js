import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp, } from 'firebase/firestore';
import { db } from './firebase';
export async function saveLook(input) {
    return addDoc(collection(db, 'looks'), {
        ...input,
        createdAt: serverTimestamp(),
    });
}
export async function getUserLooks(userId) {
    const q = query(collection(db, 'looks'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function deleteLook(lookId) {
    return deleteDoc(doc(db, 'looks', lookId));
}
// ── Presets (community / curated) ────────────────────────────────────────────
export async function getPublicPresets() {
    const snap = await getDocs(collection(db, 'presets'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
