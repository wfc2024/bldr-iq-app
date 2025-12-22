# BLDR IQ Deployment Guide
## Easiest Path: GitHub → Netlify → GoDaddy Embed

---

## Prerequisites

Before you begin, create free accounts at:
- [ ] [GitHub](https://github.com) - For code hosting
- [ ] [Netlify](https://netlify.com) - For app hosting & deployment
- [ ] [Supabase](https://supabase.com) - For database & authentication (optional but recommended)

---

## Phase 1: Export from Figma Make

### Step 1: Download Your Project Files
1. In Figma Make, click the **menu icon** (three dots) in the top right
2. Select **"Export Project"** or **"Download Code"**
3. Save the ZIP file to your computer
4. **Extract the ZIP** to a folder (e.g., `bldr-iq-app`)

### Step 2: Verify Your Files
Your extracted folder should contain:
```
bldr-iq-app/
├── App.tsx
├── components/
├── services/
├── context/
├── data/
├── styles/
├── package.json
├── index.html
├── vite.config.ts (or similar)
└── ... other files
```

---

## Phase 2: Prepare for Deployment

### Step 3: Create Package Configuration (if missing)

If you don't have a `package.json`, create one in the root folder with this content:

```json
{
  "name": "bldr-iq-budget-builder",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "latest",
    "recharts": "^2.12.7",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2",
    "tailwindcss": "^4.0.0",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@types/papaparse": "^5.3.14",
    "typescript": "^5.5.3"
  }
}
```

### Step 4: Create Build Configuration

Create a file named `vite.config.ts` in your root folder (if not present):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
```

### Step 5: Create Netlify Configuration

Create a file named `netlify.toml` in your root folder:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

This ensures:
- Netlify knows how to build your app
- React Router works correctly (SPA redirect)
- Uses Node.js version 18

### Step 6: Create .gitignore File

Create a file named `.gitignore` in your root folder:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Logs
*.log

# Editor directories
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
```

---

## Phase 3: Set Up GitHub Repository

### Step 7: Create New Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in details:
   - **Repository name**: `bldr-iq-budget-builder`
   - **Description**: "Budget Builder for Construction Projects"
   - **Visibility**: Choose **Private** (recommended) or Public
   - **DO NOT** check "Initialize with README" (you have files already)
4. Click **"Create repository"**

### Step 8: Upload Your Code to GitHub

**Option A: Using GitHub Desktop (Easiest for Beginners)**

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in with your GitHub account
3. Click **"File"** → **"Add Local Repository"**
4. Select your `bldr-iq-app` folder
5. If it says "not a git repository", click **"Create a repository here"**
6. Click **"Publish repository"** button
7. Select your GitHub account and click **"Publish"**

**Option B: Using Command Line (For Developers)**

1. Open Terminal/Command Prompt
2. Navigate to your project folder:
   ```bash
   cd path/to/bldr-iq-app
   ```
3. Initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - BLDR IQ Budget Builder"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bldr-iq-budget-builder.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

### Step 9: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files listed
3. Confirm you see: `App.tsx`, `package.json`, `netlify.toml`, etc.

---

## Phase 4: Deploy to Netlify

### Step 10: Connect Netlify to GitHub

1. Go to [Netlify](https://netlify.com) and sign up/log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub (if first time)
5. Select your repository: `bldr-iq-budget-builder`

### Step 11: Configure Build Settings

Netlify should auto-detect your settings from `netlify.toml`, but verify:

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Step 12: Add Environment Variables (If Using Supabase)

If you've integrated Supabase:

1. Click **"Show advanced"** → **"New variable"**
2. Add these variables:
   - **Key**: `VITE_SUPABASE_URL`  
     **Value**: Your Supabase project URL (from Supabase dashboard)
   - **Key**: `VITE_SUPABASE_ANON_KEY`  
     **Value**: Your Supabase anon/public key (from Supabase dashboard)

### Step 13: Deploy!

1. Click **"Deploy site"** button
2. Netlify will:
   - Clone your code from GitHub
   - Install dependencies
   - Run the build command
   - Publish your site
3. Wait 2-5 minutes for deployment (watch the build logs)

### Step 14: Get Your App URL

Once deployed:
1. You'll see a random URL like: `random-name-123456.netlify.app`
2. Click **"Site settings"** → **"Change site name"**
3. Choose a custom name: `bldriq-budget` → becomes `bldriq-budget.netlify.app`
4. Visit your live app! 🎉

---

## Phase 5: Custom Domain (Optional)

### Step 15: Add Your GoDaddy Domain

If you want `app.yourdomain.com` instead of `bldriq-budget.netlify.app`:

**In Netlify:**
1. Go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter: `app.yourdomain.com` (or `budget.yourdomain.com`)
4. Netlify will show you DNS records to add

**In GoDaddy:**
1. Log into GoDaddy
2. Go to **"My Products"** → **"DNS"** for your domain
3. Click **"Add"** → **"CNAME"**
   - **Name**: `app` (or `budget`)
   - **Value**: `bldriq-budget.netlify.app`
   - **TTL**: 1 hour
4. Click **"Save"**

**Wait 10-60 minutes** for DNS to propagate. Then visit `app.yourdomain.com`!

---

## Phase 6: Embed on GoDaddy Website

### Step 16: Create Embed Code

Choose one of these methods:

**Method A: Full-Screen iFrame (Dedicated Page)**

Create a new page on your GoDaddy site (e.g., `budget-tool.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BLDR IQ Budget Builder</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100vh;
      border: none;
    }
  </style>
</head>
<body>
  <iframe 
    src="https://bldriq-budget.netlify.app"
    title="BLDR IQ Budget Builder"
    loading="lazy"
  ></iframe>
</body>
</html>
```

**Method B: Embedded Section (In Existing Page)**

Add this to your existing GoDaddy page where you want the app:

```html
<div style="width: 100%; max-width: 1400px; margin: 0 auto;">
  <iframe 
    src="https://bldriq-budget.netlify.app"
    width="100%"
    height="900px"
    style="border: 2px solid #1B2D4F; border-radius: 8px;"
    title="BLDR IQ Budget Builder"
    loading="lazy"
  ></iframe>
</div>
```

**Method C: Popup/Modal Button**

Add a button that opens the app in a modal:

```html
<button onclick="openBudgetBuilder()" style="background: #F7931E; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 18px; cursor: pointer;">
  Launch Budget Builder
</button>

<div id="budgetModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999;">
  <div style="position: relative; width: 95%; height: 95%; margin: 2.5% auto; background: white; border-radius: 10px; overflow: hidden;">
    <button onclick="closeBudgetBuilder()" style="position: absolute; top: 10px; right: 10px; background: #1B2D4F; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; z-index: 10000;">
      Close
    </button>
    <iframe 
      src="https://bldriq-budget.netlify.app"
      width="100%"
      height="100%"
      style="border: none;"
      title="BLDR IQ Budget Builder"
    ></iframe>
  </div>
</div>

<script>
  function openBudgetBuilder() {
    document.getElementById('budgetModal').style.display = 'block';
  }
  function closeBudgetBuilder() {
    document.getElementById('budgetModal').style.display = 'none';
  }
</script>
```

### Step 17: Upload to GoDaddy

**Via GoDaddy Website Builder:**
1. Edit your page
2. Add an **"HTML"** or **"Embed"** block
3. Paste your chosen embed code
4. Save and publish

**Via File Manager/cPanel:**
1. Log into GoDaddy hosting
2. Open File Manager
3. Navigate to your site's folder
4. Edit your HTML file
5. Paste the embed code where you want it
6. Save the file

---

## Phase 7: Testing & Optimization

### Step 18: Test Your Deployment

Visit your app and test:
- [ ] App loads correctly
- [ ] All features work (create project, add line items, etc.)
- [ ] Authentication works (if integrated)
- [ ] Data persists (refresh page and check)
- [ ] Works on mobile devices
- [ ] Works in different browsers (Chrome, Safari, Firefox)

### Step 19: Set Up Supabase (If Not Done)

If you're still using localStorage:
1. Follow the Supabase integration guide (in your app documentation)
2. Add environment variables to Netlify (Step 12)
3. Trigger a re-deploy: Go to Netlify → **"Deploys"** → **"Trigger deploy"**

---

## Phase 8: Automatic Updates

### Step 20: How to Update Your App

The beauty of this setup: **Every change you push to GitHub automatically deploys!**

**Using GitHub Desktop:**
1. Make changes to your code locally
2. Open GitHub Desktop
3. Review changes in the left panel
4. Write a commit message (e.g., "Added export feature")
5. Click **"Commit to main"**
6. Click **"Push origin"**
7. Netlify automatically detects the change and rebuilds your site (2-5 minutes)

**Using Command Line:**
```bash
git add .
git commit -m "Your update message"
git push
```

**Monitor Deployment:**
1. Go to Netlify dashboard
2. Click **"Deploys"** tab
3. Watch the build progress
4. Once "Published", your changes are live!

---

## Troubleshooting

### Build Fails on Netlify

**Check build logs:**
1. Netlify → Deploys → Click the failed deploy
2. Read the error message

**Common issues:**
- **Missing dependencies**: Make sure all packages are in `package.json`
- **TypeScript errors**: Fix any type errors in your code
- **Environment variables**: Ensure all required vars are set in Netlify

### App Shows Blank Page

- Check browser console (F12) for errors
- Verify `netlify.toml` has the redirect rule
- Check that build output is in `dist` folder

### Data Not Persisting

- If using localStorage: Data is device-specific (expected)
- If using Supabase: Check environment variables are set
- Check browser console for API errors

### iFrame Not Loading on GoDaddy

- Ensure GoDaddy allows iframes (some builders restrict them)
- Check browser console for CORS or X-Frame-Options errors
- Try the popup modal method instead

---

## Security Checklist

Before going live:
- [ ] Enable HTTPS (Netlify does this automatically)
- [ ] Set up Supabase Row Level Security (RLS) policies
- [ ] Never commit API keys to GitHub (use environment variables)
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Test authentication thoroughly
- [ ] Set up Supabase rate limiting

---

## Performance Optimization

### Enable Netlify Features:
1. **Asset Optimization**: Netlify → Site settings → Build & deploy → Asset optimization → Enable all
2. **Forms** (if you add contact forms): Netlify handles spam protection
3. **Analytics** (paid): Track usage

### Lighthouse Score:
1. Open your app in Chrome
2. Press F12 → Lighthouse tab
3. Click "Generate report"
4. Aim for 90+ in all categories

---

## Maintenance

### Regular Tasks:
- **Weekly**: Check Netlify deploy status
- **Monthly**: Update dependencies in `package.json`
- **Quarterly**: Review Supabase storage/usage
- **Yearly**: Renew domain (GoDaddy will remind you)

### Monitoring:
- Set up Netlify deploy notifications (email/Slack)
- Monitor Supabase dashboard for errors
- Check Google Analytics (if implemented)

---

## Cost Breakdown

- **GitHub**: Free for public/private repos
- **Netlify**: 
  - Free tier: 100GB bandwidth/month, 300 build minutes/month
  - More than enough for small-medium traffic
  - Paid: $19/month for pro features
- **Supabase**:
  - Free tier: 500MB database, 50,000 monthly active users
  - Paid: $25/month for more storage/usage
- **GoDaddy**: 
  - Your existing hosting plan (already paid)
  - Domain: ~$12-20/year

**Total cost to start: $0** ✨

---

## Next Steps After Deployment

1. **Get Feedback**: Share with 5-10 beta users
2. **Monitor Usage**: Check Netlify analytics
3. **Iterate**: Based on feedback, make improvements
4. **Market**: Add SEO, social sharing, etc.
5. **Scale**: Upgrade Netlify/Supabase if needed

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://answers.netlify.com
- **GitHub Docs**: https://docs.github.com
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev

---

## Questions?

Common questions:

**Q: Can I use a different hosting service?**  
A: Yes! Vercel, Cloudflare Pages, AWS Amplify all work similarly.

**Q: What if I want to move away from Netlify later?**  
A: Your code is on GitHub. You can deploy to any service anytime.

**Q: Will this handle 1000+ simultaneous users?**  
A: Netlify's free tier handles this easily. Supabase free tier handles 50k monthly active users.

**Q: Can I keep the app completely private?**  
A: Yes! Set GitHub repo to private, add password protection in Netlify settings.

**Q: What about GDPR/data privacy?**  
A: Supabase is EU-compliant. Add a privacy policy and cookie notice to your site.

---

## Summary of URLs You'll Have

After completing this guide:

- **GitHub**: `https://github.com/YOUR_USERNAME/bldr-iq-budget-builder`
- **Netlify**: `https://bldriq-budget.netlify.app`
- **Custom Domain** (optional): `https://app.yourdomain.com`
- **Embedded on GoDaddy**: `https://yourdomain.com/budget-tool.html`

---

## Final Checklist

- [ ] Phase 1: Files exported from Figma Make
- [ ] Phase 2: Configuration files created
- [ ] Phase 3: Code uploaded to GitHub
- [ ] Phase 4: Deployed to Netlify
- [ ] Phase 5: Custom domain set up (optional)
- [ ] Phase 6: Embedded on GoDaddy website
- [ ] Phase 7: Fully tested
- [ ] Phase 8: Automatic updates working

---

**🎉 Congratulations! Your BLDR IQ Budget Builder is now live!**

---

*Last Updated: November 28, 2025*
