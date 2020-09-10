import React from 'react';
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import './style.css';

const Toast = ({ 
  bgClass,
  content1,
  content2 = ''
}) => (
  <div className={`toast-container ${bgClass} text-white`}>
    <div className='content text-left'>
      { content1 }
      <br />
      { content2 }
    </div>
  </div>
)

function handleToastify(
  bgClass,
  content1,
  content2 = ''
) {
  toast(
    <Toast 
      bgClass={bgClass}
      content1={content1}
      content2={content2}
    />, 
    { 
      position: toast.POSITION.TOP_RIGHT, 
      className: `${bgClass} toastify`,
      progressClassName: 'toast-progress',
      autoClose: 4000,
      hideProgressBar: true,
      closeButton: false
    }
  );

}

Toast.propTypes = {
  bgClass: PropTypes.string.isRequired,
  content1: PropTypes.string.isRequired,
  content2: PropTypes.string,
}

export default handleToastify;