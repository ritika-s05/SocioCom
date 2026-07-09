'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Pulse dot component
const PulseDot = ({ color = '#00D9FF' }) => (
  <span style={{ position: 'relative', display: 'inline-block', width: 10, height: 10 }}>
    <span style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      background: color, animation: 'ping 1.5s ease-in-out infinite', opacity: 0.6
    }} />
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
  </span>
);

// ── Stat card
const StatCard = ({ label, value, sub, accent = '#00D9FF', icon }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
    border: `1px solid ${accent}22`,
    borderRadius: 16, padding: '24px',
    display: 'flex', flexDirection: 'column', gap: 8,
    transition: 'border-color 0.3s, transform 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}22`; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#888', fontSize: 12, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ color: accent, fontSize: 32, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ color: '#666', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{sub}</div>}
  </div>
);

// ── Engagement bar (Roblox health bar style)
const EngagementBar = ({ rate, max = 20 }) => {
  const [width, setWidth] = useState(0);
  const pct = Math.min((rate / max) * 100, 100);
  const color = rate > 10 ? '#00D9FF' : rate > 5 ? '#E94560' : '#666';

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#0A0A0F', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${width}%`, background: color,
          borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}88`
        }} />
      </div>
      <span style={{ color, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', minWidth: 40, textAlign: 'right' }}>
        {rate.toFixed(1)}%
      </span>
    </div>
  );
};

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [serverOk, setServerOk] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [healthRes, postsRes] = await Promise.all([
          fetch(`${API}/health`),
          fetch(`${API}/api/instagram/posts`),
        ]);
        const health = await healthRes.json();
        const postsData = await postsRes.json();
        setServerOk(health.status === 'ok');
        setPosts(postsData.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const avgEngagement = posts.length ? (posts.reduce((s, p) => s + p.engagement_rate, 0) / posts.length) : 0;
  const topPost = posts.reduce((best, p) => p.engagement_rate > (best?.engagement_rate || 0) ? p : best, null);

  const chartData = posts
    .slice(0, 10)
    .map(p => ({
      name: p.caption?.slice(0, 15) + '…' || p.instagram_post_id,
      reach: p.reach,
      likes: p.likes,
      engagement: parseFloat(p.engagement_rate.toFixed(2)),
    }));

  const tabs = ['overview', 'posts', 'campaigns'];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#00D9FF', fontSize: 32, fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>
          SOCIOCOM
        </div>
        <div style={{ color: '#444', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0A0F; }
        @keyframes ping { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(2); opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>

        {/* ── Header */}
        <div style={{
          borderBottom: '1px solid #1A1A2E', padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
          position: 'sticky', top: 0, background: '#0A0A0F', zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#E94560', fontSize: 18, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: 2 }}>
              SOCIOCOM
            </span>
            <span style={{ color: '#333', fontSize: 12 }}>|</span>
            <span style={{ color: '#555', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>Social Commerce Intelligence</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PulseDot color={serverOk ? '#00D9FF' : '#E94560'} />
            <span style={{ color: '#555', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              {serverOk ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* ── Nav tabs */}
        <div style={{ borderBottom: '1px solid #1A1A2E', padding: '0 32px', display: 'flex', gap: 0 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 20px', fontSize: 13, fontFamily: 'Inter, sans-serif',
              color: activeTab === tab ? '#00D9FF' : '#555',
              borderBottom: activeTab === tab ? '2px solid #00D9FF' : '2px solid transparent',
              textTransform: 'capitalize', transition: 'color 0.2s',
              fontWeight: activeTab === tab ? 600 : 400,
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Main content */}
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }} className="fade-up">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Stat cards */}
              <div className="card-grid">
                <StatCard label="Total Reach" value={totalReach.toLocaleString()} sub="across all posts" icon="📡" accent="#00D9FF" />
                <StatCard label="Total Likes" value={totalLikes.toLocaleString()} sub="from Instagram" icon="❤️" accent="#E94560" />
                <StatCard label="Avg Engagement" value={`${avgEngagement.toFixed(1)}%`} sub="across 25 posts" icon="⚡" accent="#F5A623" />
                <StatCard label="Posts Tracked" value={posts.length} sub="synced from Instagram" icon="📸" accent="#7B61FF" />
              </div>

              {/* Top post highlight */}
              {topPost && (
                <div style={{
                  background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
                  border: '1px solid #E9456022', borderRadius: 16, padding: 24,
                }}>
                  <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                    🏆 Top Performing Post
                  </div>
                  <div style={{ color: '#F5F5F5', fontSize: 15, marginBottom: 12, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                    {topPost.caption?.slice(0, 120)}...
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <span style={{ color: '#00D9FF', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                      {topPost.reach.toLocaleString()} reach
                    </span>
                    <span style={{ color: '#E94560', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                      {topPost.engagement_rate.toFixed(1)}% engagement
                    </span>
                    <a href={topPost.permalink} target="_blank" rel="noreferrer"
                      style={{ color: '#7B61FF', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, textDecoration: 'none' }}>
                      View on Instagram →
                    </a>
                  </div>
                </div>
              )}

              {/* Reach chart */}
              <div style={{
                background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
                border: '1px solid #1A1A2E', borderRadius: 16, padding: 24,
              }}>
                <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, fontFamily: 'JetBrains Mono, monospace' }}>
                  Reach by Post (Top 10)
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barSize={24}>
                    <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0A0A0F', border: '1px solid #333', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                      labelStyle={{ color: '#888' }}
                      itemStyle={{ color: '#00D9FF' }}
                    />
                    <Bar dataKey="reach" fill="#00D9FF" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}

          {/* POSTS TAB */}
          {activeTab === 'posts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                {posts.length} Posts — sorted by engagement
              </div>
              {[...posts].sort((a, b) => b.engagement_rate - a.engagement_rate).map((post, i) => (
                <div key={post.instagram_post_id} style={{
                  background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
                  border: '1px solid #1A1A2E', borderRadius: 12, padding: '16px 20px',
                  display: 'grid', gridTemplateColumns: '32px 1fr 120px 80px 80px',
                  alignItems: 'center', gap: 16,
                  transition: 'border-color 0.2s',
                  animationDelay: `${i * 0.03}s`,
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1A1A2E'}
                >
                  <span style={{ color: '#333', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ color: '#F5F5F5', fontSize: 13, marginBottom: 4, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                      {post.caption?.slice(0, 60) || 'No caption'}...
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: '#555', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                        {post.media_type}
                      </span>
                      <span style={{ color: '#555', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                        {new Date(post.posted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <EngagementBar rate={post.engagement_rate} />
                  <span style={{ color: '#00D9FF', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textAlign: 'right' }}>
                    {post.reach.toLocaleString()}
                  </span>
                  <a href={post.permalink} target="_blank" rel="noreferrer"
                    style={{ color: '#7B61FF', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', textAlign: 'right' }}>
                    View →
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                Automation Engine — Campaign History
              </div>

              {/* Automation status card */}
              <div style={{
                background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
                border: '1px solid #00D9FF22', borderRadius: 16, padding: 24,
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <PulseDot color="#00D9FF" />
                <div>
                  <div style={{ color: '#F5F5F5', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                    Automation Engine Running
                  </div>
                  <div style={{ color: '#555', fontSize: 12, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                    Checking every hour — high engagement posts trigger Mailchimp campaigns automatically
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ color: '#00D9FF', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                    THRESHOLD
                  </div>
                  <div style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700 }}>
                    5.0%
                  </div>
                </div>
              </div>

              {/* Placeholder campaign log */}
              <div style={{
                background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
                border: '1px solid #1A1A2E', borderRadius: 16, padding: 24,
              }}>
                <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>
                  Recent Triggers
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                  background: '#0A0A0F', borderRadius: 10, border: '1px solid #1A1A2E',
                }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#F5F5F5', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                      Campaign triggered for <span style={{ color: '#00D9FF' }}>Hat</span>
                    </div>
                    <div style={{ color: '#555', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                      Matched with post — 18.6% engagement rate
                    </div>
                  </div>
                  <span style={{
                    background: '#00D9FF22', color: '#00D9FF', fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace', padding: '4px 10px', borderRadius: 99,
                  }}>
                    TRIGGERED
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}