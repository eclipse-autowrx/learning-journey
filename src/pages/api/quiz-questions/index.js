import { QuizQuestionService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { type, difficulty, count, category, tags } = req.query;
        
        let questions;
        
        if (count) {
          // Get random questions
          const filters = {};
          if (type) filters.question_type = type;
          if (difficulty) filters.difficulty = difficulty;
          if (category) filters.category = category;
          if (tags) filters.tags = { $in: tags.split(',') };
          
          questions = await QuizQuestionService.getRandomQuestions(parseInt(count), filters);
        } else if (type) {
          questions = await QuizQuestionService.getQuestionsByType(type);
        } else if (difficulty) {
          questions = await QuizQuestionService.getQuestionsByDifficulty(difficulty);
        } else {
          questions = await QuizQuestionService.getAllQuestions();
        }
        
        res.status(200).json({ success: true, data: questions });
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const questionData = req.body;
        const newQuestion = await QuizQuestionService.createQuestion(questionData);
        res.status(201).json({ success: true, data: newQuestion });
      } catch (error) {
        console.error('Error creating quiz question:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
