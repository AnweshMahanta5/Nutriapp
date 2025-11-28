import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import IngredientChecker from './pages/IngredientChecker'
import Database from './pages/Database'
import DietPlanner from './pages/DietPlanner'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import {AuthProvider} from './context/AuthContext'
import {ThemeProvider} from './context/ThemeContext'

export default function App(){
 return(
  <ThemeProvider>
   <AuthProvider>
    <BrowserRouter>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      <Route path='/ingredient-checker' element={<ProtectedRoute><IngredientChecker/></ProtectedRoute>}/>
      <Route path='/database' element={<ProtectedRoute><Database/></ProtectedRoute>}/>
      <Route path='/diet-planner' element={<ProtectedRoute><DietPlanner/></ProtectedRoute>}/>
      <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
     </Routes>
    </BrowserRouter>
   </AuthProvider>
  </ThemeProvider>
 )
}
