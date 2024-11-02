import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function App() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  // Write test data to Firestore
  const writeTestData = async () => {
    try {
      await setDoc(doc(firestore, 'test', 'testDoc'), {
        message: 'Hello from Firebase!',
      });
      setStatus('Data written to Firestore successfully.');
    } catch (error) {
      setStatus(`Error writing to Firestore: ${error.message}`);
    }
  };

  // Read test data from Firestore
  const readTestData = async () => {
    try {
      const docRef = doc(firestore, 'test', 'testDoc');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMessage(docSnap.data().message);
        setStatus('Data read from Firestore successfully.');
      } else {
        setStatus('No such document in Firestore!');
      }
    } catch (error) {
      setStatus(`Error reading from Firestore: ${error.message}`);
    }
  };

  // Run the write/read tests on component mount
  useEffect(() => {
    writeTestData();
    readTestData();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Firebase Testing App</h1>
      <p>Status: {status}</p>
      <p>Message from Firestore: {message}</p>
    </div>
  );
}

export default App;
