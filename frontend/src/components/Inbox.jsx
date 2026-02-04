import React, { useEffect, useState } from 'react';
import { getInbox, getSent, getTrash, getDrafts, getSpam, deleteEmail } from '../api';

const Inbox = ({ onSelectEmail, folder = 'inbox' }) => {
    const [emails, setEmails] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [refreshing, setRefreshing] = useState(false);

    // Mock Data for visual fidelity if API is empty/loading
    const mockData = {
        inbox: [
            { id: 999, sender: "Google <no-reply@accounts.google.com>", subject: "Security alert", sent_at: new Date().toISOString(), is_encrypted: false },
        ],
        sent: [
            { id: 996, sender: "To: alice@example.com", subject: "Re: Project Update", sent_at: new Date().toISOString(), is_encrypted: false },
        ],
        trash: [
            { id: 995, sender: "Spammer", subject: "Win a Prize", sent_at: new Date().toISOString(), is_encrypted: false }
        ],
        spam: [],
        drafts: []
    }

    const fetchData = async () => {
        setRefreshing(true);
        try {
            let res;
            switch (folder) {
                case 'sent': res = await getSent(); break;
                case 'trash': res = await getTrash(); break;
                case 'drafts': res = await getDrafts(); break;
                case 'spam': res = await getSpam(); break;
                default: res = await getInbox();
            }

            const serverData = res.data || [];
            setEmails(serverData);

        } catch (e) {
            console.error("Fetch Error:", e);
            // Don't use mocks on error, user needs to know it failed
            setEmails([]);
        } finally {
            setTimeout(() => setRefreshing(false), 500);
        }
    };

    useEffect(() => {
        setEmails([]); // Reset
        setSelectedIds(new Set());
        fetchData();

        // Auto-refresh every 5 seconds to catch new messages
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [folder]);

    const toggleSelectAll = () => {
        if (selectedIds.size === emails.length && emails.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(emails.map(e => e.id)));
        }
    };

    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`Delete ${selectedIds.size} emails?`)) {
            setRefreshing(true);
            try {
                // Execute deletes in parallel
                const promises = Array.from(selectedIds).map(id => deleteEmail(id));
                await Promise.all(promises);

                // Refresh data from server to ensure state consistency
                await fetchData();
                setSelectedIds(new Set()); // Clear selection
            } catch (error) {
                console.error("Bulk delete failed", error);
                alert("Failed to delete some emails. Please try again.");
                // Still refresh to show what happened
                fetchData();
            } finally {
                setRefreshing(false);
            }
        }
    }

    // Date formatter for Indian Standard Time area
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            // Explicitly force IST (Asia/Kolkata)
            return date.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="w-full h-full flex-col glass-panel" style={{ borderRadius: '0', border: 'none', background: 'transparent', display: 'flex' }}>
            {/* Toolbar */}
            <div className="glass" style={{
                padding: '12px 24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                borderBottom: '1px solid var(--glass-border)',
                background: '#1a1b21',
                borderRadius: '20px 20px 0 0' // Top rounded only
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        checked={emails.length > 0 && selectedIds.size === emails.length}
                        onChange={toggleSelectAll}
                        style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer' }}
                        title="Select All"
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Select All</span>
                </div>

                <div style={{ width: '1px', height: '24px', background: '#333', margin: '0 10px' }}></div>

                {/* Explicit Text Buttons to remove confusion */}
                <button
                    className={`btn btn-ghost ${refreshing ? 'spin' : ''}`}
                    onClick={fetchData}
                    title="Refresh Inbox"
                    style={{ color: refreshing ? 'var(--primary)' : 'inherit' }}
                >
                    <span>🔄</span> Refresh
                </button>

                {selectedIds.size > 0 && (
                    <>
                        <button className="btn btn-ghost hover-danger" title="Move to Trash" onClick={handleBulkDelete}>
                            <span>🗑️</span> Delete
                        </button>
                        <button className="btn btn-ghost" title="Archive Email">
                            <span>📦</span> Archive
                        </button>
                        <button className="btn btn-ghost" title="Add Label">
                            <span>🏷️</span> Label
                        </button>
                    </>
                )}

                <div style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                    {folder === 'inbox' ? 'INBOX' : folder.toUpperCase()} {selectedIds.size > 0 ? `(${selectedIds.size} SELECTED)` : ''}
                </div>
            </div>

            {/* List Header */}
            <div style={{
                display: 'grid', gridTemplateColumns: '40px 200px 1fr 150px 120px',
                padding: '12px 24px',
                borderBottom: '1px solid #2d2e36',
                fontSize: '0.75rem', fontWeight: 'bold',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#131419'
            }}>
                <div></div>
                <div>Sender</div>
                <div>Subject</div>
                <div>Security</div>
                <div style={{ textAlign: 'right' }}>Date</div>
            </div>

            {/* Email List - Explicit overflow for scrolling */}
            <div style={{ flex: 1, overflowY: 'scroll', minHeight: 0 }}>
                {emails.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        No messages in {folder}.
                    </div>
                ) : (
                    emails.map((e, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelectEmail(e)}
                            className={`email-row ${selectedIds.has(e.id) ? 'selected' : ''}`}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 200px 1fr 150px 120px',
                                padding: '16px 24px',
                                borderBottom: '1px solid #23242a',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: selectedIds.has(e.id) ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                            }}
                            onMouseEnter={(ev) => ev.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                            onMouseLeave={(ev) => ev.currentTarget.style.background = selectedIds.has(e.id) ? 'rgba(124, 58, 237, 0.1)' : 'transparent'}
                        >
                            {/* Checkbox */}
                            <div onClick={(ev) => ev.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(e.id)}
                                    onChange={() => toggleSelect(e.id)}
                                    style={{ width: '16px', height: '16px', margin: 0 }}
                                />
                            </div>

                            {/* Sender */}
                            <div style={{
                                fontWeight: !e.read && folder === 'inbox' ? '700' : '400',
                                color: (folder === 'sent' || folder === 'drafts') ? '#9ca3af' : 'white',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '15px'
                            }}>
                                {e.sender ? e.sender.split('<')[0] : "Unknown"}
                            </div>

                            {/* Subject + Snippet */}
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                                {e.is_encrypted && <span title="Encrypted" style={{ fontSize: '1rem', marginRight: '8px' }}>🔒</span>}

                                {e.is_encrypted ? (
                                    <span style={{
                                        fontFamily: '"Fira Code", monospace',
                                        color: '#ef4444',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        *** ENCRYPTED METADATA ***
                                    </span>
                                ) : (
                                    <span style={{ color: !e.read ? 'white' : '#cbd5e1' }}>
                                        {e.subject || "(No Subject)"}
                                    </span>
                                )}

                                <span style={{ color: '#6b7280', marginLeft: '12px', fontSize: '0.85rem' }}>
                                    - {e.is_encrypted ? "Encrypted Content..." : "Click to read more..."}
                                </span>
                            </div>

                            {/* Security Badge */}
                            <div>
                                {e.is_encrypted ? (
                                    (e.encryption_level === 'otp' || e.encryption_level === 'otp_client') ?
                                        <span style={{
                                            color: '#00ff88', fontSize: '0.7rem', fontWeight: 'bold',
                                            border: '1px solid #00ff88', padding: '4px 10px', borderRadius: '20px',
                                            background: 'rgba(0,255,136,0.1)',
                                            boxShadow: '0 0 10px rgba(0,255,136,0.2)'
                                        }}>OT PAD</span> :
                                        <span style={{
                                            color: '#a78bfa', fontSize: '0.7rem', fontWeight: 'bold',
                                            border: '1px solid #a78bfa', padding: '4px 10px', borderRadius: '20px',
                                            background: 'rgba(124, 58, 237, 0.1)',
                                            boxShadow: '0 0 10px rgba(124, 58, 237, 0.2)'
                                        }}>AES-256</span>
                                ) : (
                                    <span style={{ color: '#6b7280', fontSize: '0.75rem', opacity: 0.7 }}>Plaintext</span>
                                )}
                            </div>

                            {/* Date */}
                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#6b7280' }}>
                                {formatDate(e.sent_at)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                padding: '10px',
                color: '#10b981',
                fontSize: '0.75rem',
                borderTop: '1px solid #2d2e36',
                background: '#131419',
                letterSpacing: '0.5px',
                fontFamily: '"Fira Code", monospace',
                borderRadius: '0 0 20px 20px'
            }}>
                Network: SECURE • QKD LINK: ACTIVE
            </div>
        </div>
    );
};

export default Inbox;
