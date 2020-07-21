import React, { useState } from 'react';
import './App.css';
import { createWorker } from 'tesseract.js';

const App = () => {
  const [uploads, setUploads] = useState([])
  const [patterns, setPatterns] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const worker = createWorker({
    logger: m => console.log(m)
  });


  const handleChange = (e) => {
    const selectedFiles = e.target.files

    let fileUrls = []
    for (var key in selectedFiles) {
      if (!selectedFiles.hasOwnProperty(key)) continue;
      let fileUrl = selectedFiles[key]
      fileUrls.push(URL.createObjectURL(fileUrl))
    }
    setUploads(fileUrls)
  }

  const generateText = async () => {
    for (var i = 0; i < uploads.length; i++) {
      setLoading(true)
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text, confidence } } = await worker.recognize(uploads[i]);
      let filePattern = /\b\w{10,10}\b/g;
      let filePatterns = text.match(filePattern);
      let filedoc = [{
        pattern: filePatterns || [],
        text: text,
        confidence: confidence
      }];
      setPatterns(
        ...patterns,
        filePatterns
      )
      setDocuments([
        ...documents,
        ...filedoc
      ]
      )
      await worker.terminate();
      setLoading(false)
    }
  }
  return (
    <div className="app">
      <header className="header">
        <h1>My OCR App</h1>
      </header>

      { /* File uploader */}
      <section className="hero">
        <label className="fileUploaderContainer">
          Click here to upload documents
            <input
            type="file"
            id="fileUploader"
            onChange={handleChange}
            multiple
          />
        </label>
        <br />
        <div>
          {uploads.map((value, index) => (
            <img key={index} src={value} width="100px" />
          ))}
        </div>
        <br />
        <button
          className="button"
          onClick={generateText}
          disabled={loading}
        >{loading ? "Processing..." : "Generate"}</button>
      </section>

      { /* Results */}
      <section className="results">
        {documents.map((value, index) => (
          <div className="results__result">
            <div className="results__result__image">
              <img src={uploads[index]} width="250px" />
            </div>
            <div className="results__result__info">
              <div className="results__result__info__codes">
                <small><strong>Confidence Score:</strong> {value.confidence}</small>
              </div>
              <div className="results__result__info__codes">
                <small><strong>Pattern Output:</strong> {value.pattern.map((pattern) => pattern + ', ')}</small>
              </div>
              <div className="results__result__info__text">
                <small><strong>Full Output:</strong> {value.text}</small>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default App;