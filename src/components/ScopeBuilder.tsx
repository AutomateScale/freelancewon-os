import React, { useState } from 'react';
import { FileText, Plus, Trash2, Copy, Check, ShieldAlert } from 'lucide-react';

interface Milestone {
  title: string;
  deliverables: string;
  payment: number;
}

export const ScopeBuilder: React.FC = () => {
  const [projectName, setProjectName] = useState('GHL + n8n AI Lead Scoring System');
  const [clientName, setClientName] = useState('Acme Growth Labs');
  const [revisionsLimit, setRevisionsLimit] = useState(2);
  const [copied, setCopied] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      title: 'Phase 1: Architecture & Webhook Sync',
      deliverables: 'Configure n8n environment, connect GoHighLevel webhooks, set up payload validation.',
      payment: 1000,
    },
    {
      title: 'Phase 2: AI Lead Scoring Engine',
      deliverables: 'Integrate OpenAI structured outputs, custom prompt engineering, Supabase database storage.',
      payment: 1500,
    },
    {
      title: 'Phase 3: Testing & Video Handoff',
      deliverables: 'End-to-end integration testing, video walkthrough documentation, 14-day post-launch support.',
      payment: 500,
    },
  ]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Phase ${milestones.length + 1}: Custom Integration`,
        deliverables: 'Describe deliverables here...',
        payment: 1000,
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== index));
  };

  const totalValue = milestones.reduce((acc, curr) => acc + curr.payment, 0);

  const generateSOWText = () => {
    return `SCOPE OF WORK (SOW) & DELIVERABLE AGREEMENT

Project: ${projectName}
Client: ${clientName}
Total Project Value: $${totalValue.toLocaleString()}
Revision Policy: Includes up to ${revisionsLimit} rounds of revisions per milestone.

==================================================
MILESTONE BREAKDOWN & PAYMENT SCHEDULE
==================================================

${milestones
  .map(
    (m, i) => `[${i + 1}] ${m.title} - $${m.payment.toLocaleString()}
Deliverables: ${m.deliverables}
`
  )
  .join('\n')}

==================================================
TERMS & SCOPE DEFENSE
==================================================
1. Payment Terms: 50% deposit required before project kickoff, remainder due upon completion of Phase 3.
2. Out-of-Scope Requests: Any additions to this specification will be billed separately at the standard rate.
3. Access Requirements: Client will provide API keys and access credentials within 48 hours of project start.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSOWText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '0 28px 40px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText color="var(--primary)" /> Scope of Work (SOW) Builder
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Protect your project against scope creep and set clear payment milestones for client contracts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
        
        {/* Editor */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Project Agreement Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client Name / Business</label>
              <input 
                type="text" 
                className="form-input" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Included Revision Rounds</label>
            <input 
              type="number" 
              className="form-input" 
              value={revisionsLimit} 
              onChange={(e) => setRevisionsLimit(Number(e.target.value))} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>Milestones ({milestones.length})</h4>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={addMilestone}>
              <Plus size={14} /> Add Milestone
            </button>
          </div>

          {milestones.map((m, idx) => (
            <div key={idx} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: 1, fontWeight: 700 }} 
                  value={m.title} 
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[idx].title = e.target.value;
                    setMilestones(updated);
                  }} 
                />
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: '100px' }} 
                  value={m.payment} 
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[idx].payment = Number(e.target.value);
                    setMilestones(updated);
                  }} 
                />
                <button 
                  onClick={() => removeMilestone(idx)} 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea 
                className="form-textarea" 
                style={{ minHeight: '60px', fontSize: '0.85rem' }} 
                value={m.deliverables} 
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[idx].deliverables = e.target.value;
                  setMilestones(updated);
                }} 
              />
            </div>
          ))}
        </div>

        {/* Live Preview */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Formatted SOW Document</h3>
            <button className="btn btn-primary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied to Clipboard' : 'Copy SOW Text'}
            </button>
          </div>

          <div style={{ 
            background: '#070a12', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '8px', 
            padding: '20px', 
            fontFamily: 'monospace', 
            fontSize: '0.85rem', 
            color: '#cbd5e1', 
            whiteSpace: 'pre-wrap', 
            lineHeight: '1.6',
            flex: 1
          }}>
            {generateSOWText()}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={14} color="var(--accent-amber)" /> Never start work without explicit written approval of the Scope of Work and initial deposit.
          </div>
        </div>

      </div>
    </div>
  );
};
