import mongoose from 'mongoose'

const Match = mongoose.model('Match', new mongoose.Schema({
    MatchId: String,
    Team1: String,
    Team2: String,
    Winner: String,
    "DateTime UTC": String,
    Votes: [{
        username: String,
        Team: String
    }]
}))

export default Match