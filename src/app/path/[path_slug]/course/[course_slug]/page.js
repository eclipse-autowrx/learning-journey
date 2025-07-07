
import BreadCrumb from "@/app/components/atom/BreadCrumb"
import { notFound } from 'next/navigation'
import { fetchPathBySlug } from "@/lib/utils/consume_apis/api_path"
import { fetchCourseBySlug } from "@/lib/utils/consume_apis/api_course"
import CourseScreen from "@/app/components/screen/CourseScreen"
import { cookies } from 'next/headers';

const Page = async ({ params }) => {
  const cookieStore = await cookies();

  const { path_slug, course_slug } = await params;
  if (!path_slug || !course_slug) notFound()

  let dbPath = null
  let dbCourse = null

  try {
    const user_id = cookieStore.get('user_id')?.value || "";
    const token = cookieStore.get('token')?.value || "";
    dbPath = await fetchPathBySlug(path_slug, user_id, token);
    // if (dbPath.courses) {
    //   dbCourse = dbPath.courses.find((c) => c.slug == course_slug)
    // }
    dbCourse = await fetchCourseBySlug(course_slug, `user_id=${user_id}&token=${token}`);
    // // Call API to get progress for dbCourse
    // if (dbCourse && dbCourse._id) {
    //   try {
    //     const user_id = cookieStore.get('user_id')?.value || "";
    //     const token = cookieStore.get('token')?.value || "";
    //     // Only fetch progress if user is logged in
    //     if (user_id && token) {
    //       const progressRes = await fetch(
    //         process.env.HOST  +`/api/progress/courses/${dbCourse._id}?user_id=${user_id}&token=${token}`,
    //         { cache: "no-store" }
    //       );
    //       if (progressRes.ok) {
    //         const progressData = await progressRes.json();
    //         if (progressData && progressData.success && progressData.data) {
    //           dbCourse.progress = progressData.data;
    //         }
    //       }
    //     }
    //   } catch (err) {
    //     // If progress fetch fails, just continue
    //     console.log("Failed to fetch course progress", err);
    //   }
    // }
  } catch (err) {
    console.log(err)
  }


  if (!dbPath || !dbCourse) notFound()

  return (
    <div
      className="w-full bg-[#FFF9EC] text-slate-600 text-2xl p-0 pb-1
                h-screen flex flex-col"
    >
      <BreadCrumb items={[
        { label: dbPath.name, link: `/path/${path_slug}` },
        { label: dbCourse.name, link: `/path/${path_slug}/course/${course_slug}` }
      ]} />

      <div className="w-full grow pt-2 px-4 flex flex-col">
        <CourseScreen course={dbCourse} path_slug={path_slug} />
      </div>
    </div>
  );
}

export default Page;
