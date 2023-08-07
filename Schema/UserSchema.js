import mongoose from 'mongoose'
const { Schema } = mongoose


const COLLECTION_NAME = 'USERS'

export const UserSchema = new mongoose.Schema({
    username: String,
    records: [{ matchID: String, vote: String }]
})

const User = mongoose.model("User", UserSchema)

export default User