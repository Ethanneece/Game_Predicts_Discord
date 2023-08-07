import mongoose from 'mongoose'

const DiscordSchema = mongoose.model("Discord", new mongoose.Schema({
    channel_id: String, 
    message_id: String, 
    MatchId: String, 
}))

export default DiscordSchema