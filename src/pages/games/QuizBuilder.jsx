import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Play } from "lucide-react";
import { useData } from "../../context/DataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import GoldDivider from "../../components/GoldDivider.jsx";

const EMPTY_FORM = {
  question: "",
  options: ["", "", "", ""],
  answer: "",
};

export default function QuizBuilder() {
  const { quizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion } =
    useData();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function setOption(index, value) {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const question = form.question.trim();
    const options = form.options.map((o) => o.trim()).filter(Boolean);

    if (!question) {
      setError("Please enter a question.");
      return;
    }
    if (options.length < 2) {
      setError("Add at least 2 options.");
      return;
    }
    if (!form.answer.trim()) {
      setError("Select the correct answer.");
      return;
    }
    if (!options.includes(form.answer.trim())) {
      setError("The correct answer must be one of your options.");
      return;
    }

    const payload = {
      question,
      options,
      answer: form.answer.trim(),
      addedBy: user?.displayName,
    };

    if (editingId) {
      updateQuizQuestion(editingId, payload);
    } else {
      addQuizQuestion(payload);
    }
    resetForm();
  }

  function startEdit(q) {
    setEditingId(q.id);
    setForm({
      question: q.question,
      options: [
        q.options[0] || "",
        q.options[1] || "",
        q.options[2] || "",
        q.options[3] || "",
      ],
      answer: q.answer,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-xs tracking-[0.4em] text-ash mb-2">QUIZ BUILDER</p>
      <h1 className="font-display text-4xl sm:text-5xl gold-text-anim mb-3">
        Build Your Quiz
      </h1>
      <p className="text-parchment/60 text-sm mb-6">
        Create your own questions — once saved, they show up directly in{" "}
        <span className="text-gold">Who Knows Who Better</span>.
      </p>

      <GoldDivider />

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 mt-8 space-y-5">
        <h2 className="font-display text-xl text-gold">
          {editingId ? "Edit question" : "New question"}
        </h2>

        <div>
          <label className="block text-xs tracking-wide text-ash mb-1">
            QUESTION
          </label>
          <textarea
            value={form.question}
            onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
            rows={2}
            placeholder="e.g. What is my favourite food?"
            className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs tracking-wide text-ash">
            OPTIONS (2–4)
          </label>
          {form.options.map((opt, i) => (
            <input
              key={i}
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment"
            />
          ))}
        </div>

        <div>
          <label className="block text-xs tracking-wide text-ash mb-1">
            CORRECT ANSWER
          </label>
          <select
            value={form.answer}
            onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
            className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment"
          >
            <option value="">Select correct answer...</option>
            {form.options
              .map((o) => o.trim())
              .filter(Boolean)
              .map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            <Plus size={16} />
            {editingId ? "Update question" : "Add question"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-parchment/60 hover:text-gold px-4 py-2.5"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-parchment">
            Your questions ({quizQuestions.length})
          </h2>
          {quizQuestions.length > 0 && (
            <Link
              to="/games/quiz"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
            >
              <Play size={14} /> Play quiz
            </Link>
          )}
        </div>

        {quizQuestions.length === 0 ? (
          <p className="text-ash text-sm italic py-8 text-center glass rounded-xl">
            No questions yet — add your first one above.
          </p>
        ) : (
          <div className="space-y-3">
            {quizQuestions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gold tracking-widest mb-1">
                      Q{i + 1}
                    </p>
                    <p className="text-parchment/90 text-sm sm:text-base">
                      {q.question}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt) => (
                        <li
                          key={opt}
                          className={`text-xs sm:text-sm ${
                            opt === q.answer
                              ? "text-gold"
                              : "text-parchment/50"
                          }`}
                        >
                          {opt === q.answer ? "✓ " : "· "}
                          {opt}
                        </li>
                      ))}
                    </ul>
                    {q.addedBy && (
                      <p className="text-ash text-xs mt-2">by {q.addedBy}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(q)}
                      aria-label="Edit question"
                      className="text-ash hover:text-gold p-1.5"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteQuizQuestion(q.id)}
                      aria-label="Delete question"
                      className="text-ash hover:text-red-400 p-1.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/games"
          className="text-sm text-parchment/60 hover:text-gold underline underline-offset-4"
        >
          Back to games
        </Link>
      </div>
    </div>
  );
}
