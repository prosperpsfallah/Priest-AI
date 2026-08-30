import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json({limit: '1mb'}));

app.post('/api/chat', async (req, res) => {
  try {
    const {message} = req.body;
    if(!message) return res.status(400).json({error: 'No message'});

    if(!process.env.OPENAI_API_KEY)
      return res.status(500).json({error: 'OPENAI_API_KEY missing in Vercel'});

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{role: 'user', content: message}]
    });
    res.json({answer: r.choices[0].message.content});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

export default serverless(app);