import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  getDocs,
  query,
  limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { TrackingItem, OrderRequest, PartnerLead } from './types';
import { INITIAL_SAMPLE_TRACKS, INITIAL_REQUESTS, INITIAL_PARTNERS } from './data/logisticData';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Use provisioned Firestore Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const isFirebaseReady = Boolean(firebaseConfig.projectId);

/**
 * Fetch a single shipment by Resi from Firestore
 */
export async function getShipmentFromDb(resi: string): Promise<TrackingItem | null> {
  try {
    const cleanResi = resi.trim().toUpperCase();
    const docRef = doc(db, 'shipments', cleanResi);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TrackingItem;
    }
    return null;
  } catch (err) {
    console.warn('Firestore fetch shipment error:', err);
    return null;
  }
}

/**
 * Save or update a shipment in Firestore
 */
export async function saveShipmentToDb(resi: string, trackData: TrackingItem): Promise<boolean> {
  try {
    const cleanResi = resi.trim().toUpperCase();
    const docRef = doc(db, 'shipments', cleanResi);
    await setDoc(docRef, {
      ...trackData,
      no: cleanResi,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore save shipment error:', err);
    return false;
  }
}

/**
 * Listen to all shipments in real-time
 */
export function subscribeShipments(callback: (shipments: Record<string, TrackingItem>) => void) {
  try {
    const colRef = collection(db, 'shipments');
    return onSnapshot(colRef, (snapshot) => {
      const results: Record<string, TrackingItem> = {};
      snapshot.forEach((docSnap) => {
        results[docSnap.id] = docSnap.data() as TrackingItem;
      });
      callback(results);
    }, (err) => {
      console.warn('Firestore shipments subscription error:', err);
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
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, order, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore save order error:', err);
    return false;
  }
}

/**
 * Listen to order requests in real-time
 */
export function subscribeOrders(callback: (orders: OrderRequest[]) => void) {
  try {
    const colRef = collection(db, 'orders');
    return onSnapshot(colRef, (snapshot) => {
      const list: OrderRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as OrderRequest);
      });
      callback(list);
    }, (err) => {
      console.warn('Firestore orders subscription error:', err);
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
  try {
    const docRef = doc(db, 'partners', partner.id);
    await setDoc(docRef, partner, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore save partner error:', err);
    return false;
  }
}

/**
 * Listen to partner leads in real-time
 */
export function subscribePartners(callback: (partners: PartnerLead[]) => void) {
  try {
    const colRef = collection(db, 'partners');
    return onSnapshot(colRef, (snapshot) => {
      const list: PartnerLead[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PartnerLead);
      });
      callback(list);
    }, (err) => {
      console.warn('Firestore partners subscription error:', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to partners:', err);
    return () => {};
  }
}

/**
 * Auto-seed initial sample data into Cloud Firestore if collections are empty
 */
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const shipmentsCol = collection(db, 'shipments');
    const qShip = query(shipmentsCol, limit(1));
    const snapShip = await getDocs(qShip);

    if (snapShip.empty) {
      console.log('Seeding initial shipments into Firestore...');
      for (const [resi, data] of Object.entries(INITIAL_SAMPLE_TRACKS)) {
        await setDoc(doc(db, 'shipments', resi), {
          ...data,
          no: resi,
          updatedAt: new Date().toISOString()
        });
      }
    }

    const ordersCol = collection(db, 'orders');
    const qOrders = query(ordersCol, limit(1));
    const snapOrders = await getDocs(qOrders);

    if (snapOrders.empty) {
      console.log('Seeding initial orders into Firestore...');
      for (const order of INITIAL_REQUESTS) {
        await setDoc(doc(db, 'orders', order.id), order);
      }
    }

    const partnersCol = collection(db, 'partners');
    const qPartners = query(partnersCol, limit(1));
    const snapPartners = await getDocs(qPartners);

    if (snapPartners.empty) {
      console.log('Seeding initial partners into Firestore...');
      for (const p of INITIAL_PARTNERS) {
        await setDoc(doc(db, 'partners', p.id), p);
      }
    }
  } catch (err) {
    console.warn('Firestore auto-seed check skipped or encountered error:', err);
  }
}
