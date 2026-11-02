// Checks run on the proposal before it goes to Upwork. Warnings are advice from the playbook;
// problems block "Prepare on Upwork" because Upwork would reject them or they break Upwork's rules.

export type Lane = 'full' | 'quick';

export interface CheckResult { problems: string[]; warnings: string[] }

const CONTACT_PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/, 'an email address'],
  [/(?:\+?\d[\s().-]?){9,}/, 'a phone number'],
];

export function checkProposal(text: string, lane: Lane, proofLink = ''): CheckResult {
  const problems: string[] = [];
  const warnings: string[] = [];
  const body = text.trim();
  const words = body ? body.split(/\s+/).length : 0;

  if (!body) problems.push('The proposal is empty.');
  if (body.length > 5000) problems.push(`Upwork allows 5,000 characters; this is ${body.length}.`);
  const withoutLinks = body.replace(/https?:\/\/\S+/gi, '');
  for (const [pattern, what] of CONTACT_PATTERNS) {
    if (pattern.test(withoutLinks)) problems.push(`It includes ${what}. Upwork's terms keep contact on Upwork until a contract starts.`);
  }

  if (/\b(whats\s?app|telegram|skype|discord|calendly|cal\.com|zoom\.us)\b/i.test(withoutLinks)) {
    warnings.push('It names an outside chat or calendar. Fine if the job is about that tool; never invite the client to talk there.');
  }
  if (body.includes('—')) warnings.push('It has an em dash. The playbook says to avoid them.');
  if (/\bdear (hiring manager|sir|madam)\b/i.test(body)) warnings.push('Skip "Dear Hiring Manager". Open with your question.');
  if (/^\s*(i am writing|i came across|i hope this|hello,? i am|hi,? i am)/i.test(body)) warnings.push('It opens with throat-clearing. Lead with a question about their setup.');
  if (/\$\s?\d|\bper hour\b|\/hr\b|\bhours?\b.*\bestimate/i.test(body)) warnings.push('Price or hours are in the letter. Keep them in the bid field.');
  if (!body.split('\n')[0].includes('?')) warnings.push('The first line has no question. The playbook opens with one diagnostic question.');

  if (lane === 'quick') {
    if (words > 75) warnings.push(`Quick notes stay under 75 words; this is ${words}.`);
    if (/https?:\/\//i.test(body)) warnings.push('Quick notes have no links.');
  } else {
    if (words > 250) warnings.push(`Full proposals stay short; this is ${words} words.`);
    const links = body.match(/https?:\/\/\S+/gi) ?? [];
    const others = links.filter((l) => !proofLink || !l.startsWith(proofLink));
    if (others.length) warnings.push('It links somewhere other than your proof page. Keep it to one link.');
  }
  return { problems, warnings };
}
