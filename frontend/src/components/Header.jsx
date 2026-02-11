import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-logo">
            🎨 Whiteboard
          </div>
          <input 
            type="text" 
            defaultValue="Untitled" 
            className="board-name-input"
          />
          <button className="header-menu-btn" title="More options">
            ⋮
          </button>
        </div>
        <div className="header-right">
          <button className="header-btn" title="Video call">
            📹
          </button>
          <button className="header-btn" title="Comments">
            💬
          </button>
          <button className="profile-button">
            <div className="profile-icon"></div>
          </button>
          <button className="present-button">
            ▶ Present
          </button>
          <button className="share-button">
            ⬆ Share
          </button>
        </div>
      </div>
    </header>
  );
}
