import {NavLink} from 'react-router-dom'
export default function Sidebar(){
 const link='px-3 py-2 rounded-xl block hover:bg-emerald-400/20'
 return(
 <div className='hidden md:block fixed left-0 top-0 h-screen w-60 bg-white/10 backdrop-blur-2xl p-4 border-r border-white/10'>
  <h2 className='text-lg font-semibold mb-4'>Menu</h2>
  <NavLink to='/dashboard' className={link}>Dashboard</NavLink>
  <NavLink to='/ingredient-checker' className={link}>Ingredient Checker</NavLink>
  <NavLink to='/database' className={link}>Food Database</NavLink>
  <NavLink to='/diet-planner' className={link}>Diet Planner</NavLink>
  <NavLink to='/profile' className={link}>Profile</NavLink>
 </div>
)
}
