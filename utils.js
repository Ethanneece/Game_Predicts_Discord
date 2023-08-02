import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey, MessageComponentTypes, ButtonStyleTypes } from 'discord-interactions';
import teams from './teams.json' assert { type: 'json'};

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['🔵', '🔴'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//My functions
export function ansiFormat(message) {

  let rtn = '```ansi\n'
  message = message.replace('\u001b', '')
  rtn += message + '\n```'

  return rtn
}

export const ESCAPE = '\u001b'

export async function DiscordRequest(endpoint, contents, method) {

  //prepare the fetch request
  let url = encodeURI('https://discord.com/api/v10/' + endpoint)

  let headers = {
    'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
  }

  console.log(headers)

  let protocol = {
    headers: headers,
    method: method,
  }

  if (method == "POST") {
    protocol.body = JSON.stringify({
      content: contents.content,
      components: contents.components
    })

    console.log(protocol.body)

    headers['Accept'] = 'application/json'
    headers['content-Type'] = 'application/json'
  }

  let res = await fetch(url, protocol)

  return res
}


const TEAMS_PER_REQUEST = 5
const TEAM1_EMOJI = '🔵'
const TEAM2_EMOJI = '🔴'

export async function displayTeams(channel_id) {

  for (let key in teams.cargoquery) {
    console.log(key)

    let team = teams.cargoquery[key].title

    let message = formatTeam(team)

    let res = await DiscordRequest(`channels/${channel_id}/messages`, message, 'POST')

    if (!res.ok) {
      console.log("error")
      return;
    }

    let result = await res.json()

    if (!res.ok) {
      console.log("error")
    }

    if (TEAMS_PER_REQUEST <= Number(key) + 1) {
      console.log('break')
      break; 
    }
  }
}

function teamButtons(team) {

  let { Team1, Team2 } = team
  let components = [
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: [
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: Team1,
          label: Team1,
          style: ButtonStyleTypes.PRIMARY
        },
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: Team2,
          label: Team2, 
          style: ButtonStyleTypes.DANGER
        }
      ],
    }
  ]

  return components
}



function formatTeam(team) {
  let { ['DateTime UTC']: DateTime_UTC, Team1, Team2 } = team
  let dateTime_UTC = new Date(DateTime_UTC)
  let dateLocal = new Date()
  dateLocal.setTime(dateTime_UTC.getTime() - new Date().getTimezoneOffset())

  let date = dateLocal.getDate()

  let days = ['Sunday', 'Monday', 'Tuesday', 'Wendsday', 'Thursday', 'Friday', 'Saturday']
  let day = days[dateLocal.getDay()]

  let meridiem = dateLocal.getHours() < 12 ? 'AM' : 'PM'
  let hours = dateLocal.getHours() % 12

  let message = ansiFormat(ESCAPE + "[0;37m" + day + " " + date + ": " + hours + + " " + meridiem + "\n" +
    ESCAPE + "[1;34m" + Team1 + ESCAPE + "[1;37m" + " VS " + ESCAPE + "[1;31m" + Team2)

  let buttons = teamButtons(team)
  let formattedTeam = {content: message, components: buttons}


  return formattedTeam
}