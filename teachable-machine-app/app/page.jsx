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
  const labelContainerRef = useRef(null);
  
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
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Teachable Machine AI</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button