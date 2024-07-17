import React from 'react';
import ReactDOM from 'react-dom';
import createRoot from 'react-dom/client'

const Index = () => {
        return <div>WELCOME TO MELLIFERA!!</div>;
    };

    ReactDOM.createRoot(
        document.getElementById("app"),
      )
      .render(
        <React.StrictMode>
          <Index />
        </React.StrictMode>,
      );