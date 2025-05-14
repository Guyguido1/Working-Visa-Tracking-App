# Visa Management System

A multi-tenant visa management application built with Next.js, designed for visa agencies to manage their customers' visa applications, track important dates, and collaborate within their company.

## 📋 Features

- **Multi-tenant Architecture**: Complete data isolation between companies
- **Dashboard**: View key metrics and categorized customer lists
- **Customer Management**: Add, view, edit, and delete customers
- **Document Management**: Upload and manage customer documents
- **Notes System**: Add and manage notes for each customer
- **User Management**: Admin users can manage company users and permissions
- **Reporting System**: Track reports with due dates and statuses
- **Date Tracking**: Monitor visa/passport expiry dates and upcoming birthdays
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19
- **Styling**: Tailwind CSS, DaisyUI
- **Database**: PostgreSQL via Neon Serverless
- **Authentication**: Custom session-based auth
- **State Management**: React Server Components + Client Hooks
- **Icons**: Lucide React

## 🏗️ Project Structure

\`\`\`
app/
├── (app)/           # Protected routes requiring authentication
├── (auth)/          # Authentication routes (login/register)
├── actions/         # Server actions for data fetching/mutations
├── api/             # API routes
├── globals.css      # Global styles
├── layout.tsx       # Root layout
└── page.tsx         # Root page (redirects to dashboard)

components/          # Reusable UI components
lib/                 # Utility functions and database client
utils/               # Helper functions
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Neon account)

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
DATABASE_URL=your_postgres_connection_string
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run database migrations:
   \`\`\`
   npm run migrate
   \`\`\`
4. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

## 🔐 Authentication System

The application uses a custom session-based authentication system:

- Sessions are stored in a database table and referenced via cookies
- Middleware handles route protection by checking for valid sessions
- Each user belongs to a company, and data is isolated by company_id

## 🏢 Multi-tenant Architecture

The application implements a robust multi-tenant architecture:

- Each company has its own isolated data
- All database queries include a `company_id` filter
- The session object includes the user's `company_id`
- Admin users can only manage users within their own company

## 🗂️ Database Structure

The database has these key tables:

- `companies`: Stores company information
- `users`: Users with company_id foreign key
- `customers`: Customer records with company_id foreign key
- `reports`: Reports linked to customers
- `customer_notes`: Notes for customers
- `customer_files`: Files associated with customers
- `sessions`: User sessions

## 🧩 Key Components

- **Sidebar**: Main navigation component
- **StatCard**: Dashboard statistics display
- **CustomerCalendar**: Custom date picker calendar
- **DateField**: Date input field with validation
- **ThemeToggle**: Dark/light mode toggle

## 🛣️ Routes Overview

### Public Routes
- `/login`: User login
- `/register`: Company and admin registration

### Protected Routes
- `/dashboard`: Main dashboard with statistics
- `/customers`: Customer list
- `/customers/[id]`: Customer details
- `/add-customer`: Add new customer
- `/edit-customer/[id]`: Edit customer
- `/manage-users`: User management (admin only)

## 🔄 Data Flow

1. User authenticates via login/register
2. Session is created and stored in database
3. Middleware checks session for protected routes
4. Server components fetch data server-side
5. Client components use server actions for mutations
6. Data is isolated by company_id for multi-tenant security

## 🔒 Security Considerations

The application implements several security measures:
- Password hashing with bcryptjs
- Session-based authentication
- Multi-tenant data isolation
- Input validation
- CSRF protection via form actions

## 🚧 Future Improvements

Potential enhancements for the application:
- Add pagination for large customer lists
- Implement more robust error boundaries
- Add more comprehensive form validation
- Enhance the file upload system with real storage
- Add more detailed activity logging
- Implement email notifications for upcoming deadlines
- Add more detailed reporting capabilities and visualizations

## 📝 License

[MIT](LICENSE)
