import type { FC } from 'react';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: Props) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
  { id: 'buildings', label: 'Buildings' },
  { id: 'co2-tracker', label: 'CO₂ Tracker' }, 
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav style={{
      backgroundColor: '#000000',
      borderBottom: '2px solid #F74902',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#F74902',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1.5rem',
          }}>
            OSU
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#FFFFFF' }}>
              Campus Energy Tracker
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#F74902' }}>
              Oregon State University
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <ul style={{
          display: 'flex',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          gap: '0.5rem',
        }}>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                style={{
                  backgroundColor: currentPage === item.id ? '#F74902' : 'transparent',
                  color: currentPage === item.id ? '#FFFFFF' : '#F74902',
                  border: currentPage === item.id ? 'none' : '2px solid #F74902',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: currentPage === item.id ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.backgroundColor = '#F74902';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#F74902';
                  }
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}