# How to add your own notes

<p class='subtitle'>This course is built to grow. Every page is a plain Markdown file, so adding knowledge takes two steps.</p>

## 1. Write a page

Copy `content/my-notes/_template.md`, rename it (for example `content/my-notes/timeline-therapy.md`) and write your notes. Plain Markdown works:

- `#` for the page title, `##` and `###` for headings
- `**bold**`, `*italic*`, lists with `-` or `1.`
- Tables with `| col | col |`

You can also use the same coloured boxes as the course chapters:

<div class='box key'><div class='box-title'>Key Takeaway</div><p>Copy this green box for the main point of a page.</p></div>

<div class='box extra'><div class='box-title'>Going deeper</div><p>Purple box: research, history or extra reading.</p></div>

<div class='box todo'><div class='box-title'>Practice tasks</div><label class='task'><input type='checkbox'> <span>Red box: tasks with tick boxes. Ticks are saved in your browser.</span></label></div>

<div class='box exam'><div class='box-title'>Self-test</div><ul><li>Blue box: questions. Put the answer at the end in brackets and italics and it becomes a "Show answer" button. <i>(Like this)</i></li></ul></div>

## 2. List it in the menu

Open `content/manifest.json` and add a line to the module where it belongs, or make a new module:

```json
{
  "title": "Timeline Techniques",
  "pages": [
    { "id": "timeline-therapy", "title": "Timeline Therapy", "file": "content/my-notes/timeline-therapy.md" }
  ]
}
```

The `id` becomes the web address (`#/timeline-therapy`), so keep it short, lowercase, with dashes and no spaces. Every id must be different.

Commit and push. GitHub Pages updates in about a minute, and the new page appears in the menu and in search.

<div class='box fact'><div class='box-title'>Tip</div><p>Commas matter in <code>manifest.json</code>. If the site shows "Couldn't load the course" after an edit, paste the file into a JSON checker to find the missing or extra comma.</p></div>
