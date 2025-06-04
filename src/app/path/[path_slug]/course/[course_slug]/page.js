
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
    dbPath = await fetchPathBySlug(path_slug,
      cookieStore.get('user_id')?.value || "",
      cookieStore.get('token')?.value || "");
    if (dbPath.courses) {
      dbCourse = dbPath.courses.find((c) => c.slug == course_slug)
    }
    // dbCourse = await fetchCourseBySlug(course_slug);
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
