import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import BattlePlanV1 from '../G3BattlePlan.jsx'
import BattlePlanV2 from '../G3BattlePlan2.jsx'

function App() {
  const [version, setVersion] = useState(2)

  return (
    <>
      {/* Version toggle pill — fixed, above both navs */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(8,8,9,0.92)',
        border: '1px solid #252729',
        borderRadius: 8,
        padding: '4px 5px',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{
          fontSize: 9,
          letterSpacing: 2,
          color: '#6B6965',
          fontFamily: 'sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          paddingRight: 4,
        }}>
          DRAFT
        </span>
        {[1, 2].map(v => (
          <button
            key={v}
            onClick={() => setVersion(v)}
            style={{
              background: version === v ? '#F5C518' : 'transparent',
              border: `1px solid ${version === v ? '#F5C518' : '#252729'}`,
              color: version === v ? '#080809' : '#6B6965',
              borderRadius: 5,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'sans-serif',
              cursor: 'pointer',
              transition: 'all .15s',
              letterSpacing: 0.5,
            }}
          >
            V{v}
          </button>
        ))}
      </div>

      {version === 1 ? <BattlePlanV1 /> : <BattlePlanV2 />}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
