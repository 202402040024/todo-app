# TaskFlow — Production-Ready Full-Stack To-Do App

A modern, full-featured task management application built with **Next.js 16**, **MongoDB Atlas**, **Tailwind CSS v4**, and **JWT Authentication**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| **Backend** | Next.js API Routes, JWT, bcryptjs |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **UI Libraries** | Framer Motion, React Icons, React Toastify |
| **Theme** | next-themes (Light/Dark mode) |
| **Deployment** | Vercel |

---

## ✨ Features

- **Authentication** — Register, Login, Logout with JWT (HTTP-only cookies)
- **Route Protection** — Middleware redirects unauthenticated users
- **Task CRUD** — Create, Read, Update, Delete with confirmation modals
- **Search** — Debounced full-text search by title, description, category
- **Filters** — Filter by status, priority, category
- **Sorting** — Newest, Oldest, Due Date, Priority, Recently Updated
- **Pagination** — Server-side pagination with page controls
- **Views** — Grid view and List (table) view
- **Dashboard Analytics** — Stats cards with animated counters, recent tasks, upcoming deadlines, distribution charts
- **Dark Mode** — Persistent theme with next-themes
- **Notifications** — React Toastify for all actions
- **Responsive** — Works on all screen sizes, mobile sidebar drawer

---

## 📁 Project Structure

```
todo-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.js
│   │   │   ├── login/route.js
│   │   │   ├── logout/route.js
│   │   │   └── me/route.js
│   │   └── tasks/
│   │       ├── route.js
│   │       └── [id]/route.js
│   ├── dashboard/
│   │   ├── layout.js
│   │   └── page.js
│   ├── tasks/
│   │   ├── layout.js
│   │   └── page.js
│   ├── profile/
│   │   ├── layout.js
│   │   └── page.js
│   ├── login/page.js
│   ├── register/page.js
│   ├── not-found.js
│   ├── loading.js
│   ├── page.js
│   ├── globals.css
│   └── layout.js
├── components/
│   ├── ui/           — Button, Input, Select, Badge, Modal, ConfirmModal, SkeletonLoader, EmptyState
│   ├── forms/        — TaskForm
│   ├── tasks/        — TaskCard, TaskRow, TaskFilters, Pagination
│   ├── dashboard/    — StatsCard, RecentTasks, UpcomingDeadlines, TaskDistribution
│   └── layout/       — Navbar, Sidebar
├── hooks/
│   ├── useAuth.js    — Auth context + login/register/logout
│   ├── useTasks.js   — Task CRUD operations
│   └── useDebounce.js
├── lib/
│   ├── mongodb.js    — Connection with caching
│   ├── jwt.js        — sign/verify/decode
│   ├── auth.js       — getCurrentUser, cookie helpers
│   └── helpers.js    — Utilities (formatDate, apiError, etc.)
├── models/
│   ├── User.js
│   └── Task.js
├── proxy.js          — Route protection (Next.js 16)
└── .env.local
```

---

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌿 MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account and click **Build a Database**
3. Choose **Free Shared** tier → Select region → Create Cluster
4. **Security > Database Access** → Add a new database user with password
5. **Security > Network Access** → Add IP `0.0.0.0/0` (or your specific IP)
6. **Databases > Connect** → Choose "Drivers" → Copy connection string
7. Replace `<username>`, `<password>`, and set the database name to `taskflow`
8. Paste into your `MONGODB_URI` in `.env.local`

### Verify with MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Open Compass → Paste your `MONGODB_URI` connection string
3. Click **Connect**
4. You should see your `taskflow` database with `users` and `tasks` collections after registering

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow full-stack app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. **Environment Variables** — Add all variables from `.env.local`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL
4. Click **Deploy**

### 3. Post-Deployment

- Update `NEXT_PUBLIC_APP_URL` with your actual Vercel domain
- Ensure MongoDB Atlas Network Access allows `0.0.0.0/0` for Vercel's dynamic IPs

---

## 🔐 Security

| Feature | Implementation |
|---|---|
| Password Hashing | bcryptjs with salt rounds = 12 |
| Authentication | JWT tokens, 7-day expiry |
| Cookie Security | `httpOnly`, `secure`, `sameSite: lax` |
| Route Protection | `proxy.js` (Next.js 16 Proxy/Middleware) |
| Input Validation | Client + server-side validation |
| API Authorization | `getCurrentUser()` on every protected endpoint |
| Email Enumeration | Generic "Invalid email or password" message |

---

## 🗄️ Database Schema

### Users Collection
```js
{
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```js
{
  userId: ObjectId (ref: User),
  title: String (required, max 200),
  description: String (max 1000),
  category: String (default: 'General'),
  priority: 'low' | 'medium' | 'high',
  status: 'pending' | 'in-progress' | 'completed',
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout (clear cookie) |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (search, filter, sort, paginate) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

#### GET /api/tasks — Query Parameters
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 10, max: 50) |
| `search` | string | Search title/description/category |
| `status` | string | Filter: pending, in-progress, completed |
| `priority` | string | Filter: low, medium, high |
| `category` | string | Filter by category name |
| `sortBy` | string | newest, oldest, dueDate, priority, updated |

---

## 🛠️ Production Deployment Checklist

- [ ] Set a strong, unique `JWT_SECRET` (32+ chars)
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Confirm HTTPS is enabled (Vercel handles this)
- [ ] Test all auth flows (register, login, logout, protected routes)
- [ ] Test task CRUD end-to-end
- [ ] Verify dark mode persists across sessions
- [ ] Check responsive layout on mobile
- [ ] Confirm toast notifications work

---

Built with ❤️ using Next.js 16, MongoDB Atlas, Tailwind CSS v4
