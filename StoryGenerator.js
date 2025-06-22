import { useState, useEffect, useRef } from "react";

export default function StoryGenerator() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef(null);

  const generateStory = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const inputPrompt = `Write a short story based on this idea: ${prompt}`;

    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_FREE_HUGGINGFACE_API_KEY",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: inputPrompt }),
    });

    const data = await response.json();
    const text = data[0]?.generated_text || "Error generating story. Please try again.";
    setStory(text);
    setLoading(false);
  };

  const generateAudio = () => {
    if (!story) return;
    const utterance = new SpeechSynthesisUtterance(story);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const startAnimation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let x = 0;
    setAnimating(true);
    const img = new Image();
    img.src = "https://cdn.pixabay.com/photo/2014/04/02/10/56/robot-304843_960_720.png";

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, 50, 100, 100);
      x += 2;
      if (x < canvas.width) {
        requestAnimationFrame(draw);
      } else {
        setAnimating(false);
      }
    };
    img.onload = draw;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">🎬 Free Story & Animation Generator</h1>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={3}
        placeholder="Enter a story idea (e.g., A robot making friends in space)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={generateStory}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Generating..." : "Generate Story"}
      </button>

      {story && (
        <>
          <div className="mt-6 text-left bg-gray-100 p-4 rounded shadow">
            <h2 className="font-semibold text-xl mb-2">📖 Your Story</h2>
            <p className="whitespace-pre-wrap">{story}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={generateAudio}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            >
              🔊 Narrate Story
            </button>
            <button
              onClick={startAnimation}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={animating}
            >
              🎞️ Play Animation
            </button>
          </div>
          <canvas ref={canvasRef} width={600} height={200} className="mt-4 border rounded shadow"></canvas>
        </>
      )}
    </div>
  );
}
