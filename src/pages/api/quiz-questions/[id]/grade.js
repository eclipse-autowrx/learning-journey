import { QuizQuestionService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method !== "POST") {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({ success: false, error: 'Answer is required' });
    }

    const result = await QuizQuestionService.gradeAnswer(id, answer);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error grading quiz answer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
}
