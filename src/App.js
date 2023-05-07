import React from 'react';
import Tree from './features/mainPage';
import { ModalProvider, LayoutProvider } from 'exsportia-components';

function App() {
  return (
    <div className="App">
      <ModalProvider>
        <LayoutProvider>
          <Tree />
        </LayoutProvider>
      </ModalProvider>
    </div>
  );
}

export default App;
