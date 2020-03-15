import React/*, { useState, useEffect } */from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Nav from '../../components/nav';
import './style.css';

function Dashboard() {
  
  return (      
    <div className='d-flex flex-row h-100'>
      <Nav />
    </div>
  );
}
const mapStateToProps = (state) => ({
  
});
const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
