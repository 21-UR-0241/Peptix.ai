
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const CLAUDE_PROXY_URL = '/api/claude';

console.log('🔑 API Keys Status:');
console.log('Gemini:', GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
console.log('Claude Proxy:', CLAUDE_PROXY_URL);

let cachedWorkingModel = null;
export async function analyzeImageWithAI(imageFile) {
  console.log('🚀 Starting AI analysis...');
  const errors = [];
  try {
    console.log('🤖 Trying Claude Sonnet (primary)...');
    const result = await analyzeWithClaude(imageFile);
    console.log('✅ SUCCESS with Claude!');
    return result;
  } catch (error) {
    console.error('❌ Claude failed:', error.message);
    errors.push(`Claude: ${error.message}`);
  }
  if (GEMINI_API_KEY) {
    try {
      console.log('🤖 Trying Gemini (fallback)...');
      const result = await analyzeWithGemini(imageFile);
      console.log('✅ SUCCESS with Gemini!');
      return result;
    } catch (error) {
      console.error('❌ Gemini failed:', error.message);
      errors.push(`Gemini: ${error.message}`);
    }
  }

  console.error('❌ All AI services failed');
  throw new Error('Unable to analyze image. Details: ' + errors.join(' | '));
}
async function analyzeWithClaude(imageFile) {
  const base64Image = await convertImageToBase64(imageFile);
  console.log('📦 Image size:', Math.round(base64Image.length / 1024), 'KB');

  const prompt = generateComprehensivePrompt();
  console.log('🌐 Calling Claude via proxy at:', CLAUDE_PROXY_URL);

  const response = await fetch(CLAUDE_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, prompt })
  });

  console.log('📡 Claude proxy response status:', response.status);
  if (!response.ok) {
    const text = await response.text();
    console.error('Claude error body:', text);
    let errorMessage = 'Claude API error';
    try {
      const json = JSON.parse(text);
      errorMessage = json.error?.message || json.error || errorMessage;
    } catch {
      errorMessage = `${errorMessage} (${response.status}): ${text.slice(0, 200)}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('📥 Claude response received');

  if (!data.content || !data.content[0] || !data.content[0].text) {
    console.error('Invalid Claude response:', data);
    throw new Error('Invalid response structure from Claude');
  }
  const content = data.content[0].text;
  console.log('✅ Claude content length:', content.length);

  return parseAIResponse(content);
}

async function analyzeWithGemini(imageFile) {
  const base64Image = await convertImageToBase64(imageFile);
  console.log('📦 Image size:', Math.round(base64Image.length / 1024), 'KB');

  const prompt = generateComprehensivePrompt();
  const modelConfig = await findWorkingGeminiModel();
  console.log(`🌐 Calling Gemini ${modelConfig.api}/${modelConfig.model}...`);

  const url = `https://generativelanguage.googleapis.com/${modelConfig.api}/models/${modelConfig.model}:generateContent?key=${GEMINI_API_KEY}`;
  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 3000,
      topP: 0.8,
      topK: 40
    }
  };

  if (modelConfig.api === 'v1beta') {
    requestBody.safetySettings = [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  console.log('📡 Gemini response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini error response:', errorText);
    cachedWorkingModel = null;
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error?.message || `Gemini API error (${response.status})`);
    } catch {
      throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 200)}`);
    }
  }

  const data = await response.json();
  console.log('📥 Gemini response received');

  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Content blocked: ${data.promptFeedback.blockReason}. Try a different image type.`
    );
  }
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini did not return results. Try a different image.');
  }
  const candidate = data.candidates[0];
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Image blocked by safety filters.');
  }
  if (!candidate.content?.parts?.[0]?.text) {
    throw new Error('Invalid response format from Gemini');
  }
  const content = candidate.content.parts[0].text;
  console.log('✅ Gemini content length:', content.length);

  return parseAIResponse(content);
}

// Prompt used for both Claude and Gemini
function generateComprehensivePrompt() {
  return `You are a fitness/wellness educational assistant (not a medical provider).
- Educational purposes only; do NOT diagnose, prescribe, or imply medical treatment.
- Base everything strictly on observable traits in the image (e.g., posture, visible muscle tone, apparent body composition, skin clarity/redness, dryness/oiliness, hair thickness/health, visible signs of recovery/strain).
- Be concise but specific; avoid placeholders or generic filler.
- Keep content high-level and wellness-oriented; always remind to consult professionals.
Return ONLY valid JSON (no code fences, no extra text) with this structure:
{
  "analysis": {
    "mainIssues": [
      { "title": "Issue 1", "detail": "Image-based observation that seems suboptimal" }
    ],
    "alreadyAchieved": [
      { "title": "Positive 1", "detail": "Image-based observation that looks good/healthy" }
    ]
  },
  "peptides": [
    {
      "name": "Name of peptide",
      "category": "muscle-growth|recovery|skin-health|anti-aging|performance|metabolism|fat-burning|wellness",
      "description": "Educational reason this peptide is often researched in scenarios like what you see (no promises or prescriptions).",
      "benefits": [
        "Specific research-backed benefit 1",
        "Specific research-backed benefit 2",
        "Specific research-backed benefit 3"
      ],
      "usage": "General info on typical research protocols (frequency/timing/method). Always consult professionals."
    }
  ],
  "disclaimer": "Educational info only. Not medical advice. Consult qualified healthcare professionals."
}
Rules:
- Provide 4–6 peptides in the "peptides" array.
- Use double quotes for all keys/strings.
- No text before or after JSON.
- No comments or trailing commas.
- Tailor everything to what’s observable in the image (no hidden assumptions).`;
}

function parseAIResponse(content) {
  console.log('🔍 Parsing AI response...');
  let jsonString = content.trim();

  const jsonMatch =
    content.match(/```json\s*([\s\S]*?)\s*```/) ||
    content.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim();
    console.log('📝 Extracted JSON from code block');
  }

  const jsonStart = jsonString.indexOf('{');
  const jsonEnd = jsonString.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No valid JSON object found in response');
  }
  jsonString = jsonString.substring(jsonStart, jsonEnd + 1);

  jsonString = jsonString
    .replace(/\/\/[^\n\r]*/g, '')
    .replace(/#.*$/gm, '')
    .replace(/,\s*([\]}])/g, '$1')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error('JSON parse error:', err);
    throw new Error('AI returned malformed data. Please try again with a different image.');
  }

  if (!parsed || typeof parsed !== 'object') throw new Error('Parsed result is not a valid object');
  if (!parsed.analysis || typeof parsed.analysis !== 'object') throw new Error('Missing or invalid "analysis" object');
  if (!Array.isArray(parsed.peptides) || parsed.peptides.length < 4) {
    throw new Error('Missing or insufficient peptides (need at least 4).');
  }

  parsed.analysis.mainIssues = parsed.analysis.mainIssues || [];
  parsed.analysis.alreadyAchieved = parsed.analysis.alreadyAchieved || [];
  parsed.peptides = parsed.peptides.map((p, i) => ({
    name: p?.name || `Peptide ${i + 1}`,
    category: p?.category || 'wellness',
    description: p?.description || '',
    benefits: Array.isArray(p?.benefits) ? p.benefits : [],
    usage: p?.usage || 'Consult a professional for guidance'
  }));
  parsed.disclaimer =
    parsed.disclaimer || 'Educational info only. Consult qualified healthcare professionals.';

  return parsed;
}

async function findWorkingGeminiModel() {
  if (cachedWorkingModel) return cachedWorkingModel;
  const fallback = { api: 'v1beta', model: 'gemini-pro-vision' };

  try {
    const v1betaUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const v1betaResponse = await fetch(v1betaUrl);
    if (v1betaResponse.ok) {
      const data = await v1betaResponse.json();
      const visionModels = data.models?.filter(
        (m) =>
          m.supportedGenerationMethods?.includes('generateContent') &&
          (m.name.includes('vision') || m.name.includes('1.5') || m.name.includes('flash') || m.name.includes('pro'))
      );
      if (visionModels?.length) {
        const priority = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
        for (const p of priority) {
          const found = visionModels.find((m) => m.name.includes(p));
          if (found) {
            cachedWorkingModel = { api: 'v1beta', model: found.name.split('/').pop() };
            return cachedWorkingModel;
          }
        }
        cachedWorkingModel = { api: 'v1beta', model: visionModels[0].name.split('/').pop() };
        return cachedWorkingModel;
      }
    }
  } catch (e) {
    console.error('Error fetching v1beta models:', e);
  }

  try {
    const v1Url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
    const v1Response = await fetch(v1Url);
    if (v1Response.ok) {
      const data = await v1Response.json();
      const visionModels = data.models?.filter(
        (m) =>
          m.supportedGenerationMethods?.includes('generateContent') &&
          (m.name.includes('vision') || m.name.includes('1.5'))
      );
      if (visionModels?.length) {
        cachedWorkingModel = { api: 'v1', model: visionModels[0].name.split('/').pop() };
        return cachedWorkingModel;
      }
    }
  } catch (e) {
    console.error('Error fetching v1 models:', e);
  }

  return fallback;
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    console.log('🖼️ Converting image to base64...');
    console.log('File type:', file.type);
    console.log('File size:', Math.round(file.size / 1024), 'KB');

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      reject(new Error(`Invalid file type: ${file.type}. Please use JPEG, PNG, or WebP images.`));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Image file is too large. Please use an image smaller than 20MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64String = reader.result.split(',')[1];
        if (!base64String) return reject(new Error('Failed to convert image to base64'));
        console.log('✅ Image converted to base64');
        resolve(base64String);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export default analyzeImageWithAI;