import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, DollarSign, Tag, CheckCircle2, Flame } from 'lucide-react';

export interface Lead {
  id: string;
  clientName: string;
  projectTitle: string;
  value: number;
  stage: 'backlog' | 'proposal' | 'interview' | 'won' | 'retainer';
  source: 'Upwork' | 'Skool' | 'Cold Outreach' | 'Referral';
  priority: 'High' | 'Medium' | 'Normal';
  dateAdded: string;
}

interface PipelineBoardProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id' | 'dateAdded'>) => void;
  onMoveLead: (id: string, newStage: Lead['stage']) => void;
  onDeleteLead: (id: string) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ leads, onAddLead, onMoveLead, onDeleteLead }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState(2500);
  const [newStage, setNewStage] = useState<Lead['stage']>('proposal');
  const [newSource, setNewSource] = useState<Lead['source']>('Upwork');
  const [newPriority, setNewPriority] = useState<Lead['priority']>('High');

  const stages: { id: Lead['stage']; label: string; color: string }[] = [
    { id: 'backlog', label: 'Saved / Prospecting', color: 'var(--text-muted)' },
    { id: 'proposal', label: 'Proposal Sent', color: '#a5b4fc' },
    { id: 'interview', label: 'Interview Scheduled', color: 'var(--accent-amber)' },
    { id: 'won', label: 'Contract Won', color: 'var(--accent-emerald)' },
    { id: 'retainer', label: 'Active Retainer', color: 'var(--accent-purple)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newTitle.trim()) return;
    onAddLead({
      clientName: newClient,
      projectTitle: newTitle,
      value: Number(newValue),
      stage: newStage,
      source: newSource,
      priority: newPriority,
    });
    setNewClient('');
    setNewTitle('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '0 28px 40px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Deal & Proposal Pipeline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track client leads, active proposals, and recurring retainers in real-time.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Deal
        </button>
      </div>

      {/* Kanban Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const stageTotal = stageLeads.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div key={stage.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Stage Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.color }}></span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{stage.label}</h3>
                </div>
                <span className="badge badge-indigo">{stageLeads.length}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 600 }}>
                Total: <span style={{ color: 'var(--accent-emerald)' }}>${stageTotal.toLocaleString()}</span>
              </div>

              {/* Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {stageLeads.length === 0 ? (
                  <div style={{ border: '1px dashed var(--border-subtle)', borderRadius: '8px', padding: '24px 12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    No deals in {stage.label.toLowerCase()}
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      style={{ 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '10px', 
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{lead.clientName}</div>
                        <button 
                          onClick={() => onDeleteLead(lead.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.projectTitle}</div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <DollarSign size={14} />{lead.value.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            <Tag size={10} /> {lead.source}
                          </span>
                          {lead.priority === 'High' && (
                            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                              <Flame size={10} /> Hot
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stage Move Controls */}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-end' }}>
                        {stage.id !== 'won' && stage.id !== 'retainer' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              const nextStage = stage.id === 'backlog' ? 'proposal' : stage.id === 'proposal' ? 'interview' : 'won';
                              onMoveLead(lead.id, nextStage);
                            }}
                          >
                            Advance <ArrowRight size={12} />
                          </button>
                        )}
                        {stage.id === 'interview' && (
                          <button 
                            className="btn btn-emerald" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => onMoveLead(lead.id, 'won')}
                          >
                            <CheckCircle2 size={12} /> Mark Won
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Add New Freelance Opportunity</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Client / Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Acme Corp or John (Upwork)" 
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Scope / Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Full-Stack Automation & n8n Pipeline" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Deal Value ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="2500" 
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Stage</label>
                  <select 
                    className="form-select" 
                    value={newStage} 
                    onChange={(e) => setNewStage(e.target.value as Lead['stage'])}
                  >
                    <option value="backlog">Saved Prospect</option>
                    <option value="proposal">Proposal Sent</option>
                    <option value="interview">Interview</option>
                    <option value="won">Contract Won</option>
                    <option value="retainer">Retainer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lead Source</label>
                  <select 
                    className="form-select" 
                    value={newSource} 
                    onChange={(e) => setNewSource(e.target.value as Lead['source'])}
                  >
                    <option value="Upwork">Upwork</option>
                    <option value="Skool">Skool Community</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select 
                  className="form-select" 
                  value={newPriority} 
                  onChange={(e) => setNewPriority(e.target.value as Lead['priority'])}
                >
                  <option value="High">Hot / High Priority</option>
                  <option value="Medium">Medium</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
