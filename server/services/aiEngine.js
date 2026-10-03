/**
 * Interview AI Assistant - AI Engine Service
 * Implements question generation, answer evaluation (4 criteria),
 * recommendations engine, and optional Gemini LLM integration with fallback.
 */

// Fallback Deterministic Question Bank (FR14)
const FALLBACK_QUESTION_BANK = {
  'Python Developer': {
    Technical: [
      { question: "Explain the difference between mutable and immutable types in Python with examples.", category: "Core Python", difficulty: "Beginner" },
      { question: "How does Python's memory management and garbage collection work (reference counting vs cyclic GC)?", category: "Memory Management", difficulty: "Intermediate" },
      { question: "What are Python decorators, and how would you implement a timing or caching decorator using functools.wraps?", category: "Advanced Python", difficulty: "Intermediate" },
      { question: "Explain Python generators, the yield keyword, and how they optimize memory when processing large datasets.", category: "Generators & Iterators", difficulty: "Intermediate" },
      { question: "What is the Global Interpreter Lock (GIL) in CPython, and how does it impact multi-threaded CPU-bound vs I/O-bound applications?", category: "Concurrency", difficulty: "Advanced" },
      { question: "How do class inheritance, method overriding, and the Method Resolution Order (MRO/super()) work in Python?", category: "OOP", difficulty: "Beginner" },
      { question: "How would you handle custom exceptions and context managers (__enter__ and __exit__) in Python?", category: "Core Python", difficulty: "Intermediate" },
      { question: "Compare list comprehensions, map/filter functions, and traditional loops in terms of readability and performance.", category: "Performance", difficulty: "Beginner" },
      { question: "How do you profile and optimize a slow Python script or API endpoint?", category: "Optimization", difficulty: "Advanced" },
      { question: "Explain asyncio in Python: event loops, coroutines, tasks, and when to choose asyncio over multiprocessing.", category: "Asynchronous Programming", difficulty: "Advanced" },
      { question: "Describe how you write unit tests in Python using pytest or unittest, including mocking external APIs.", category: "Testing", difficulty: "Intermediate" },
      { question: "What are Python dunder methods (like __str__, __repr__, __call__, __getitem__), and when would you use them?", category: "OOP", difficulty: "Intermediate" },
      { question: "How would you securely interact with a relational database using an ORM like SQLAlchemy or raw queries in Python?", category: "Databases", difficulty: "Intermediate" },
      { question: "Explain the differences between shallow copy and deep copy in Python.", category: "Core Python", difficulty: "Beginner" },
      { question: "Design a rate limiter in Python using sliding window or token bucket algorithm for a web service.", category: "System Design", difficulty: "Advanced" }
    ],
    Behavioral: [
      { question: "Describe a challenging bug you encountered in a Python project and how you systematically tracked and resolved it.", category: "Problem Solving", difficulty: "Intermediate" },
      { question: "Tell me about a time you had to optimize performance or refactor legacy code under a tight deadline.", category: "Project Execution", difficulty: "Intermediate" },
      { question: "How do you handle disagreement with a code reviewer on style, architecture, or design patterns?", category: "Collaboration", difficulty: "Beginner" },
      { question: "Describe an instance where you learned a new library or tool quickly to deliver a feature.", category: "Adaptability", difficulty: "Beginner" },
      { question: "Give an example of how you mentored a junior teammate or explained a complex technical concept to a non-technical stakeholder.", category: "Leadership & Communication", difficulty: "Advanced" }
    ]
  },
  'Java Developer': {
    Technical: [
      { question: "Explain the four core principles of Object-Oriented Programming (OOP) and how Java implements them.", category: "Core Java / OOP", difficulty: "Beginner" },
      { question: "What is the difference between an Abstract Class and an Interface in Java 8+ (including default and static methods)?", category: "Core Java", difficulty: "Beginner" },
      { question: "How does the Java Virtual Machine (JVM) manage memory (Heap vs Stack, Metaspace, and Garbage Collection generations)?", category: "JVM Internals", difficulty: "Intermediate" },
      { question: "Explain the differences between HashMap, ConcurrentHashMap, and TreeMap in Java.", category: "Collections", difficulty: "Intermediate" },
      { question: "How does Java handle thread synchronization, race conditions, and deadlocks? Explain volatile, synchronized, and ReentrantLock.", category: "Concurrency", difficulty: "Advanced" },
      { question: "Describe the Spring Boot lifecycle, Dependency Injection, and Inversion of Control (IoC).", category: "Spring Framework", difficulty: "Intermediate" },
      { question: "How do Java Streams and Lambda expressions work, and what are their performance trade-offs compared to classic loops?", category: "Java 8+ Features", difficulty: "Intermediate" },
      { question: "Explain how database transactions and isolation levels (READ_COMMITTED, REPEATABLE_READ) are managed in Spring via @Transactional.", category: "Database & Spring", difficulty: "Advanced" },
      { question: "What are the common design patterns you regularly use in Java (e.g., Singleton, Factory, Builder, Observer) and why?", category: "Design Patterns", difficulty: "Intermediate" },
      { question: "How do you diagnose and troubleshoot a memory leak or High CPU issue in a running Java service using profiling tools?", category: "Diagnostics & Performance", difficulty: "Advanced" },
      { question: "What is the contract between equals() and hashCode() in Java, and what happens if it is violated?", category: "Core Java", difficulty: "Beginner" },
      { question: "Explain how RESTful APIs are secured in Java using Spring Security and JWT tokens.", category: "Security", difficulty: "Intermediate" },
      { question: "How does Hibernate caching work (First-level vs Second-level cache), and how do you resolve the N+1 select problem?", category: "JPA & Hibernate", difficulty: "Advanced" },
      { question: "Explain Java Exception Hierarchy: checked vs unchecked exceptions and best practices for custom exception handling.", category: "Core Java", difficulty: "Beginner" },
      { question: "How do Java Virtual Threads (Project Loom) differ from platform threads, and what benefits do they provide for high-throughput I/O?", category: "Modern Java", difficulty: "Advanced" }
    ],
    Behavioral: [
      { question: "Describe a situation where a production service had an outage. What was your incident management and root-cause analysis process?", category: "Incident Response", difficulty: "Advanced" },
      { question: "Tell me about a time you had to balance technical debt with delivering business features quickly.", category: "Decision Making", difficulty: "Intermediate" },
      { question: "How do you approach code reviews when reviewing peers' pull requests to maintain high code quality?", category: "Team Collaboration", difficulty: "Beginner" },
      { question: "Describe a project where requirements changed midway. How did you adapt your architecture or sprint plan?", category: "Agility & Adaptability", difficulty: "Intermediate" },
      { question: "Tell me about a time you identified a process inefficiency in your development workflow and improved it.", category: "Continuous Improvement", difficulty: "Intermediate" }
    ]
  },
  'Full Stack Developer': {
    Technical: [
      { question: "Explain the end-to-end flow of what happens when a user enters a URL in a browser and presses Enter until the page renders.", category: "Web Fundamentals", difficulty: "Beginner" },
      { question: "How does React's Virtual DOM work, and how does React's reconciliation algorithm optimize DOM updates?", category: "Frontend (React)", difficulty: "Beginner" },
      { question: "Explain the differences between client-side rendering (CSR), server-side rendering (SSR), and static site generation (SSG).", category: "Web Architecture", difficulty: "Intermediate" },
      { question: "How do you design a scalable RESTful API with proper HTTP verbs, status codes, pagination, and error handling?", category: "API Design", difficulty: "Intermediate" },
      { question: "Explain authentication and authorization in modern full-stack apps: compare Session cookies, JWTs, and OAuth2.", category: "Security", difficulty: "Intermediate" },
      { question: "How does the Node.js Event Loop work, and how does it handle non-blocking asynchronous I/O?", category: "Backend (Node.js)", difficulty: "Intermediate" },
      { question: "Compare Relational Databases (PostgreSQL/MySQL) with NoSQL Databases (MongoDB) in terms of schema, ACID compliance, and scalability.", category: "Databases", difficulty: "Intermediate" },
      { question: "How do you optimize frontend web performance (Core Web Vitals, code-splitting, lazy loading, image optimization, memoization)?", category: "Web Performance", difficulty: "Intermediate" },
      { question: "Explain Cross-Origin Resource Sharing (CORS), CSRF, and XSS attacks and how to defend against each in a full-stack app.", category: "Web Security", difficulty: "Advanced" },
      { question: "How would you design and implement real-time communication (e.g., live notifications or chat) using WebSockets or SSE?", category: "Real-time Systems", difficulty: "Advanced" },
      { question: "Describe how you manage state across a large React application (Redux Toolkit, Zustand, Context API vs Server State like TanStack Query).", category: "Frontend State", difficulty: "Intermediate" },
      { question: "How do you structure database indexes and optimize slow SQL/NoSQL queries in a high-traffic application?", category: "Database Optimization", difficulty: "Advanced" },
      { question: "Explain containerization with Docker and how you set up a CI/CD pipeline for automated testing and deployment.", category: "DevOps & Deployment", difficulty: "Intermediate" },
      { question: "How do you handle database migrations safely in production without causing downtime?", category: "Data Architecture", difficulty: "Advanced" },
      { question: "Design an end-to-end full stack system for a URL shortener with high read traffic, analytics, and caching.", category: "System Design", difficulty: "Advanced" }
    ],
    Behavioral: [
      { question: "Tell me about a complex full-stack feature you built from scratch. What technical trade-offs did you make?", category: "Full-Stack Ownership", difficulty: "Intermediate" },
      { question: "Describe a time when frontend and backend teams had conflicting expectations on an API contract. How did you resolve it?", category: "Cross-Functional Collaboration", difficulty: "Intermediate" },
      { question: "How do you stay up to date with rapidly evolving web frameworks and tooling without suffering from fatigue?", category: "Continuous Learning", difficulty: "Beginner" },
      { question: "Tell me about a project that failed or missed its delivery deadline. What did you learn from the retrospective?", category: "Accountability", difficulty: "Intermediate" },
      { question: "Describe how you prioritize technical refactoring vs urgent user-requested features.", category: "Product & Engineering Balance", difficulty: "Advanced" }
    ]
  },
  'Data Analyst': {
    Technical: [
      { question: "Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with practical business examples.", category: "SQL", difficulty: "Beginner" },
      { question: "How do SQL window functions (ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD()) work and when would you use them?", category: "Advanced SQL", difficulty: "Intermediate" },
      { question: "What are the common techniques for handling missing or inconsistent data in a large dataset using Python (Pandas)?", category: "Data Cleaning", difficulty: "Beginner" },
      { question: "Explain the difference between descriptive, diagnostic, predictive, and prescriptive analytics.", category: "Analytics Concepts", difficulty: "Beginner" },
      { question: "How do you formulate and test an A/B test hypothesis? What are p-values, statistical significance, and Type I/II errors?", category: "Statistics & A/B Testing", difficulty: "Intermediate" },
      { question: "Explain how you would clean, transform, and aggregate raw transactional data to calculate Customer Lifetime Value (CLV) or Churn Rate.", category: "Business Metrics", difficulty: "Intermediate" },
      { question: "What is the difference between Star Schema and Snowflake Schema in data warehousing?", category: "Data Modeling", difficulty: "Intermediate" },
      { question: "How do you choose the right data visualization (e.g., scatter plot, histogram, heat map, box plot) to convey insights clearly to executive leadership?", category: "Data Storytelling", difficulty: "Beginner" },
      { question: "Explain the concepts of correlation vs causation and give an example where two metrics correlate but have no causal link.", category: "Statistics", difficulty: "Beginner" },
      { question: "How would you optimize a slow-running SQL query processing tens of millions of rows in a data warehouse (BigQuery / Snowflake / Postgres)?", category: "Query Optimization", difficulty: "Advanced" },
      { question: "Describe how you design automated dashboards in Tableau or Power BI to track real-time business KPIs.", category: "BI & Dashboards", difficulty: "Intermediate" },
      { question: "What is exploratory data analysis (EDA) and what step-by-step checklist do you follow when exploring a brand-new dataset?", category: "Data Exploration", difficulty: "Beginner" },
      { question: "Explain anomaly/outlier detection methods (Z-score, IQR, isolation forest) and how you decide whether to remove or impute them.", category: "Statistics", difficulty: "Intermediate" },
      { question: "How do you validate the integrity of your data pipeline before presenting metrics to C-level executives?", category: "Data Governance", difficulty: "Intermediate" },
      { question: "Design an analytics framework to measure user engagement and drop-off funnel for an e-commerce checkout flow.", category: "Product Analytics", difficulty: "Advanced" }
    ],
    Behavioral: [
      { question: "Tell me about a time your data analysis contradicted a stakeholder's gut feeling or expectations. How did you present your findings?", category: "Stakeholder Management", difficulty: "Intermediate" },
      { question: "Describe a situation where you had to work with ambiguous requirements or incomplete data to answer a critical business question.", category: "Critical Thinking", difficulty: "Intermediate" },
      { question: "How do you explain technical statistical concepts to non-technical business partners?", category: "Communication", difficulty: "Beginner" },
      { question: "Tell me about a time you discovered a critical data error in an existing report. How did you handle communication and remediation?", category: "Data Integrity & Ethics", difficulty: "Intermediate" },
      { question: "Describe a project where your data insight directly influenced a strategic business decision or revenue growth.", category: "Business Impact", difficulty: "Advanced" }
    ]
  },
  'Software Engineer': {
    Technical: [
      { question: "Explain the SOLID principles of Object-Oriented Design and provide an example of violating and fixing the Single Responsibility Principle.", category: "Software Architecture", difficulty: "Beginner" },
      { question: "Compare Arrays vs Linked Lists vs Hash Tables in terms of time and space complexity for search, insertion, and deletion.", category: "Data Structures", difficulty: "Beginner" },
      { question: "What is Big-O notation, and how do you analyze the worst-case, average-case, and amortized time complexity of an algorithm?", category: "Algorithms", difficulty: "Beginner" },
      { question: "Explain how DNS resolution, TCP handshake, TLS/SSL encryption, and HTTP requests establish a secure connection.", category: "Computer Networks", difficulty: "Intermediate" },
      { question: "What are the trade-offs between monolithic architecture and microservices architecture? When should you adopt each?", category: "System Architecture", difficulty: "Intermediate" },
      { question: "Explain the CAP Theorem and how it applies to distributed databases (Consistency, Availability, Partition Tolerance).", category: "Distributed Systems", difficulty: "Advanced" },
      { question: "How do database indexes (B-Trees and Hash Indexes) work internally, and what are the trade-offs of having too many indexes?", category: "Database Internals", difficulty: "Intermediate" },
      { question: "Describe process vs thread: memory allocation, context switching overhead, and inter-process communication (IPC).", category: "Operating Systems", difficulty: "Intermediate" },
      { question: "How do you design an idempotent API, and why is idempotency crucial in payment and distributed messaging systems?", category: "API Design", difficulty: "Intermediate" },
      { question: "Explain caching strategies (Cache-Aside, Write-Through, Write-Back) and how to handle cache invalidation and cache stampedes.", category: "Caching & Performance", difficulty: "Advanced" },
      { question: "What is the difference between synchronous, asynchronous, and event-driven architectures? When would you use a message broker like Kafka or RabbitMQ?", category: "System Design", difficulty: "Advanced" },
      { question: "Describe how you write thorough automated test suites: Unit Tests, Integration Tests, End-to-End Tests, and the Test Pyramid.", category: "Software Quality", difficulty: "Beginner" },
      { question: "How would you design a scalable, fault-tolerant distributed rate limiter service?", category: "System Design", difficulty: "Advanced" },
      { question: "Explain database ACID properties vs BASE properties in distributed systems.", category: "Database Systems", difficulty: "Intermediate" },
      { question: "How do you debug a production memory leak or CPU spike in a distributed microservices environment with distributed tracing?", category: "Observability & SRE", difficulty: "Advanced" }
    ],
    Behavioral: [
      { question: "Describe the most complex software project you designed or implemented. What were the key architecture decisions?", category: "Engineering Craftsmanship", difficulty: "Advanced" },
      { question: "Tell me about a time you had a technical disagreement with a senior engineer or architect. How did you navigate the conversation?", category: "Collaboration", difficulty: "Intermediate" },
      { question: "How do you handle tight deadlines with competing priorities without compromising on testing and code quality?", category: "Time Management", difficulty: "Intermediate" },
      { question: "Describe a situation where a piece of code you pushed caused a production regression. What was your immediate response?", category: "Ownership & Accountability", difficulty: "Intermediate" },
      { question: "Tell me about a time you advocated for improving engineering practices (e.g., CI/CD, documentation, code review guidelines) in your team.", category: "Engineering Leadership", difficulty: "Intermediate" }
    ]
  }
};

/**
 * Generate Interview Questions (FR6)
 */
const generateQuestions = async ({ jobRole, experienceLevel, interviewType, technicalTopic, questionCount = 5 }) => {
  const targetCount = parseInt(questionCount, 10) || 5;
  const roleKey = FALLBACK_QUESTION_BANK[jobRole] ? jobRole : 'Software Engineer';
  
  // Try Gemini if API key is provided
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const questions = await fetchGeminiQuestions({
        jobRole,
        experienceLevel,
        interviewType,
        technicalTopic,
        questionCount: targetCount
      });
      if (questions && questions.length >= targetCount) {
        return questions.slice(0, targetCount);
      }
    } catch (err) {
      console.warn('[AI Engine] Gemini API call failed or timed out. Falling back to deterministic fallback bank:', err.message);
    }
  }

  // Deterministic Fallback Generation with progressive difficulty
  const roleBank = FALLBACK_QUESTION_BANK[roleKey];
  let pool = [];

  if (interviewType === 'Technical') {
    pool = [...roleBank.Technical];
  } else if (interviewType === 'Behavioral') {
    pool = [...roleBank.Behavioral];
  } else {
    // Mixed: 70% technical, 30% behavioral
    const techCount = Math.ceil(targetCount * 0.7);
    const behCount = targetCount - techCount;
    const techPool = [...roleBank.Technical];
    const behPool = [...roleBank.Behavioral];
    
    // Pick with topic boost if topic specified
    const selectedTech = pickProgressiveQuestions(techPool, techCount, experienceLevel, technicalTopic);
    const selectedBeh = pickProgressiveQuestions(behPool, behCount, experienceLevel, null);
    return interleaveQuestions(selectedTech, selectedBeh);
  }

  return pickProgressiveQuestions(pool, targetCount, experienceLevel, technicalTopic);
};

const pickProgressiveQuestions = (pool, count, experienceLevel, topic) => {
  let matchedPool = [...pool];

  // If topic provided, boost items containing topic
  if (topic && topic.trim()) {
    const topicLower = topic.toLowerCase().trim();
    matchedPool.sort((a, b) => {
      const aMatch = (a.question + ' ' + a.category).toLowerCase().includes(topicLower);
      const bMatch = (b.question + ' ' + b.category).toLowerCase().includes(topicLower);
      return bMatch - aMatch;
    });
  }

  // Progressive difficulty targets based on target count
  // E.g., for 5 questions: 2 Beginner, 2 Intermediate, 1 Advanced (adjusted for level)
  const beginners = matchedPool.filter(q => q.difficulty === 'Beginner');
  const intermediates = matchedPool.filter(q => q.difficulty === 'Intermediate');
  const advanced = matchedPool.filter(q => q.difficulty === 'Advanced');

  let result = [];
  
  if (experienceLevel === 'Beginner') {
    result.push(...beginners.slice(0, Math.ceil(count * 0.6)));
    result.push(...intermediates.slice(0, Math.floor(count * 0.3)));
    result.push(...advanced.slice(0, count - result.length));
  } else if (experienceLevel === 'Advanced') {
    result.push(...intermediates.slice(0, Math.floor(count * 0.3)));
    result.push(...advanced.slice(0, Math.ceil(count * 0.5)));
    result.push(...beginners.slice(0, count - result.length));
  } else {
    // Intermediate
    result.push(...beginners.slice(0, Math.floor(count * 0.25)));
    result.push(...intermediates.slice(0, Math.ceil(count * 0.5)));
    result.push(...advanced.slice(0, count - result.length));
  }

  // Fill up if needed
  if (result.length < count) {
    for (const q of matchedPool) {
      if (!result.some(r => r.question === q.question)) {
        result.push(q);
        if (result.length >= count) break;
      }
    }
  }

  return result.slice(0, count).map((q, idx) => ({
    questionId: `q_${Date.now()}_${idx + 1}`,
    question: q.question,
    category: q.category || 'General',
    difficulty: q.difficulty || 'Intermediate'
  }));
};

const interleaveQuestions = (techList, behList) => {
  const result = [];
  let tIdx = 0;
  let bIdx = 0;
  while (tIdx < techList.length || bIdx < behList.length) {
    if (tIdx < techList.length) result.push(techList[tIdx++]);
    if (tIdx < techList.length && (tIdx % 2 === 0) && bIdx < behList.length) {
      result.push(behList[bIdx++]);
    }
    if (tIdx >= techList.length && bIdx < behList.length) {
      result.push(behList[bIdx++]);
    }
  }
  return result;
};

/**
 * Detect empty, ignorance, or gibberish / keyboard-mash answers
 */
const isGibberishOrInvalid = (text) => {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length < 2) return { isInvalid: true, reason: 'empty' };

  const lower = trimmed.toLowerCase();

  // Ignorance patterns (e.g. "I don't know", "no idea", "not sure", "idk", "skip", "pass")
  const ignorancePatterns = [
    /^(i\s+)?(don'?t|do\s+not)\s+know/i,
    /^(i\s+)?have\s+no\s+idea/i,
    /^(no\s+idea|not\s+sure|no\s+clue|cannot\s+recall|can'?t\s+remember)/i,
    /^(i\s+)?haven'?t\s+(learned|studied|used|worked)/i,
    /^(pass|skip|next|idk|na|n\/a|none|nothing|no|nope|dunno)$/i,
    /^not\s+(applicable|relevant|sure|known)/i
  ];
  if (ignorancePatterns.some(p => p.test(lower))) {
    return { isInvalid: true, reason: 'ignorance' };
  }

  // Tokenize words
  const words = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return { isInvalid: true, reason: 'empty' };

  const allowedShort = new Set([
    'sql', 'css', 'html', 'js', 'ts', 'dom', 'api', 'jwt', 'jvm', 'gc', 'io', 'db',
    'ui', 'ux', 'ci', 'cd', 'aws', 'cpu', 'ram', 'star', 'acid', 'base', 'rest',
    'cors', 'csrf', 'xss', 'ssr', 'ssg', 'csr', 'mro', 'gil', 'ioc', 'oop', 'orm',
    'tcp', 'dns', 'tls', 'ssl', 'http', 'eda', 'clv', 'iqr', 'ipc'
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
  if (/(.)\1{4,}/.test(singleCombined)) {
    return { isInvalid: true, reason: 'gibberish' };
  }
  if (/(\w{2,4})\1{3,}/.test(singleCombined)) {
    return { isInvalid: true, reason: 'gibberish' };
  }

  return { isInvalid: false };
};

// Comprehensive topic concept dictionary for high-precision local evaluation
const TOPIC_CONCEPT_MAP = {
  // Python
  'mutable': ['mutable', 'immutable', 'modify', 'state', 'id', 'memory', 'list', 'tuple', 'dict', 'reference'],
  'garbage collection': ['reference counting', 'cyclic', 'garbage collector', 'gc', 'generation', 'cycle', 'memory'],
  'decorator': ['wrapper', 'functools', 'wraps', 'closure', 'inner function', 'higher order', 'argument', '@'],
  'generator': ['yield', 'generator', 'iterator', 'lazy', 'memory', 'next', 'stream', 'iterable'],
  'gil': ['global interpreter lock', 'cpython', 'thread', 'cpu', 'io', 'multiprocessing', 'concurrency', 'lock'],
  
  // Java
  'oop': ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'object', 'interface'],
  'abstract class': ['interface', 'default method', 'multiple inheritance', 'abstract method', 'instantiate', 'contract'],
  'jvm': ['heap', 'stack', 'metaspace', 'garbage collection', 'eden', 'survivor', 'old generation', 'memory'],
  'hashmap': ['bucket', 'collision', 'thread safe', 'concurrenthashmap', 'treemap', 'red black tree', 'synchronized'],
  'spring': ['dependency injection', 'inversion of control', 'ioc', 'bean', 'application context', 'autowired'],
  
  // Full Stack / React / Web
  'virtual dom': ['virtual dom', 'in-memory', 'real dom', 'reconciliation', 'diffing', 'tree', 'batch', 'repaint', 'reflow', 'fiber'],
  'reconciliation': ['diffing', 'virtual dom', 'heuristics', 'key', 'element type', 'tree', 'batch', 'dom', 'update'],
  'rendering': ['client-side', 'server-side', 'static site', 'csr', 'ssr', 'ssg', 'html', 'seo', 'hydrate', 'pre-render'],
  'rest': ['http', 'get', 'post', 'put', 'delete', 'status code', 'idempotent', 'stateless', 'resource', 'endpoint'],
  'jwt': ['token', 'header', 'payload', 'signature', 'stateless', 'secret', 'bearer', 'authentication', 'session'],
  'event loop': ['single thread', 'non-blocking', 'asynchronous', 'call stack', 'callback queue', 'microtask', 'libuv', 'io'],
  'sql': ['join', 'inner', 'left', 'right', 'outer', 'index', 'query', 'table', 'row', 'foreign key'],
  'window function': ['over', 'partition by', 'order by', 'row_number', 'rank', 'dense_rank', 'lag', 'lead'],
  'security': ['cors', 'csrf', 'xss', 'token', 'same-origin', 'sanitization', 'header', 'cookie', 'injection'],
  'solid': ['single responsibility', 'open closed', 'liskov', 'interface segregation', 'dependency inversion', 'srp'],
  'cap': ['consistency', 'availability', 'partition tolerance', 'network partition', 'distributed', 'trade-off'],
  'big-o': ['time complexity', 'space complexity', 'worst case', 'amortized', 'asymptotic', 'o(n)', 'o(1)', 'o(log n)']
};

const extractDomainKeywords = (question, category) => {
  const combined = (question + ' ' + (category || '')).toLowerCase();
  const matchedLists = [];

  for (const [key, concepts] of Object.entries(TOPIC_CONCEPT_MAP)) {
    if (combined.includes(key)) {
      matchedLists.push(...concepts);
    }
  }

  // Also extract significant technical words from question
  const questionWords = question.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'explain', 'difference', 'between', 'describe', 'using', 'would', 'when', 'handle', 'compare', 'where', 'which', 'their'].includes(w));

  return Array.from(new Set([...matchedLists, ...questionWords]));
};

/**
 * Evaluate User Answer (FR8, FR9)
 * Evaluates Correctness, Relevance, Completeness, Clarity (0-10)
 */
const evaluateAnswer = async ({ question, category, difficulty, userAnswer, jobRole, experienceLevel, expectedAnswer, keyPoints }) => {
  // Reject empty answer
  if (!userAnswer || !userAnswer.trim()) {
    throw new Error('Answer cannot be empty. Please provide your answer or choose Skip.');
  }

  const trimmed = userAnswer.trim();

  // Step 1: Pre-validation for gibberish, keyboard mash, or explicit non-answers
  const invalidCheck = isGibberishOrInvalid(trimmed);
  if (invalidCheck.isInvalid) {
    return evaluateLocally({
      question,
      category,
      difficulty,
      userAnswer: trimmed,
      jobRole,
      experienceLevel,
      expectedAnswer,
      keyPoints
    });
  }

  // Step 2: Try Gemini if API key is provided
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const evaluation = await fetchGeminiEvaluation({
        question,
        category,
        difficulty,
        userAnswer: trimmed,
        jobRole,
        experienceLevel,
        expectedAnswer,
        keyPoints
      });
      if (evaluation && typeof evaluation.overallScore === 'number') {
        const correctness = Math.min(10, Math.max(0, Number(evaluation.correctness) || 0));
        const relevance = Math.min(10, Math.max(0, Number(evaluation.relevance) || 0));
        let overallScore = Math.min(10, Math.max(0, Number(evaluation.overallScore) || 0));

        // If correctness or relevance is minimal, overallScore must not be high
        if (correctness <= 1 || relevance <= 1) {
          overallScore = Math.min(overallScore, 1.0);
          if (correctness === 0 && relevance === 0) overallScore = 0.0;
        }

        return {
          ...evaluation,
          overallScore: Math.round(overallScore * 10) / 10,
          correctness: Math.round(correctness * 10) / 10,
          relevance: Math.round(relevance * 10) / 10,
          completeness: Math.round((Number(evaluation.completeness) || 0) * 10) / 10,
          clarity: Math.round((Number(evaluation.clarity) || 0) * 10) / 10,
          expectedAnswer: expectedAnswer || evaluation.expectedAnswer || evaluation.improvedAnswer || '',
          keyPoints: Array.isArray(keyPoints) && keyPoints.length ? keyPoints : (Array.isArray(evaluation.missingPoints) ? evaluation.missingPoints : [])
        };
      }
    } catch (err) {
      console.warn('[AI Engine] Gemini evaluation failed. Falling back to local evaluator:', err.message);
    }
  }

  // Step 3: High-fidelity local rule-based AI evaluator
  return evaluateLocally({
    question,
    category,
    difficulty,
    userAnswer: trimmed,
    jobRole,
    experienceLevel,
    expectedAnswer,
    keyPoints
  });
};

/**
 * Local AI Evaluator - generates authentic, constructive, non-generic feedback
 */
const evaluateLocally = ({ question, category, difficulty, userAnswer, jobRole, experienceLevel, expectedAnswer, keyPoints = [] }) => {
  const cleanAnswer = (userAnswer || '').trim();

  // 1. Check for gibberish, empty, or ignorance expressions
  const invalidCheck = isGibberishOrInvalid(cleanAnswer);
  if (invalidCheck.isInvalid) {
    let feedbackMsg = '';
    if (invalidCheck.reason === 'ignorance') {
      feedbackMsg = 'No substantive answer was provided. To succeed in technical interviews, explain the foundational concepts even if you are unsure of all details.';
    } else {
      feedbackMsg = 'The submitted response contains random characters or incoherent text. In a technical interview, answers must directly explain technical mechanisms and reasoning.';
    }

    return {
      overallScore: 0.0,
      correctness: 0.0,
      relevance: 0.0,
      completeness: 0.0,
      clarity: 0.0,
      strengths: [],
      missingPoints: ['A coherent technical response addressing the question was not submitted.'],
      feedback: feedbackMsg,
      improvedAnswer: expectedAnswer || generateExemplaryAnswer(question, category, jobRole),
      expectedAnswer: expectedAnswer || generateExemplaryAnswer(question, category, jobRole),
      keyPoints: Array.isArray(keyPoints) ? keyPoints : []
    };
  }

  const lowerAnswer = cleanAnswer.toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 2. Extract expected target concepts
  const expectedConcepts = (Array.isArray(keyPoints) && keyPoints.length > 0)
    ? keyPoints.map(k => k.toLowerCase())
    : extractDomainKeywords(question, category);

  // 3. Match concepts in candidate answer
  const matchedConcepts = expectedConcepts.filter(concept => {
    if (concept.includes(' ')) {
      if (lowerAnswer.includes(concept)) return true;
      const parts = concept.split(' ');
      return parts.every(p => lowerAnswer.includes(p));
    }
    return lowerAnswer.includes(concept);
  });

  const totalExpected = Math.max(expectedConcepts.length, 3);
  const matchRatio = matchedConcepts.length / totalExpected;

  // 4. Check for totally off-topic / zero relevance answers
  if (matchedConcepts.length === 0) {
    return {
      overallScore: 0.0,
      correctness: 0.0,
      relevance: 0.0,
      completeness: 0.0,
      clarity: 0.0,
      strengths: [],
      missingPoints: [
        `The answer did not mention any expected concepts for ${category || 'this topic'}.`,
        `Expected key concepts: ${expectedConcepts.slice(0, 4).join(', ')}`
      ],
      feedback: 'The answer is irrelevant to the question asked. Please address the specific topic and technical mechanism.',
      improvedAnswer: expectedAnswer || generateExemplaryAnswer(question, category, jobRole),
      expectedAnswer: expectedAnswer || generateExemplaryAnswer(question, category, jobRole),
      keyPoints: expectedConcepts
    };
  }

  // 5. Score Relevance (0 to 10)
  let relevance = 0;
  if (matchRatio >= 0.6) relevance = 9.5;
  else if (matchRatio >= 0.4) relevance = 8.0;
  else if (matchRatio >= 0.25) relevance = 6.5;
  else if (matchRatio >= 0.15) relevance = 5.0;
  else relevance = 3.0;

  // 6. Score Correctness (0 to 10)
  let correctness = 0;
  if (matchRatio >= 0.7 && wordCount >= 30) correctness = 9.5;
  else if (matchRatio >= 0.5 && wordCount >= 25) correctness = 8.0;
  else if (matchRatio >= 0.35) correctness = 6.5;
  else if (matchRatio >= 0.2) correctness = 4.5;
  else correctness = 2.5;

  // 7. Score Completeness (0 to 10)
  let completeness = 0;
  if (wordCount >= 60 && matchRatio >= 0.5) completeness = 9.0;
  else if (wordCount >= 35 && matchRatio >= 0.35) completeness = 7.5;
  else if (wordCount >= 20 && matchRatio >= 0.2) completeness = 5.5;
  else completeness = 3.5;

  // 8. Score Clarity (0 to 10)
  let clarity = 5.0;
  const sentenceCount = (cleanAnswer.match(/[.!?]+/g) || []).length;
  if (sentenceCount >= 2 && wordCount >= 20) clarity = 8.5;
  else if (sentenceCount >= 1) clarity = 7.0;

  // 9. Compute Weighted Overall Score
  let overallScore = Math.round(
    (correctness * 0.40 + relevance * 0.30 + completeness * 0.20 + clarity * 0.10) * 10
  ) / 10;

  // Enforce score sanity: if very few concepts matched, cap overall score
  if (matchRatio < 0.2) {
    overallScore = Math.min(overallScore, 3.5);
  } else if (matchRatio < 0.35) {
    overallScore = Math.min(overallScore, 5.5);
  }

  // Strengths
  const strengths = [];
  if (matchedConcepts.length > 0) {
    strengths.push(`Identified core concepts: ${matchedConcepts.slice(0, 3).join(', ')}.`);
  }
  if (wordCount >= 30) {
    strengths.push('Provided structured technical context with clear articulation.');
  }

  // Missing Points
  const missing = expectedConcepts.filter(c => !matchedConcepts.includes(c)).slice(0, 3);
  const missingPoints = missing.length > 0
    ? [`Could deepen explanation on: ${missing.join(', ')}.`]
    : ['Mention edge cases, memory footprint, or concurrency implications in high-scale environments.'];

  // Feedback
  let feedback = '';
  if (overallScore >= 8) {
    feedback = `Strong and accurate response. You clearly demonstrated core mechanics of ${category}. To reach senior level, articulate production trade-offs and performance tuning.`;
  } else if (overallScore >= 5) {
    feedback = `Partially correct answer. You understood foundational principles, but missed key mechanisms (${missing.join(', ')}). Review the model answer to deepen technical depth.`;
  } else {
    feedback = `The response only touched upon surface-level aspects and missed major technical concepts. Study the core mechanics and practice answering with concrete examples.`;
  }

  return {
    overallScore: Math.min(10, Math.max(0, overallScore)),
    correctness: Math.min(10, Math.max(0, correctness)),
    relevance: Math.min(10, Math.max(0, relevance)),
    completeness: Math.min(10, Math.max(0, completeness)),
    clarity: Math.min(10, Math.max(0, clarity)),
    strengths,
    missingPoints,
    feedback,
    improvedAnswer: expectedAnswer || generateExemplaryAnswer(question, category, jobRole),
    expectedAnswer: expectedAnswer || generateExemplaryAnswer(question, category, jobRole),
    keyPoints: expectedConcepts
  };
};

/**
 * Generate exemplary answers for learning
 */
const generateExemplaryAnswer = (question, category, role) => {
  return `In a production ${role} environment, addressing "${question}" requires understanding both the conceptual principles and operational trade-offs:\n\n` +
    `1. Core Principle: Clearly state the primary mechanism and why it exists in the language/framework ecosystem.\n` +
    `2. Practical Example: For instance, in a real-world scenario, you configure or execute this to ensure high availability, thread safety, or resource efficiency.\n` +
    `3. Trade-offs & Edge Cases: Always highlight potential pitfalls—such as memory overhead, concurrency locks, or network latency—and how modern architectures mitigate them (e.g., using caching, connection pooling, or defensive error handling).`;
};


/**
 * Generate Final Performance Report & Concrete Recommendations (FR10, FR11)
 */
const generateReportRecommendations = ({ questions, jobRole, experienceLevel }) => {
  const answered = questions.filter(q => !q.skipped);
  const skipped = questions.filter(q => q.skipped);

  // Calculate aggregates
  let avgCorrectness = 0;
  let avgRelevance = 0;
  let avgCompleteness = 0;
  let avgClarity = 0;
  let overallScore = 0;

  if (answered.length > 0) {
    avgCorrectness = Math.round((answered.reduce((sum, q) => sum + (q.correctness || 0), 0) / answered.length) * 10) / 10;
    avgRelevance = Math.round((answered.reduce((sum, q) => sum + (q.relevance || 0), 0) / answered.length) * 10) / 10;
    avgCompleteness = Math.round((answered.reduce((sum, q) => sum + (q.completeness || 0), 0) / answered.length) * 10) / 10;
    avgClarity = Math.round((answered.reduce((sum, q) => sum + (q.clarity || 0), 0) / answered.length) * 10) / 10;
    
    // Overall average
    overallScore = Math.round((answered.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length) * 10) / 10;
  }

  // Aggregate strengths
  const strengthsSet = new Set();
  answered.forEach(q => {
    if (q.strengths && Array.isArray(q.strengths)) {
      q.strengths.forEach(s => strengthsSet.add(s));
    }
  });

  if (strengthsSet.size === 0) {
    strengthsSet.add('Demonstrated proactive initiative by completing a full mock interview session.');
  }

  // Aggregate areas to improve
  const areasToImproveSet = new Set();
  answered.forEach(q => {
    if (q.score < 7.5 && q.missingPoints && Array.isArray(q.missingPoints)) {
      q.missingPoints.forEach(m => areasToImproveSet.add(`${q.category}: ${m}`));
    }
  });
  skipped.forEach(q => {
    areasToImproveSet.add(`${q.category}: Skipped question on "${q.question.substring(0, 45)}..."`);
  });

  if (areasToImproveSet.size === 0) {
    areasToImproveSet.add('Fine-tune concise delivery and edge-case handling under strict time limits.');
  }

  // Generate concrete AI recommendations linked to weak areas (FR11)
  const recommendations = [];
  const lowScoringCategories = [...new Set(questions.filter(q => q.skipped || (q.score || 0) < 7).map(q => q.category))];

  if (lowScoringCategories.length > 0) {
    lowScoringCategories.slice(0, 4).forEach(cat => {
      recommendations.push(buildConcreteRecommendation(cat, jobRole));
    });
  } else {
    // If high score across the board
    recommendations.push({
      topic: 'System Design & Scalability',
      action: 'Practice designing end-to-end distributed architectures, focusing on caching strategies (Redis), asynchronous queues, and database sharding.',
      resources: 'System Design Primer & High Scalability Architecture patterns'
    });
    recommendations.push({
      topic: 'Behavioral STAR Method Mastery',
      action: 'Frame past project achievements using Situation, Task, Action, Result, quantifying impact with concrete percentages and business revenue metrics.',
      resources: 'STAR Framework for Senior Engineering Interviews'
    });
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
      strengths: Array.from(strengthsSet).slice(0, 5),
      areasToImprove: Array.from(areasToImproveSet).slice(0, 5),
      recommendations
    }
  };
};

const buildConcreteRecommendation = (category, jobRole) => {
  const map = {
    'OOP': {
      topic: 'Object-Oriented Design & Principles',
      action: 'Implement the SOLID principles with clean code examples, focusing on Interface Segregation and Dependency Inversion.',
      resources: 'Design Patterns: Elements of Reusable Object-Oriented Software'
    },
    'SQL': {
      topic: 'SQL Joins & Indexing',
      action: 'Practice INNER, LEFT, RIGHT, and FULL JOIN queries on sample schemas and analyze query execution plans with EXPLAIN ANALYZE.',
      resources: 'Use The Index, Luke (SQL Indexing Guide)'
    },
    'Core Python': {
      topic: 'Python Memory & Data Structures',
      action: 'Build practical exercises testing mutable vs immutable behavior, custom context managers, and memory profiling with tracemalloc.',
      resources: 'Fluent Python & Python Official Data Model Docs'
    },
    'Concurrency': {
      topic: 'Concurrent Programming & Race Conditions',
      action: 'Write code samples demonstrating thread pools, locks, semaphores, and race condition prevention.',
      resources: 'Java Concurrency in Practice / Python asyncio internals'
    },
    'Spring Framework': {
      topic: 'Spring Boot IoC & Lifecycle',
      action: 'Create a microservice demonstrating @Transactional boundaries, custom bean scopes, and aspect-oriented programming (AOP).',
      resources: 'Spring in Action & Baeldung Spring Guides'
    },
    'Frontend (React)': {
      topic: 'React Internals & State Architecture',
      action: 'Practice profiling re-renders with React DevTools and optimize using useMemo, useCallback, and Zustand state slices.',
      resources: 'React 18+ Official Documentation & Overreacted by Dan Abramov'
    }
  };

  if (map[category]) return map[category];

  return {
    topic: `${category} Deep Dive`,
    action: `Revise fundamental concepts in ${category}, implement 3 code exercises from documentation, and practice explaining edge cases aloud.`,
    resources: `Official ${jobRole} documentation and practice coding prompts`
  };
};

/**
 * Optional Gemini LLM Integration
 */
const callGeminiWithFallback = async (apiKey, prompt) => {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        throw new Error(`Model ${model} returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`Empty text response from ${model}`);

      return JSON.parse(text);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
};

const fetchGeminiQuestions = async ({ jobRole, experienceLevel, interviewType, technicalTopic, questionCount }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `You are an expert technical interviewer. Generate exactly ${questionCount} interview questions for a ${experienceLevel} ${jobRole}.
Interview Type: ${interviewType}.
${technicalTopic ? `Specific Technical Topic: ${technicalTopic}.` : ''}

Requirements:
- Provide progressive difficulty (from introductory to challenging).
- Avoid duplicate, ambiguous, or generic questions.
- Provide keyPoints (3-5 required technical concepts) and an expectedAnswer for each question.
- Respond ONLY with valid JSON in this exact structure:
[
  {
    "question": "string",
    "category": "string",
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "expectedAnswer": "string",
    "keyPoints": ["point 1", "point 2", "point 3"]
  }
]`;

  const parsed = await callGeminiWithFallback(apiKey, prompt);
  if (!Array.isArray(parsed)) throw new Error('Gemini response is not an array');

  return parsed.map((item, idx) => ({
    questionId: `q_gemini_${Date.now()}_${idx}`,
    question: item.question,
    category: item.category || 'General',
    difficulty: item.difficulty || 'Intermediate',
    expectedAnswer: item.expectedAnswer || '',
    keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : []
  }));
};

const fetchGeminiEvaluation = async ({ question, category, difficulty, userAnswer, jobRole, experienceLevel, expectedAnswer, keyPoints }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const expectedPointsStr = Array.isArray(keyPoints) && keyPoints.length ? keyPoints.join(', ') : 'Accurate technical explanation and mechanics';

  const prompt = `You are a strict, objective, and fair technical interviewer evaluating an answer for a ${experienceLevel} ${jobRole}.
Question: "${question}" (Category: ${category}, Difficulty: ${difficulty})
Expected Key Concepts / Points: "${expectedPointsStr}"
${expectedAnswer ? `Expected Model Answer Reference: "${expectedAnswer}"` : ''}
Candidate Answer: "${userAnswer}"

CRITICAL SCORING RULES:
1. If the candidate answer is gibberish (e.g. random letters like 'gtrh'), off-topic, factually wrong, or states 'I don't know' / 'no idea', ALL scores (correctness, relevance, completeness, clarity, overallScore) MUST BE 0 (or at most 1).
2. Do NOT give marks simply because the candidate wrote something.
3. If the answer is partially correct, award proportionate marks (3.0 to 6.5 out of 10) based on the percentage of expected concepts accurately explained.
4. Only award high marks (7.5 to 10.0) if the answer is accurate, directly answers the prompt, and demonstrates genuine technical mastery.
5. Provide concise, constructive feedback explaining what was correct and what key points were missing.

Respond ONLY with valid JSON in this exact structure:
{
  "overallScore": number (0-10, one decimal),
  "correctness": number (0-10, one decimal),
  "relevance": number (0-10, one decimal),
  "completeness": number (0-10, one decimal),
  "clarity": number (0-10, one decimal),
  "strengths": ["string"],
  "missingPoints": ["string"],
  "feedback": "string",
  "improvedAnswer": "string"
}`;

  return await callGeminiWithFallback(apiKey, prompt);
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  evaluateLocally,
  isGibberishOrInvalid,
  generateReportRecommendations,
  FALLBACK_QUESTION_BANK
};

