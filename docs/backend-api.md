# Backend APIs

- User module: user_id
    - user_id source:
        - opt #1: external, get_user_id via query
        - opt #2: internal, get user_id via cookie
    - Get user info via API

- Inventory:
    - Authenticate
        - POST /user/auth?user_id=[user_id]&&token=[token]

    - User progress
        - ⏳ GET progress/courses/bulk/:course_ids
        - ⏳ GET progress/courses/:course_id
        - ⏳ PUT progress/courses/:course_id

    - Collections
        - ✅ GET collections
        - GET collections/:collection_id
        - POST collections
        - PUT collections/:collection_id
        - DELETE  collections/:collections_id

    - paths
        - ✅ GET paths
        - ✅ GET paths/:path_id
        - POST paths
        - PUT paths/:path_id
        - DELETE  paths/:path_id

    - course
        - GET courses
        - ✅ GET courses/:course_id
        - POST courses
        - PUT courses/:course_id
        - DELETE  courses/:course_id
    
    - lesson
        - GET lessons
        - ✅ GET lessons/:lesson_id
        - POST lessons
        - PUT lessons/:lesson_id
        - DELETE  lessons/:lesson_id

    - media
        - ✅ GET medias/list-icon
        - GET medias
        - GET medias/:media_id
        - POST medias
        - DELETE  medias/:media_id



# Run mongodb
```sh
mkdir -p ~/mongo-data
docker run --name mongo-dev -p 27000:27017 -v ~/mongo-data:/data/db -d mongo

  ```


# Prompt to prepare data

### Clean up markdown
  ```
  Remove outline out of this markdown but keep # level of header, give me back raw markdown : 
  ```