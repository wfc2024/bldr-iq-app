# Authentication Framework Setup

This document explains the authentication and user management framework that has been implemented in your BLDR IQ app.

## What Was Added

### 1. **Type Definitions** (`/types/user.ts`)
- `User` interface: Defines user profile structure
- `AuthState` interface: Tracks authentication state
- `Project` type updated with optional `userId` field

### 2. **Services Layer**

#### Auth Service (`/services/authService.ts`)
Mock authentication service that handles:
- `getCurrentUser()` - Get current logged-in user
- `signup()` - Create new user account
- `login()` - Authenticate existing user
- `logout()` - Log out current user
- `updateProfile()` - Update user information

**Current Implementation:** Uses localStorage
**Future Integration:** Replace methods with Supabase calls

#### Data Service (`/services/dataService.ts`)
Abstracts all project data operations:
- `getProjects(userId)` - Get all projects for a user
- `getProject(projectId, userId)` - Get single project
- `saveProject(project)` - Save/update project
- `deleteProject(projectId, userId)` - Delete project
- `getProjectStats(userId)` - Get user statistics

**Current Implementation:** Uses localStorage with `bldriq_projects` key
**Future Integration:** Replace localStorage with Supabase database queries

### 3. **React Context** (`/contexts/AuthContext.tsx`)
Provides authentication state throughout the app:
- `user` - Current user object
- `isAuthenticated` - Boolean flag
- `isLoading` - Loading state
- `login()`, `signup()`, `logout()`, `updateProfile()` methods

Usage:
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### 4. **UI Components**

#### AuthModal (`/components/AuthModal.tsx`)
- Login/Signup modal with tabs
- Form validation
- Error handling
- Currently creates mock accounts

#### UserMenu (`/components/UserMenu.tsx`)
- User avatar dropdown in header
- Shows user name and email
- Logout option
- Sign in button for guests

### 5. **Data Migration** (`/utils/dataMigration.ts`)
- Migrates old localStorage data (`projects` key) to new format (`bldriq_projects` key)
- Adds `userId: "guest-user-1"` to existing projects
- Runs automatically on app startup

### 6. **Updated Components**
- **App.tsx**: Wrapped in `AuthProvider`, added `UserMenu`, runs migration
- **ProjectsTab.tsx**: Uses `dataService` instead of direct localStorage
- **BudgetBuilderTab.tsx**: Uses `dataService` and associates projects with users

## Current Behavior

### Guest Mode
- App auto-logs in as "Guest User" on first visit
- All projects are stored locally
- No authentication required
- Perfect for prototyping and demos

### Account Creation (Mock)
- Users can create accounts (stored in localStorage)
- Login/logout functionality works
- Projects are associated with user accounts
- **Note:** This is demo-only, not secure for production

## How to Integrate with Supabase

When you're ready to add real authentication and database:

### 1. Set Up Supabase Project
1. Create account at supabase.com
2. Create new project
3. Get your project URL and anon key

### 2. Update Auth Service (`/services/authService.ts`)

Replace mock methods with Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async signup(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data.user;
}

async login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data.user;
}

async logout() {
  await supabase.auth.signOut();
}
```

### 3. Update Data Service (`/services/dataService.ts`)

Replace localStorage with Supabase database:

```typescript
async getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async saveProject(project: Project) {
  const { data, error } = await supabase
    .from('projects')
    .upsert(project)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async deleteProject(projectId: string, userId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);
  
  if (error) throw error;
}
```

### 4. Create Database Schema

In Supabase SQL editor:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  project_name TEXT NOT NULL,
  address TEXT NOT NULL,
  gc_markup_percentage DECIMAL NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL NOT NULL DEFAULT 0,
  grand_total DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Draft',
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Install Supabase Package

```bash
npm install @supabase/supabase-js
```

## Security Notes

⚠️ **IMPORTANT:** The current implementation is for PROTOTYPING ONLY:
- localStorage is not secure
- No encryption
- No server-side validation
- Not suitable for production or real user data

When you integrate Supabase:
- Use environment variables for API keys
- Enable Row Level Security
- Don't collect PII without proper security measures
- Consider deploying to a production environment

## Benefits of This Architecture

1. **Easy to swap backends** - Services abstract storage logic
2. **Type-safe** - Full TypeScript support
3. **Testable** - Services can be mocked for testing
4. **Scalable** - Ready for real database integration
5. **User-friendly** - Works in guest mode without requiring login

## Questions?

This framework is designed to make future integration straightforward. When you're ready to add Supabase or another backend:
1. Keep the service interfaces the same
2. Replace the implementation inside each method
3. Your components don't need to change!
