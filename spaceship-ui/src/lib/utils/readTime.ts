import ezekielReport1 from '@/data/ezekiel-reports/report-1.html?raw';
import ezekielReport2 from '@/data/ezekiel-reports/report-2.html?raw';
import ezekielReport3 from '@/data/ezekiel-reports/report-3.html?raw';

const ezekielReports = [ezekielReport1, ezekielReport2, ezekielReport3];

function visibleText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function embeddedResearchText(content: string): string {
  const match = content.match(/<EzekielReport\s+report=\{([123])\}\s*\/>/);
  if (!match) return '';
  return visibleText(ezekielReports[Number(match[1]) - 1]);
}

export function getReadTime(content: string): string {
  const wordsPerMinute = 200;
  const completeContent = `${content} ${embeddedResearchText(content)}`.trim();
  const noOfWords = completeContent ? completeContent.split(/\s+/g).length : 0;
  const minutes = noOfWords / wordsPerMinute;
  const readTime = Math.max(1, Math.ceil(minutes));
  return `${readTime} min read`;
}
