import { WebSocketServer } from 'ws';
import admin from 'firebase-admin';
import serviceAccount from './freertdb-firebase-adminsdk-fbsvc-0846017ccc.json' with { type: 'json' }; // Replace with the path to your service account key JSON file

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://freertdb-default-rtdb.firebaseio.com/' // Replace with your database URL
});

const db = admin.database();
const wss = new WebSocketServer({ port: 80, host: '0.0.0.0' });

wss.on('connection', function connection(ws) {
    ws.on('message', async function message(data) {
      console.log('received: %s', data);
  
      // Ensure data is a string
      const pathString = String(data);
  
      // Log the type and value of pathString
      //console.log('pathString type:', typeof pathString);
      //console.log('pathString value:', pathString);
  
      if (pathString.startsWith('n')) {
        // Create new data in the path that follows the "n"
        const [path, value] = pathString.slice(1).split('>');
        const ref = db.ref(path);
        ref.set(value, (error) => {
          if (error) {
            console.error('Error creating new data:', error);
            ws.send('Error creating new data');
          } else {
            console.log('New data created successfully');
            ws.send('New data created successfully');
          }
        });
      } else if (pathString.startsWith('/')) {
        // Retrieve the value from Firebase Realtime Database
        const ref = db.ref(pathString);
        ref.once('value', (snapshot) => {
          const value = snapshot.val();
          ws.send(JSON.stringify(value));
        });
      }
    });
  
    ws.send('Connected to WebSocket server');
  });
