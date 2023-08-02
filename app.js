import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, displayTeams } from './utils.js';

import {db_connect, db_log, db_createUser, db_makeVote} from './mongodb.js'


// Create an express app
const app = express();


// Connect to the database.
db_connect()


/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  console.log(req.body)


  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    
    //Testing 
    if (name === 'hello') {

      let rtn = "# LCS Upcoming Matches \n"
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: rtn,
        },
      });

      displayTeams(req.body.channel_id)
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    let {custom_id} = data
    let username = req.body.member.user.username

    db_makeVote(username, custom_id)
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { 
        content: `you voted for ${custom_id}`
      }
    })
  }
});

// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
  db_log(`Listening on port ${PORT}`)
});
