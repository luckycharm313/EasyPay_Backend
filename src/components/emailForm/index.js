import React, { useState } from "react";
import "./style.css";

function EmailForm({onSendHandle}) {
  const [email, setEmail] = useState("");
  const onSend = () => {
    onSendHandle(email);
    setEmail("");
  }

  return (
    <div className="d-flex flex-row align-items-center">
      <input
        className="txt-ellipsis email-input"
        placeholder="Enter your email"
        type="text"
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="button" className="btn-half-request" onClick={() => onSend()}>
        Request
      </button>
    </div>
  );
}

export default EmailForm;
