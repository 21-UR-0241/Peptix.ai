// AI Service for comprehensive health image analysis
// Uses Claude ONLY via proxy

const CLAUDE_PROXY_URL = 'http://localhost:3001/api/claude';

console.log('🔑 Using Claude API via proxy at:', CLAUDE_PROXY_URL);

// Main function - uses only Claude
export async function analyzeImageWithAI(imageFile) {
  console.log('🚀 Starting AI analysis with Claude...');
  
  try {
    console.log('🤖 Analyzing with Claude (via proxy)...');
    const result = await analyzeWithClaude(imageFile);
    console.log('✅ SUCCESS with Claude!');
    return result;
  } catch (error) {
    console.error('❌ Claude analysis failed:', error.message);
    
    // Check if proxy server is running
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to proxy server. Make sure to run: npm run server');
    }
    
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

// Claude via proxy
async function analyzeWithClaude(imageFile) {
  try {
    const base64Image = await convertImageToBase64(imageFile);
    console.log('📦 Image size:', Math.round(base64Image.length / 1024), 'KB');
    
    const prompt = generateComprehensivePrompt();
    
    console.log('🌐 Calling Claude via proxy...');
    
    const response = await fetch(CLAUDE_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image,
        prompt: prompt
      })
    });

    console.log('📡 Claude proxy response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Claude error response:', errorData);
      
      const errorMessage = errorData.error?.message || errorData.error || 'Claude API error';
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
    
  } catch (error) {
    console.error('Claude error details:', error);
    throw error;
  }
}

function generateComprehensivePrompt() {
  return `You are an expert health and fitness analyst specializing in peptide therapy recommendations.

Analyze this image comprehensively and provide detailed, personalized peptide recommendations.

IMPORTANT INSTRUCTIONS:
1. First, determine what type of image this is:
   - Face/Skin close-up → Focus on skincare and anti-aging peptides
   - Body/Physique photo → Focus on muscle building and body composition peptides
   - Fitness/Workout context → Focus on performance and recovery peptides
   - Body composition/Weight → Focus on metabolism and fat loss peptides
   - General health photo → Focus on wellness and longevity peptides

2. Provide a detailed analysis of what you observe in the image related to health and fitness

3. Recommend 4-6 SPECIFIC peptides that are scientifically proven and relevant to the observations

4. For each peptide, provide:
   - Full scientific name
   - Category/type of peptide
   - Detailed explanation of why it's recommended based on the image
   - Specific benefits (4-5 benefits)
   - Usage recommendations

RESPOND ONLY IN THIS EXACT JSON FORMAT (no additional text before or after):

{
  "category": "skin|muscle|fitness|weight-loss|wellness",
  "analysis": "Detailed 3-4 sentence analysis of what you observe in the image. Be specific about visible features, concerns, or characteristics that inform your recommendations.",
  "concerns": ["specific concern 1", "specific concern 2", "specific concern 3", "specific concern 4"],
  "peptides": [
    {
      "name": "Full scientific name of peptide",
      "category": "anti-aging|muscle-growth|recovery|metabolism|performance|fat-burning",
      "description": "2-3 sentences explaining why THIS SPECIFIC peptide is recommended based on what you see in the image",
      "benefits": [
        "Specific measurable benefit 1",
        "Specific measurable benefit 2",
        "Specific measurable benefit 3",
        "Specific measurable benefit 4"
      ],
      "usage": "Specific usage instructions including timing, frequency, and application method"
    }
  ]
}

IMPORTANT: 
- Base ALL recommendations on actual observations from the image
- Only recommend real, scientifically-documented peptides
- Be specific about dosing and usage
- Ensure JSON is properly formatted with no syntax errors
- Do not include any text outside the JSON structure
- This is for educational and health optimization purposes
- Analyze the image objectively for health and fitness assessment`;
}

function parseAIResponse(content) {
  try {
    console.log('🔍 Parsing AI response...');
    let jsonString = content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                     content.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
      console.log('📝 Extracted JSON from code block');
    }
    
    // Remove any leading/trailing non-JSON text
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsed = JSON.parse(jsonString);
    console.log('✅ JSON parsed successfully');
    
    // Validate the structure
    if (!parsed.analysis || !parsed.peptides || !Array.isArray(parsed.peptides)) {
      throw new Error('Invalid response structure from AI');
    }
    
    // Ensure all required fields are present
    parsed.category = parsed.category || 'general';
    parsed.concerns = parsed.concerns || [];
    
    // Validate each peptide has required fields
    parsed.peptides = parsed.peptides.map(peptide => ({
      name: peptide.name || 'Unknown Peptide',
      category: peptide.category || 'general',
      description: peptide.description || 'No description provided',
      benefits: Array.isArray(peptide.benefits) ? peptide.benefits : [],
      usage: peptide.usage || 'Consult with healthcare provider'
    }));
    
    console.log('✅ Validation complete:', parsed.peptides.length, 'peptides');
    
    return parsed;
    
  } catch (error) {
    console.error('❌ Error parsing AI response:', error);
    console.error('Raw content (first 500 chars):', content.substring(0, 500));
    
    throw new Error(`Unable to parse AI response: ${error.message}`);
  }
}

// Helper function to convert image to base64
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    console.log('🖼️ Converting image to base64...');
    console.log('File type:', file.type);
    console.log('File size:', Math.round(file.size / 1024), 'KB');
    
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Image file is too large. Please use an image smaller than 20MB.'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const base64String = reader.result.split(',')[1];
        if (!base64String) {
          reject(new Error('Failed to convert image to base64'));
          return;
        }
        console.log('✅ Image converted to base64');
        resolve(base64String);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Export the main function
export default analyzeImageWithAI;