import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({status: 'OK', message: 'Backend is alive'});
});

app.post('/api/chat', (req, res) => {
  const {message} = req.body;
  res.json({answer: `You said: ${message}. Backend is working!`});
});

export default serverless(app);