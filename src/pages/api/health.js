import connectToDatabase from "@/lib/mongodb";
import { PathService, CourseService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Test database connection
    await connectToDatabase();
    
    // Get basic stats
    const pathCount = await PathService.getAll().then(paths => paths.length).catch(() => 0);
    const courseCount = await CourseService.getAll().then(courses => courses.length).catch(() => 0);
    
    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        collections: {
          paths: pathCount,
          courses: courseCount
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString()
      }
    });
  }
}
