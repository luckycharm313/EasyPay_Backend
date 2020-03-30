import React from 'react';
import './style.css';

function Nav() {    
  const activeLinkStyle = { background: 'rgba(75, 212, 141, 0.3)' };
  
  return (
    <div className='nav-menu pt-4'>
      <ul>
        <li>
          <a
            href='/'
            style={document.location.pathname === '/' ? activeLinkStyle : {}}
          >
            <div className='text'>
              <p>Dashboard</p>
              <span>D</span>
            </div>
          </a>
        </li>
      </ul>
    </div>
  )
}

export default Nav;