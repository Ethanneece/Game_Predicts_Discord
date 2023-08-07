import { InteractionResponseType } from 'discord-interactions'
import { getUser, getDiscordByChannelId, getMatch, updateMatches } from '../mongodb.js'
import { DiscordRequest, updatePredictions } from '../utils.js'

export async function makeVote(req, res) {

    await updateMatches()

    let { custom_id } = req.body.data

    console.log(req.body.message)

    let username = req.body.member.user.username

    let match_id = custom_id.split(':')[0]

    let channel_id = req.body.channel_id
    let message_id = await getDiscordByChannelId(channel_id)

    message_id = message_id.message_id

    //Pull custom data from the db.
    let upcomingMatch = await getMatch(match_id)
    let user = await getUser(username)


    let teamNumber = custom_id.split(':')[1]
    let teamName = teamNumber === '1' ? upcomingMatch.Team1 : upcomingMatch.Team2

    //Saving user data 
    let userVote = user.records.find(vote => vote.matchId == upcomingMatch.matchId)
    if (!userVote) {
        user.records.push[{ username: username, matchID: upcomingMatch.matchID }]
        user.save()
    }
    else {
        userVote.vote = teamName
    }
    user.save()

    //Saving match data
    let upcomingMatchUser = upcomingMatch.Votes.find(vote => vote.username === user.username)
    if (!upcomingMatchUser) {
        upcomingMatch.Votes.push({ username: username, Team: teamName })
    }
    else {
        upcomingMatchUser.Team = teamName
    }
    upcomingMatch.save()

    updatePredictions(upcomingMatch, channel_id, message_id)

    res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `you voted for ${teamName}`
        }
    })

    setTimeout(async () => {
        let token = req.body.token
        let app_id = req.body.application_id
        let result = await DiscordRequest(`webhooks/${app_id}/${token}/messages/@original`, null, 'DELETE')
    }, 5000)
}