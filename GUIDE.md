# CVflow — User Guide

A step-by-step guide to set up and run the CVflow application locally.

## Prerequisites

Make sure the following software is installed on your machine:

| Software | Purpose |
|----------|---------|
| [XAMPP](https://www.apachefriends.org/) | Provides Apache (web server), MySQL/MariaDB (database), and PHP |
| [Node.js](https://nodejs.org/) (v18+) | Required to run the frontend dev server |
| npm | Comes bundled with Node.js |

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Place (or clone) the project inside your XAMPP `htdocs` folder so the path looks like:

```
C:\xampp\htdocs\CVflow\
```

## 2. Start XAMPP Services

1. Open the **XAMPP Control Panel**.
2. Start **Apache**.
3. Start **MySQL**.

> By default Apache runs on port **80** or **8080** and MySQL on port **3306**. Make sure these ports are not occupied by other applications.

## 3. Set Up the Database

1. Open **phpMyAdmin** in your browser: <http://localhost/phpmyadmin>
2. Create a new database named **`cv_management`** (collation: `utf8mb4_general_ci`).
3. Select the newly created database, go to the **Import** tab.
4. Choose the SQL dump file located at the project root:

   ```
   CVflow/cv_management (2).sql
   ```

5. Click **Go** to import. This creates all required tables and seed data.

### Database Credentials

The backend connects using the settings in `backend/database.php`:

| Setting  | Default Value |
|----------|---------------|
| Host     | `localhost`   |
| User     | `root`        |
| Password | *(empty)*     |
| Database | `cv_management` |

These match the default XAMPP MySQL configuration. If your setup differs, update `backend/database.php` accordingly.

## 4. Verify the Backend

The PHP backend is served directly by Apache. Confirm it works by visiting:

```
http://localhost:8080/CVflow/backend/lookups.php
```

You should see a JSON response. If you get a 404, check that:

- Apache is running.
- The project is inside `htdocs/CVflow/`.
- Your Apache port matches the URL (adjust `8080` to your port).

## 5. Install Frontend Dependencies

Open a terminal, navigate to the `frontend` folder, and install packages:

```bash
cd CVflow/frontend
npm install
```

## 6. Configure the Backend URL (Optional)

The frontend defaults to `http://localhost:8080/CVflow` as the backend base URL.

If your Apache runs on a different port or path, create a `.env` file inside the `frontend` folder:

```bash
VITE_BACKEND_URL=http://localhost:<your-port>/CVflow
```

## 7. Start the Frontend Dev Server

```bash
npm run dev
```

The app will be available at: **<http://localhost:3000>**

## 8. Build for Production (Optional)

To create an optimized production build:

```bash
npm run build
```

The output will be in `frontend/dist/`. You can preview it with:

```bash
npm run preview
```

## Available npm Scripts

Run these from the `frontend/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove the `dist` folder |

## Project Structure

```
CVflow/
├── backend/                 # PHP API endpoints
│   ├── database.php         # Database connection config
│   ├── auth.php             # Authentication endpoint
│   ├── register.php         # User registration
│   ├── cv.php               # CV CRUD operations
│   ├── lookups.php          # Lookup data (countries, skills, etc.)
│   ├── search_cvs.php       # CV search endpoint
│   ├── admin_users.php      # Admin user management
│   └── admin_lookups.php    # Admin lookup management
├── frontend/                # React SPA
│   ├── src/                 # Source code
│   ├── package.json         # Dependencies & scripts
│   └── vite.config.ts       # Vite configuration
├── cv_management (2).sql    # Database dump (import this)
└── README.md                # Project overview
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **CORS errors** in the browser console | Make sure both Apache and the Vite dev server are running. The backend PHP files include CORS headers. |
| **Database connection failed** | Verify MySQL is running in XAMPP and the credentials in `backend/database.php` match your setup. |
| **Port already in use** | Change the port in XAMPP settings or adjust `VITE_BACKEND_URL` / the `dev` script in `package.json`. |
| **`npm run clean` fails on Windows** | The script uses a Unix command. Use `Remove-Item -Recurse -Force dist` in PowerShell instead, or run via Git Bash. |
| **Blank page at localhost:3000** | Check the browser console for errors. Ensure the backend URL is reachable. |
