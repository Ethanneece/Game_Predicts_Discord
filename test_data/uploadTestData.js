import 'dotenv/config'

import mongoose from 'mongoose'
import {UserSchema} from '../Schema/UserSchema.js'
import Match from '../Schema/MatchSchema.js'

import testUserData from './users.json' assert { type: 'json'}

const db_connection = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dash.zywposf.mongodb.net/LeaugePredictions?retryWrites=true&w=majority`


let db = await mongoose.connect(db_connection)

let testUser = mongoose.model('testUser', UserSchema)

for (let key in testUserData.users) {

    let user = testUserData.users[key].user

    console.log(user.records)

    testUser.create({ username: user.username, records: user.records})
}
