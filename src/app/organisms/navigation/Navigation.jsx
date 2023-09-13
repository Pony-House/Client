import React from 'react';

import SideBar from './Sidebar';
import Drawer from './Drawer';
import ProfileAvatarMenu from './ProfileAvatarMenu';

function Navigation() {
  return (
    <div className="sidebar">
      <div className='sidebar-1'><SideBar /></div>
      <div id="space-header" className='sidebar-2 border-end border-bg'><Drawer /></div>
      <div id="profile-sidebar" className='sidebar-3 border-start border-bg'><ProfileAvatarMenu /></div>
    </div>
  );
}

export default Navigation;
