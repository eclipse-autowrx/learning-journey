async function fetchCourseBySlug(slug, queryParams) {
    if (!slug) throw ('Invalid post slug');
    try {
        const response = (await fetch(process.env.HOST + "/api/courses/" + slug + "?" + queryParams))
        const data = await response.json();
        if (data && data.success) {
            return data.data
        } else {
            throw ('Course not found')
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

export { fetchCourseBySlug }
