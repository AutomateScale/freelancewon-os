import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Loader2, Play, Trash2, MessageCircle } from 'lucide-react';

// Saved Upwork searches that run on a schedule and send new jobs to your WhatsApp.
// The local server (server/alerts.mjs) does the running; this panel only edits the list.

export interface AlertFilters { feed: 'best_match' | 'most_recent' | 'search'; query: string; jobType: string; verifiedOnly: boolean; maxProposals: string }

interface SavedAlert {
  id: string; name: string; org_uid: string; feed: AlertFilters['feed']; query: string; job_type: string;
  verified_only: boolean; proposals_max: number | null; every_minutes: number; enabled: boolean;
  last_run: string | null; last_result: string;
}

type Api = <T>(path: string, body?: unknown) => Promise<T>;

const FEED_LABEL = { best_match: 'Best matches', most_recent: 'Most recent', search: 'Search' } as const;

const describe = (a: SavedAlert) => [
  a.feed === 'search' ? `"${a.query}"` : FEED_LABEL[a.feed],
  a.job_type, a.verified_only && 'payment verified', a.proposals_max && `under ${a.proposals_max} proposals`,
  `every ${a.every_minutes >= 60 ? `${a.every_minutes / 60} h` : `${a.every_minutes} min`}`,
].filter(Boolean).join(' · ');

export const JobAlerts: React.FC<{ api: Api; orgUid: string; filters: AlertFilters }> = ({ api, orgUid, filters }) => {
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [channels, setChannels] = useState({ enabled: false, callmebot: false, webhook: false });
  const [name, setName] = useState('');
  const [every, setEvery] = useState('60');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const data = await api<{ searches: SavedAlert[]; channels: typeof channels }>('/api/alerts');
    setAlerts(data.searches);
    setChannels(data.channels);
  }, [api]);

  useEffect(() => { refresh().catch(() => {}); }, [refresh]);

  const run = async (label: string, fn: () => Promise<string | void>) => {
    setBusy(label);
    setMessage('');
    try {
      const done = await fn();
      if (done) setMessage(done);
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const save = () => run('save', async () => {
    await api('/api/alerts/save', {
      name, org_uid: orgUid, feed: filters.feed, query: filters.query, job_type: filters.jobType,
      verified_only: filters.verifiedOnly, proposals_max: filters.maxProposals, every_minutes: Number(every),
    });
    setName('');
    return 'Saved. The first run tells your WhatsApp the alert is on.';
  });

  const toggle = (a: SavedAlert) => run(`toggle-${a.id}`, async () => { await api('/api/alerts/save', { ...a, enabled: !a.enabled }); });
  const remove = (a: SavedAlert) => run(`delete-${a.id}`, async () => { await api('/api/alerts/delete', { id: a.id }); });
  const runNow = (a: SavedAlert) => run(`run-${a.id}`, async () => (await api<{ search: SavedAlert }>('/api/alerts/run', { id: a.id })).search.last_result);
  const test = () => run('test', async () => { await api('/api/alerts/test', {}); return 'Test message sent. Check your WhatsApp.'; });

  const ready = channels.callmebot || channels.webhook;

  if (!channels.enabled) {
    return (
      <div className="glass-card" style={{ padding: '16px', display: 'grid', gap: '6px' }}>
        <strong style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Bell size={18} color="var(--accent-amber)" /> WhatsApp job alerts: coming soon</strong>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Saved searches that send new jobs to your WhatsApp. They're switched off until we've confirmed scheduled searches with Upwork.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <strong style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Bell size={18} color="var(--accent-amber)" /> WhatsApp job alerts</strong>
        {ready && (
          <button className="btn btn-secondary" onClick={test} disabled={busy !== null}>
            {busy === 'test' ? <Loader2 size={16} className="spin" /> : <MessageCircle size={16} />} Send test
          </button>
        )}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Save the search above and new jobs from it go to your WhatsApp. Upwork runs the search with your filters; FreelanceWon never scores
        or picks jobs for you. Up to 3 alerts, checked at most once an hour while FreelanceWon OS is running on your computer.
      </p>

      {!ready && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gap: '6px' }}>
          <span>Connect your WhatsApp first (free, about 2 minutes):</span>
          <ol style={{ paddingLeft: '20px', display: 'grid', gap: '4px' }}>
            <li>Follow the steps at callmebot.com/blog/free-api-whatsapp-messages to get your personal API key.</li>
            <li>Add <code>CALLMEBOT_PHONE</code> and <code>CALLMEBOT_APIKEY</code> to your <code>.env</code> file, then restart <code>npm start</code>.</li>
          </ol>
          <span>Using n8n, Make or Twilio instead? Set <code>ALERT_WEBHOOK_URL</code> and route the message wherever you like.</span>
        </div>
      )}

      {ready && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Alert name, e.g. GHL funnels" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: '1 1 180px' }} />
          <select className="form-select" value={every} onChange={(e) => setEvery(e.target.value)} style={{ width: 'auto' }}>
            <option value="60">Every hour</option>
            <option value="120">Every 2 hours</option>
            <option value="240">Every 4 hours</option>
          </select>
          <button className="btn btn-primary" onClick={save} disabled={busy !== null || !orgUid || (filters.feed === 'search' && !filters.query.trim())}>
            {busy === 'save' ? <Loader2 size={16} className="spin" /> : <Bell size={16} />} Save this search as an alert
          </button>
        </div>
      )}

      {message && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{message}</p>}

      {alerts.map((a) => (
        <div key={a.id} style={{ display: 'grid', gap: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.9rem' }}>{a.name}</strong>
            <div style={{ display: 'flex', gap: '6px' }}>
              <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={a.enabled} onChange={() => toggle(a)} disabled={busy !== null} /> On
              </label>
              <button className="btn btn-secondary" onClick={() => runNow(a)} disabled={busy !== null || !ready} title="Run now">
                {busy === `run-${a.id}` ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
              </button>
              <button className="btn btn-secondary" onClick={() => remove(a)} disabled={busy !== null} title="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{describe(a)}</span>
          {a.last_run && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Last run {new Date(a.last_run).toLocaleString()}: {a.last_result}</span>}
        </div>
      ))}
    </div>
  );
};
