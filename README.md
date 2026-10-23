# firmanains.github.io

Personal site of Firman Aulia Insani. Plain HTML + CSS + a few lines of JS — no build step.

```
index.html          the page
style.css           gruvbox terminal theme, boot/typing animations
script.js           uptime, tmux clock + active window, interactive prompt
.nojekyll           tells GitHub Pages to serve files as-is
```

## Deploy to GitHub Pages (free)

1. Create a **public** repository named exactly `firmanains.github.io`
   (it must match your GitHub username; if the username differs, name it `<username>.github.io`).
2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial personal site"
   git branch -M main
   git remote add origin git@github.com:firmanains/firmanains.github.io.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root)**.
4. Wait a minute, then open <https://firmanains.github.io>.

Every later `git push` to `main` redeploys automatically.

## Editing

- Content lives directly in `index.html`; sections are marked with `<!-- ===== -->` comments.
- Colours are Gruvbox tokens at the top of `style.css`.
- To add a case study: add a line to the `ls -l` list and copy one `<article class="md">` block. To add a project: copy one `<li>` in the `tree`.
