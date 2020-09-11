import React, { useRef} from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { requestSend } from "../../redux/actions/startup";
import EmailForm from "../../components/emailForm";
import SectionOffer from "../../components/sectionOffer";
import CardForm from "../../components/cardForm";
import ContactForm from "../../components/contactForm";
import handleToastify from "../../components/toast";
import { offers, deserves_1, deserves_2 } from "../../services/Constants";
import "./style.css";

function Landing({ requestSend }) {
  const requestForm = useRef(null);
  const onSendHandle = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email === '' || reg.test(email) === false)
      return handleToastify(
        "bg-danger",
        "Invalid email"
      );
    var params = { 
      email,
      name: '',
      message: ''
    };
    requestSend(params, 0);
  };

  const onContactHandle = (params) => {
    requestSend(params, 1);
  };

  const onNavigateRequest = () => {
    window.scrollTo({
      top: requestForm.current.offsetTop,
      behavior: 'smooth'
    })
  };
  
  return (
    <> 
      <nav className="navbar header-container main-p">
        <div className="navbar-brand">
          <img
            src={require("../../assets/app_logo.png")}
            width="114"
            height="40"
            className="d-inline-block align-top"
            alt=""
          />
        </div>
        <button type="button" className="btn-request" onClick={onNavigateRequest}>
          Request a demo
        </button>
      </nav>
      <div ref={requestForm} className="container-fluid d-flex flex-column header-bg">
        <div className="txt-header-container">
          <h3 className="txt-header">
            A two-way solution for businesses & everyday consumers
          </h3>
          <p className="txt-sub-header">
            Create and enjoy the{" "}
            <strong className="font-weight-bold f-b">
              best payment experience
            </strong>
          </p>
          <div className="email-container">
            <EmailForm onSendHandle={(email) => onSendHandle(email)}/>
          </div>
        </div>
        <div className="card header-image">
          <img
            src={require("../../assets/phone_1.png")}
            className="d-inline-block align-top"
            alt=""
          />
        </div>
      </div>
      <div className="container-fluid main-p section-p">
        <h3 className="section-header">
          What we offer
        </h3>
        <p className="section-sub-header">
          Receive payments and create a seamless experience with our suite of features. 
        </p>
        <div className="position-relative offer-section">
          <SectionOffer data={offers[0]} iType={1} />
          <div className="offer-line">
            <img
              src={require("../../assets/line_1.png")}
              className="d-inline-block align-top"
              alt=""
            />
          </div>
        </div>
        <div className="position-relative offer-section-2">
        <SectionOffer data={offers[1]} iType={2} />
        <div className="offer-line-2">
          <img
            src={require("../../assets/line_2.png")}
            className="d-inline-block align-top"
            alt=""
          />
        </div>
        </div>
        <SectionOffer data={offers[2]} iType={1} />
      </div>
      <div className="container-fluid second-part main-p">
        <div className="second-part-container">
          <h3 className="second-part-header">
            Be the first to get a Demo
          </h3>
          <p className="second-part-sub-header">
          Try out our application for your organization, and start measuring your financial success rate. 
          </p>
          <div className="email-container">
            <EmailForm onSendHandle={(email) => onSendHandle(email)}/>
          </div>
          <img
            src={require("../../assets/hands.png")}
            className="d-inline-block align-top"
            alt=""
          />
        </div>        
      </div>
      <div className="container-fluid main-p deserve-container">
        <h3 className="deserve-header">
          Why <strong className="font-weight-bold f-b">Easy Pay</strong> deserves your trust 
        </h3>
        <div className="row mt-5 justify-content-around align-items-center">
          <div className="col-md-5 mx-4 deserve-1">
            <CardForm info={deserves_1} title='Easy Pay' />
            <div className="deserve-1-img">
              <img
                src={require("../../assets/card_1.png")}
                className="d-inline-block align-top"
                alt=""
              />
            </div>
          </div>
          <div className="col-md-5 mx-4 deserve-2">
            <CardForm info={deserves_2} title='Others' />
            <div className="deserve-1-img">
              <img
                src={require("../../assets/card_2.png")}
                className="d-inline-block align-top"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid main-p d-flex flex-column justify-content-end footer-bg">
        <div className="row">
          <div className="col-md-7 mb-5 d-flex align-items-end">
            <div className="foot-container">
              <h5 className="mb-5">Contact us</h5>
              <p className="mb-3">We are easy to approach and we will address your concerns.</p>
              <p className="mb-5">support@easypayplatform.io</p>
            </div>            
          </div>
          <div className="col-md-5">
            <ContactForm onContactHandle={(e) => onContactHandle(e)}/>
          </div>
        </div>
      </div>
      <div className="footer d-flex align-items-center main-p">
        <h6>Copyright 2020 Easy Pay Platform LLC.</h6>
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  requestSend,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Landing)
);
