import React from 'react';
import styled from 'styled-components';

const Card = ({ title, img= [], onClick, fontSize =  "1em" }) => {
  return (
    <StyledWrapper fontSize={fontSize}>
      <article className="article-wrapper" onClick={onClick} tabIndex={0}>
        <div
          className="rounded-lg container-project"
          style={{
            background: img ? `url(${img}) center/cover no-repeat` : 'gray'
          }}
        />
        <div className="project-info">
          <div className="flex-pr">
            <div className="project-title text-nowrap">{title}</div>
            <div className="project-hover">
              <svg style={{color: 'black'}} xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" color="black" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor"><line y2={12} x2={19} y1={12} x1={5} /><polyline points="12 5 19 12 12 19" /></svg>
            </div>
          </div>

        </div>
      </article>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  font-family: 'Roboto Slab', serif;
  .article-wrapper {
    width: 260px;
    -webkit-transition: 0.15s all ease-in-out;
    transition: 0.15s all ease-in-out;
    border-radius: 10px;
    padding: 5px;
    border: 4px solid transparent;
    cursor: pointer;
    background-color: white;
  }

  .article-wrapper:hover {
    -webkit-box-shadow: 10px 10px 0 #4e84ff, 20px 20px 0 #4444bd;
    box-shadow: 10px 10px 0 #4e84ff, 20px 20px 0 #4444bd;
    border-color: #0578c5;
    -webkit-transform: translate(-20px, -20px);
    -ms-transform: translate(-20px, -20px);
    transform: translate(-20px, -20px);
  }

  .article-wrapper:active {
    -webkit-box-shadow: none;
    box-shadow: none;
    -webkit-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0);
  }

  .types {
    gap: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    place-content: flex-start;
  }

  .rounded-lg {
    border-radius: 10px;
  }

  .article-wrapper:hover .project-hover {
    -webkit-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
    background-color: #a6c2f0;
  }

  .project-info {
    padding-top: 20px;
    padding: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    gap: 20px;
  }

  .project-title {
    font-size: ${props => props.fontSize || "1em"};
    margin: 0;
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: black;
  }

  .flex-pr {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .project-type {
    background: #b2b2fd;
    color: #1a41cd;
    font-weight: normal;
    padding: 0.3em 0.7em;
    border-radius: 15px;
    font-size: calc(${props => props.fontSize || "1em"} * 0.6);
    letter-spacing: -0.6px
  }

  .project-hover {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 9px;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
  }

  .container-project {
    width: 100%;
    height: 250px; /* Increased from 170px to 250px */
    background: gray;
  }
`;

export default Card;