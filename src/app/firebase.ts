import * as admin from 'firebase-admin';
import serviceAccount from '../config/serviceAccountKeyFirebase.json';

admin.initializeApp({
  credential: admin.credential.cert(<admin.ServiceAccount>serviceAccount),
  storageBucket: 'fullstack-coding-test-c8c51.appspot.com',
});
