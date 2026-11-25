import { notesContent } from '../content.js';

export const SITE_ORIGIN = 'https://amldecode.in';
export const DEFAULT_LASTMOD = '2026-11-25';

function slugifyTitle(title = '', fallbackIndex = 0) {
  const cleaned = String(title || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\$/g, ' and ')
    .replace(/\bvs\.?\b/g, ' vs ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return cleaned || `module-${fallbackIndex + 1}`;
}

function inferCategory(index, title = '') {
  const t = String(title).toLowerCase();
  if (t.includes('sanction') || t.includes('sdn') || t.includes('false hit') || t.includes('adverse media')) {
    return 'Sanctions & Screening';
  }
  if (t.includes('ubo') || t.includes('ownership') || t.includes('control') || t.includes('entity')) {
    return 'Beneficial Ownership & Entities';
  }
  if (t.includes('laundering') || t.includes('transaction monitoring') || t.includes('investigation') || t.includes('sar') || t.includes('str')) {
    return 'Transaction Monitoring & SAR';
  }
  if (t.includes('risk') || t.includes('pep')) {
    return 'Risk Assessment & PEP';
  }
  if (index < 6) {
    return 'KYC, AML & Due Diligence';
  }
  return 'KYC Lifecycle & Governance';
}

function summarizeModuleContent(content = '', title = '') {
  const normalized = String(content || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return `Practical AML and KYC study guide covering ${title} for financial crime compliance analysts.`;
  }
  if (normalized.length <= 155) return normalized;
  const cut = normalized.slice(0, 152);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}

export function buildModuleRegistry(modules = notesContent) {
  const list = Array.isArray(modules) ? modules : [];
  const usedSlugs = new Set();

  const entries = list.map((mod, idx) => {
    const moduleNumber = idx + 1;
    const moduleId = mod?.id || `aml-mod-${String(moduleNumber).padStart(2, '0')}`;
    const title = String(mod?.title || `AML Module ${moduleNumber}`).trim();
    const baseSlug = slugifyTitle(title, idx);
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    const category = mod?.category || inferCategory(idx, title);
    const routePath = `/notes/${slug}`;
    const canonicalUrl = `${SITE_ORIGIN}${routePath}`;
    const metaTitle = `${title} — AML & KYC Notes | AMLDecode`;
    const metaDescription = summarizeModuleContent(mod?.content, title);
    const lastModified = mod?.updatedAt || mod?.lastmod || DEFAULT_LASTMOD;

    return {
      index: idx,
      moduleNumber,
      id: moduleId,
      slug,
      title,
      category,
      routePath,
      canonicalUrl,
      legacyQueryUrl: `${SITE_ORIGIN}/?view=notes&module=${moduleNumber}`,
      metaTitle,
      metaDescription,
      lastModified,
      relatedModuleIds: [],
    };
  });

  // Populate up to 3 related module IDs per module (same category first, then adjacent)
  entries.forEach((entry, idx) => {
    const sameCat = entries
      .filter((other, otherIdx) => otherIdx !== idx && other.category === entry.category)
      .slice(0, 2)
      .map((m) => m.id);

    const neighbor = entries[idx + 1] || entries[idx - 1];
    const combined = Array.from(new Set([...sameCat, ...(neighbor ? [neighbor.id] : [])])).slice(0, 3);
    entry.relatedModuleIds = combined;
  });

  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const byIndex = new Map(entries.map((e) => [e.index, e]));
  const byId = new Map(entries.map((e) => [e.id, e]));

  return {
    entries,
    bySlug,
    byIndex,
    byId,
  };
}

export const MODULE_REGISTRY = buildModuleRegistry(notesContent);
export const MODULE_ENTRIES = MODULE_REGISTRY.entries;
export const MODULE_BY_SLUG = MODULE_REGISTRY.bySlug;
export const MODULE_BY_INDEX = MODULE_REGISTRY.byIndex;
export const MODULE_BY_ID = MODULE_REGISTRY.byId;