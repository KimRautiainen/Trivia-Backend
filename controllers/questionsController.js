"use strict"
const e = require("express");
const questionsModel = require("../models/questionsModel");
const validationResult = require("express-validator");


// get questions with tournament tag

const getQuestionsWithTournamentTag = async (req,res) => {
   
    try{
        const tournamentTag = req.params.tournamentTag;
      
        const questions = await questionsModel.getQuestionsWithTournamentTag(tournamentTag);
        res.json(questions);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const questionsController = {
    getQuestionsWithTournamentTag,
}
module.exports = questionsController;