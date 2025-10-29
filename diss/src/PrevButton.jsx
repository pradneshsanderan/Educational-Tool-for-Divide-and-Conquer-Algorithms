import React from 'react';
import styled from 'styled-components';

const Button = ({onClick}) => {
  return (
    <StyledWrapper>
      <button className="button" onClick={onClick}>
        <div className="bgContainer">
          <span>Previous</span>
        </div>
        <div className="arrowContainer">
          <svg width={25} height={25} viewBox="0 0 45 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.23223 17.2322C0.255922 18.2085 0.255922 19.7915 1.23223 20.7678L17.1421 36.6777C18.1184 37.654 19.7014 37.654 20.6777 36.6777C21.654 35.7014 21.654 34.1184 20.6777 33.1421L6.53553 19L20.6777 4.85786C21.654 3.88155 21.654 2.29864 20.6777 1.32233C19.7014 0.34602 18.1184 0.34602 17.1421 1.32233L1.23223 17.2322ZM45 16.5L3 16.5V21.5L45 21.5V16.5Z" fill="black" />
          </svg>
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
    padding: 0.2em 2em 0.2em 1.5em;
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
    min-width: 180px; 
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
    max-width: 45%; /* adjust this if the button text is not proper */
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
