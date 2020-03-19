import React, { useState/*, useEffect*/ } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  requestSend
} from '../../actions/startup'
import './style.css';

function Landing({ requestSend }) {
  const [phone, setPhone] = useState('');
  const onSendHandle = () => {
    let regNumber = /^\d+$/ ;
    if( phone === '' || regNumber.test(phone) === false ) return alert('Phone is not correct. Must be number');
    var params = { phone };
    requestSend(params);
  };

  return (      
    <div className='container d-flex flex-column'>
      <div className='row d-flex flex-column align-items-center justify-content-center my-4'>
        <img src={require('../../../public/easypay.png')} alt='logo' className='img-logo'/>
        <h3 className='text-center font-weight-bold mt-3' >Easy Pay Platform</h3>
        <span className='text-center f-d'>…Making Payment Real Easy</span>
      </div>
      <div className='row my-5'>
        <div className='col-md-6 my-4 d-flex flex-column justify-content-between py-3'>
          <div>
            <p>Easy Pay is a platform that simplifies making and receiving Payments altogether.</p>
            <p>Our system focuses on every day people by bringing back privacy to payments.</p>
            <p>We also enable businesses receive & process payments seamlessly.</p>
          </div>
          <div className='d-flex flex-row align-items-center' >
            <input className='form-control f-d' placeholder='Enter your number To Request A Demo & Learn More' type='text' value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type='button' className='ml-2 btn-main' onClick={onSendHandle}>Request</button>
          </div>
        </div>
        <div className='col-md-6 my-4'>
          <img src={require('../../../public/mobile.png')} alt='mobile' className='img-mobile'/>
          <p className='text-center mt-4 mb-0'>COMING SOON ON ANDROID & APPLE APP STORES</p>
        </div>
      </div>
      <div className='line my-4'></div>

      <div className='row my-5'>
        <div className='col-md-12'>
          <div className='d-flex flex-column align-items-center justify-content-center mx-auto'>
            <img src={require('../../../public/bucket-qr.png')} alt='QR' className='img-icon'/>
            <span className='text-center font-weight-bold mt-3'>DIGITAL WALLET</span>
          </div>
          <p className='f-d mt-4'>
            A digital wallet powered by mobile app. We are bringing back privacy to payments. You don’t have to worry about your debit or 
            credit card exchanging hands at restaurants, bars and other business places. Simply make payments, tip, split bills, see recent 
            activities and much more right from your personalized easy pay app. With just a Tap and a barcode scan, your payment is done 
            and secured! It’s a promise, we are making payments feel and look real easy.
          </p>
        </div>        
      </div>
      <div className='line my-4'></div>
      
      <div className='row my-5'>
        <div className='col-md-12'>
          <div className='d-flex flex-column align-items-center justify-content-center mx-auto'>
            <img src={require('../../../public/easypayadmin.png')} alt='Admin' className='img-icon'/>
            <span className='text-center font-weight-bold mt-3'>ADMIN CONSOLE</span>
          </div>
          <p className='f-d mt-4'>
          With our admin console, we make it easy to issue receipts, track payments, process payments securely while giving your 
          customers a fast and amazing experience. All payments are digital, so you do not have to worry about paper or wastage 
          Easy pay is the new way to make and receive payments. Easy pay console is customizable and can fit any business operations.
          </p>
        </div>        
      </div>
      <div className='line my-4'></div>
      
      <div className='row my-5'>
        <div className='col-md-12'>
          <div className='d-flex flex-column align-items-center justify-content-center mx-auto'>
            <img src={require('../../../public/warning.png')} alt='Security' className='img-icon'/>
            <span className='text-center font-weight-bold mt-3'>SECURITY</span>
          </div>
          <p className='f-d mt-4'>
          Easy pay values security. That is the reason we started in the first place. We are PCI compliant and all payments are processed 
          with end to end encryption. You always have control over your personal and important information. We built the system that way.
          Be rest assured , you’re in safe hands. 
          </p>
        </div>        
      </div>
      <div className='line my-4'></div>

      <div className='row my-5'>
        <div className='col-md-12'>
          <div className='d-flex flex-column align-items-center justify-content-center mx-auto'>
            <img src={require('../../../public/cell-phone.png')} alt='Contact US' className='img-icon'/>
            <span className='text-center font-weight-bold mt-3'>CONTACT US</span>
          </div>
          <p className='f-d mt-4'>
          We are currently working on our beta app. We’ll like you to try it out and request a demo to experience the power of Easy pay. 
          Enter your phone number or email below to request a demo & learn more 
          </p>
          <div className='d-flex flex-row align-items-center mt-5 w-75 mx-auto' >
            <input className='form-control f-d' placeholder='Enter your number To Request A Demo & Learn More' type='text' value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type='button' className='ml-2 btn-main' onClick={onSendHandle}>Request</button>
          </div>
        </div>        
      </div>
      <div className='line my-4'></div>
      <div className='row my-4'>
        <p className='mx-auto'>Copyright 2020 Easy Pay Platform LLC.</p>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => ({
  
});
const mapDispatchToProps = {
  requestSend
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Landing));
