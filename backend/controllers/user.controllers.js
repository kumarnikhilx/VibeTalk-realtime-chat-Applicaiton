import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"
import Conversation from "../models/conversation.model.js"

export const getCurrentUser=async (req,res)=>{
try {
    let user=await User.findById(req.userId).select("-password")
    if(!user){
        return res.status(400).json({message:"user not found"})
    }

    return res.status(200).json(user)
} catch (error) {
    return res.status(500).json({message:`current user error ${error}`})
}
}

export const editProfile=async (req,res)=>{
    try {
        let {name}=req.body
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }
        let user=await User.findByIdAndUpdate(req.userId,{
           name,
           image 
        },{new:true})

        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`profile error ${error}`})
    }
}

export const getOtherUsers=async (req,res)=>{
    try {
        let users=await User.find({
            _id:{$ne:req.userId}
        }).select("-password")

        const usersWithConversations = await Promise.all(users.map(async (user) => {
            const conversation = await Conversation.findOne({
                partcipants: { $all: [req.userId, user._id] }
            }).populate("messages");

            let latestMessage = null;
            let unreadCount = 0;

            if (conversation) {
                if (conversation.messages.length > 0) {
                    latestMessage = conversation.messages[conversation.messages.length - 1];
                }
                
                // Calculate unread count (messages sent TO me that are NOT read)
                unreadCount = conversation.messages.filter(
                    msg => msg.receiver.toString() === req.userId && msg.status !== "read"
                ).length;
            }

            return {
                ...user._doc,
                latestMessage,
                unreadCount
            };
        }));

        return res.status(200).json(usersWithConversations)
    } catch (error) {
        return res.status(500).json({message:`get other users error ${error}`})
    }
}

export const search =async (req,res)=>{
    try {
        let {query}=req.query
        if(!query){
            return res.status(400).json({message:"query is required"})
        }
        let users=await User.find({
            $or:[
                {name:{$regex:query,$options:"i"}},
                {userName:{$regex:query,$options:"i"}},
            ]
        })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({message:`search users error ${error}`})
    }
}