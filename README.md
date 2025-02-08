# Deep Research AI Assistant

## Overview
Deep Research is an advanced AI-powered research assistant that conducts comprehensive, multi-step research based on user queries. It uses a sophisticated system of follow-up questions and deep web crawling to gather, analyze, and synthesize information into detailed reports.

## Key Features
- Interactive chat interface
- Smart follow-up questions generation
- Deep web crawling and research
- Multi-step research process
- Detailed report generation
- Source tracking and citation
- Real-time research progress updates

## Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **AI**:
  - GPT-4o-mini for query analysis and report generation
  - Custom AI models for research direction
- **Web Crawling**: Firecrawl.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui

## Application Flow

### 1. Initial Query Phase
1. User submits an initial research query
2. The system processes the query using GPT-4o-mini
3. Generates relevant follow-up questions to better understand research needs

### 2. Follow-up Questions Phase
1. Questions are presented one by one in a chat interface
2. Each answer is stored and analyzed
3. System maintains context through a chat history
4. Uses Zustand store to manage state and message flow

### 3. Deep Research Phase
```typescript
// Research process structure
const researchProcess = {
  initialQuery: "User's first question",
  followUpQA: [
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
    // ...
  ],
  research: {
    breadth: 3, // Number of parallel research paths
    depth: 2,   // How deep to go in each path
  }
};
```

### 4. Research Execution
1. **Query Generation**:
   - System generates SERP queries based on all collected information
   - Uses `generateSerpQueries` function to create targeted search queries

2. **Web Crawling**:
   - Utilizes Firecrawl.js for efficient web crawling
   - Implements concurrent requests with rate limiting
   - Collects relevant information from multiple sources

3. **Information Processing**:
   - Analyzes collected data using AI models
   - Extracts key learnings and insights
   - Tracks all visited URLs for citation

4. **Report Generation**:
   - Synthesizes all collected information
   - Creates a detailed, structured report
   - Includes sources and citations

## Code Structure

```
project/
├── app/
│   ├── api/
│   │   ├── actions.ts       # Server actions for research
│   │   └── chat/
│   │       └── route.ts     # API routes
├── components/
│   ├── ChatLayout.tsx       # Main chat interface
│   └── Unified/
│       ├── MainInput.tsx    # Chat input component
│       └── ...
├── lib/
│   ├── store.ts            # Zustand store
│   ├── firecrwal.ts        # Web crawler configuration
│   └── provider.ts         # AI model providers
```

## Key Components

### ChatLayout
- Manages the main chat interface
- Handles message flow and research state
- Coordinates between user input and research process

### MainInput
- Handles user input
- Manages input validation
- Coordinates with chat layout for message handling

### Store (Zustand)
```typescript
interface ChatStore {
  messages: MessageType[];
  hasMessages: boolean;
  isChatPending: boolean;
  addMessage: (message: MessageType) => void;
  clearMessages: () => void;
  setIsChatPending: (isPending: boolean) => void;
}
```

## Research Process Details

### 1. Query Analysis
- Initial query is analyzed for research scope
- Follow-up questions are generated to clarify:
  - Specific aspects of interest
  - Desired depth of research
  - Particular focus areas

### 2. Research Execution
- Multiple SERP queries are generated
- Concurrent web crawling with depth-first approach
- Information is collected and processed in real-time

### 3. Report Generation
- Collected information is synthesized
- Structured report is generated with:
  - Executive summary
  - Detailed findings
  - Source citations
  - Related topics

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/avayyyyyyy/deep-research.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
OPENAI_API_KEY=your_api_key
FIRECRAWL_API_KEY=your_api_key
```

4. Run the development server:
```bash
npm run dev
```

## Contributing
Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
