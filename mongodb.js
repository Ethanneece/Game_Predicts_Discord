import 'dotenv/config'
import mongoose from 'mongoose'
import Logger from './LogSchema.js'
import User from './UserSchema.js'

const db_connection = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dash.zywposf.mongodb.net/?retryWrites=true&w=majority`

let db = ""

export function db_connect() {
    db = mongoose.connect(db_connection)
}

async function createOrFindUser(username) {

    let user = await User.findOne({username: username})

    if (!user) {

        user = await User.create({username: username})
    }

    return user
}

export async function db_makeVote(username, team) {
    
    let user = await createOrFindUser(username)

    user.records.push({team: team})
    user.save()
}

export async function getRecords(username) {

    let user = await createOrFindUser(username)
    
    for (let key in user.records) {
        let record = user.records[key]
        
    }
}

export function db_log(message) {

    let log = new Logger({ 
        time: Date.now(),
        message: message,
    })

    log.save()
}



