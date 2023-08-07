import { InteractionResponseType } from "discord-interactions"

import { getUpcomingMatch, isSetUp, setUpChannel } from '../mongodb.js'
import { formatTeam, DiscordRequest } from '../utils.js'

// called in discord channel when wanting to set up bot functions
export async function setUp(req, res) {

    const channel_id = req.body.channel_id

    //Chanell has already 
    if (await isSetUp(channel_id)) {

        res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Predictions are already set up in this channel.'
            }
        })

        return true
    }

    res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'Setting up Predictions for your server.'
        }
    })

    //Delete 
    setTimeout(async () => {
        let token = req.body.token
        let app_id = req.body.application_id
        let result = await DiscordRequest(`webhooks/${app_id}/${token}/messages/@original`, null, 'DELETE')
    }, 5000)

    let match = await getUpcomingMatch()

    let message = formatTeam(match)

    let result = await DiscordRequest(`/channels/${channel_id}/messages`, message, 'POST')

    result = await result.json()

    console.log(result)

    console.log('message_Id: ' + result.id)


    setUpChannel(channel_id, result.id)
}