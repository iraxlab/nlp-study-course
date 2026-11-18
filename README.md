# NLP Study Course

Practitioner-level study notes on Neuro-Linguistic Programming. It covers frames and principles, communication, emotional mastery, behavioural change and belief change. Each chapter has key takeaways, scripts, practice tasks you can tick off, and a self-test.

It's a plain static website: HTML, CSS, a little JavaScript, and one Markdown file per page. There's no build step and nothing to install.

## Put it on GitHub Pages

1. Create a new repository on GitHub, for example `nlp-study-course`.
2. Upload everything in this folder, including the hidden `.nojekyll` file. You can drag and drop the files on the repo page, or use git:
   ```bash
   git init
   git add .
   git commit -m "NLP study course"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/nlp-study-course.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, pick the **main** branch and the **/ (root)** folder, then click **Save**.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/nlp-study-course/`.

## Preview it on your computer

Browsers block the page files when you just double-click `index.html`, so run a tiny local server from this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add more knowledge

1. Copy `content/my-notes/_template.md` to a new file, such as `content/my-notes/timeline-therapy.md`, and write your notes in Markdown.
2. Add the page to `content/manifest.json`, under an existing module or in a new one:
   ```json
   { "id": "timeline-therapy", "title": "Timeline Therapy", "file": "content/my-notes/timeline-therapy.md" }
   ```
3. Commit and push.

New pages show up in the menu and in search automatically. The site's own page **My Notes → How to add your own notes** shows the coloured boxes, tick-box tasks and self-test questions you can copy.

## The PDF Library

The menu has a **PDF Library** page that links to the original course PDFs in the `pdfs/` folder: the full workbook (also split into two parts) and the slides for each technique.

These PDFs are the course's own material and include its branding and trainer details. Keep the repository **private** so you're not republishing paid course content. GitHub Pages works on private repositories with a paid plan (GitHub Pro or Team). On a free account, either leave the `pdfs/` folder out of a public repo or keep the whole site private and preview it locally.

## Folder layout

```
index.html                 the site shell
assets/style.css           look and feel (light and dark mode)
assets/app.js              menu, search, progress, tick boxes
content/manifest.json      the menu: modules and pages, in order
content/course/            the 32 course chapters plus reference pages
content/my-notes/          your own pages and the template
content/pdfs/library.md    the PDF Library page
pdfs/                      the course PDFs
```

## Features

- Menu by module, with previous/next buttons
- Search across every page (press `/` to jump to the search box)
- Practice-task tick boxes and a "Mark as studied" button. Progress is saved in your browser.
- Self-test answers hidden behind **Show answer**
- Light and dark mode, works on phones, prints cleanly

## Note

These are study notes, not a replacement for supervised training. Techniques that touch trauma, depression, PTSD, eating disorders or other mental health conditions belong with a qualified professional.
