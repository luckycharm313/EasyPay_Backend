import React, { useState , useEffect} from "react";
import "./style.css";

function SectionOffer({ data, iType }) {
  const [ width, setWidth ] = useState(window.innerWidth);
  
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    
    window.addEventListener("resize", handleResize);    
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  return (
    <>
      {iType === 1 || width <= 768 ? (
        <div className="row mb-5">
          <div className="col-md-6">
            <img
              src={data.imgUrl}
              className="d-inline-block align-top img-offer"
              alt=""
            />
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <h4 className="offer-title">{data.title}</h4>
            <p className="offer-contents">{data.contents}</p>
          </div>
        </div>
      ) : (
        <div className="row mb-5">
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <h4 className="offer-title">{data.title}</h4>
            <p className="offer-contents">{data.contents}</p>
          </div>
          <div className="col-md-6">
            <img
              src={data.imgUrl}
              className="d-inline-block align-top img-offer"
              alt=""
            />
          </div>
        </div>
      )}
    </>
  );
}

export default SectionOffer;
