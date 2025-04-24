import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import type { User, Article, PoliticalLeaning, Topic, WordCount } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyACY14_pxfI24K3sj84O2pH0o4R7g2o4ok",
  authDomain: "my-news-app-64304.firebaseapp.com",
  projectId: "my-news-app-64304",
  storageBucket: "my-news-app-64304.appspot.com",
  messagingSenderId: "153518551285",
  appId: "1:153518551285:web:your_app_id_here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email: string, password: string, displayName: string, isAdmin: boolean = false) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      politicalLeaning: 'unspecified',
      savedArticles: [],
      likedArticles: [],
      surveyCompleted: false,
      isAdmin,
      createdAt: new Date()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data functions
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateUserPoliticalLeaning = async (userId: string, politicalLeaning: PoliticalLeaning) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      politicalLeaning,
      surveyCompleted: true
    });
  } catch (error) {
    throw error;
  }
};

// Article functions
export const createArticle = async (articleData: Omit<Article, 'id' | 'status' | 'likes' | 'shares'>) => {
  try {
    const articlesRef = collection(db, 'articles');
    const newArticleRef = doc(articlesRef);
    
    await setDoc(newArticleRef, {
      ...articleData,
      status: 'approved', // Since this is created by admin, it's automatically approved
      likes: 0,
      shares: 0
    });
    
    return newArticleRef.id;
  } catch (error) {
    throw error;
  }
};

export const getArticles = async (
  topicFilter?: Topic[], 
  wordCountFilter?: WordCount[], 
  politicalLeaning?: PoliticalLeaning,
  limitCount = 10
): Promise<Article[]> => {
  try {
    let articlesQuery = collection(db, 'articles');
    let constraints = [];
    
    // Only show approved articles
    constraints.push(where('status', '==', 'approved'));
    
    if (topicFilter && topicFilter.length > 0) {
      constraints.push(where('topics', 'array-contains-any', topicFilter));
    }
    
    if (wordCountFilter && wordCountFilter.length > 0) {
      constraints.push(where('wordCount', 'in', wordCountFilter));
    }
    
    if (politicalLeaning && politicalLeaning !== 'unspecified') {
      constraints.push(where('politicalLeaning', '==', politicalLeaning));
    }
    
    constraints.push(orderBy('publishedDate', 'desc'));
    constraints.push(limit(limitCount));
    
    const q = query(articlesQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishedDate: doc.data().publishedDate.toDate()
    } as Article));
  } catch (error) {
    throw error;
  }
};

export const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    const articleDoc = await getDoc(doc(db, 'articles', articleId));
    if (articleDoc.exists()) {
      return {
        id: articleDoc.id,
        ...articleDoc.data(),
        publishedDate: articleDoc.data().publishedDate.toDate()
      } as Article;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const submitPublicArticle = async (article: Omit<Article, 'id'>) => {
  try {
    const articlesRef = collection(db, 'articles');
    const newArticleRef = doc(articlesRef);
    await setDoc(newArticleRef, {
      ...article,
      status: 'pending',
      publishedDate: new Date(),
      likes: 0,
      shares: 0
    });
    return newArticleRef.id;
  } catch (error) {
    throw error;
  }
};

export const approveArticle = async (articleId: string) => {
  try {
    await updateDoc(doc(db, 'articles', articleId), {
      status: 'approved'
    });
  } catch (error) {
    throw error;
  }
};

export const rejectArticle = async (articleId: string) => {
  try {
    await updateDoc(doc(db, 'articles', articleId), {
      status: 'rejected'
    });
  } catch (error) {
    throw error;
  }
};

export const likeArticle = async (userId: string, articleId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      likedArticles: arrayUnion(articleId)
    });
    
    await updateDoc(doc(db, 'articles', articleId), {
      likes: increment(1)
    });
  } catch (error) {
    throw error;
  }
};

export const unlikeArticle = async (userId: string, articleId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      likedArticles: arrayRemove(articleId)
    });
    
    await updateDoc(doc(db, 'articles', articleId), {
      likes: increment(-1)
    });
  } catch (error) {
    throw error;
  }
};

export const saveArticle = async (userId: string, articleId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      savedArticles: arrayUnion(articleId)
    });
  } catch (error) {
    throw error;
  }
};

export const unsaveArticle = async (userId: string, articleId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      savedArticles: arrayRemove(articleId)
    });
  } catch (error) {
    throw error;
  }
};

export const shareArticle = async (articleId: string) => {
  try {
    await updateDoc(doc(db, 'articles', articleId), {
      shares: increment(1)
    });
  } catch (error) {
    throw error;
  }
};