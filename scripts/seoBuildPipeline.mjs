import fs from 'fs';
import path from 'path';
import { notesContent } from '../src/content.js';
import { MODULE_ENTRIES, SITE_ORIGIN, DEFAULT_LASTMOD } from '../src/data/moduleRegistry.js';

const distDir = path.resolve('dist');
const publicDir = path.resolve('public');

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSitemapXml() {
  const staticPublicUrls = [
    { loc: `${SITE_ORIGIN}/`, lastmod: DEFAULT_LASTMOD, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/notes`, lastmod: DEFAULT_LASTMOD, changefreq: 'weekly', priority: '0.9' },
  ];

  const moduleUrls = MODULE_ENTRIES.map((entry) => ({
    loc: entry.canonicalUrl,
    lastmod: entry.lastModified || DEFAULT_LASTMOD,
    changefreq: 'weekly',
    priority: '0.85',
  }));

  const allUrls = [...staticPublicUrls, ...moduleUrls];
  const xmlItems = allUrls
    .map(
      (u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</urlset>\n`;
}

function injectPrerenderedModuleHtml(templateHtml, entry, rawContent = '') {
  const paragraphs = String(rawContent || '')
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 6);

  const bodyHtml = paragraphs
    .map((p) => `        <p>${escapeHtml(p)}</p>`)
    .join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        name: entry.title,
        description: entry.metaDescription,
        url: entry.canonicalUrl,
        educationalLevel: 'Intermediate',
        about: entry.category,
        isPartOf: {
          '@type': 'WebSite',
          name: 'AMLDecode',
          url: `${SITE_ORIGIN}/`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Notes', item: `${SITE_ORIGIN}/notes` },
          { '@type': 'ListItem', position: 3, name: entry.title, item: entry.canonicalUrl },
        ],
      },
    ],
  });

  const ssrBlock = `\n    <main id="amldecode-prerender-content" data-module-slug="${escapeHtml(entry.slug)}">\n      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/notes">Notes</a> / <span>${escapeHtml(entry.title)}</span></nav>\n      <article>\n        <h1>${escapeHtml(entry.title)}</h1>\n        <p><strong>Category:</strong> ${escapeHtml(entry.category)}</p>\n${bodyHtml}\n      </article>\n    </main>\n    <script type="application/ld+json" id="amldecode-module-ld">${jsonLd}</script>`;

  let out = templateHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(entry.metaTitle)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(entry.metaDescription)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(entry.canonicalUrl)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(entry.metaTitle)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(entry.metaDescription)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:url" content="${escapeHtml(entry.canonicalUrl)}" />`);

  if (/<div id="root"><\/div>/i.test(out)) {
    out = out.replace(/<div id="root"><\/div>/i, `<div id="root"></div>${ssrBlock}`);
  } else {
    out = out.replace(/<\/body>/i, `${ssrBlock}\n  </body>`);
  }

  return out;
}

const sitemapXml = buildSitemapXml();
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');

  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const templateHtml = fs.readFileSync(indexPath, 'utf8');

    // Prerender /notes index
    const notesIndexDir = path.join(distDir, 'notes');
    fs.mkdirSync(notesIndexDir, { recursive: true });
    const indexLinks = MODULE_ENTRIES.map(
      (m) => `        <li><a href="${escapeHtml(m.routePath)}">${escapeHtml(m.title)}</a></li>`
    ).join('\n');
    const notesIndexHtml = templateHtml
      .replace(/<title>[\s\S]*?<\/title>/i, '<title>AML &amp; KYC Study Notes — 34 Learning Modules | AMLDecode</title>')
      .replace(/<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${SITE_ORIGIN}/notes" />`)
      .replace(
        /<div id="root"><\/div>/i,
        `<div id="root"></div>\n    <main id="amldecode-prerender-notes"><h1>AML &amp; KYC Study Notes</h1><ul>\n${indexLinks}\n</ul></main>`
      );
    fs.writeFileSync(path.join(notesIndexDir, 'index.html'), notesIndexHtml, 'utf8');

    // Prerender all 34 /notes/<slug> pages
    MODULE_ENTRIES.forEach((entry) => {
      const modObj = notesContent[entry.index] || {};
      const outDir = path.join(distDir, 'notes', entry.slug);
      fs.mkdirSync(outDir, { recursive: true });
      const html = injectPrerenderedModuleHtml(templateHtml, entry, modObj.content || '');
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    });
  }
}

console.log(`Generated sitemap.xml (${MODULE_ENTRIES.length} modules + core routes) and prerendered ${MODULE_ENTRIES.length} /notes/<slug> HTML pages.`);