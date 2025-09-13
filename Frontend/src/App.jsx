import { useState, useEffect, useRef } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import { gsap } from 'gsap';

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [review, setReview] = useState(``);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const reviewButtonRef = useRef(null);

  useEffect(() => {
    prism.highlightAll();

    // Initial animations
    gsap.fromTo(leftRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(rightRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 });
    gsap.fromTo(reviewButtonRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.5 });
  }, []);

  async function reviewCode() {
    gsap.to(reviewButtonRef.current, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
    gsap.to(rightRef.current, { opacity: 0.5, scale: 0.98, duration: 0.3 });

    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code });
      setReview(response.data);

      gsap.to(rightRef.current, 
        { opacity: 1,
           scale: 1,
            duration: 0.3 
          });
      gsap.fromTo(rightRef.current, { y: 20, 
        opacity: 0 },
         { 
          y: 0, 
          opacity: 1,
          duration: 0.5,
          ease: "power2.out"
           });
    } catch (error) {
      console.error("Error fetching code review:", error);
      setReview("❌ Error: Could not fetch code review. Please try again.");
      gsap.to(rightRef.current,
         { 
          opacity: 1, 
          scale: 1, 
          duration: 0.3,
          backgroundColor: '#f8d7da'
          });
    }
  }

  return (
    <main className="flex flex-col lg:flex-row h-screen w-full p-4 lg:p-8 bg-zinc-900 text-gray-100 font-sans gap-4 ">
      {/* Left Panel */}
      <div
        ref={leftRef}
        className=" flex flex-col flex-1 bg-zinc-800 rounded-xl shadow-2xl p-4 lg:p-6"
      >
        <h2 className=" text-xl lg:text-2xl font-bold mb-4 border-b border-zinc-500 pb-2">
          Your Code
        </h2>

              {/* Flexible height editor */}
      <div className="flex-1 min-h-[300px] mb-4 overflow-y-auto">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
          padding={10}
          className="w-full h-full bg-zinc-900 rounded-2xl 
                    whitespace-pre-wrap break-words overflow-x-hidden font-mono text-sm"
        />
      </div>


        {/* Review Button */}
        <div className="flex justify-center">
          <button
            ref={reviewButtonRef}
            onClick={reviewCode}
            className="w-full lg:w-3/4 px-2 py-3 bg-gradient-to-tl from-gray-900 to-zinc-800 text-zinc-300 font-bold text-lg rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          >
            Get Code Review
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div
        ref={rightRef}
        className="flex flex-col flex-1 bg-zinc-800 rounded-xl shadow-2xl p-4 lg:p-6"
      >
        <h2 className="text-xl lg:text-2xl font-bold mb-4 border-b border-zinc-500 pb-2 ">
          AI Review
        </h2>

        {/* Scrollable review area */}
<div className="flex-1 bg-zinc-900 rounded-lg p-4 overflow-y-auto prose prose-invert max-w-none shadow-inner break-words whitespace-pre-wrap">
  <Markdown rehypePlugins={[rehypeHighlight]}>
    {review}
  </Markdown>
  {review === "" && (
    <p className="text-gray-400 text-center italic mt-10">
      Your AI code review will appear here.  
      Click <span className="font-semibold">"Get Code Review"</span> to analyze your code.
    </p>
  )}
</div>

      </div>
    </main>
  );
}

export default App;
