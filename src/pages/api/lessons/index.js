import { LessonService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const dbLessons = await LessonService.getAll();
        res.status(200).json({ success: true, data: dbLessons });
      } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const lessonData = req.body;
        const newLesson = await LessonService.create(lessonData);
        res.status(201).json({ success: true, data: newLesson });
      } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
