import mongoose from 'mongoose'

const Match = mongoose.model('Match', new mongoose.Schema({
    matchId: Number, 
    Team1, String, 
    Team2, String,
    Votes : [{
        Player: String, 
        Team: String 
    }]
}))

export default Match