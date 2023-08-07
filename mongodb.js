import 'dotenv/config'
import mongoose from 'mongoose'
import Logger from './Schema/LogSchema.js'
import User from './Schema/UserSchema.js'
import Match from './Schema/MatchSchema.js'
import Discord from './Schema/DiscordSchema.js'

import {fandom_findMatchById, fandom_upComingMatches} from './fandomQuery.js'


const DB_NAME = 'LeaguePredictions'
const db_connection = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dash.zywposf.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

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

export async function isSetUp(channel_id) {

    let discord = await Discord.findOne({channel_id: channel_id})

    return discord != null
}

export async function setUpChannel(channel_id, message_id) {

    let discord = await Discord.create({channel_id: channel_id, message_id: message_id})

    console.log(discord)
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

export async function getMatch(match_id) {

    return await Match.findOne({MatchId: match_id})
}

export function db_log(message) {

    let log = new Logger({ 
        time: Date.now(),
        message: message,
    })

    log.save()
}

export async function getUser(username) {

    return User.findOne({username: username})
}

export async function getPlayerMatches(username) {

}

export async function replaceMatches() {

    let matches = await fandom_upComingMatches()
    matches = matches.cargoquery
    for (let key in matches) {
        let match = matches[key].title

        new Match(match).save()
    }
}

export async function getDiscordByChannelId(channel_id) {

    return await Discord.findOne({channel_id: channel_id})
}

export async function getUpcomingMatch() {

    let matches = await Match.find({Winner: null})

    // We have no upcoming matches and need to find some.
    if (matches == undefined || matches.length == 0) {
        await replaceMatches()
        matches = await Match.find({Winner: null})

        //No more matches left in the season.
        if (matches.length == 0) {
            return null 
        }
    }

    //Sorting through and finding the closest match. 
    let upcomingMatch = matches.reduceRight((callback, currentValue) =>  {
        return Date.parse(callback['DateTime UTC']) < Date.parse(currentValue['DateTime UTC'])
            ? callback : currentValue
    })    

    return upcomingMatch
}

// This function is called to match sure we have the most 
// up to date match being displayed. 
export async function updateMatches() {

    let matches = await Match.find({Winner: null})

    let currentDate = Date.now() 

    for (let key in matches) {
        let match = matches[key]

        let matchDate = new Date(match['DateTime UTC']).getTime()

        if (currentDate > matchDate) {

            match.Winner = "TBD"
            await match.save()
        }
    }
}

// Checking to update matches 
export async function findMatchWinners() {

    let matches = await Match.find({Winner: "TBD"})

    for (let key in matches) {
        let match = matches[key]

        let fandom = await fandom_findMatchById(match.MatchId)

        if (fandom.Winner !== null) {
            console.log(fandom.Winner)
            match.Winner = fandom.Winner
            await match.save()
            console.log('match updated: ' + match.MatchId)
        }
    }
}

export async function checkCurrentMatch() {

    let discord = await Discord.find({})

}