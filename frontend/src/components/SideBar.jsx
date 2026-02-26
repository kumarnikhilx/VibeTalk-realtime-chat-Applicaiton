import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dp from "../assets/dp.webp"
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import { serverUrl } from '../main';
import axios from 'axios';
import { setOtherUsers, setSearchData, setSelectedUser, setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { HiDotsVertical } from 'react-icons/hi';
import { MdDonutLarge, MdMessage } from 'react-icons/md';

function SideBar() {
    let {userData,otherUsers,selectedUser,onlineUsers,searchData} = useSelector(state=>state.user)
    let [search,setSearch]=useState(false)
    let [input,setInput]=useState("")
    let dispatch=useDispatch()
    let navigate=useNavigate()
    
    const handleLogOut=async ()=>{
        try {
            let result =await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
            dispatch(setUserData(null))
            dispatch(setOtherUsers(null))
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const handlesearch=async ()=>{
        try {
            let result =await axios.get(`${serverUrl}/api/user/search?query=${input}`,{withCredentials:true})
            dispatch(setSearchData(result.data))
        }
        catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        if(input){
            handlesearch()
        }
    },[input])

  return (
    <div className={`lg:w-[30%] h-full flex flex-col border-r border-[#e1e6ed] bg-white relative transition-all duration-300 ease-in-out ${!selectedUser ? "w-full flex" : "w-0 overflow-hidden lg:w-[30%] lg:flex"}`}>
        
        {/* Header - Current User Menu */}
        <div className='w-full h-[60px] bg-[#f0f2f5] flex justify-between items-center px-4 shrink-0'>
            <div className='w-10 h-10 rounded-full overflow-hidden cursor-pointer' onClick={()=>navigate("/profile")}>
                <img src={userData?.image || dp} alt="Profile" className='w-full h-full object-cover'/>
            </div>
            <div className='flex gap-4 text-[#54656f]'>
                <MdDonutLarge className='w-6 h-6 cursor-pointer' title="Status"/>
                <MdMessage className='w-6 h-6 cursor-pointer' title="New Chat"/>
                <div onClick={handleLogOut} className="cursor-pointer" title="Log out">
                    <BiLogOutCircle className='w-6 h-6'/>
                </div>
            </div>
        </div>

        {/* Search Bar */}
        <div className='w-full bg-white p-2 border-b border-[#e1e6ed]'>
            <div className='w-full h-[35px] bg-[#f0f2f5] rounded-lg flex items-center px-3 gap-3'>
                {input.length > 0 ? (
                    <RxCross2 className='w-5 h-5 text-[#54656f] cursor-pointer shrink-0' onClick={()=>{ setInput(""); setSearch(false); }}/>
                ) : (
                    <IoIosSearch className='w-5 h-5 text-[#54656f] shrink-0'/>
                )}
                <input 
                    type="text" 
                    placeholder='Search or start new chat' 
                    className='w-full h-full bg-transparent outline-none text-[15px] text-[#3b4a54] placeholder:text-[#667781]' 
                    onChange={(e)=>setInput(e.target.value)} 
                    value={input}
                />
            </div>
        </div>

        {/* Chat List */}
        <div className='w-full flex-1 overflow-y-auto bg-white flex flex-col'>
            {/* Search Results */}
            {input.length>0 ? (
                searchData?.map((user) => (
                    <div key={user._id} className='w-full h-[72px] flex items-center px-3 hover:bg-[#f5f6f6] cursor-pointer' onClick={()=>{
                        dispatch(setSelectedUser(user))
                        setInput("")
                        setSearch(false)
                    }}>
                        <div className='relative w-[50px] h-[50px] shrink-0 rounded-full overflow-hidden'>
                            <img src={user.image || dp} alt="" className='w-full h-full object-cover'/>
                        </div>
                        <div className='ml-4 flex-1 h-full flex flex-col justify-center border-b border-[#f2f2f2] pr-4'>
                            <div className='flex justify-between items-center'>
                                <h1 className='text-[#111b21] text-[17px]'>{user.name || user.userName}</h1>
                                {onlineUsers?.includes(user._id) && <span className='text-[12px] text-[#25D366]'>Online</span>}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                /* Regular Chat List */
                otherUsers?.map((user) => (
                    <div key={user._id} className={`w-full h-[72px] flex items-center pl-3 cursor-pointer ${selectedUser?._id === user._id ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`} onClick={()=>dispatch(setSelectedUser(user))}>
                        <div className='relative shrink-0'>
                            <div className='w-[49px] h-[49px] rounded-full overflow-hidden'>
                                <img src={user.image || dp} alt="" className='w-full h-full object-cover'/>
                            </div>
                            {onlineUsers?.includes(user._id) &&
                                <span className='w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 border-2 border-white bg-cyan-500'></span>
                            }
                        </div>
                        <div className='ml-4 flex-1 h-full flex flex-col justify-center pr-4 border-b border-[#f2f2f2]'>
                            <div className='flex justify-between items-baseline mb-1'>
                                <h1 className='text-[#111b21] text-[17px] truncate max-w-[70%]'>{user.name || user.userName}</h1>
                            </div>
                            <div className='flex justify-between items-center w-full'>
                                <span className='text-[#667781] text-[14px] truncate flex-1 pr-2'>
                                    {user.latestMessage ? (user.latestMessage.message || "Photo") : "Tap to chat"}
                                </span>
                                {user.unreadCount > 0 && (
                                    <span className='bg-cyan-500 text-white text-[12px] font-bold px-[6px] py-[2px] rounded-full min-w-[20px] text-center'>
                                        {user.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  )
}

export default SideBar