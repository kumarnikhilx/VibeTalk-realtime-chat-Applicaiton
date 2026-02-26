import React, { useEffect, useRef } from 'react'
import { BiCheck, BiCheckDouble } from 'react-icons/bi'

function SenderMessage({image,message,status}) {
  let scroll = useRef()
  
  useEffect(()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  },[message,image])
  
  const handleImageScroll=()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  }
  
  // Format current time for the placeholder timestamp
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className='flex items-start justify-end w-full mb-1'>
      <div 
        ref={scroll} 
        className='w-fit max-w-[65%] md:max-w-[500px] px-3 py-1.5 bg-[#d9fdd3] text-[#111b21] text-[15px] rounded-lg rounded-tr-none shadow-sm flex flex-col relative'
      >
        {/* The small tail for the sender bubble */}
        <span className='absolute top-0 -right-2 w-0 h-0 border-t-[10px] border-t-[#d9fdd3] border-r-[10px] border-r-transparent'></span>
        
        {image &&  <img src={image} alt="attached" className='w-[200px] rounded-lg mb-1' onLoad={handleImageScroll}/>}
        
        <div className='flex items-end flex-wrap gap-2'>
          {message && <span className='leading-snug break-words max-w-full'>{message}</span>}
          <div className='flex items-center gap-1 ml-auto shrink-0 pb-[2px]'>
            <span className='text-[11px] text-[#667781]'>
              {currentTime}
            </span>
            {status === 'sent' && <BiCheck className='text-[#667781] w-[16px] h-[16px]'/>}
            {status === 'delivered' && <BiCheckDouble className='text-[#667781] w-[16px] h-[16px]'/>}
            {status === 'read' && <BiCheckDouble className='text-[#53bdeb] w-[16px] h-[16px]'/>}
            {!status && <BiCheck className='text-[#667781] w-[16px] h-[16px]'/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SenderMessage
