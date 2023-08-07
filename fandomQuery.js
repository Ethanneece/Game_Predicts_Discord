// Querying data from sites table: https://lol.fandom.com/wiki/Special:CargoTables/MatchSchedule
// API Sandbox: https://lol.fandom.com/wiki/Special:ApiSandbox

const defaultQuery = {

    url: 'https://lol.fandom.com/api.php',
    action: 'cargoquery',
    format: 'json',
    tables: 'MatchSchedule',
    limit: '5',
    fields: ['Team1', 'Team2', 'Winner', 'DateTime_UTC', 'MatchId'],
} 

export async function fandom_upComingMatches() {

    //Get current time to get upcoming matches
    let currentTime = new Date().toISOString()

    //Looking at matchId to pull up specifically 2023 LCS Matches. 
    let matchID = '%LCS/2023%'

    let where = `&where=DateTime_UTC >= '${currentTime}' AND MatchId LIKE '${matchID}'`

    let query = formatQuery(defaultQuery) + where

    query = encodeURI(query)

    return fandomQuery(query)
}

// Creates a query based off formatting  
function formatQuery(queryParams) {

    let query = queryParams.url
    query += '?action=' + queryParams.action
    query += '&format=' + queryParams.format
    query += '&tables=' + queryParams.tables
    query += '&limit=' + queryParams.limit
    query += '&fields=' + queryParams.fields.join(", ") 

    return query
}

export async function fandom_findMatchById(matchId) {

    let newQueryParams = structuredClone(defaultQuery)
    newQueryParams.limit = 1 

    let query = formatQuery(newQueryParams)

    let where = `&where='${matchId}'=MatchId`

    query += where

    query = encodeURI(query)

    let result = await fandomQuery(query)
    result = result.cargoquery[0].title
    console.log(result)
    return result
}

async function fandomQuery(query) { 

    let result = await fetch(query)

    if (!result.ok) {
        console.log(result.ok)
    }

    result = await result.json()

    return result 
}