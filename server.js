import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import serverless from 'serverless-http';

const app = express();
app.use(cors());

// INCREASED LIMIT TO 20MB FOR IMAGES
app.use(express.json({limit: '20mb'}));

app.post('/api/chat', async (req, res) => {
  try {
    const {message, image} = req.body;

    if(!process.env.OPENAI_API_KEY){
      return res.status(500).json({error: 'Missing OPENAI_API_KEY'});
    }

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    let messages = [{role: 'system', content: 'You are PRIEST AI. Be helpful.'}];

    if(image && image.startsWith('data:image')) {
      messages.push({
        role: 'user',
        content: [
          {type: 'text', text: message || 'What is in this image?'},
          {type: 'image_url', image_url: {url: image}}
        ]
      });
    } else {
      messages.push({role: 'user', content: message});
    }

    const r = await openai.chat.completions.create({
      model: image? 'gpt-4o' : 'gpt-4o-mini',
      messages
    });
    res.json({answer: r.choices[0].message.content});
  } catch(e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

export default serverless(app);