import React, { useState } from "react";
import "./style.css";

function ContactForm({ onContactHandle }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const onSend = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email === '' || reg.test(email) === false)
      return alert("Invalid email.");
    if (message === '')
      return alert("Message is empty.");

    var params = { 
      email,
      name: '',
      message: ''
    };
    onContactHandle(params);
    setEmail("");
    setName("");
    setMessage("");
  }

  return (
    <div className="d-flex flex-column contact-form">
      <h5 className="mb-4">Talk with us!</h5>
      <input
        className="txt-ellipsis contact-input mb-4"
        placeholder="Name"
        type="text"
        value={name} 
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="txt-ellipsis contact-input mb-4"
        placeholder="Email"
        type="email"
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        className="txt-ellipsis contact-textarea mb-4"
        placeholder="Message"
        type="text"
        cols="6"
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="button" className="contact-btn" onClick={() => onSend()}>
        Send
      </button>
    </div>
  );
}

export default ContactForm;
