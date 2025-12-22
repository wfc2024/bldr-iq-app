# Backend Integration Guide

This app is currently set up with a framework for user authentication and database integration. All the abstraction layers are in place to make future integration easy.

## Current State

The app currently uses:
- **Local Storage** for data persistence (projects stored in browser)
- **Mock Authentication** (guest user mode by default)
- **Service Layer Pattern** to abstract all data operations

## Architecture

### 1. Services (`/services`)

**authService.ts** - Handles user authentication
- `getCurrentUser()` - Get logged in user
- `login()` - Sign in user
- `signup()` - Create new account
- `logout()` - Sign out user
- `updateProfile()` - Update user info

**dataService.ts** - Handles project data
- `getProjects(userId)` - Get all projects for a user
- `getProject(projectId, userId)` - Get single project
- `saveProject(project)` - Create or update project
- `deleteProject(projectId, userId)` - Delete project
- `getProjectStats(userId)` - Get user statistics

### 2. Context (`/contexts`)

**AuthContext.tsx** - React context for user state
- Provides user info to all components
- Manages authentication state
- Wraps the entire app

### 3. Components

**AuthModal.tsx** - Login/Signup UI
**UserMenu.tsx** - User profile dropdown

## Integration with Supabase (or other backend)

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Update authService.ts

Replace mock implementations with real Supabase calls:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

async login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata.name,
    createdAt: data.user.created_at,
  };
}

// Update other methods similarly...
```

### Step 3: Update dataService.ts

Replace localStorage with Supabase database queries:

```typescript
async getProjects(userId?: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async saveProject(project: Project): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .upsert(project)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update other methods similarly...
```

### Step 4: Set Up Database Schema

Create the following table in Supabase:

```sql
-- Users table (auto-created by Supabase Auth)

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  address TEXT NOT NULL,
  gc_markup_percentage DECIMAL NOT NULL,
  line_items JSONB NOT NULL,
  subtotal DECIMAL NOT NULL,
  grand_total DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,
  notes TEXT,
  CONSTRAINT valid_status CHECK (status IN ('Draft', 'Active', 'Completed', 'Archived'))
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 5: Environment Variables

Create a `.env` file (not included in version control):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Alternative Backends

The service layer pattern works with any backend:

### REST API
Replace service methods with `fetch()` calls to your API endpoints

### GraphQL
Replace service methods with GraphQL queries/mutations

### Firebase
Replace with Firebase Auth and Firestore

## Data Migration

To migrate existing localStorage data to a backend:

```typescript
// One-time migration script
const migrateLocalDataToBackend = async () => {
  const localProjects = JSON.parse(localStorage.getItem("projects") || "[]");
  
  for (const project of localProjects) {
    await dataService.saveProject({
      ...project,
      userId: currentUser.id
    });
  }
  
  // Clear local storage after migration
  localStorage.removeItem("projects");
};
```

## Security Notes

⚠️ **Important**: This demo app is not suitable for production use as-is:

- Figma Make is for prototyping, not production apps
- Do not collect PII (Personally Identifiable Information)
- Do not store sensitive construction project data
- Always use HTTPS in production
- Implement proper authentication and authorization
- Validate all user inputs on the backend
- Use environment variables for API keys
- Set up proper CORS policies
- Implement rate limiting
- Add proper error handling and logging

## Testing the Integration

1. Create a test Supabase project
2. Update both service files
3. Set up the database schema
4. Test authentication flow
5. Test project CRUD operations
6. Verify row-level security works
7. Test on different devices to confirm cloud sync

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
