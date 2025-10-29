import React from 'react';
import styled from 'styled-components';

const Button = ({onClick, children, ...props}) => {
  return (
    <StyledWrapper>
      <button className="button" onClick={onClick} {...props}>
        <span>{children}</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    white-space: nowrap; 
    padding: 0;
    border: none;
    transform: none;
    transform-origin: center;
    font-family: 'Fira Mono', monospace;
    text-decoration: none;
    font-size: 15px;
    cursor: pointer;
    padding-bottom: 3px;
    border-radius: 5px;
    box-shadow: 0 2px 0 #494a4b;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-color: #DA7756;
  }

  .button span {
    background: #f1f5f8;
    display: block;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid #494a4b;
  }

  .button:active {
    transform: translateY(5px);
    padding-bottom: 0px;
    outline: 0;
  }`;

export default Button;
