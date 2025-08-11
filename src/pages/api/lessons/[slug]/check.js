import { LessonService } from '@/lib/services/dataService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { slug } = req.query;
  const { answers } = req.body;

  if (!slug) {
    return res.status(400).json({ success: false, error: 'Lesson slug is required' });
  }

  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: 'Answers must be an array' });
  }

  try {
    const lesson = await LessonService.getBySlug(slug);

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    if (lesson.lesson_type !== 'quiz') {
      return res.status(400).json({ success: false, error: 'This lesson is not a quiz' });
    }

    const quizQuestions = lesson.quiz_questions || [];

    if (answers.length !== quizQuestions.length) {
      return res.status(400).json({ success: false, error: 'Number of answers does not match number of questions' });
    }

    let score = 0;
    const detailedResults = answers.map(userAnswer => {
      const question = quizQuestions[userAnswer.question_index];
      if (!question) {
        // Should not happen if lengths are validated, but good for safety
        return {
          question_index: userAnswer.question_index,
          is_correct: false,
          user_answer: userAnswer.answer_index,
          correct_answer: -1,
        };
      }
      
      const correctAnswerIndex = question.answers.findIndex(a => a.is_correct);
      const isCorrect = userAnswer.answer_index === correctAnswerIndex;
      
      if (isCorrect) {
        score++;
      }

      return {
        question_index: userAnswer.question_index,
        is_correct: isCorrect,
        user_answer: userAnswer.answer_index,
        correct_answer: correctAnswerIndex,
      };
    });

    return res.status(200).json({
      success: true,
      score,
      total: quizQuestions.length,
      results: detailedResults,
    });

  } catch (error) {
    console.error(`API Error checking quiz for slug ${slug}:`, error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
