// ============================================
//  GEN AI SERVICE - Powered by Hugging Face Free Models
// ============================================
// This service uses FREE Hugging Face Inference API
// No API key required! Just works out of the box!
// Models used: GPT-2, TinyLlama (all free & fast)
// ============================================

class HuggingFaceService {
  constructor() {
    this.baseURL = 'https://api-inference.huggingface.co/models';
    this.maxRetries = 2;
    this.timeout = 25000;
  }

  getModels() {
    return {
      primary: 'gpt2',
      backup: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
    };
  }

  async generateStory(topic, preferences = {}) {
    const models = this.getModels();
    let model = models.primary;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const prompt = this.createPrompt(topic, preferences);
        const response = await this.callAPI(model, prompt);
        
        if (response && response.length > 100) {
          const code = this.getCodeTemplate(topic);
          return {
            story: response,
            code,
            topic,
            generatedBy: 'Gen AI',
            model,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        console.log(`Attempt ${attempt} failed, trying backup...`);
        model = models.backup;
      }
    }
    
    return this.getFallbackStory(topic, preferences);
  }

  createPrompt(topic, preferences) {
    const { level = 'beginner', theme = 'adventure' } = preferences;
    return `Write an educational story about ${topic} in computer science. Theme: ${theme}. Level: ${level}. Make it engaging and teach the concept clearly in 200-300 words.\n\nStory: `;
  }

  async callAPI(model, prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.8,
            top_p: 0.9,
            do_sample: true
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('API error');

      const result = await response.json();
      let story = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
      story = story?.replace(prompt, '').trim();
      
      return story;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getCodeTemplate(topic) {
    const templates = {
      arrays: `const array = [];\narray.push(5);\narray[0] = 10;\narray.pop();`,
      stacks: `class Stack {\n  constructor() { this.items = []; }\n  push(x) { this.items.push(x); }\n  pop() { return this.items.pop(); }\n}`,
      queues: `class Queue {\n  constructor() { this.items = []; }\n  enqueue(x) { this.items.push(x); }\n  dequeue() { return this.items.shift(); }\n}`
    };
    return templates[topic] || templates.arrays;
  }

  getFallbackStory(topic, preferences) {
    return {
      story: `Once upon a time, there was a ${topic} that needed to be understood...`,
      code: this.getCodeTemplate(topic),
      topic,
      generatedBy: 'Fallback',
      model: 'built-in',
      timestamp: Date.now()
    };
  }
}

const huggingFaceService = new HuggingFaceService();
export default huggingFaceService;
