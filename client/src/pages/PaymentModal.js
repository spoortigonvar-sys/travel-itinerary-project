import { useState } from 'react';

function fmtAmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Yes Bank'];

export default function PaymentModal({ payment, onClose, onSuccess }) {
  const [tab, setTab]   = useState('upi');
  const [upi, setUpi]   = useState('');
  const [card, setCard] = useState({ num: '', name: '', exp: '', cvv: '' });
  const [bank, setBank] = useState('');
  const [step, setStep] = useState('form'); // form | processing | success
  const [err, setErr]   = useState('');

  const validate = () => {
    if (tab === 'upi' && !upi.includes('@'))            { setErr('Enter a valid UPI ID e.g. rahul@upi'); return false; }
    if (tab === 'card') {
      if (card.num.replace(/\s/g,'').length < 16)       { setErr('Enter a valid 16-digit card number'); return false; }
      if (!card.name.trim())                             { setErr('Enter cardholder name'); return false; }
      if (!card.exp.match(/^\d{2}\/\d{2}$/))            { setErr('Enter expiry as MM/YY'); return false; }
      if (card.cvv.length < 3)                          { setErr('Enter a valid CVV'); return false; }
    }
    if (tab === 'netbanking' && !bank)                  { setErr('Please select a bank'); return false; }
    return true;
  };

  const pay = () => {
    setErr('');
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => setStep('success'), 2200);
  };

  const fmtCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp  = (v) => { const d = v.replace(/\D/g,''); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2,4) : d; };

  const TAB = (active) => ({
    flex: 1, padding: '9px 0', textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    color: active ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s',
  });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:400, maxWidth:'95vw', overflow:'hidden', boxShadow:'0 25px 70px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ background:'var(--sidebar)', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", color:'#fff', fontSize:16 }}>Wandr Pay</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Secure Mock Payment</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>{payment.from} → {payment.to}</div>
            <div style={{ color:'#fff', fontSize:22, fontWeight:600 }}>{fmtAmt(payment.amount)}</div>
          </div>
        </div>

        {step === 'form' && (
          <div style={{ padding:22 }}>
            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:20 }}>
              <div style={TAB(tab==='upi')}         onClick={() => { setTab('upi');        setErr(''); }}>📱 UPI</div>
              <div style={TAB(tab==='card')}        onClick={() => { setTab('card');       setErr(''); }}>💳 Card</div>
              <div style={TAB(tab==='netbanking')}  onClick={() => { setTab('netbanking'); setErr(''); }}>🏦 Net Banking</div>
            </div>

            {/* UPI */}
            {tab === 'upi' && (
              <div>
                <div style={{ textAlign:'center', marginBottom:16 }}>
                  <div style={{ width:90, height:90, margin:'0 auto 10px', background:'#f3f4f6', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)' }}>
                    <svg viewBox="0 0 40 40" width="72" height="72">
                      {Array.from({length:10},(_,r)=>Array.from({length:10},(_,c)=>(Math.sin(r*c+r+c)*10)%2>0?<rect key={`${r}-${c}`} x={c*4} y={r*4} width="3" height="3" fill="#1a1a2e"/>:null))}
                      <rect x="1" y="1" width="10" height="10" fill="none" stroke="#1a1a2e" strokeWidth="1.5"/>
                      <rect x="29" y="1" width="10" height="10" fill="none" stroke="#1a1a2e" strokeWidth="1.5"/>
                      <rect x="1" y="29" width="10" height="10" fill="none" stroke="#1a1a2e" strokeWidth="1.5"/>
                      <rect x="3" y="3" width="6" height="6" fill="#1a1a2e"/>
                      <rect x="31" y="3" width="6" height="6" fill="#1a1a2e"/>
                      <rect x="3" y="31" width="6" height="6" fill="#1a1a2e"/>
                    </svg>
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Scan with any UPI app or enter UPI ID below</div>
                </div>
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input className="form-input" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@upi" />
                </div>
              </div>
            )}

            {/* Card */}
            {tab === 'card' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" value={card.num} maxLength={19} placeholder="0000 0000 0000 0000"
                    style={{ fontFamily:'monospace', letterSpacing:2 }}
                    onChange={(e) => setCard((c) => ({ ...c, num: fmtCard(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input className="form-input" value={card.name} placeholder="RAHUL SHARMA" style={{ textTransform:'uppercase' }}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input className="form-input" value={card.exp} maxLength={5} placeholder="MM/YY"
                      onChange={(e) => setCard((c) => ({ ...c, exp: fmtExp(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" type="password" value={card.cvv} maxLength={4} placeholder="•••"
                      onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g,'') }))} />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking */}
            {tab === 'netbanking' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {BANKS.map((b) => (
                  <div key={b} onClick={() => setBank(b)}
                    style={{ padding:'10px 12px', border:`1.5px solid ${bank===b?'var(--accent)':'var(--border)'}`, borderRadius:8, cursor:'pointer', fontSize:12, background:bank===b?'#fff5f2':'#fff', fontWeight:bank===b?500:400, transition:'all 0.15s' }}>
                    🏦 {b}
                  </div>
                ))}
              </div>
            )}

            {err && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:6, padding:'8px 12px', fontSize:12, marginTop:12 }}>{err}</div>}

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={pay}>Pay {fmtAmt(payment.amount)}</button>
            </div>
            <div style={{ textAlign:'center', marginTop:10, fontSize:10, color:'var(--muted)' }}>🔒 Demo only — no real money is transferred</div>
          </div>
        )}

        {step === 'processing' && (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', border:'4px solid #f3f4f6', borderTop:'4px solid var(--accent)', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
            <div style={{ fontWeight:500, fontSize:15, marginBottom:4 }}>Processing payment…</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>Please wait, do not close this window</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28 }}>✅</div>
            <div style={{ fontWeight:600, fontSize:17, marginBottom:6 }}>Payment Successful!</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>
              <strong>{payment.from}</strong> paid <strong>{fmtAmt(payment.amount)}</strong> to <strong>{payment.to}</strong>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:24 }}>Transaction ID: WDR{Date.now().toString().slice(-8)}</div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={onSuccess}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}