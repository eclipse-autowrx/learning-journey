import { CourseService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "PUT": {
      // Bulk update state
      const { ids, state } = req.body;
      if (!Array.isArray(ids) || !state) {
        return res.status(400).json({ success: false, error: "Missing ids or state" });
      }
      try {
        const result = await CourseService.bulkUpdateState(ids, state);
        return res.status(200).json({ success: true, result });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    case "DELETE": {
      // Bulk delete
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, error: "Missing ids" });
      }
      try {
        const result = await CourseService.bulkDelete(ids);
        return res.status(200).json({ success: true, result });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
