import { useEffect, useState } from 'react';

import './App.css';

function Image({ uuid }) {
  return <div className="image">
    <img src={`https://uk-meetup.walshy.dev/api/image/${uuid}`} alt="R2" />
  </div>
}

function App() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('https://uk-meetup.walshy.dev/api/images')
      .then(res => res.json())
      .then(list => setImages(list));
  }, []);

  return (
    <div className="App">
      <h1 id="title">Image Viewer</h1>

      {images.length > 0 && images.map(image => 
        <Image uuid={image} key={image} />
      )}
      {images.length === 0 && <h3>Grabbing images...</h3>}
    </div>
  );
}

export default App;
