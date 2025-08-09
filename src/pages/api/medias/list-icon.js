// This endpoint served mock media icons. Remove or replace with DB-backed source if needed.

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        return res.status(410).json({ success: false, error: "Deprecated: media icons are no longer served from mock data" });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
