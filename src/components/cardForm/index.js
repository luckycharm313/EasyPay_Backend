import React from "react";
import "./style.css";

function CardForm({ info, title }) {
  return (
    <div className="cardForm">
      <h5 className="mb-5">{title}</h5>
      {
        info.map((e, index) => (
          <div key={index} className="d-flex flex-row align-items-center mb-4">
            <img
              src={e.imgUrl}
              className="d-inline-block align-top cardform-img"
              alt=""
            />
            <span className="cardform-label ml-4">{e.label}</span>
          </div>
        ))
      }
    </div>
  );
}

export default CardForm;
