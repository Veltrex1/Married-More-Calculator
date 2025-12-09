# MarriedMore Calculator

A beautiful calculator to find the date when you've been married more than not - the day you've officially spent more of your life married than unmarried.

## Features

- **Basic Calculator**: Simple date-based calculation
- **Advanced Calculator**: Precise datetime calculation with support for both partners
- Beautiful, modern UI with animations
- Fully responsive design

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI components

## Local Development

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### First Time Setup

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect the Next.js configuration
   - Click "Deploy"

3. **Get Your URL**:
   - After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Subsequent Deployments

Vercel automatically deploys on every push to your main branch. Just commit and push your changes:

```bash
git add .
git commit -m "Your changes"
git push
```

## Embedding in Shopify

This calculator is configured to work as an embedded iframe in Shopify stores.

### Steps to Embed:

1. **In Shopify Admin**:
   - Go to: Online Store → Pages → Add page
   - Create a new page (e.g., "MarriedMore Calculator")

2. **Add Custom HTML**:
   - In the page editor, add a "Custom Liquid" or "Custom HTML" block
   - Insert the following code:

   ```html
   <div style="width: 100%; max-width: 1200px; margin: 0 auto;">
     <iframe 
       src="https://YOUR-VERCEL-URL.vercel.app"
       width="100%" 
       height="1200px"
       frameborder="0"
       style="border: none; overflow: hidden;"
       scrolling="no"
     ></iframe>
   </div>

   <script>
     // Auto-resize iframe based on content
     window.addEventListener('message', function(e) {
       if (e.data.height) {
         document.querySelector('iframe').style.height = e.data.height + 'px';
       }
     });
   </script>
   ```

3. **Replace `YOUR-VERCEL-URL`** with your actual Vercel deployment URL

4. **Save and Publish** the page in Shopify

## Project Structure

```
.
├── web/                    # Next.js application
│   ├── app/
│   │   ├── married-more/  # Calculator page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage (shows calculator)
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   └── ui/            # UI components (buttons, cards, etc.)
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   └── package.json
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## Configuration

The app is configured for iframe embedding:
- `X-Frame-Options: ALLOWALL` header allows embedding in any domain
- Responsive design adapts to different screen sizes
- Clean, modern UI optimized for e-commerce stores

## License

Private project
