import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import serverless from 'serverless-http';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    if(!process.env.OPENAI_API_KEY){
      return res.status(500).json({error: 'Add OPENAI_API_KEY in Vercel Settings'});
    }

    const {message} = req.body;
    if(!message) return res.status(400).json({error: 'Message required'});

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {role: 'system', content: 'You are PRIEST AI. Be helpful.'},
        {role: 'user', content: message}
      ]
    });
    res.json({answer: r.choices[0].message.content});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

export default serverless(app);