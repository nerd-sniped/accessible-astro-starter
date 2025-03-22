const fs = require('fs');
const path = require('path');
const { projects } = require('../src/config/projects');

/**
 * Rewrites relative image and file links to absolute GitHub URLs.
 * 
 * @param {string} markdown - The original markdown content
 * @param {string} repo - The GitHub repo string (e.g., yourusername/project)
 * @returns {string}
 */
function rewriteRelativeLinks(markdown, repo) {
  const rawBase = `https://raw.githubusercontent.com/${repo}/main/`;
  const blobBase = `https://github.com/${repo}/blob/main/`;

  return markdown
    // Replace relative image links: ![alt](./img.png)
    .replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g, (_match, alt, link) => {
      return `![${alt}](${rawBase}${link.replace(/^.\//, '')})`;
    })
    // Replace regular relative links: [text](./docs/info.md)
    .replace(/\[([^\]]+)\]\((?!http)([^)]+)\)/g, (_match, text, link) => {
      return `[${text}](${blobBase}${link.replace(/^.\//, '')})`;
    });
}

async function fetchReadmes() {
  const outputDir = path.resolve('./src/content/projects');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const project of projects) {
    const apiUrl = `https://api.github.com/repos/${project.repo}/readme`;
    const headers = {
      Accept: 'application/vnd.github.v3.raw',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(apiUrl, { headers });

    if (!res.ok) {
      console.error(`❌ Failed to fetch README from ${project.repo}: ${res.statusText}`);
      continue;
    }

    const markdown = await res.text();
    const rewritten = rewriteRelativeLinks(markdown, project.repo);

    const frontmatter =
      `---\n` +
      `title: "${project.title}"\n` +
      `repo: "https://github.com/${project.repo}"\n` +
      `tags: [${project.tags.map(tag => `"${tag}"`).join(', ')}]\n` +
      `---\n\n`;

    const fullContent = frontmatter + rewritten;
    const outputPath = path.join(outputDir, `${project.slug}.mdx`);

    fs.writeFileSync(outputPath, fullContent);
    console.log(`✅ Wrote ${project.slug}.mdx`);
  }
}

fetchReadmes();