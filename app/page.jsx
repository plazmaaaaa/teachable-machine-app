'use client';
import { useState, useEffect, useRef } from 'react';
import * as tmImage from '@teachablemachine/image';

export default function Home() {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Add background color state
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Load the Teachable Machine model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelURL = '/my_model/model.json';
        const metadataURL = '/my_model/metadata.json';
        
        console.log('Loading model from:', modelURL);
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setIsLoaded(true);
        console.log('Model loaded successfully!');
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    
    loadModel();
  }, []);

  // Start webcam and predictions
  const startWebcam = async () => {
    if (!model) {
      alert('Model not loaded yet!');
      return;
    }

    try {
      // Setup webcam
      const webcam = new tmImage.Webcam(400, 400, true);
      await webcam.setup();
      await webcam.play();
      
      // Display webcam
      if (webcamRef.current) {
        webcamRef.current.srcObject = webcam.webcam;
        webcamRef.current.style.display = 'block';
      }
      
      // Create prediction loop
      const predictLoop = async () => {
        if (!model || !isWebcamOn) return;
        
        // Get prediction
        const prediction = await model.predict(webcam.canvas);
        setPredictions(prediction);
        
        // Check if we have predictions
        if (prediction.length > 0) {
          const topPrediction = prediction[0];
          
          // 🔊 BACKGROUND COLOR CODE
          // Change background based on what's detected
          // CHANGE 'Your Dog' and 'Not Your Dog' to YOUR actual class names!
          if (topPrediction.probability > 0.8) {
            if (topPrediction.className === 'Your Dog') {
              setBackgroundColor('#d4edda'); // Light green for "Your Dog"
            } else if (topPrediction.className === 'Not Your Dog') {
              setBackgroundColor('#f8d7da'); // Light red for "Not Your Dog"
            } else {
              setBackgroundColor('#e6f3ff'); // Light blue for other detections
            }
          } else {
            setBackgroundColor('#ffffff'); // White for uncertain
          }
          
          // 🔊 SOUND ALERT CODE
          if (topPrediction.probability > 0.9) {
            // Play alert sound
            try {
              const audio = new Audio('/alert.wav');
              audio.play();
              console.log(`🔊 Playing sound for: ${topPrediction.className}`);
            } catch (error) {
              console.log("Couldn't play sound:", error);
            }
            
            // Show alert on screen (optional)
            // alert(`Detected: ${topPrediction.className}!`);
            
            // Mobile vibration
            if ('vibrate' in navigator) {
              navigator.vibrate(200); // Vibrate for 200ms
            }
          }
        }
        
        // Continue loop
        requestAnimationFrame(predictLoop);
      };
      
      setIsWebcamOn(true);
      predictLoop();
      
    } catch (error) {
      console.error('Error starting webcam:', error);
      alert('Could not access webcam. Please check permissions.');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    setIsWebcamOn(false);
    setPredictions([]);
    setBackgroundColor('#ffffff'); // Reset to white when stopping
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: backgroundColor,
      minHeight: '100vh',
      transition: 'background-color 0.5s ease'
    }}>
      <h1>Teachable Machine AI</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startWebcam} 
          disabled={!isLoaded || isWebcamOn}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: isWebcamOn ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isWebcamOn ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoaded ? 'Start Webcam' : 'Loading Model...'}
        </button>
        
        <button 
          onClick={stopWebcam}
          disabled={!isWebcamOn}
          style={{
            padding: '10px 20px',
            backgroundColor: isWebcamOn ? '#ff4444' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isWebcamOn ? 'pointer' : 'not-allowed'
          }}
        >
          Stop Webcam
        </button>
      </div>

      {/* Webcam Display */}
      <div style={{ marginBottom: '20px' }}>
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          style={{
            width: '400px',
            height: '400px',
            border: '1px solid #ccc',
            display: isWebcamOn ? 'block' : 'none'
          }}
        />
        {!isWebcamOn && (
          <div style={{
            width: '400px',
            height: '400px',
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            Webcam will appear here
          </div>
        )}
      </div>

      {/* Predictions Display */}
      <div style={{ marginTop: '20px' }}>
        <h3>Predictions:</h3>
        {predictions.length > 0 ? (
          <div>
            {predictions.map((pred, index) => (
              <div key={index} style={{
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '5px'
              }}>
                <strong>{pred.className}:</strong> {(pred.probability * 100).toFixed(2)}%
                <div style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#ddd',
                  borderRadius: '10px',
                  marginTop: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${pred.probability * 100}%`,
                    height: '100%',
                    backgroundColor: '#0070f3',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No predictions yet. Start the webcam to see results.</p>
        )}
      </div>
    </div>
  );
}