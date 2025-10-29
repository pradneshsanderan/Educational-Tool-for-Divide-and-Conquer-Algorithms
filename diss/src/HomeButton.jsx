import React from 'react';
import styled from 'styled-components';

const Button = ({onClick}) => {
  return (
    <StyledWrapper>
      <button className="button" onClick={onClick}>
        <div className="bgContainer">
          <span>Home   </span>
        </div>
        <div className="arrowContainer">
          <img
            src="/25694.png"
            alt="Home"
            style={{ width: 20, height: 20, display: "block", margin: "0 auto" }}
          />
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.2em 0em 0.2em 1.5em;
    background-color: #EDEBE8;
    cursor: pointer;
    box-shadow: 4px 6px 0px black;
    border: 4px solid;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    z-index: 100;
    font-size: 0.8em;
    transition: box-shadow 250ms, transform 250ms, filter 50ms;
  }
  button:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 3px 0px black;
  }
  button:active {
    filter: saturate(0.75);
  }
  button::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: #DA7756;
    z-index: -1;
    transform: translateX(-100%);
    transition: transform 250ms;
  }
  button:hover::after {
    transform: translateX(0);
  }
  .bgContainer {
    position: relative;
    display: flex;
    justify-content: start;
    align-items: center;
    overflow: hidden;
    font-size: 1.1em;
    font-weight: 600;
  }
  .bgContainer span {
  position: relative;
  transition: all 250ms;
}
  .arrowContainer {
    padding: 0.5em;
    margin-inline-end: 0.5em;
    margin-left: 1em; 
    border: 4px solid;
    border-radius: 50%;
    background-color: #DA7756;
    position: relative;
    overflow: hidden;
    transition: transform 250ms, background-color 250ms;
    z-index: 100;
  }
  .arrowContainer::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: #EDEBE8;
    transform: translateX(-100%);
    z-index: -1;
    transition: transform 250ms ease-in-out;
  }
  button:hover .arrowContainer::after {
    transform: translateX(0);
  }
  button:hover .arrowContainer {
    transform: translateX(5px);
  }
  button:active .arrowContainer {
    transform: translateX(8px);
  }
  .arrowContainer svg {
    vertical-align: middle;
    width: 16px;
    height: 16px;
  }`;

export default Button;
