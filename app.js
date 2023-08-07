import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { verifyDiscordRequest } from './utils.js';

import { db_connect, db_log, db_makeVote, findMatchWinners, updateMatches, updateDiscordMatchId } from './mongodb.js'
import { setUp } from './Routes/setUp.js'
import { makeVote } from './Routes/vote.js'


// Create an express app
const app = express();

// Verify that the request comes from discord. 
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }))

// Connect to the database.
await db_connect()
await updateMatches()
await findMatchWinners()
await updateDiscordMatchId()

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data

  const { type, data } = req.body;


  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    //Testing 
    if (name === 'hello') {

      setUp(req, res)
      return;
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {

    makeVote(req, res)
    return 
  }
});

// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
  db_log(`Listening on port ${PORT}`)
});
