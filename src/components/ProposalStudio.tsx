import React, { useState } from 'react';
import { Sparkles, Copy, Check, ShieldCheck, Zap, Video, FileCheck } from 'lucide-react';

export const ProposalStudio: React.FC = () => {
  const [jobDescription, setJobDescription] = useState(
    'Looking for an expert AI automation developer to build custom n8n workflows connecting GoHighLevel CRM with OpenAI and Supabase for automated lead qualification and custom reporting.'
  );
  const [clientName, setClientName] = useState('Sarah');
  const [clientPainPoint, setClientPainPoint] = useState('Manual lead data entry and slow response time to high-value leads');
  const [primarySkill, setPrimarySkill] = useState('n8n + GHL Automation & Multi-Agent Orchestration');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateProposals = () => {
    return [
      {
        title: 'Option A: The Upwork Hook & Proof Framework',
        badge: 'High Conversion (Upwork)',
        icon: Zap,
        content: `Hi ${clientName || 'there'},

I saw you're looking to automate lead qualification between GoHighLevel and Supabase via n8n — I built an identical automated pipeline last month that cut lead response time from 4 hours down to under 45 seconds.

Here is exactly how we'll solve ${clientPainPoint || 'your lead response lag'}:
1. **n8n Webhook Listener**: Instantly captures new GHL contacts as soon as they opt-in.
2. **AI Lead Scoring**: Evaluates the prospect against your custom criteria using OpenAI structured outputs.
3. **Automated Sync**: Updates Supabase and routes priority leads directly to your team's Slack/GHL pipeline.

I have pre-built n8n nodes ready for GHL and Supabase so we can deploy this within 48 hours without starting from scratch.

Would you be open to a quick 5-minute chat or loom video walkthrough of the existing workflow?

Best,
[Your Name]`
      },
      {
        title: 'Option B: The Audit & Micro-Video Pitch',
        badge: 'High-Ticket Direct Outreach',
        icon: Video,
        content: `Hi ${clientName || 'there'},

Quick question about your GHL + n8n automation stack:

Most setups fail because rate limits or unhandled API exceptions drop webhooks silently, causing missed leads during peak traffic.

I recorded a short 2-minute Loom video walking through how I set up error-resilient n8n pipelines with automatic retry queues and Supabase logging for ${primarySkill}.

You can view the setup idea here: [Insert Loom Link]

No sales pressure at all — if you'd like me to set this up for your team, we can get started right away. 

Cheers,
[Your Name]`
      },
      {
        title: 'Option C: The 3-Step Solution & Guarantee',
        badge: 'Agency / Enterprise',
        icon: ShieldCheck,
        content: `Hi ${clientName || 'there'},

Solving ${clientPainPoint || 'manual lead entry'} requires a clean, scalable architecture. Here is our 3-step implementation plan:

• **Phase 1 (Day 1)**: Audit GHL custom fields and design clean Deno/n8n data transformation schema.
• **Phase 2 (Day 2)**: Deploy n8n workflow with exponential backoff retries and Supabase error logging.
• **Phase 3 (Day 3)**: End-to-end testing, video documentation, and team handoff.

**My Guarantee**: If the pipeline doesn't process 100% of your test leads cleanly with zero dropped webhooks, you don't pay.

Let me know if you'd like to review the architecture documentation today.

Best regards,
[Your Name]`
      }
    ];
  };

  const proposals = generateProposals();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ padding: '0 28px 40px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles color="var(--primary)" /> AI Proposal Studio
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Generate high-converting Upwork proposals and direct pitches tailored to client job posts in seconds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px' }}>
        
        {/* Input Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} color="var(--accent-purple)" /> Opportunity Details
          </h3>

          <div className="form-group">
            <label className="form-label">Client Name (if known)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Sarah" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Post / Opportunity Description</label>
            <textarea 
              className="form-textarea" 
              rows={4}
              value={jobDescription} 
              onChange={(e) => setJobDescription(e.target.value)} 
              placeholder="Paste the job description or client request here..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client's Core Pain Point</label>
            <input 
              type="text" 
              className="form-input" 
              value={clientPainPoint} 
              onChange={(e) => setClientPainPoint(e.target.value)} 
              placeholder="e.g. Slow lead response time & manual data entry" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Core Skill / Solution Stack</label>
            <input 
              type="text" 
              className="form-input" 
              value={primarySkill} 
              onChange={(e) => setPrimarySkill(e.target.value)} 
              placeholder="e.g. n8n + GoHighLevel + Supabase Automations" 
            />
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.85rem', color: '#a5b4fc' }}>
            💡 <strong>Pro Tip:</strong> Upwork clients scan the first 2 lines of your proposal in their inbox preview. Lead with proof or a specific solution, never with "Hi, I am an expert developer..."
          </div>
        </div>

        {/* Generated Proposals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {proposals.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <div key={idx} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} color="var(--primary)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{prop.title}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-emerald">{prop.badge}</span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleCopy(prop.content, idx)}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={14} color="var(--accent-emerald)" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Proposal
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(11, 15, 25, 0.95)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  fontSize: '0.9rem', 
                  fontFamily: 'monospace', 
                  whiteSpace: 'pre-wrap',
                  color: '#e2e8f0',
                  lineHeight: '1.6'
                }}>
                  {prop.content}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
