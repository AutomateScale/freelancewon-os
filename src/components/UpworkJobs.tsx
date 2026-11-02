import React, { useCallback, useEffect, useState } from 'react';
import { Link2, Search, Sparkles, ExternalLink, Send, ShieldCheck, Loader2, LogOut, PlusCircle, PenLine } from 'lucide-react';
import type { Lead } from './PipelineBoard';
import { JobAlerts } from './JobAlerts';
import { checkProposal, type Lane } from '../lib/proposalChecks';

// Everything here goes through Upwork's official MCP server with your own Upwork login,
// via the local server in /server. Job data stays in memory and is gone when you close the tab.

interface UpworkAccount { name: string; org_uid: string; role: string; role_label: string; suspended?: string }

interface UpworkJob {
  id: string;
  title: string;
  url: string;
  budget?: string;
  job_type?: string;
  experience_level?: string;
  duration?: string;
  proposals_tier?: string;
  proposal_count?: number;
  applied?: boolean;
  connect_price?: number;
  published_date?: string;
  description_snippet?: string;
  skills?: string[];
  client?: { country?: string; rating?: number; total_reviews?: number; total_spent?: string; verification_status?: string };
}

interface ProposalPreview {
  preview_id?: string;
  connects_cost?: number;
  connects_balance?: number;
  can_apply?: boolean;
  unmet_preferred_qualifications?: unknown;
  screening_questions?: string[] | { question: string }[];
  answeredCount?: number;
  [key: string]: unknown;
}

type Feed = 'best_match' | 'most_recent' | 'search';

const ORG_KEY = 'freelancewon_upwork_org';
const ABOUT_KEY = 'freelancewon_about_me';
const PROOF_KEY = 'freelancewon_proof_link';

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-FreelanceWon': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // A static host (the online demo) answers /api with the HTML page: treat that as "no local server".
  if (!(res.headers.get('content-type') ?? '').includes('application/json')) throw new Error('FreelanceWon OS server is not running');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status, data });
  return data as T;
}

const tool = <T,>(name: string, args: Record<string, unknown>, approvedInApp = false) =>
  api<T>('/api/upwork/tool', { name, args, approvedInApp });

// Upwork wraps client-written text in a provenance tag; show it as labelled client content.
const clientText = (text?: string) => (text ?? '').replace(/<\/?untrusted_participant_content>/g, '').trim();

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

interface JobDetails {
  applied?: boolean;
  can_apply?: boolean;
  connects_cost?: number;
  screening_questions?: string[];
  data?: { marketplaceJobPosting?: {
    id?: string; url?: string;
    content?: { title?: string };
    contractTerms?: { contractType?: string; experienceLevel?: string;
      hourlyContractTerms?: { hourlyBudgetMin?: number; hourlyBudgetMax?: number };
      fixedPriceContractTerms?: { amount?: { displayValue?: string } } };
    clientCompanyPublic?: { country?: { name?: string } };
  } };
}

// The job-detail ("get") response has a different shape from search results.
function jobFromDetails(d: JobDetails): UpworkJob {
  const p = d.data?.marketplaceJobPosting ?? {};
  const hourly = p.contractTerms?.hourlyContractTerms;
  const budget = hourly?.hourlyBudgetMin || hourly?.hourlyBudgetMax
    ? `$${hourly.hourlyBudgetMin ?? '?'}–$${hourly.hourlyBudgetMax ?? '?'}/hr`
    : p.contractTerms?.fixedPriceContractTerms?.amount?.displayValue;
  return {
    id: p.id ?? '',
    title: clientText(p.content?.title) || 'Upwork job',
    url: p.url ?? '',
    budget,
    job_type: p.contractTerms?.contractType?.toLowerCase(),
    applied: d.applied,
    connect_price: d.connects_cost,
    client: { country: p.clientCompanyPublic?.country?.name },
  };
}

export const UpworkJobs: React.FC<{ onAddLead: (lead: Omit<Lead, 'id' | 'dateAdded'>) => void }> = ({ onAddLead }) => {
  const [serverUp, setServerUp] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<UpworkAccount[]>([]);
  const [orgUid, setOrgUid] = useState(() => localStorage.getItem(ORG_KEY) ?? '');
  const [aboutMe, setAboutMe] = useState(() => localStorage.getItem(ABOUT_KEY) ?? '');
  const [proofLink, setProofLink] = useState(() => localStorage.getItem(PROOF_KEY) ?? '');
  const [lane, setLane] = useState<Lane>('full');
  const [jobLink, setJobLink] = useState('');

  const [feed, setFeed] = useState<Feed>('best_match');
  const [query, setQuery] = useState('');
  const [jobType, setJobType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [maxProposals, setMaxProposals] = useState('');
  const [jobs, setJobs] = useState<UpworkJob[]>([]);
  const [note, setNote] = useState('');

  const [selected, setSelected] = useState<UpworkJob | null>(null);
  const [draft, setDraft] = useState('');
  const [disclose, setDisclose] = useState(true);
  const [disclosure, setDisclosure] = useState('Drafted with AI assistance and reviewed by me.');
  const [bid, setBid] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [jobQuestions, setJobQuestions] = useState<string[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [preview, setPreview] = useState<ProposalPreview | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refreshStatus = useCallback(async () => {
    try {
      const status = await api<{ upworkConnected: boolean; aiProvider: string | null }>('/api/status');
      setServerUp(true);
      setConnected(status.upworkConnected);
      setAiProvider(status.aiProvider);
      if (status.upworkConnected) {
        const data = await tool<{ accounts: UpworkAccount[] }>('list_accounts', {});
        const usable = (data.accounts ?? []).filter((a) => (a.role === 'TALENT' || a.role === 'FL_AGENCY') && a.suspended !== 'true');
        setAccounts(usable);
        setOrgUid((current) => (usable.some((a) => a.org_uid === current) ? current : usable[0]?.org_uid ?? ''));
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) setConnected(false);
      else setServerUp(false);
    }
  }, []);

  useEffect(() => { refreshStatus(); }, [refreshStatus]);
  useEffect(() => { if (orgUid) localStorage.setItem(ORG_KEY, orgUid); }, [orgUid]);
  useEffect(() => { localStorage.setItem(ABOUT_KEY, aboutMe); }, [aboutMe]);
  useEffect(() => { localStorage.setItem(PROOF_KEY, proofLink); }, [proofLink]);
  // Any edit after "Prepare on Upwork" makes the preview stale: prepare again before submitting.
  useEffect(() => { setPreview(null); }, [draft, bid, answers, disclose]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError('');
    try { await fn(); } catch (e) { setError(errorText(e)); } finally { setBusy(null); }
  };

  const loadJobs = () => run('jobs', async () => {
    const filters: Record<string, unknown> = { limit: 10 };
    if (jobType) filters.job_type = jobType;
    if (verifiedOnly) filters.verified_payment_only = true;
    if (maxProposals) filters.proposals_max = Number(maxProposals);
    const args = feed === 'search'
      ? { action: 'search', org_uid: orgUid, params: { ...filters, query: query.trim() } }
      : { action: 'smart_search', org_uid: orgUid, params: { ...filters, mode: feed } };
    if (feed === 'search' && !query.trim()) throw new Error('Type what kind of work you are looking for.');
    const data = await tool<{ jobs?: UpworkJob[]; mode_note?: string }>('find_jobs', args);
    setJobs(data.jobs ?? []);
    setNote(data.mode_note ?? '');
    setSelected(null);
  });

  // A job link pasted from Upwork (or from a WhatsApp alert) opens that one job.
  const openLink = () => run('link', async () => {
    if (!jobLink.trim()) throw new Error('Paste an Upwork job link.');
    const details = await tool<JobDetails>('find_jobs', { action: 'get', org_uid: orgUid, params: { id: jobLink.trim() } });
    const job = jobFromDetails(details);
    if (!job.id) throw new Error('Upwork did not find that job.');
    setJobs((current) => [job, ...current.filter((j) => j.id !== job.id)]);
    setJobLink('');
  });

  // With AI, the draft is written from the full posting and your playbook. "Write it myself" starts blank.
  const startProposal = (job: UpworkJob, withAi: boolean) => run(`draft-${job.id}`, async () => {
    setSelected(job);
    setDraft('');
    setDrafting(false);
    setPreview(null);
    setSubmitted(false);
    setAnswers({});
    setJobQuestions([]);
    const details = await tool<JobDetails>('find_jobs', { action: 'get', org_uid: orgUid, params: { id: job.id } });
    setJobQuestions(details.screening_questions ?? []);
    setDisclose(withAi);
    if (!withAi) { setDrafting(true); return; }
    const result = await api<{ draft: string; disclosure: string }>('/api/ai/draft', { job: details, aboutMe, lane, proofLink });
    setDraft(result.draft);
    setDisclosure(result.disclosure);
    setDrafting(true);
  });

  const coverLetter = () => (disclose ? `${draft.trim()}\n\n${disclosure}` : draft.trim());

  const prepareOnUpwork = () => run('prepare', async () => {
    if (!selected) return;
    if (!Number(bid)) throw new Error('Enter your bid amount.');
    const { problems } = checkProposal(draft, lane, proofLink);
    if (problems.length) throw new Error(problems.join(' '));
    const invites = await tool<{ invitations?: unknown[] }>('list_freelancer_proposals', {
      action: 'invitations', org_uid: orgUid, params: { job_posting_id: selected.id },
    });
    if ((invites.invitations ?? []).length > 0) {
      throw new Error('This client already invited you. Accept the invitation on Upwork instead.');
    }
    const params: Record<string, unknown> = { job_reference: selected.id, cover_letter: coverLetter(), charged_amount: Number(bid) };
    const answered = Object.entries(answers).filter(([, a]) => a.trim());
    if (answered.length) params.answers = answered.map(([question, answer]) => ({ question, answer }));
    const data = await tool<ProposalPreview & { preview?: ProposalPreview }>('manage_proposals', { action: 'create', org_uid: orgUid, params }, true);
    const next: ProposalPreview = { ...(data.preview ?? {}), ...data, answeredCount: answered.length };
    const asked = (next.screening_questions ?? []).map((q) => (typeof q === 'string' ? q : q.question));
    if (asked.length) setJobQuestions(asked);
    setPreview(next);
  });

  const submitOnUpwork = () => run('submit', async () => {
    if (!selected || !preview?.preview_id) return;
    await tool('confirm_preview', { action: 'confirm', org_uid: orgUid, params: { type: 'proposal', preview_id: preview.preview_id } }, true);
    setSubmitted(true);
    const amount = Number(bid) || 0;
    onAddLead({ clientName: 'Upwork client', projectTitle: selected.title, value: amount, stage: 'proposal', source: 'Upwork', priority: 'Normal' });
  });

  const disconnect = () => run('disconnect', async () => {
    await api('/api/upwork/disconnect', {});
    setConnected(false);
    setJobs([]);
    setSelected(null);
  });

  const questions = jobQuestions;
  const checks = checkProposal(draft, lane, proofLink);

  if (serverUp === false) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 28px 40px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Run FreelanceWon OS on your computer to use Upwork Jobs</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
            Upwork Jobs signs in to Upwork with your own account, so it needs the small local server that comes with the app.
          </p>
          <pre style={{ background: 'var(--bg-pill)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>npm install{'\n'}npm start</pre>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Then open http://127.0.0.1:8787</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 28px 40px', display: 'grid', gap: '20px' }}>
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} color="var(--accent-emerald)" /> Upwork Jobs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Official Upwork MCP, your own Upwork login. Upwork picks and orders the jobs; you choose which to apply to and approve every proposal.
          </p>
        </div>
        {connected ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="form-select" value={orgUid} onChange={(e) => setOrgUid(e.target.value)} style={{ width: 'auto' }}>
              {accounts.map((a) => <option key={a.org_uid} value={a.org_uid}>{a.name} ({a.role_label})</option>)}
            </select>
            <button className="btn btn-secondary" onClick={disconnect} disabled={busy !== null}><LogOut size={16} /> Disconnect</button>
          </div>
        ) : (
          <a className="btn btn-primary" href="/api/upwork/connect"><Link2 size={16} /> Connect Upwork</a>
        )}
      </div>

      {error && <div className="glass-card" style={{ padding: '12px 16px', borderColor: 'var(--accent-rose)', color: '#fecdd3' }}>{error}</div>}

      {connected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
          <div style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
            <div className="glass-card" style={{ padding: '16px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {([['best_match', 'Best matches'], ['most_recent', 'Most recent'], ['search', 'Search']] as const).map(([id, label]) => (
                  <button key={id} className={feed === id ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setFeed(id)}>{label}</button>
                ))}
              </div>
              {feed === 'search' && (
                <input className="form-input" placeholder="e.g. GoHighLevel automation" value={query} onChange={(e) => setQuery(e.target.value)} />
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ width: 'auto' }}>
                  <option value="">Hourly or fixed</option>
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed price</option>
                </select>
                <input className="form-input" type="number" min={1} placeholder="Max proposals" value={maxProposals}
                  onChange={(e) => setMaxProposals(e.target.value)} style={{ width: '150px' }} />
                <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} /> Payment verified only
                </label>
                <button className="btn btn-emerald" onClick={loadJobs} disabled={busy !== null || !orgUid}>
                  {busy === 'jobs' ? <Loader2 size={16} className="spin" /> : <Search size={16} />} Load jobs
                </button>
              </div>
              {note && <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{note}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input className="form-input" placeholder="Or paste an Upwork job link" value={jobLink} onChange={(e) => setJobLink(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') openLink(); }} style={{ flex: '1 1 220px' }} />
                <button className="btn btn-secondary" onClick={openLink} disabled={busy !== null || !orgUid}>
                  {busy === 'link' ? <Loader2 size={16} className="spin" /> : <Link2 size={16} />} Open job
                </button>
              </div>
            </div>

            <JobAlerts api={api} orgUid={orgUid} filters={{ feed, query, jobType, verifiedOnly, maxProposals }} />

            {jobs.map((job) => (
              <div key={job.id} className="glass-card" style={{ padding: '16px', display: 'grid', gap: '8px', borderColor: selected?.id === job.id ? 'var(--primary)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong>{job.title}</strong>
                  {job.applied && <span className="badge badge-amber">Applied</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {job.budget && <span>{job.budget}</span>}
                  {job.experience_level && <span>{job.experience_level}</span>}
                  <span>{job.proposal_count !== undefined ? `${job.proposal_count} proposals` : job.proposals_tier ? `${job.proposals_tier} proposals` : ''}</span>
                  {job.connect_price !== undefined && <span>{job.connect_price} Connects</span>}
                </div>
                {job.client && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Client: {[job.client.country, job.client.total_spent && `${job.client.total_spent} spent`,
                      job.client.rating !== undefined && `${job.client.rating}★ from freelancers (${job.client.total_reviews ?? 0})`,
                      job.client.verification_status === 'VERIFIED' ? 'payment verified' : 'payment not verified'].filter(Boolean).join(' · ')}
                  </div>
                )}
                {job.description_snippet && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Client's posting · </span>
                    {clientText(job.description_snippet)}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!job.applied && (
                    <>
                      <button className="btn btn-primary" onClick={() => startProposal(job, true)} disabled={busy !== null || !aiProvider}
                        title={aiProvider ? '' : 'Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env'}>
                        {busy === `draft-${job.id}` ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Draft with AI
                      </button>
                      <button className="btn btn-secondary" onClick={() => startProposal(job, false)} disabled={busy !== null}>
                        <PenLine size={16} /> Write it myself
                      </button>
                    </>
                  )}
                  <a className="btn btn-secondary" href={job.url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> View on Upwork</a>
                  <button className="btn btn-secondary" onClick={() => onAddLead({ clientName: 'Upwork client', projectTitle: job.title, value: 0, stage: 'backlog', source: 'Upwork', priority: 'Normal' })}>
                    <PlusCircle size={16} /> Add to pipeline
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
            <div className="glass-card" style={{ padding: '16px' }}>
              <div className="form-group">
                <label className="form-label">About me (used for every proposal draft, stays on this computer)</label>
                <textarea className="form-textarea" rows={5} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="What you do, 2-3 real results with numbers, tools you know, how you like to work." />
              </div>
              <div className="form-group">
                <label className="form-label">Proof page or portfolio link (optional, used in full proposals)</label>
                <input className="form-input" placeholder="https://..." value={proofLink} onChange={(e) => setProofLink(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Proposal style:</span>
                <button className={lane === 'full' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setLane('full')}>Full proposal</button>
                <button className={lane === 'quick' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setLane('quick')}>Quick note</button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                {lane === 'full'
                  ? 'One question about their setup, then 3 to 6 short lines: your first step, your closest proof, your link.'
                  : '1 to 3 sentences, under 75 words. Sounds like you typed it between calls.'}
                {' '}Rules come from playbook/proposal-playbook.md; edit it to sound like you.
              </p>
              {!aiProvider && <p style={{ fontSize: '0.8rem', color: 'var(--accent-amber)' }}>Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env to draft proposals with AI.</p>}
            </div>

            {selected && (
              <div className="glass-card" style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                <strong>Proposal: {selected.title}</strong>
                {busy === `draft-${selected.id}` && <p style={{ color: 'var(--text-muted)' }}><Loader2 size={16} className="spin" /> Writing a draft from the full posting...</p>}
                {drafting && !submitted && (
                  <>
                    <textarea className="form-textarea" rows={12} value={draft} onChange={(e) => setDraft(e.target.value)}
                      placeholder={lane === 'quick' ? 'Do you already have ...? This is right in my wheelhouse ...' : 'Start with one question about their setup.'} />
                    {(checks.problems.length > 0 || checks.warnings.length > 0) && draft.trim() && (
                      <ul style={{ fontSize: '0.8rem', paddingLeft: '18px', display: 'grid', gap: '2px' }}>
                        {checks.problems.map((p) => <li key={p} style={{ color: 'var(--accent-rose)' }}>{p}</li>)}
                        {checks.warnings.map((w) => <li key={w} style={{ color: 'var(--accent-amber)' }}>{w}</li>)}
                      </ul>
                    )}
                    <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={disclose} onChange={(e) => setDisclose(e.target.checked)} />
                      Add "{disclosure}" (Upwork's terms ask for AI-assisted content to be disclosed; leave it on whenever AI helped)
                    </label>
                    {questions.length > 0 && (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <p style={{ fontSize: '0.85rem' }}>The client asks these questions. Answer each one:</p>
                        {questions.map((q) => (
                          <div key={q} className="form-group">
                            <label className="form-label">{clientText(q)}</label>
                            <textarea className="form-textarea" rows={2} value={answers[q] ?? ''} onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input className="form-input" type="number" min={1} placeholder={selected.job_type === 'hourly' ? 'Your hourly rate' : 'Your bid'}
                        value={bid} onChange={(e) => setBid(e.target.value)} style={{ width: '160px' }} />
                      <button className="btn btn-primary" onClick={prepareOnUpwork} disabled={busy !== null}>
                        {busy === 'prepare' ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />} Prepare on Upwork
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Nothing is sent yet. Upwork prepares a preview with the Connects cost; you submit it in the next step.
                      To attach files or boost, finish the proposal on Upwork instead.
                    </p>
                  </>
                )}

                {preview && !submitted && (
                  <div style={{ display: 'grid', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <strong>Upwork preview</strong>
                    <div style={{ fontSize: '0.9rem' }}>
                      Costs <strong>{preview.connects_cost ?? '?'}</strong> Connects · you have <strong>{preview.connects_balance ?? '?'}</strong>
                      {preview.can_apply === false && <span style={{ color: 'var(--accent-rose)' }}> · Upwork says you can't apply to this job</span>}
                    </div>
                    {Boolean(preview.unmet_preferred_qualifications) && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
                        You don't meet some of the client's preferred qualifications: {JSON.stringify(preview.unmet_preferred_qualifications)}. You can still apply.
                      </p>
                    )}
                    {preview.preview_id && (preview.answeredCount ?? 0) >= questions.length && preview.can_apply !== false && (
                      <button className="btn btn-emerald" onClick={submitOnUpwork} disabled={busy !== null}>
                        {busy === 'submit' ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Submit on Upwork ({preview.connects_cost ?? '?'} Connects)
                      </button>
                    )}
                  </div>
                )}

                {submitted && (
                  <p style={{ color: 'var(--accent-emerald)' }}>
                    Submitted. It's on your Upwork proposals page and in your pipeline under "Proposal".
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
