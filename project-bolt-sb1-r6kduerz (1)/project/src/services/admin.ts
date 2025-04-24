import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  type: "service_account",
  project_id: "my-news-app-64304",
  private_key_id: "ec01bd7142e32ce5b24021ab4ea001b1f1d80236",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC2lcEKRRYI6qgX\nRpzfG09MoTeQtxS9ffMjaryXte/+uceFgab6H22iYUzZotbsz293pCkudE3sqDc5\niUJYm9M4Qn1jRIKMGG7xYJ/uUfquOYdQjSB2Iwr10EOLV1v5Vcwa0b0p+AvJbOq2\nz9/SowPGRYAud0NWMuCz1S2qOoNBguTRI1an2iPMi8ths1WKdh9Q7mi3WwJYFebr\nfjkps46PCX/+rGeKv6Ew7ToGppG9vGkGErt+o+Sd3kOitoVrofgdg3cwWUDLLezd\njrqz6O4+prjW7nC/qW2Mi/vdbJXq2V+9jny9qWqq+1Mbgk7iW0z0i1jxjzOVP6PT\n49bT9UvvAgMBAAECggEASsGb7SmGMRZqxkTqG8sht71Wc9ESE9fKwhiEqRUb8057\na6U/Ca/ugoqWHZG3r/PqrrCvD88czKW/HradTIxYefN3RTqavOOQIRIvyTMVkVoK\nlieCP/xvE2A3F4koJjlDvUNc0R83LDyFCV6pRKPr+rUgG2ZHUra4G8lPzh/w99P+\n8P7p+K7wC7XnCeOEHbUZp7EdJ90lBqet+g2dJJBmYKAJJCEVorIRhpQ2+efTNGuT\n3t3t1fhj5+TQGV35OcZMIeKObz/iY+HvmQFfyY6RR/ySz5rapIXZV4OZz/0zFfwQ\n312PIuEXd+1LERWC+ys8mcR24pjRGSxmze41/y96iQKBgQDwjiLX9L1EE9pMvxoA\nvTogmDOwm2qtJOvNo+04CAYOMrMhf6KLVtzGGy6FFbT3emFatd6n59nKIOqRQibW\nF/rBHCTLsd0vKn6h44dxDnLzTTpWyE/TL9LEXLwQBzF9YmbY8zhs7UkVRR8ouZVW\n1pkxCG8ftPuFh3UN02EN29rGIwKBgQDCTsucvxsmUJ3aaqrUFrtz17gWY3OSpu57\n1dtybsdgMw+vlE1XoU8STJOd3JEx40aFock8Qtcs1O1wM993YjxQhkCzPijcMZBD\nOviKQVR8MT248M8KZ95j1V5vGUzlzfBZDwYKd5StzzfK4OxUP4+ffFLdg4XW7Oj4\n/a/Oq6uRxQKBgFKXKmVk9Np7ynaRIjdgwKVSPGUFZ0HdLEylXJvhPVsAkzoMHV2j\nzBcEXBt7UW+qh+RiDvktBDx+wqpuwPC+uOw2YnfBMISyHVotyWHKqTLZsA79pVKH\n1+BtSnBiV96Ju2//Sb80VORFoCYWWay/70bDc4u6UqUM1eaSTX85ncprAoGAMfzL\nbPvNJEJBGduvLvjaKKcqeLgFF4lSeRE/b2UIbbs1IdppO04IZZDFuSrxP4BUuDQy\n7QnVCXeNzfvKVZA0LBMduf8Xy+4ESwd0wTylW33ffyCUYvztvYk6ziIYIlakqoSu\n7SpuWXihxdOveM0RSdpWBx6649v243eALw8DCHECgYB25ioMLiSzhyVJ/w3XItIe\n0jQtViBAK2Sxqupxks5frNNeZ+iNgjoYA2KxKL/cOypm0ieYzx9EsjhiicdpGr19\n6x57btjDpqqmc98dEqTlU7SoMNJgZ8jKw8H3naxIcx/ur9oqtqZlnhvbIB/oVwFN\nVAaxYH6D3eADxyu6sB+1zQ==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@my-news-app-64304.iam.gserviceaccount.com",
  client_id: "103257829239276435329",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40my-news-app-64304.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const adminApp = initializeApp({
  credential: cert(serviceAccount)
});

export const adminDb = getFirestore(adminApp);

export const createAdminUser = async (email: string, password: string) => {
  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
      emailVerified: true,
    });

    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      isAdmin: true,
      createdAt: new Date()
    });

    return userRecord;
  } catch (error) {
    throw error;
  }
};