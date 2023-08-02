import mongoose from 'mongoose'

const Logger = mongoose.model("Logger", new mongoose.Schema({
    time: Number, 
    message: String
}))

export default Logger