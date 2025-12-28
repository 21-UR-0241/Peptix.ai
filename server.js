// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import routes from './server/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS Configuration - BEFORE any routes
const corsOptions = {
  origin: function(origin, callback) {
    console.log('🔍 CORS check - Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      console.log('✅ No origin - allowing');
      return callback(null, true);
    }
    
    // In development: allow all localhost origins
    if (isDevelopment) {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        console.log('✅ Development - allowing localhost origin:', origin);
        return callback(null, true);
      }
    } else {
      // In production: only allow specific origin
      const allowedOrigins = [process.env.CLIENT_ORIGIN];
      if (allowedOrigins.includes(origin)) {
        console.log('✅ Production - allowing origin:', origin);
        return callback(null, true);
      }
    }
    
    console.log('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware (it automatically handles OPTIONS preflight requests)
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    claudeApiKey: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
    googleOAuth: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
    environment: process.env.NODE_ENV || 'development',
    corsMode: isDevelopment ? 'development (all localhost)' : 'production (restricted)',
  });
});

// Debug middleware - logs all API requests
app.use('/api', (req, res, next) => {
  console.log('📍 API Request:', req.method, req.path, 'from', req.get('origin'));
  next();
});

// Mount authentication and other routes
app.use('/api', routes);

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { image, prompt, mimeType } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }
    
    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing image or prompt' });
    }

    console.log('🤖 Proxying request to Claude...');
    console.log('📦 Image size:', Math.round(image.length / 1024), 'KB');
    console.log('🖼️ MIME type:', mimeType || 'image/jpeg');

    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType || 'image/jpeg',
                  data: image,
                },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    const text = await anthropicResp.text();
    console.log('📡 Claude status:', anthropicResp.status);

    if (!anthropicResp.ok) {
      try {
        return res.status(anthropicResp.status).json(JSON.parse(text));
      } catch {
        return res.status(anthropicResp.status).json({ error: text });
      }
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from Anthropic', detail: text });
    }

    return res.json(json);
  } catch (err) {
    console.error('❌ Proxy error:', err);
    res.status(500).json({ error: err.message || 'proxy error' });
  }
});

// Serve React app for all other routes (production only)
// FIXED: Express 5 doesn't support app.get('*') anymore
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Skip API routes (they're already handled above)
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Serve the React app for all other routes
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// 404 handler - MUST BE LAST!
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    console.log('❌ 404: API endpoint not found:', req.method, req.originalUrl);
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 Claude API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Loaded' : '❌ Not found'}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  
  if (isDevelopment) {
    console.log(`✅ CORS: Allowing all localhost origins in development mode`);
  } else {
    console.log(`🔒 CORS: Restricted to ${process.env.CLIENT_ORIGIN}`);
  }
  console.log(`${'='.repeat(50)}\n`);
});