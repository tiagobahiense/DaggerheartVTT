import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

const SESSION_ID = import.meta.env.VITE_SESSION_ID as string | undefined;

export async function resolveSessionDocId(): Promise<string | null> {
  if (SESSION_ID) {
    return SESSION_ID;
  }

  const snapshot = await getDocs(query(collection(db, 'sessoes'), limit(1)));
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const created = await addDoc(collection(db, 'sessoes'), {
    createdAt: serverTimestamp(),
    fear_data: { tokens: 0, last_event_id: null },
    player_groups: [],
  });
  return created.id;
}

export function subscribeSession(
  onData: (data: { id: string; [key: string]: unknown }) => void,
  onMissing?: () => void
): Unsubscribe {
  let unsubscribe: Unsubscribe = () => {};

  resolveSessionDocId().then((sessionId) => {
    if (!sessionId) {
      onMissing?.();
      return;
    }

    unsubscribe = onSnapshot(doc(db, 'sessoes', sessionId), (docSnap) => {
      if (docSnap.exists()) {
        onData({ id: docSnap.id, ...docSnap.data() });
      } else {
        onMissing?.();
      }
    });
  });

  return () => unsubscribe();
}

export const DEFAULT_SESSION_FIELDS = {
  fear_data: { tokens: 0, last_event_id: null },
  player_groups: [] as unknown[],
};
