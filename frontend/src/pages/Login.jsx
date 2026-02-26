import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUser, setUserData } from '../redux/userSlice'

function Login() {
    let navigate=useNavigate()
    let [show,setShow]=useState(false)
    let [email,setEmail]=useState("")
    let [password,setPassword]=useState("")
    let [loading,setLoading]=useState(false)
    let [err,setErr]=useState("")
    let dispatch=useDispatch()
    
        const handleLogin=async (e)=>{
            e.preventDefault()
            setLoading(true)
            try {
                let result =await axios.post(`${serverUrl}/api/auth/login`,{
    email,password
                },{withCredentials:true})
               dispatch(setUserData(result.data))
               dispatch(setSelectedUser(null))
               navigate("/")
                setEmail("")
                setPassword("")
                setLoading(false)
                setErr("")
            } catch (error) {
                console.log(error)
                setLoading(false)
                setErr(error.response.data.message)
            }
        }
    
  return (
    <div className='w-full h-screen bg-[#e0f7fa] flex flex-col items-center pt-[10vh]'>
      <div className='w-full max-w-[450px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden'>
        <div className='w-full h-[150px] bg-cyan-500 flex items-center justify-center p-6'>
           <div className='text-center'>
             <h1 className='text-white font-bold text-[36px] tracking-wide'>VibeTalk</h1>
             <p className='text-cyan-100 text-[15px] mt-1'>Log in to your account</p>
           </div>
        </div>
        <div className='p-8'>
          <form className='w-full flex flex-col gap-5' onSubmit={handleLogin}>
            <div>
              <label className='block text-gray-700 text-sm font-bold mb-2'>Email Address</label>
              <input type="email" placeholder='Enter your email' className='w-full h-[48px] outline-none border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 bg-[#f9fafb] text-gray-800 text-[16px] transition-all' onChange={(e)=>setEmail(e.target.value)} value={email} required/>
            </div>
            <div>
              <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
              <div className='w-full h-[48px] border border-gray-300 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 rounded-lg bg-[#f9fafb] relative transition-all'>
                <input type={`${show?"text":"password"}`} placeholder='Enter your password' className='w-full h-full outline-none bg-transparent px-4 text-gray-800 text-[16px]' onChange={(e)=>setPassword(e.target.value)} value={password} required/>
                <span className='absolute top-1/2 -translate-y-1/2 right-4 text-[14px] text-cyan-600 font-semibold cursor-pointer hover:text-cyan-800 select-none' onClick={()=>setShow(prev=>!prev)}>{`${show?"HIDE":"SHOW"}`}</span>
              </div>
            </div>
            
            {err && <div className='bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-200'>{"* " + err}</div>}
            
            <button className='w-full h-[48px] bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-[18px] font-semibold mt-4 transition-colors shadow-md flex items-center justify-center' disabled={loading}>{loading?"Logging in...":"Log In"}</button>
            <div className='text-center mt-6'>
               <p className='text-gray-600 text-[15px]'>Don't have an account? <span className='text-cyan-600 font-semibold cursor-pointer hover:underline' onClick={()=>navigate("/signup")}>Sign up</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
