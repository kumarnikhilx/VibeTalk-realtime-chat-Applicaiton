import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
   name:"user",
   initialState:{
    userData:null,
    otherUsers:null,
    selectedUser:null,
    socket:null,
    onlineUsers:null,
    searchData:null
   },  
   reducers:{
    setUserData:(state,action)=>{
   state.userData=action.payload
    },
    setOtherUsers:(state,action)=>{
      state.otherUsers=action.payload
       },
       setSelectedUser:(state,action)=>{
         state.selectedUser=action.payload
          }
          ,
          setSocket:(state,action)=>{
            state.socket=action.payload
             },
             setOnlineUsers:(state,action)=>{
              state.onlineUsers=action.payload
               },
               setSearchData:(state,action)=>{
                state.searchData=action.payload
                 },
                 updateUserLatestMessage:(state,action)=>{
                   let {userId, latestMessage, isSender}=action.payload
                   let user = state.otherUsers?.find(u=>u._id === userId)
                   if(user){
                      user.latestMessage = latestMessage
                      // Only increment unread count if we are NOT the sender
                      if(!isSender) {
                          user.unreadCount = (user.unreadCount || 0) + 1
                      }
                   }
                   let searchUser = state.searchData?.find(u=>u._id === userId)
                   if(searchUser){
                      searchUser.latestMessage = latestMessage
                      if(!isSender) {
                          searchUser.unreadCount = (searchUser.unreadCount || 0) + 1
                      }
                   }
                 },
                 clearUnreadCount:(state,action)=>{
                   let userId = action.payload
                   let user = state.otherUsers?.find(u=>u._id === userId)
                   if(user) user.unreadCount = 0
                   let searchUser = state.searchData?.find(u=>u._id === userId)
                   if(searchUser) searchUser.unreadCount = 0
                 }
   }
})

export const {setUserData, setOtherUsers,setSelectedUser,setSocket,setOnlineUsers,setSearchData,updateUserLatestMessage,clearUnreadCount}=userSlice.actions
export default userSlice.reducer