
## Introduction

This repo provide design and sourcecode for learning-journey module.

## UX design
UX design can be found <a href="https://www.figma.com/proto/txyROkbkONSYR34O68JvQk/Playground-Learning?page-id=560%3A18067&node-id=560-18279&viewport=-1774%2C271%2C0.19&t=EBj90R0DJnst632I-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=560%3A18279&show-proto-sidebar=1&hide-ui=1" target="_blank">here</a>

## Techonologies

- This is a SSR webapp build by NextJS
- Language: Typescript
- Database: Mongo DB

## Deployment

- The whole project will be packaged in a Docker image. It needs to connect to an external MongoDB.
- This web app is designed to be served in two ways:

  1. Standalone web app; it can be hosted for public or internal use.
  2. Embedded in the playground.digital.auto platform as a built-in learning tool.

### Considerations 
- Package and deploy by npm, npx

# For developer

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Development Setup (Recommended for Developers)

1. **Run the development setup script:**
   ```bash
   npm run setup:dev
   ```
   This will:
   - Check Docker installation
   - Create `.env.dev` file
   - Start MongoDB and MongoDB Express
   - Migrate mock data to the database

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the services:**
   - **Next.js App:** http://localhost:3000
   - **MongoDB Express (Admin):** http://localhost:8081 (admin/password123)

### Production Setup

1. **Run the production setup script:**
   ```bash
   npm run setup:prod
   ```
   This will:
   - Check Docker installation
   - Create `.env.prod` file from template
   - Build the Next.js application
   - Start all production services
   - Migrate data to the database

2. **Access the application:**
   - **Application:** http://localhost:3000
   - **MongoDB Express (if enabled):** http://localhost:8081

### Manual Setup

#### Development
```bash
npm run docker:dev:up    # Start MongoDB and MongoDB Express
npm run migrate          # Migrate data
npm run dev              # Start development server
```

#### Production
```bash
cp env.prod.example .env.prod  # Configure production environment
npm run docker:prod:up         # Start production services
npm run docker:prod:admin      # With MongoDB Express
npm run docker:prod:nginx      # With Nginx
npm run docker:prod:full       # With all services
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Available Scripts

### Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run migrate` - Migrate mock data to database

### Additional Scripts

For maintenance tasks, run scripts directly from `scripts/` directory:
- `node scripts/backup-db.js` - Backup database
- `node scripts/restore-db.js` - Restore database
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for more details

## API Endpoints

The application now supports both database and mock data with automatic fallback:

### Paths
- `GET /api/paths` - Get all paths
- `GET /api/paths/[slug]` - Get path by slug
- `POST /api/paths` - Create new path
- `PUT /api/paths/[slug]` - Update path
- `DELETE /api/paths/[slug]` - Delete path

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/[slug]` - Get course by slug
- `POST /api/courses` - Create new course
- `PUT /api/courses/[slug]` - Update course
- `DELETE /api/courses/[slug]` - Delete course

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/[slug]` - Get lesson by slug
- `POST /api/lessons` - Create new lesson
- `PUT /api/lessons/[slug]` - Update lesson
- `DELETE /api/lessons/[slug]` - Delete lesson

### Quiz Questions
- `GET /api/quiz-questions` - Get all quiz questions (with filters)
- `GET /api/quiz-questions/[id]` - Get quiz question by ID
- `POST /api/quiz-questions` - Create new quiz question
- `PUT /api/quiz-questions/[id]` - Update quiz question
- `DELETE /api/quiz-questions/[id]` - Delete quiz question
- `POST /api/quiz-questions/[id]/grade` - Grade a quiz answer

### Health Check
- `GET /api/health` - Check application and database status

## Database Schema

The application uses MongoDB with the following collections:
- **paths** - Learning paths with course references
- **courses** - Courses with lesson references and sections
- **lessons** - Individual lessons with different types (video, text, quiz, interactive, etc.)
- **courseprogresses** - User progress tracking


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

For detailed setup instructions, see [SETUP.md](./SETUP.md).


## For uploaded media

1 Config the folder store data in .env file
```bash
MEDIA_STORE_PATH=/opt/learning/media_store
```

2. Create a symbolic link from your media store to the public directory
```bash
ln -s /opt/learning/media_store/images ./public/images
ln -s /opt/learning/media_store/files ./public/files
```
