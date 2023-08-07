import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey, MessageComponentTypes, ButtonStyleTypes } from 'discord-interactions';
import teams from './teams.json' assert { type: 'json'};

//My functions
export function ansiFormat(message) {

  let rtn = '```ansi\n'
  message = message.replace('\u001b', '')
  rtn += message + '\n```'

  return rtn
}

export function verifyDiscordRequest(clientKey) {
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

export const ESCAPE = '\u001b'

export async function DiscordRequest(endpoint, contents, method) {

  //prepare the fetch request
  let url = encodeURI('https://discord.com/api/v10/' + endpoint)

  let headers = {
    'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
  }

  let protocol = {
    headers: headers,
    method: method,
  }

  if (method == "POST" || method == 'PATCH') {
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

export async function displayTeams(channel_id) {

  for (let key in teams.cargoquery) {

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

export function teamButtons(team) {

  let { Team1, Team2, MatchId} = team
  let components = [
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: [
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: MatchId + ':1',
          label: Team1,
          style: ButtonStyleTypes.PRIMARY
        },
        {
          type: MessageComponentTypes.BUTTON,
          custom_id: MatchId + ':2',
          label: Team2, 
          style: ButtonStyleTypes.DANGER
        }
      ],
    }
  ]

  return components
}



export function formatTeam(team) {

  let { ['DateTime UTC']: DateTime_UTC, Team1, Team2, MatchId } = team
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