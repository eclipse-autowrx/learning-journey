import { QuizQuestionService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case "GET":
      try {
        const question = await QuizQuestionService.getQuestionById(id);
        if (!question) {
          return res.status(404).json({ success: false, error: "Question not found" });
        }
        res.status(200).json({ success: true, data: question });
      } catch (error) {
        console.error('Error fetching quiz question:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        const updateData = req.body;
        const updatedQuestion = await QuizQuestionService.updateQuestion(id, updateData);
        res.status(200).json({ success: true, data: updatedQuestion });
      } catch (error) {
        console.error('Error updating quiz question:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "DELETE":
      try {
        await QuizQuestionService.deleteQuestion(id);
        res.status(200).json({ success: true, message: "Question deleted successfully" });
      } catch (error) {
        console.error('Error deleting quiz question:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
