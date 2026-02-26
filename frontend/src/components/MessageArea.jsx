import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import dp from "../assets/dp.webp"
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice';
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { HiDotsVertical } from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../main';
import { setMessages } from '../redux/messageSlice';
import { updateUserLatestMessage, clearUnreadCount } from '../redux/userSlice';

function MessageArea() {
  let {selectedUser,userData,socket,onlineUsers}=useSelector(state=>state.user)
  let dispatch=useDispatch()
  let [showPicker,setShowPicker]=useState(false)
  let [input,setInput]=useState("")
  let [frontendImage,setFrontendImage]=useState(null)
  let [backendImage,setBackendImage]=useState(null)
  let image=useRef()
  let {messages}=useSelector(state=>state.message)
  let chatEndRef = useRef(null)

  const handleImage=(e)=>{
    let file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  // Generate a distinct light background color based on user ID
  const getBackgroundColor = (userId) => {
    if (!userId) return '#efeae2';
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 40%, 94%)`; // light pastel background
  }

  const handleSendMessage=async (e)=>{
    e.preventDefault()
    if(input.length==0 && backendImage==null){
      return 
    }
    try {
      let formData=new FormData()
      formData.append("message",input)
      if(backendImage){
        formData.append("image",backendImage)
      }
      let result=await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`,formData,{withCredentials:true})
      dispatch(setMessages([...messages,result.data]))
      // Dispatch immediately to update our own sidebar preview, marked as sender so unread count ignores it
      dispatch(updateUserLatestMessage({userId: selectedUser._id, latestMessage: result.data, isSender: true}))
      setInput("")
      setFrontendImage(null)
      setBackendImage(null)
    } catch (error) {
      console.log(error)
    }
  }

  const onEmojiClick =(emojiData)=>{
    setInput(prevInput=>prevInput+emojiData.emoji)
    setShowPicker(false)
  }

  useEffect(()=>{
    socket?.on("newMessage",(mess)=>{
      // Update sidebar latest message for whoever sent this
      dispatch(updateUserLatestMessage({userId: mess.sender, latestMessage: mess, isSender: false}))
      
      // Only append to chat if it's from the currently open user
      // If we're looking at them, we instantly mark as read
      if(selectedUser && selectedUser._id === mess.sender){
         dispatch(setMessages((prevMessages) => [...prevMessages, mess]))
         // Auto-read if we are currently looking at their chat
         axios.put(`${serverUrl}/api/message/markAsRead/${mess.sender}`, {}, {withCredentials:true}).catch(console.log)
      }
    })

    socket?.on("messagesRead", ({readerId, readMessageIds}) => {
      // If the person reading our messages is the one we are currently looking at
      if(selectedUser && selectedUser._id === readerId) {
         dispatch(setMessages((prevMessages) => 
            prevMessages.map(msg => 
               readMessageIds.includes(msg._id) ? {...msg, status: "read"} : msg
            )
         ))
      }
    })

    return ()=>{
      socket?.off("newMessage")
      socket?.off("messagesRead")
    }
  },[socket, selectedUser, dispatch])
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if(selectedUser) {
      // Mark messages as read when opening a user's chat
      dispatch(clearUnreadCount(selectedUser._id))
      axios.put(`${serverUrl}/api/message/markAsRead/${selectedUser._id}`, {}, {withCredentials:true}).catch(console.log)
    }
  }, [selectedUser, dispatch])

  return (
    <div 
      className={`lg:w-[70%] lg:static absolute top-0 left-0 w-full h-full overflow-hidden transition-transform duration-300 ease-in-out z-20 ${selectedUser ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`} 
      style={{backgroundColor: getBackgroundColor(selectedUser?._id)}}
    >
      
      {selectedUser && 
        <div className='w-full h-full flex flex-col relative'>
          {/* Header */}
          <div className='w-full h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4 shrink-0 shadow-sm z-10'>
            <div className='flex items-center gap-4'>
              <div className='cursor-pointer lg:hidden' onClick={()=>dispatch(setSelectedUser(null))}>
                 <IoIosArrowRoundBack className='w-8 h-8 text-[#54656f]'/>
              </div>
              <div className='w-10 h-10 rounded-full overflow-hidden cursor-pointer'>
                <img src={ selectedUser?.image || dp} alt="" className='w-full h-full object-cover'/>
              </div>
              <div className='flex flex-col'>
                <h1 className='text-[#111b21] font-medium text-[16px]'>{selectedUser?.name || "user"}</h1>
                {onlineUsers?.includes(selectedUser._id) && <span className='text-[13px] text-[#667781]'>Online</span>}
              </div>
            </div>
            <div className='flex items-center gap-6 text-[#54656f]'>
              <IoSearch className='w-6 h-6 border-transparent cursor-pointer' title="Search..."/>
              <HiDotsVertical className='w-6 h-6 border-transparent cursor-pointer' title="Menu"/>
            </div>
          </div>

          {/* Chat Messages */}
          <div className='w-full flex-1 overflow-y-auto px-[5%] py-4 flex flex-col gap-2'>
            {messages && messages.map((mess)=>(
              mess.sender==userData._id 
                ? <SenderMessage key={mess._id} image={mess.image} message={mess.message} status={mess.status}/> 
                : <ReceiverMessage key={mess._id} image={mess.image} message={mess.message}/>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Emoji Picker */}
          {showPicker && <div className='absolute bottom-[80px] left-[20px] z-[100]'><EmojiPicker width={300} height={400} onEmojiClick={onEmojiClick}/></div> }

          {/* Input Area */}
          <div className='w-full bg-[#f0f2f5] px-4 py-[10px] flex items-end gap-2 shrink-0 relative'>
             
             {frontendImage && (
               <div className='absolute bottom-[70px] left-4 bg-white p-2 rounded-lg shadow-md'>
                 <img src={frontendImage} alt="preview" className='w-24 h-24 object-cover rounded'/>
                 <button onClick={()=>{setFrontendImage(null); setBackendImage(null)}} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs pointer'>×</button>
               </div>
             )}

             <div className='flex items-center gap-4 text-[#54656f] mb-2 shrink-0'>
                <div onClick={()=>setShowPicker(prev=>!prev)} className='cursor-pointer'>
                  <RiEmojiStickerLine className='w-[26px] h-[26px]'/>
                </div>
                <div onClick={()=>image.current.click()} className='cursor-pointer'>
                  <FaPlus className='w-[24px] h-[24px]'/>
                </div>
                <input type="file" accept="image/*" ref={image} hidden onChange={handleImage}/>
             </div>

             <form className='flex-1 flex items-center gap-2' onSubmit={handleSendMessage}>
                <div className='flex-1 bg-white rounded-lg min-h-[42px] flex items-center px-3'>
                  <input 
                    type="text" 
                    className='w-full bg-transparent outline-none text-[15px] text-[#111b21] py-2' 
                    placeholder='Type a message' 
                    onChange={(e)=>setInput(e.target.value)} 
                    value={input}
                  />
                </div>
                <button type="submit" disabled={input.length === 0 && !backendImage} className={`flex items-center justify-center w-[42px] h-[42px] rounded-full shrink-0 ${(input.length > 0 || backendImage) ? 'text-[#54656f] cursor-pointer' : 'text-[#8696a0] opacity-50 cursor-not-allowed'}`}>
                  <IoMdSend className='w-[24px] h-[24px]'/>
                </button>
             </form>

          </div>
        </div> 
      }
      
      {!selectedUser && 
        <div className='w-full h-full flex flex-col justify-center items-center bg-[#e0f7fa] border-b-[6px] border-cyan-500'>
          <h1 className='text-cyan-800 font-light text-[32px] mt-8'>Welcome to VibeTalk</h1>
          <p className='text-cyan-700 text-[14px] mt-4 max-w-[400px] text-center'>Send and receive messages in real-time. Start a conversation from the sidebar.</p>
        </div>
      }
    </div>
  )
}

export default MessageArea