import fs from 'node:fs';
import path from 'node:path';

const articleChannels = ['gitblog', 'blogger'];

function stripNonArticleText(text, channel) {
  let value = text.replace(/<!--[\s\S]*?-->/g, '');
  if (channel === 'gitblog') {
    // Do not count examples in fenced code as rendered NewsFigure components.
    value = value.replace(/^\s*(```|~~~)[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '');
  }
  return value;
}

function quotedAttribute(attributes, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = attributes.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`));
  return match ? (match[1] ?? match[2]) : null;
}

function collectGitBlogIds(text, issues) {
  const source = stripNonArticleText(text, 'gitblog');
  const ids = [];
  const tags = [...source.matchAll(/<NewsFigure\b([^>]*)\/?>/g)];
  for (const [index, tag] of tags.entries()) {
    const id = quotedAttribute(tag[1], 'media');
    if (!id || /[{}]/.test(id)) issues.push(`gitblog NewsFigure[${index}] must have a literal media ID`);
    else ids.push(id);
  }
  if (/<img\b/i.test(source) || /!\[[^\]]*\]\([^)]*\)/.test(source))
    issues.push('gitblog contains an image outside a literal NewsFigure media ID');
  if (source.includes('<NewsFigure') && tags.length === 0)
    issues.push('gitblog contains an unidentified or dynamic NewsFigure');
  return ids;
}

function collectBloggerIds(text, issues) {
  const source = stripNonArticleText(text, 'blogger');
  const figures = [...source.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure\s*>/gi)];
  const ids = [];
  let figureImageCount = 0;
  for (const [index, figure] of figures.entries()) {
    const body = figure[2];
    const images = [...body.matchAll(/<img\b([^>]*)\/?>/gi)];
    if (!images.length) continue;
    figureImageCount += images.length;
    const id = quotedAttribute(figure[1], 'id');
    const mediaId = quotedAttribute(figure[1], 'data-media-id');
    if (!id || !mediaId || id !== mediaId)
      issues.push(`blogger figure[${index}] with img must have matching literal id and data-media-id`);
    else ids.push(id);
    if (images.length !== 1) issues.push(`blogger figure[${index}] must contain exactly one img`);
    for (const [imageIndex, image] of images.entries()) {
      const src = quotedAttribute(image[1], 'src');
      if (!src || /[{}]/.test(src))
        issues.push(`blogger figure[${index}].img[${imageIndex}] must have a literal src`);
    }
  }
  const allImages = [...source.matchAll(/<img\b/gi)].length;
  if (allImages !== figureImageCount) issues.push('blogger contains an img outside an identified figure');
  return ids;
}

function duplicateIds(ids) {
  return new Set(ids).size !== ids.length;
}

function isImageFile(file) {
  const header = fs.readFileSync(file).subarray(0, 512).toString('utf8').trimStart();
  const bytes = fs.readFileSync(file).subarray(0, 12);
  return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    || (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    || header.startsWith('GIF87a') || header.startsWith('GIF89a')
    || (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')
    || /^<svg\b/i.test(header) || /^<\?xml[\s\S]*?<svg\b/i.test(header);
}

/**
 * Validate an opt-in inventory that explains the actual local article figures.
 * This checks input consistency only; approval data in a job is not trusted authorization.
 */
export function checkApprovedVisualInventory(job, { artifactBase = process.cwd() } = {}) {
  const inventory = job.approvedVisualInventory;
  if (inventory === undefined) return [];
  const issues = [];
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory))
    return ['approvedVisualInventory must be an object'];
  if (inventory.contentId !== job.contentId) issues.push('approvedVisualInventory.contentId must match contentId');
  if (typeof inventory.reason !== 'string' || !inventory.reason.trim())
    issues.push('approvedVisualInventory.reason is required');
  const approval = inventory.approval;
  const approvalTimestamp = typeof approval?.approvedAt === 'string'
    && /(?:Z|[+-]\d{2}:\d{2})$/i.test(approval.approvedAt)
    ? Date.parse(approval.approvedAt)
    : NaN;
  if (!approval || typeof approval !== 'object' || Array.isArray(approval)
      || approval.kind !== 'USER_MESSAGE'
      || typeof approval.reference !== 'string' || !approval.reference.trim()
      || !Number.isFinite(approvalTimestamp) || approvalTimestamp > Date.now())
    issues.push('approvedVisualInventory.approval must contain kind USER_MESSAGE, reference, and a non-future timezone-aware approvedAt');

  const channels = inventory.channels;
  if (!channels || typeof channels !== 'object' || Array.isArray(channels))
    return [...issues, 'approvedVisualInventory.channels must be an object'];
  const expectedChannels = articleChannels.filter((channel) => job.channels?.includes(channel));
  const declaredChannels = Object.keys(channels).sort();
  if (expectedChannels.length !== declaredChannels.length
      || expectedChannels.some((channel) => !Object.hasOwn(channels, channel)))
    issues.push('approvedVisualInventory.channels must exactly match the GitBlog/Blogger channels in the job');
  const artifacts = job.artifacts;

  for (const channel of expectedChannels) {
    const declared = channels[channel];
    if (!Array.isArray(declared) || declared.length === 0
        || declared.some((id) => typeof id !== 'string' || !id.trim())) {
      issues.push(`approvedVisualInventory.channels.${channel} must be a nonempty list of IDs`);
      continue;
    }
    if (duplicateIds(declared)) issues.push(`approvedVisualInventory.channels.${channel} contains duplicate IDs`);

    const media = (job.media ?? []).filter((asset) => asset.channels?.includes(channel));
    const mediaIds = media.map((asset) => asset.assetId);
    if (mediaIds.some((id) => typeof id !== 'string' || !id.trim()))
      issues.push(`${channel} counted media must have a nonempty assetId`);
    if (duplicateIds(mediaIds)) issues.push(`${channel} media asset IDs must be unique`);
    if (declared.length !== mediaIds.length || declared.some((id) => !mediaIds.includes(id)))
      issues.push(`${channel} approved visual IDs must exactly match channel media asset IDs`);
    const roles = new Set(media.map((asset) => asset.role).filter((role) => typeof role === 'string' && role.trim()));
    if (roles.size < declared.length)
      issues.push(`${channel} requires at least ${declared.length} distinct media roles for its approved visual inventory; got ${roles.size}`);
    for (const asset of media) {
      if (typeof asset.localPath !== 'string' || !asset.localPath.trim()) {
        issues.push(`${channel} media ${asset.assetId || '(unknown)'} requires localPath`);
      } else {
        const file = path.resolve(artifactBase, asset.localPath);
        try {
          if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) {
            issues.push(`${channel} media ${asset.assetId} localPath must be a regular file`);
          } else if (!isImageFile(file)) {
            issues.push(`${channel} media ${asset.assetId} localPath must contain image bytes`);
          }
        } catch {
          issues.push(`${channel} media ${asset.assetId} localPath must be a readable file`);
        }
      }
    }

    const artifactPath = artifacts?.[channel];
    if (typeof artifactPath !== 'string' || !artifactPath.trim()) {
      issues.push(`artifacts.${channel} must identify the local article file`);
      continue;
    }
    const file = path.resolve(artifactBase, artifactPath);
    let text;
    try {
      if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) throw new Error('not a regular file');
      text = fs.readFileSync(file, 'utf8');
    } catch {
      issues.push(`artifacts.${channel} must be a readable local article file`);
      continue;
    }
    const actual = channel === 'gitblog'
      ? collectGitBlogIds(text, issues)
      : collectBloggerIds(text, issues);
    if (duplicateIds(actual)) issues.push(`${channel} article contains duplicate visual IDs`);
    if (actual.length !== declared.length || declared.some((id) => !actual.includes(id)))
      issues.push(`${channel} article visual IDs must exactly match approvedVisualInventory`);
  }
  return issues;
}
