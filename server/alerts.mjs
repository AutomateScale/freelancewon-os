// Job alerts: your own saved Upwork searches, run on your schedule, new jobs sent to your WhatsApp.
//
// Upwork's official MCP does the searching with exactly the filters you saved. Nothing here ranks,
// scores or filters jobs by its own criteria (Upwork API & MCP Terms 5.9): the only jobs left out are
// ones you already applied to and ones you were already told about.
//
// Off unless ENABLE_JOB_ALERTS=true. Upwork's terms (4.1) allow searches for a specific, user-directed
// task but not continuous monitoring of its job corpus, so alerts are kept narrow: up to 3 saved searches,
// 10 results each, at most once an hour, only while the app is running.
//
// Kept on disk in ~/.freelancewon/: your saved searches (alerts.json) and the ids of jobs already
// sent (alert-seen.json), which are deleted after 7 days. No job content is stored.

import path from 'node:path';

const MAX_SEARCHES = 3;
const MIN_EVERY_MINUTES = 60;
const MAX_PER_RUN = 5;
const SEEN_DAYS = 7;
const FRESH_HOURS = 48;
const FEEDS = ['best_match', 'most_recent', 'search'];

export function createAlerts({ dataDir, callTool, logActivity, readJson, writeSecret }) {
  const ALERTS_FILE = path.join(dataDir, 'alerts.json');
  const SEEN_FILE = path.join(dataDir, 'alert-seen.json');
  let running = false;

  const load = () => readJson(ALERTS_FILE)?.searches ?? [];
  const save = (searches) => writeSecret(ALERTS_FILE, { searches });

  const enabled = () => process.env.ENABLE_JOB_ALERTS === 'true';

  function channels() {
    return {
      enabled: enabled(),
      callmebot: Boolean(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY),
      webhook: Boolean(process.env.ALERT_WEBHOOK_URL),
    };
  }

  function clean(input, existing) {
    const feed = FEEDS.includes(input.feed) ? input.feed : 'best_match';
    const query = String(input.query ?? '').trim().slice(0, 200);
    if (feed === 'search' && !query) throw Object.assign(new Error('A keyword search needs keywords.'), { status: 400 });
    if (!input.org_uid) throw Object.assign(new Error('Pick your Upwork account first.'), { status: 400 });
    return {
      id: existing?.id ?? crypto.randomUUID(),
      name: String(input.name ?? '').trim().slice(0, 60) || (feed === 'search' ? query : feed === 'best_match' ? 'Best matches' : 'Most recent'),
      org_uid: String(input.org_uid),
      feed,
      query: feed === 'search' ? query : '',
      job_type: ['hourly', 'fixed'].includes(input.job_type) ? input.job_type : '',
      verified_only: input.verified_only !== false,
      proposals_max: Number(input.proposals_max) > 0 ? Math.floor(Number(input.proposals_max)) : null,
      every_minutes: Math.min(1440, Math.max(MIN_EVERY_MINUTES, Math.floor(Number(input.every_minutes) || 60))),
      enabled: input.enabled !== false,
      last_run: existing?.last_run ?? null,
      last_result: existing?.last_result ?? '',
    };
  }

  function requireEnabled() {
    if (!enabled()) throw Object.assign(new Error('Job alerts are switched off (ENABLE_JOB_ALERTS).'), { status: 403 });
  }

  function upsert(input) {
    requireEnabled();
    const searches = load();
    const index = searches.findIndex((s) => s.id === input.id);
    if (index < 0 && searches.length >= MAX_SEARCHES) {
      throw Object.assign(new Error(`You can save up to ${MAX_SEARCHES} alert searches.`), { status: 400 });
    }
    const search = clean(input, searches[index]);
    if (index < 0) searches.push(search); else searches[index] = search;
    save(searches);
    return search;
  }

  function remove(id) {
    save(load().filter((s) => s.id !== id));
  }

  function argsFor(search) {
    const params = { limit: 10 };
    if (search.job_type) params.job_type = search.job_type;
    if (search.verified_only) params.verified_payment_only = true;
    if (search.proposals_max) params.proposals_max = search.proposals_max;
    if (search.feed === 'search') return { action: 'search', org_uid: search.org_uid, params: { ...params, query: search.query, sort: 'recency' } };
    if (search.feed === 'most_recent') params.days_posted = 1;
    return { action: 'smart_search', org_uid: search.org_uid, params: { ...params, mode: search.feed } };
  }

  function loadSeen() {
    const cutoff = Date.now() - SEEN_DAYS * 86_400_000;
    const seen = readJson(SEEN_FILE) ?? {};
    for (const [id, at] of Object.entries(seen)) if (at < cutoff) delete seen[id];
    return seen;
  }

  const isFresh = (job) => {
    const at = Date.parse(job.published_date ?? '');
    return Number.isNaN(at) || Date.now() - at < FRESH_HOURS * 3_600_000;
  };

  // Title, budget, proposal count, client basics and the Upwork link. Never the posting itself.
  function message(search, job) {
    const client = job.client ?? {};
    const facts = [job.budget, job.experience_level,
      job.proposal_count !== undefined ? `${job.proposal_count} proposals` : job.proposals_tier && `${job.proposals_tier} proposals`,
      job.connect_price !== undefined && `${job.connect_price} Connects`].filter(Boolean).join(' · ');
    const payment = client.verification_status && (client.verification_status === 'VERIFIED' ? 'Payment verified' : 'Payment not verified');
    const clientLine = [payment,
      client.country, client.total_spent && `${client.total_spent} spent`].filter(Boolean).join(' · ');
    return [`🔔 New Upwork job · ${search.name}`, job.title, facts, clientLine, job.url,
      'To write the proposal, paste this link into FreelanceWon OS → Upwork Jobs.'].filter(Boolean).join('\n');
  }

  async function deliver(text) {
    const sent = [];
    if (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY) {
      const url = new URL('https://api.callmebot.com/whatsapp.php');
      url.searchParams.set('phone', process.env.CALLMEBOT_PHONE);
      url.searchParams.set('apikey', process.env.CALLMEBOT_APIKEY);
      url.searchParams.set('text', text);
      const res = await fetch(url).catch((e) => { throw new Error(`Couldn't reach CallMeBot (${e.message})`); });
      if (!res.ok) throw new Error(`CallMeBot returned ${res.status}`);
      sent.push('callmebot');
    }
    if (process.env.ALERT_WEBHOOK_URL) {
      const res = await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'freelancewon-os', text }),
      }).catch((e) => { throw new Error(`Couldn't reach your alert webhook (${e.message})`); });
      if (!res.ok) throw new Error(`Your alert webhook returned ${res.status}`);
      sent.push('webhook');
    }
    if (!sent.length) throw Object.assign(new Error('Set up WhatsApp in your .env file first (see .env.example).'), { status: 400 });
    return sent;
  }

  async function runSearch(search) {
    const data = await callTool('find_jobs', argsFor(search));
    const jobs = (data.jobs ?? []).filter((j) => j.id && !j.applied);
    const seen = loadSeen();
    const firstRun = !search.last_run;
    const fresh = jobs.filter((j) => !seen[j.id] && isFresh(j));
    for (const job of jobs) seen[job.id] ??= Date.now();
    writeSecret(SEEN_FILE, seen);

    let result;
    if (firstRun) {
      await deliver(`✅ FreelanceWon alert is on: ${search.name}\n${jobs.length === 1 ? '1 job matches' : `${jobs.length} jobs match`} right now. New ones will arrive here (checked every ${search.every_minutes / 60} h while FreelanceWon OS is running).`);
      result = `On. ${jobs.length} current match${jobs.length === 1 ? '' : 'es'}; new ones will be sent.`;
    } else {
      for (const job of fresh.slice(0, MAX_PER_RUN)) await deliver(message(search, job));
      if (fresh.length > MAX_PER_RUN) await deliver(`…and ${fresh.length - MAX_PER_RUN} more new jobs for "${search.name}". Open FreelanceWon OS to see them.`);
      result = fresh.length ? `Sent ${fresh.length} new job${fresh.length === 1 ? '' : 's'}.` : 'No new jobs.';
    }
    logActivity({ action: 'job_alert_run', search: search.name, org_uid: search.org_uid, jobs_sent: firstRun ? 0 : fresh.length });
    return result;
  }

  async function run(id) {
    requireEnabled();
    const searches = load();
    const search = searches.find((s) => s.id === id);
    if (!search) throw Object.assign(new Error('That alert no longer exists.'), { status: 404 });
    try {
      search.last_result = await runSearch(search);
    } catch (e) {
      search.last_result = `Failed: ${e.message}`;
      throw e;
    } finally {
      search.last_run = new Date().toISOString();
      const latest = load();
      const index = latest.findIndex((s) => s.id === id);
      if (index >= 0) { latest[index] = { ...latest[index], last_run: search.last_run, last_result: search.last_result }; save(latest); }
    }
    return search;
  }

  // Runs only while the app is running. Each saved search at most once an hour, one at a time.
  async function tick() {
    const ready = channels();
    if (running || !ready.enabled || !(ready.callmebot || ready.webhook)) return;
    running = true;
    try {
      for (const search of load()) {
        const due = !search.last_run || Date.now() - Date.parse(search.last_run) >= search.every_minutes * 60_000;
        if (search.enabled && due) await run(search.id).catch(() => {});
      }
    } finally {
      running = false;
    }
  }

  function start() {
    setInterval(tick, 60_000).unref();
  }

  async function test() {
    requireEnabled();
    return deliver('✅ FreelanceWon OS can reach your WhatsApp. Job alerts will arrive here.');
  }

  return { list: load, channels, upsert, remove, run, test, start };
}
