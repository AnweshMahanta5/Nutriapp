import {createContext,useContext,useEffect,useState} from 'react'
import {auth} from '../firebase/config'
import { onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut } from 'firebase/auth'

const AuthContext=createContext()
export function AuthProvider({children}){
 const [user,setUser]=useState(null)
 const [loading,setLoading]=useState(true)

 useEffect(()=>{ 
  const unsub=onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)})
  return ()=>unsub()
 },[])

 const signup=(email,pw)=>createUserWithEmailAndPassword(auth,email,pw)
 const login=(email,pw)=>signInWithEmailAndPassword(auth,email,pw)
 const logout=()=>signOut(auth)

 return loading?null:<AuthContext.Provider value={{user,signup,login,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)
