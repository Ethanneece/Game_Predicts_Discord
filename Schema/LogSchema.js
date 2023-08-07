import mongoose from 'mongoose'

const COLLECTION_NAME = 'LOGS'

const Logger = mongoose.model("Logger", new mongoose.Schema({
    time: Number, 
    message: String
}, { collection: COLLECTION_NAME}))

export default Logger