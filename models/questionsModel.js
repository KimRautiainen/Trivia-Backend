"use strict"
const pool = require("../Db");
const promisePool = pool.promise();

// get questions with tournament tag
const getQuestionsWithTournamentTag = async (tournamentTag) => {
    try{
        const sql = `
        SELECT * FROM Questions WHERE tournamentTag = ?
        `;
        const [rows] = await promisePool.query(sql,[tournamentTag])
        return rows;
    }catch(e){
        console.error("error", e.message);
        throw new error("Sql query failed");
    }
}


module.exports = {
    getQuestionsWithTournamentTag
}