import mongoose from 'mongoose'
const { Schema } = mongoose

const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    records: [
        {
            matchId: Number,
            vote: Boolean, 
        }
    ]
}))


export default User