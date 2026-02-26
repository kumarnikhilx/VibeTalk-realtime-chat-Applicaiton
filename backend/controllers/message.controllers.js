import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let {message}=req.body

        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }

        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        })

        let newMessage=await Message.create({
            sender,receiver,message,image
        })

        if(!conversation){
            conversation=await Conversation.create({
                partcipants:[sender,receiver],
                messages:[newMessage._id]
            })
        }else{
            conversation.messages.push(newMessage._id)
            await conversation.save()
        }

        const receiverSocketId=getReceiverSocketId(receiver)
if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",newMessage)
}


        
        return res.status(201).json(newMessage)
    
    } catch (error) {
        return res.status(500).json({message:`send Message error ${error}`})
    }
}

export const getMessages=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        }).populate("messages")

        return res.status(200).json(conversation?.messages)
    } catch (error) {
        return res.status(500).json({message:`get Message error ${error}`})
    }
}

export const markMessagesAsRead = async (req, res) => {
    try {
        let receiverId = req.userId
        let { senderId } = req.params

        // Find all unread messages sent BY senderId TO receiverId (current user)
        const unreadMessages = await Message.find({
            sender: senderId,
            receiver: receiverId,
            status: { $ne: "read" }
        })

        if (unreadMessages.length === 0) {
            return res.status(200).json({ message: "No unread messages" })
        }

        // Update them in the database
        await Message.updateMany(
            { sender: senderId, receiver: receiverId, status: { $ne: "read" } },
            { $set: { status: "read" } }
        )

        // Emit an event to the sender so their ticks turn blue instantly
        const senderSocketId = getReceiverSocketId(senderId)
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", {
                readerId: receiverId,
                readMessageIds: unreadMessages.map(m => m._id)
            })
        }

        return res.status(200).json({ message: "Messages marked as read successfully" })
    } catch (error) {
        return res.status(500).json({ message: `mark as read error ${error}` })
    }
}