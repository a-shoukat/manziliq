import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { getDocumentUrl } from '../lib/storage';
import type { VerificationStatus } from '../types';

interface QueueItem {
  id: string;
  email: string;
  role: string;
  verification_status: VerificationStatus;
  created_at: string;
  detail: Record<string, string | number | null> | null;
  detailTable: string;
}

/** WBS: Admin Panel — Society Verification (6) + Dealer Verification (5) + Customer CNIC review */
export default function AdminVerification({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [customers, setCustomers] = useState<(QueueItem & { cnic_number: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['dealer', 'society_admin'])
      .order('created_at', { ascending: false });

    const out: QueueItem[] = [];
    for (const p of profiles ?? []) {
      const table = p.role === 'dealer' ? 'dealer_details' : 'society_details';
      const { data: d } = await supabase
        .from(table)
        .select('*')
        .eq('profile_id', p.id)
        .single();
      out.push({ ...p, detail: d ?? null, detailTable: table });
    }
    setItems(out);

    // customer CNIC review queue (WBS: Customer CNIC verification)
    const { data: buyers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'buyer')
      .order('created_at', { ascending: false })
      .limit(100);
    const custOut: (QueueItem & { cnic_number: string | null })[] = [];
    for (const p of buyers ?? []) {
      const { data: d } = await supabase.from('customer_details').select('cnic_number, contact_phone').eq('profile_id', p.id).single();
      custOut.push({ ...p, detail: null, detailTable: 'customer_details', cnic_number: (d as { cnic_number: string | null } | null)?.cnic_number ?? null });
    }
    setCustomers(custOut);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: VerificationStatus) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setActing(id);
    await supabase.from('profiles').update({ verification_status: status }).eq('id', id);
    setActing(null);
    load();
  };

  const openDoc = async (path: string | null) => {
    if (!path) return;
    const url = await getDocumentUrl(path);
    if (url) window.open(url, '_blank');
  };

  const pending = items.filter((i) => i.verification_status === 'pending');
  const decided = items.filter((i) => i.verification_status !== 'pending');

  const renderRow = (i: QueueItem) => (
    <div key={i.id} className="queue-card">
      <div className="queue-head">
        <div>
          <strong>{i.role === 'dealer' ? i.detail?.firm_name ?? i.email : i.detail?.society_name ?? i.email}</strong>
          <div className="muted small">
            {i.role === 'dealer' ? 'Dealer' : 'Society'} · {i.email}
          </div>
        </div>
        <span className={`badge ${i.verification_status === 'approved' ? 'ok' : i.verification_status === 'pending' ? 'warn' : 'warn'}`}>
          {i.verification_status}
        </span>
      </div>
      {i.detail && (
        <div className="detail-grid">
          {Object.entries(i.detail)
            .filter(([k]) => !['profile_id', 'created_at'].includes(k))
            .map(([k, v]) => (
              <div key={k} className="detail-item">
                <span className="detail-key">{k.replace(/_/g, ' ')}</span>
                {String(v ?? '').includes('/') && (k.includes('url') || k.includes('doc') || k.includes('photo')) ? (
                  <button className="link inline" onClick={() => openDoc(v as string)}>
                    View document
                  </button>
                ) : (
                  <span>{String(v ?? '—')}</span>
                )
              }
              </div>
            ))}
        </div>
      )}
      {i.verification_status === 'pending' && (
        <div className="link-row">
          <button className="btn small" disabled={acting === i.id} onClick={() => setStatus(i.id, 'approved')}>
            Approve
          </button>
          <button className="btn secondary small" disabled={acting === i.id} onClick={() => setStatus(i.id, 'rejected')}>
            Reject
          </button>
          {i.role === 'dealer' && (
            <button className="btn danger small" disabled={acting === i.id} onClick={() => setStatus(i.id, 'blacklisted')}>
              Blacklist
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="card wide">
        <div className="topbar">
          <div>
            <h1>Verification queue</h1>
            <p className="muted" style={{ margin: 0 }}>
              Society & dealer registrations awaiting review
            </p>
          </div>
          <button className="btn secondary small" onClick={() => onNavigate('dashboard')}>
            Dashboard
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <h3>Pending ({pending.length})</h3>
            {pending.length === 0 && <p className="muted">Nothing awaiting review.</p>}
            {pending.map(renderRow)}
            <h3 style={{ marginTop: 24 }}>Decided ({decided.length})</h3>
            {decided.map(renderRow)}

            <h3 style={{ marginTop: 32 }}>Customer CNIC review</h3>
            <p className="muted small">Buyers are auto-approved at signup — review their CNIC numbers here.</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Email</th><th>CNIC</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="small">{c.email}</td>
                      <td>{c.cnic_number ?? <span className="muted">—</span>}</td>
                      <td><span className={`badge ${c.verification_status === 'approved' ? 'ok' : c.verification_status === 'pending' ? 'warn' : 'warn'}`}>{c.verification_status}</span></td>
                      <td>
                        <div className="link-row">
                          <button className="btn small" disabled={acting === c.id} onClick={() => setStatus(c.id, 'approved')}>Verify</button>
                          <button className="btn secondary small" disabled={acting === c.id} onClick={() => setStatus(c.id, 'rejected')}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && <p className="muted small">No customers yet.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
