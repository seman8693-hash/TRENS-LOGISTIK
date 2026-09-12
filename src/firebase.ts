import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  getDocs,
  query,
  limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { TrackingItem, OrderRequest, PartnerLead } from './types';
import { 
  DUMMY_RESI_LIST, 
  DUMMY_ORDER_LIST, 
  DUMMY_PARTNER_LIST 
} from './data/logisticData';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId (mandated by Firebase skill)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const isFirebaseReady = Boolean(firebaseConfig.projectId);

// Standard Operation Types for error tracing (mandated by Firebase skill)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on startup as mandated by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore running in offline/cache mode. Will automatically synchronize when online.');
    }
  }
}
testConnection();

/**
 * Fetch a single shipment by Resi from Firestore
 */
export async function getShipmentFromDb(resi: string): Promise<TrackingItem | null> {
  const cleanResi = resi.trim().toUpperCase();
  const docPath = `shipments/${cleanResi}`;
  try {
    const docRef = doc(db, 'shipments', cleanResi);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TrackingItem;
    }
    return null;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, docPath);
    }
    console.warn(`Firestore getShipment notice (${code || 'offline'}):`, err);
    return null;
  }
}

/**
 * Save or update a shipment in Firestore
 */
export async function saveShipmentToDb(resi: string, trackData: TrackingItem): Promise<boolean> {
  const cleanResi = resi.trim().toUpperCase();
  const docPath = `shipments/${cleanResi}`;
  try {
    const docRef = doc(db, 'shipments', cleanResi);
    await setDoc(docRef, {
      ...trackData,
      no: cleanResi,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
    console.error('Firestore save shipment error:', err);
    return false;
  }
}

/**
 * Delete a shipment from Firestore
 */
export async function deleteShipmentFromDb(resi: string): Promise<boolean> {
  const cleanResi = resi.trim().toUpperCase();
  const docPath = `shipments/${cleanResi}`;
  try {
    const docRef = doc(db, 'shipments', cleanResi);
    await deleteDoc(docRef);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
    console.warn('Firestore delete shipment notice:', err);
    return false;
  }
}

/**
 * Delete an order from Firestore
 */
export async function deleteOrderFromDb(orderId: string): Promise<boolean> {
  const docPath = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
    console.warn('Firestore delete order notice:', err);
    return false;
  }
}

/**
 * Delete a partner from Firestore
 */
export async function deletePartnerFromDb(partnerId: string): Promise<boolean> {
  const docPath = `partners/${partnerId}`;
  try {
    const docRef = doc(db, 'partners', partnerId);
    await deleteDoc(docRef);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
    console.warn('Firestore delete partner notice:', err);
    return false;
  }
}

/**
 * Listen to all shipments in real-time (filters out any dummy resi)
 */
export function subscribeShipments(callback: (shipments: Record<string, TrackingItem>) => void) {
  try {
    const colRef = collection(db, 'shipments');
    return onSnapshot(colRef, (snapshot) => {
      const results: Record<string, TrackingItem> = {};
      snapshot.forEach((docSnap) => {
        if (!DUMMY_RESI_LIST.includes(docSnap.id)) {
          results[docSnap.id] = docSnap.data() as TrackingItem;
        }
      });
      callback(results);
    }, (err) => {
      if (err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'shipments');
      }
      console.warn('Firestore shipments subscription notification (offline/retry):', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to shipments:', err);
    return () => {};
  }
}

/**
 * Save order to Firestore
 */
export async function saveOrderToDb(order: OrderRequest): Promise<boolean> {
  const docPath = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, order, { merge: true });
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
    console.error('Firestore save order error:', err);
    return false;
  }
}

/**
 * Get single order by ID from Firestore
 */
export async function getOrderFromDb(orderId: string): Promise<OrderRequest | null> {
  const cleanId = orderId.trim();
  const docPath = `orders/${cleanId}`;
  try {
    const docRef = doc(db, 'orders', cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as OrderRequest;
    }
    return null;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, docPath);
    }
    console.warn(`Firestore getOrder notice (${code || 'offline'}):`, err);
    return null;
  }
}

/**
 * Listen to order requests in real-time (filters out any dummy orders)
 */
export function subscribeOrders(callback: (orders: OrderRequest[]) => void) {
  try {
    const colRef = collection(db, 'orders');
    return onSnapshot(colRef, (snapshot) => {
      const list: OrderRequest[] = [];
      snapshot.forEach((docSnap) => {
        if (!DUMMY_ORDER_LIST.includes(docSnap.id)) {
          list.push(docSnap.data() as OrderRequest);
        }
      });
      callback(list);
    }, (err) => {
      if (err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
      console.warn('Firestore orders subscription notification (offline/retry):', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to orders:', err);
    return () => {};
  }
}

/**
 * Save partner lead to Firestore
 */
export async function savePartnerToDb(partner: PartnerLead): Promise<boolean> {
  const docPath = `partners/${partner.id}`;
  try {
    const docRef = doc(db, 'partners', partner.id);
    await setDoc(docRef, partner, { merge: true });
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
    console.error('Firestore save partner error:', err);
    return false;
  }
}

/**
 * Listen to partner leads in real-time (filters out any dummy partners)
 */
export function subscribePartners(callback: (partners: PartnerLead[]) => void) {
  try {
    const colRef = collection(db, 'partners');
    return onSnapshot(colRef, (snapshot) => {
      const list: PartnerLead[] = [];
      snapshot.forEach((docSnap) => {
        if (!DUMMY_PARTNER_LIST.includes(docSnap.id)) {
          list.push(docSnap.data() as PartnerLead);
        }
      });
      callback(list);
    }, (err) => {
      if (err.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'partners');
      }
      console.warn('Firestore partners subscription notification (offline/retry):', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to partners:', err);
    return () => {};
  }
}

/**
 * Purge and empty all dummy data from Cloud Firestore and local storage.
 * Leaves the database completely clean for real operations.
 */
export async function purgeAllDummyData(): Promise<void> {
  try {
    // Delete dummy shipments if existing in Firestore
    for (const resi of DUMMY_RESI_LIST) {
      try {
        await deleteDoc(doc(db, 'shipments', resi));
      } catch (e) {
        // ignore if not existing
      }
    }

    // Delete dummy orders if existing in Firestore
    for (const orderId of DUMMY_ORDER_LIST) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (e) {
        // ignore if not existing
      }
    }

    // Delete dummy partners if existing in Firestore
    for (const partnerId of DUMMY_PARTNER_LIST) {
      try {
        await deleteDoc(doc(db, 'partners', partnerId));
      } catch (e) {
        // ignore if not existing
      }
    }

    // Also clean up localStorage
    try {
      localStorage.removeItem('ln_tracks');
      localStorage.removeItem('trens_requests');
      localStorage.removeItem('trens_partners');
    } catch {
      // browser storage optional
    }
  } catch (err) {
    console.warn('Firestore purge dummy data notice:', err);
  }
}

export const seedInitialFirestoreData = purgeAllDummyData;
