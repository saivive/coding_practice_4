const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializedbServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializedbServer()

//GET players API
app.get('/players/', async (request, response) => {
  const cricketTeamQuery = `
    SELECT  
      * 
    FROM  
      cricket_team;`
  const cricketTeam = await db.all(cricketTeamQuery)
  const responseObject = cricketTeam => {
    return {
      playerId: cricketTeam.player_id,
      playerName: cricketTeam.player_name,
      jerseyNumber: cricketTeam.jersey_number,
      role: cricketTeam.role,
    }
  }
  response.send(cricketTeam.map(eachplayer => responseObject(eachplayer)))
})

//POST players API
app.post('/players/', async (request, response) => {
  const addDetails = request.body
  const {player_name, jersey_number, role} = addDetails
  const addplayerQuery = `INSERT INTO 
    cricket_team(player_name,jersey_number,role)
    VALUES( 
      '${player_name}', 
      ${jersey_number},
      '${role}'
    );`
  await db.run(addplayerQuery)
  response.send('Player Added to Team')
})

//GET player_id API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getTeamQuery = `
    SELECT  
      * 
    FROM  
      cricket_team
    WHERE 
       player_id=${playerId};`
  const getTeam = await db.get(getTeamQuery)
  const ans = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    }
  }
  response.send(ans(getTeam))
})

//PUT player API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updateDetails = request.body
  const {player_name, jersey_number, role} = updateDetails
  const updateTeamQuery = `
    UPDATE 
      cricket_team 
    SET 
      player_name='${player_name}', 
      jersey_number=${jersey_number}, 
      role='${role}'
    WHERE 
       player_id=${playerId};`
  await db.run(updateTeamQuery)
  response.send('Player Details Updated')
})

//DELETE player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const DeleteTeamQuery = `
    DELETE FROM
      cricket_team 
    WHERE 
      player_id=${playerId};`
  await db.run(DeleteTeamQuery)
  response.send('Player Removed')
})

module.exports = app
