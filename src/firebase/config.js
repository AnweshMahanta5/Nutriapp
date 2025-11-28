import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'

const firebaseConfig={
 apiKey:"AIzaSyCZmf5hony8KUNCYp4QiFqr5b0dfUI39WE",
 authDomain:"ingredient-analyzer-7a5f9.firebaseapp.com",
 projectId:"ingredient-analyzer-7a5f9",
 storageBucket:"ingredient-analyzer-7a5f9.firebasestorage.app",
 messagingSenderId:"674001671866",
 appId:"1:674001671866:web:8e40a14b5c39665392d483",
 measurementId:"G-1NMG33KHZ3"
}

const app=initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const db=getFirestore(app)
