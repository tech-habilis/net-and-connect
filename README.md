# Net & Connect - Hub Padel Management

A modern web application for managing padel club members and events, built with Next.js, NextAuth.js, and shadcn/ui.

## Features

- 🔐 **Magic Link Authentication** - Secure login via email without passwords
- 👥 **Member Management** - View and manage club members with contact information
- 📅 **Event Management** - Upcoming events display with search functionality
- 🎨 **Modern UI** - Beautiful design matching the Net & Connect brand
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔒 **Protected Routes** - Session-based authentication and route protection

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5 (Beta) with magic link email provider
- **UI Components**: shadcn/ui with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Type Safety**: TypeScript
- **Architecture**: SOLID principles with clean code practices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Email provider (Gmail, SendGrid, etc.) for magic links

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**

   Update `.env.local` with your email provider settings:

   ```env
   # Authentication
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # Email Configuration for Magic Links
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── actions/           # Server actions
├── components/        # React components
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard components
│   └── ui/           # shadcn/ui components
├── lib/              # Utilities and configurations
├── services/         # Business logic services
└── types/            # TypeScript type definitions

app/
├── api/auth/         # NextAuth API routes
├── dashboard/        # Dashboard pages
├── signin/           # Sign-in page
└── verify-request/   # Email verification page
```

## Architecture

This project follows SOLID principles and clean code practices with:

- Service layer for business logic
- Server actions for form handling
- Component composition
- Type-safe interfaces

---

Built with ❤️ for the padel community
