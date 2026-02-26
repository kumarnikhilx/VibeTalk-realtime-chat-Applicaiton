import React, { useEffect, useRef } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'

function ReceiverMessage({image,message}) {
  let scroll=useRef()
  let {selectedUser}=useSelector(state=>state.user)
  
  useEffect(()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  },[message,image])
  
  const handleImageScroll=()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  }

  // Format current time for the placeholder timestamp
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className='flex items-start gap-2 w-full mb-1'>
      <div className='w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 cursor-pointer shadow-sm' >
        <img src={selectedUser?.image || dp} alt="avatar" className='w-full h-full object-cover'/>
      </div>
      
      <div 
        ref={scroll} 
        className='w-fit max-w-[65%] md:max-w-[500px] px-3 py-1.5 bg-white text-[#111b21] text-[15px] rounded-lg rounded-tl-none shadow-sm flex flex-col relative'
      >
        {/* The small tail for the receiver bubble */}
        <span className='absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent'></span>
        
        {image &&  <img src={image} alt="attached" className='w-[200px] rounded-lg mb-1' onLoad={handleImageScroll}/>}
        
        <div className='flex items-end flex-wrap gap-2'>
          {message && <span className='leading-snug break-words max-w-full'>{message}</span>}
          <span className='text-[11px] text-[#667781] ml-auto pb-[2px] shrink-0'>
            {currentTime}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ReceiverMessage
