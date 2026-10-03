import api from './api';

/**
 * Client-Side AI Service Layer
 * Supports both Backend Server AI Endpoint and Direct Offline Mock Fallback (800ms latency)
 * 100% Free Tier - No API Key Required
 */

// Delay helper to simulate natural AI inference latency
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
  /**
   * Generate Questions (FR6)
   */
  async generateQuestions({ jobRole, experienceLevel, interviewType, technicalTopic, questionCount = 5 }) {
    try {
      const response = await api.post('/ai/generate-questions', {
        jobRole,
        experienceLevel,
        interviewType,
        technicalTopic,
        questionCount
      });
      if (response.data?.success && response.data.data?.questions) {
        return response.data.data.questions;
      }
    } catch (err) {
      console.warn('[aiService] Backend call failed, using client fallback questions:', err.message);
    }

    // Direct Client-Side Fallback Generator with 800ms natural delay
    await delay(800);
    return getOfflineFallbackQuestions(jobRole, experienceLevel, interviewType, technicalTopic, questionCount);
  },

  /**
   * Evaluate Answer (FR8, FR9)
   */
  async evaluateAnswer({ question, category, difficulty, userAnswer, jobRole, experienceLevel, expectedAnswer, keyPoints }) {
    if (!userAnswer || !userAnswer.trim()) {
      throw new Error('Answer cannot be empty. Please provide your answer or choose Skip.');
    }

    try {
      const response = await api.post('/ai/evaluate-answer', {
        question,
        category,
        difficulty,
        userAnswer,
        jobRole,
        experienceLevel,
        expectedAnswer,
        keyPoints
      });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[aiService] Backend call failed, using client fallback evaluator:', err.message);
    }

    // Direct Client-Side Fallback Evaluator with 800ms natural delay
    await delay(800);
    return evaluateOfflineAnswer(question, category, difficulty, userAnswer, jobRole, experienceLevel, expectedAnswer, keyPoints);
  },

  /**
   * Generate Report & Recommendations (FR10, FR11)
   */
  async generateReport({ questions, jobRole, experienceLevel }) {
    try {
      const response = await api.post('/ai/generate-report', {
        questions,
        jobRole,
        experienceLevel
      });
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[aiService] Backend call failed, calculating report client-side:', err.message);
    }

    await delay(600);
    return calculateOfflineReport(questions, jobRole, experienceLevel);
  }
};

/**
 * Offline Fallback Helpers
 */
function getOfflineFallbackQuestions(role, level, type, topic, count) {
  const targetCount = parseInt(count, 10) || 5;
  const questionsBank = {
    'Python Developer': [
      { question: "Explain the difference between mutable and immutable data types in Python with concrete examples.", category: "Core Python", difficulty: "Beginner" },
      { question: "How does Python's memory management and garbage collection work (reference counting vs cyclic GC)?", category: "Memory Management", difficulty: "Intermediate" },
      { question: "What are Python decorators, and how would you implement a timing or caching decorator using functools.wraps?", category: "Advanced Python", difficulty: "Intermediate" },
      { question: "Explain Python generators, the yield keyword, and memory optimization when handling large files.", category: "Generators", difficulty: "Intermediate" },
      { question: "What is the Global Interpreter Lock (GIL) in CPython, and how does it affect CPU-bound vs I/O-bound tasks?", category: "Concurrency", difficulty: "Advanced" }
    ],
    'Java Developer': [
      { question: "Explain the four core principles of OOP and how Java implements them with interfaces and classes.", category: "Core Java", difficulty: "Beginner" },
      { question: "What is the difference between an Abstract Class and an Interface in Java 8+?", category: "Core Java", difficulty: "Beginner" },
      { question: "How does the JVM Garbage Collector manage Heap generations (Eden, Survivor, Tenured)?", category: "JVM Internals", difficulty: "Intermediate" },
      { question: "Explain the differences between HashMap, ConcurrentHashMap, and TreeMap in Java.", category: "Collections", difficulty: "Intermediate" },
      { question: "How does Java handle thread synchronization, race conditions, and deadlocks?", category: "Concurrency", difficulty: "Advanced" }
    ],
    'Full Stack Developer': [
      { question: "Explain what happens from when a user enters a URL in a browser until the page renders.", category: "Web Fundamentals", difficulty: "Beginner" },
      { question: "How does React's Virtual DOM work, and how does reconciliation minimize re-renders?", category: "Frontend (React)", difficulty: "Beginner" },
      { question: "Compare client-side rendering (CSR), server-side rendering (SSR), and static site generation (SSG).", category: "Web Architecture", difficulty: "Intermediate" },
      { question: "How do you design a scalable RESTful API with proper HTTP verbs, pagination, and error codes?", category: "API Design", difficulty: "Intermediate" },
      { question: "Explain Cross-Origin Resource Sharing (CORS) and how to defend against CSRF and XSS attacks.", category: "Web Security", difficulty: "Advanced" }
    ],
    'Data Analyst': [
      { question: "Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with business examples.", category: "SQL", difficulty: "Beginner" },
      { question: "How do SQL window functions (ROW_NUMBER, RANK, DENSE_RANK) work and when would you use them?", category: "Advanced SQL", difficulty: "Intermediate" },
      { question: "What are common techniques for handling missing or inconsistent data in Pandas?", category: "Data Cleaning", difficulty: "Beginner" },
      { question: "How do you formulate and test an A/B test hypothesis, including p-values and statistical significance?", category: "Statistics", difficulty: "Intermediate" },
      { question: "How would you optimize a slow-running SQL query processing tens of millions of rows?", category: "Query Optimization", difficulty: "Advanced" }
    ],
    'Software Engineer': [
      { question: "Explain the SOLID principles and provide an example of violating the Single Responsibility Principle.", category: "Architecture", difficulty: "Beginner" },
      { question: "Compare Arrays vs Linked Lists vs Hash Tables in terms of time and space complexity.", category: "Data Structures", difficulty: "Beginner" },
      { question: "What is Big-O notation and how do you analyze worst-case vs amortized time complexity?", category: "Algorithms", difficulty: "Beginner" },
      { question: "Explain the CAP Theorem and how it applies to distributed databases.", category: "Distributed Systems", difficulty: "Advanced" },
      { question: "How would you design a scalable, fault-tolerant distributed rate limiter service?", category: "System Design", difficulty: "Advanced" }
    ]
  };

  const pool = questionsBank[role] || questionsBank['Software Engineer'];
  return pool.slice(0, targetCount).map((q, idx) => ({
    questionId: `q_client_${Date.now()}_${idx + 1}`,
    question: q.question,
    category: q.category,
    difficulty: q.difficulty
  }));
}

function isGibberishOrInvalidAnswer(text) {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length < 2) return { isInvalid: true, reason: 'empty' };

  const lower = trimmed.toLowerCase();
  const ignorancePatterns = [
    /^(i\s+)?(don'?t|do\s+not)\s+know/i,
    /^(i\s+)?have\s+no\s+idea/i,
    /^(no\s+idea|not\s+sure|no\s+clue|cannot\s+recall|can'?t\s+remember)/i,
    /^(i\s+)?haven'?t\s+(learned|studied|used|worked)/i,
    /^(pass|skip|next|idk|na|n\/a|none|nothing|no|nope|dunno)$/i
  ];
  if (ignorancePatterns.some(p => p.test(lower))) {
    return { isInvalid: true, reason: 'ignorance' };
  }

  const words = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return { isInvalid: true, reason: 'empty' };

  const allowedShort = new Set([
    'sql', 'css', 'html', 'js', 'ts', 'dom', 'api', 'jwt', 'jvm', 'gc', 'io', 'db',
    'ui', 'ux', 'ci', 'cd', 'aws', 'cpu', 'ram', 'star', 'acid', 'base', 'rest',
    'cors', 'csrf', 'xss', 'ssr', 'ssg', 'csr', 'mro', 'gil', 'ioc', 'oop', 'orm'
  ]);

  let validWordCount = 0;
  for (const word of words) {
    if (allowedShort.has(word)) {
      validWordCount++;
      continue;
    }
    const hasVowel = /[aeiouy]/.test(word);
    const excessiveConsonants = /[^aeiouy\s]{5,}/.test(word);
    const repeatedChars = /(.)\1{3,}/.test(word);

    if (hasVowel && !excessiveConsonants && !repeatedChars && word.length >= 2) {
      validWordCount++;
    }
  }

  if (validWordCount === 0 || (words.length >= 3 && (validWordCount / words.length) < 0.35)) {
    return { isInvalid: true, reason: 'gibberish' };
  }

  const singleCombined = words.join('');
  if (/(.)\1{4,}/.test(singleCombined) || /(\w{2,4})\1{3,}/.test(singleCombined)) {
    return { isInvalid: true, reason: 'gibberish' };
  }

  return { isInvalid: false };
}

function evaluateOfflineAnswer(question, category, difficulty, userAnswer, role, level, expectedAnswer, keyPoints = []) {
  const cleanAnswer = (userAnswer || '').trim();
  const invalidCheck = isGibberishOrInvalidAnswer(cleanAnswer);

  if (invalidCheck.isInvalid) {
    return {
      overallScore: 0.0,
      correctness: 0.0,
      relevance: 0.0,
      completeness: 0.0,
      clarity: 0.0,
      strengths: [],
      missingPoints: ['The submission did not contain a valid or coherent technical explanation.'],
      feedback: invalidCheck.reason === 'ignorance'
        ? 'No substantive response provided. Practice explaining the foundational mechanisms.'
        : 'The response appears to be random characters or incoherent text. In a technical interview, answers must directly explain technical mechanisms and reasoning.',
      improvedAnswer: expectedAnswer || `In a production ${role} system, addressing "${question}" requires explaining the core architectural principles, runtime execution flow, and trade-offs.`
    };
  }

  const lowerAnswer = cleanAnswer.toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const questionTokens = question.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'explain', 'difference', 'between', 'describe', 'using', 'would', 'when', 'handle', 'compare'].includes(w));

  const expectedConcepts = (Array.isArray(keyPoints) && keyPoints.length > 0)
    ? keyPoints.map(k => k.toLowerCase())
    : questionTokens;

  const matched = expectedConcepts.filter(k => lowerAnswer.includes(k));
  const ratio = expectedConcepts.length > 0 ? (matched.length / expectedConcepts.length) : 0;

  if (matched.length === 0) {
    return {
      overallScore: 0.0,
      correctness: 0.0,
      relevance: 0.0,
      completeness: 0.0,
      clarity: 0.0,
      strengths: [],
      missingPoints: ['The answer did not mention the required technical concepts for this question.'],
      feedback: 'The response is unrelated to the question asked. Please address the specific topic and technical mechanism.',
      improvedAnswer: expectedAnswer || `In a production ${role} system, addressing "${question}" requires explaining the core architectural principles, runtime execution flow, and trade-offs.`
    };
  }

  let correctness = ratio >= 0.6 && wordCount >= 30 ? 9.0 : (ratio >= 0.4 ? 7.0 : (ratio >= 0.2 ? 5.0 : 3.0));
  let relevance = ratio >= 0.5 ? 9.0 : (ratio >= 0.25 ? 7.0 : 4.0);
  let completeness = wordCount >= 45 && ratio >= 0.4 ? 8.5 : (wordCount >= 20 ? 6.0 : 4.0);
  let clarity = cleanAnswer.includes('.') && wordCount >= 15 ? 8.0 : 6.0;

  let overallScore = Math.round(
    (correctness * 0.40 + relevance * 0.30 + completeness * 0.20 + clarity * 0.10) * 10
  ) / 10;

  if (ratio < 0.25) overallScore = Math.min(overallScore, 4.0);

  return {
    overallScore,
    correctness,
    relevance,
    completeness,
    clarity,
    strengths: [`Addressed key terminology: ${matched.slice(0, 3).join(', ')}.`],
    missingPoints: expectedConcepts.filter(c => !matched.includes(c)).slice(0, 2).map(c => `Could elaborate on: ${c}`),
    feedback: overallScore >= 7
      ? `Strong foundational response covering the core mechanism.`
      : `Partially correct answer. Review missing points to build complete technical mastery.`,
    improvedAnswer: expectedAnswer || `In a production ${role} system, addressing "${question}" requires explaining both the architectural rationale and runtime behavior.`
  };
}

function calculateOfflineReport(questions, role, level) {
  const answered = questions.filter(q => !q.skipped);
  const skipped = questions.filter(q => q.skipped);

  let avgCorrectness = 7.5;
  let avgRelevance = 8.0;
  let avgCompleteness = 7.0;
  let avgClarity = 7.5;
  let overallScore = 7.5;

  if (answered.length > 0) {
    avgCorrectness = Math.round((answered.reduce((sum, q) => sum + (q.correctness || 0), 0) / answered.length) * 10) / 10;
    avgRelevance = Math.round((answered.reduce((sum, q) => sum + (q.relevance || 0), 0) / answered.length) * 10) / 10;
    avgCompleteness = Math.round((answered.reduce((sum, q) => sum + (q.completeness || 0), 0) / answered.length) * 10) / 10;
    avgClarity = Math.round((answered.reduce((sum, q) => sum + (q.clarity || 0), 0) / answered.length) * 10) / 10;
    overallScore = Math.round((answered.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length) * 10) / 10;
  }

  return {
    overallScore,
    criterionScores: {
      correctness: avgCorrectness,
      relevance: avgRelevance,
      completeness: avgCompleteness,
      clarity: avgClarity
    },
    answeredCount: answered.length,
    skippedCount: skipped.length,
    report: {
      strengths: [
        'Demonstrated good conceptual clarity in fundamental principles.',
        'Structured responses with logical reasoning and relevant keywords.'
      ],
      areasToImprove: [
        'Deepen technical specificity on advanced edge cases.',
        'Elaborate on performance trade-offs and runtime characteristics.'
      ],
      recommendations: [
        {
          topic: `${role} Architecture & Design Patterns`,
          action: 'Build modular mini-projects applying SOLID design principles and concurrency management.',
          resources: 'Official Framework Docs & System Design Best Practices'
        },
        {
          topic: 'Live Coding & Precise Communication',
          action: 'Practice articulating algorithmic complexity and trade-offs out loud using the STAR method.',
          resources: 'Technical Interview Handbook & LeetCode Discussions'
        }
      ]
    }
  };
}
