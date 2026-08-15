import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import api from '../../api/axios';

interface QuizAnswer {
  id?: number;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: number;
  text: string;
  order: number;
  answers: QuizAnswer[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  questions: QuizQuestion[];
}

interface AdminQuizManagerProps {
  quizId: number;
  onClose: () => void;
}

export function AdminQuizManager({ quizId, onClose }: AdminQuizManagerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track expanded questions for editing
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/public-pages/quizzes/${quizId}/admin_details/`);
      setQuiz(res.data);
    } catch (err) {
      setError('Failed to fetch quiz details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuizMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    try {
      await api.patch(`/api/public-pages/quizzes/${quiz.id}/`, {
        title: quiz.title,
        description: quiz.description,
        passing_score: quiz.passing_score
      });
      alert('Quiz metadata updated successfully');
    } catch (err) {
      alert('Failed to update quiz');
    }
  };

  const handleAddQuestion = () => {
    if (!quiz) return;
    const newQuestion: QuizQuestion = {
      text: 'New Question',
      order: quiz.questions.length + 1,
      answers: [
        { text: 'Option 1', is_correct: true },
        { text: 'Option 2', is_correct: false },
        { text: 'Option 3', is_correct: false },
        { text: 'Option 4', is_correct: false }
      ]
    };
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
    setExpandedQuestionIdx(quiz.questions.length);
  };

  const handleSaveQuestion = async (qIdx: number) => {
    if (!quiz) return;
    const question = quiz.questions[qIdx];
    
    // Validate
    if (question.answers.length < 2) {
      alert("A question must have at least 2 answers.");
      return;
    }
    const hasCorrect = question.answers.some(a => a.is_correct);
    if (!hasCorrect) {
      alert("Please mark at least one answer as correct.");
      return;
    }

    try {
      if (question.id) {
        // Update existing question
        await api.put(`/api/public-pages/quiz-questions/${question.id}/`, {
          quiz: quiz.id,
          text: question.text,
          order: question.order
        });
        
        for (const ans of question.answers) {
          if (ans.id) {
            await api.put(`/api/public-pages/quiz-answers/${ans.id}/`, {
              question: question.id,
              text: ans.text,
              is_correct: ans.is_correct
            });
          } else {
            await api.post(`/api/public-pages/quiz-answers/`, {
              question: question.id,
              text: ans.text,
              is_correct: ans.is_correct
            });
          }
        }
      } else {
        // Create new question
        const qRes = await api.post(`/api/public-pages/quiz-questions/`, {
          quiz: quiz.id,
          text: question.text,
          order: question.order
        });
        
        for (const ans of question.answers) {
          await api.post(`/api/public-pages/quiz-answers/`, {
            question: qRes.data.id,
            text: ans.text,
            is_correct: ans.is_correct
          });
        }
      }
      
      alert('Question saved successfully');
      fetchQuiz(); // Refresh full structure to get IDs
      setExpandedQuestionIdx(null);
    } catch (err) {
      alert('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (qIdx: number) => {
    if (!quiz) return;
    const question = quiz.questions[qIdx];
    
    if (window.confirm("Are you sure you want to delete this question?")) {
      if (question.id) {
        try {
          await api.delete(`/api/public-pages/quiz-questions/${question.id}/`);
        } catch (err) {
          alert("Failed to delete question from server.");
          return;
        }
      }
      
      const newQuestions = [...quiz.questions];
      newQuestions.splice(qIdx, 1);
      setQuiz({ ...quiz, questions: newQuestions });
      if (expandedQuestionIdx === qIdx) {
        setExpandedQuestionIdx(null);
      }
    }
  };
  
  const handleDeleteAnswer = async (qIdx: number, aIdx: number) => {
     if (!quiz) return;
     const question = quiz.questions[qIdx];
     const answer = question.answers[aIdx];
     
     if (answer.id) {
       try {
         await api.delete(`/api/public-pages/quiz-answers/${answer.id}/`);
       } catch (err) {
          alert("Failed to delete answer from server.");
          return;
       }
     }
     
     const newQuestions = [...quiz.questions];
     newQuestions[qIdx].answers.splice(aIdx, 1);
     setQuiz({ ...quiz, questions: newQuestions });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl shadow-xl flex items-center gap-4">
          <div className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          Loading Quiz Details...
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[90vh] rounded-xl bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Manage Quiz Questions
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          
          {/* Metadata Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Quiz Details</h3>
            <form onSubmit={handleUpdateQuizMeta} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={e => setQuiz({...quiz, title: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.passing_score}
                    onChange={e => setQuiz({...quiz, passing_score: parseInt(e.target.value)})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={quiz.description}
                  onChange={e => setQuiz({...quiz, description: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  <Save size={16} /> Save Quiz Details
                </button>
              </div>
            </form>
          </div>

          {/* Questions Section */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Questions ({quiz.questions.length})</h3>
            <button 
              onClick={handleAddQuestion}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add Question
            </button>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, qIdx) => (
              <div key={q.id || `new-${qIdx}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Question Header */}
                <div 
                  className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedQuestionIdx(expandedQuestionIdx === qIdx ? null : qIdx)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-gray-400 font-bold">{qIdx + 1}</span>
                    <span className="font-semibold text-gray-800 line-clamp-1">{q.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{q.answers.length} options</span>
                  </div>
                </div>

                {/* Question Editor (Expanded) */}
                {expandedQuestionIdx === qIdx && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                      <textarea
                        rows={2}
                        value={q.text}
                        onChange={e => {
                          const newQ = [...quiz.questions];
                          newQ[qIdx].text = e.target.value;
                          setQuiz({...quiz, questions: newQ});
                        }}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Answers</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = [...quiz.questions];
                            newQ[qIdx].answers.push({ text: 'New Option', is_correct: false });
                            setQuiz({...quiz, questions: newQ});
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                        >
                          <Plus size={14} /> Add Answer
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {q.answers.map((ans, aIdx) => (
                          <div key={ans.id || `new-ans-${aIdx}`} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newQ = [...quiz.questions];
                                // Optionally make it single-choice by setting all others to false
                                newQ[qIdx].answers.forEach(a => a.is_correct = false);
                                newQ[qIdx].answers[aIdx].is_correct = true;
                                setQuiz({...quiz, questions: newQ});
                              }}
                              className={`p-1 rounded-full ${ans.is_correct ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}
                              title={ans.is_correct ? "Correct Answer" : "Mark as Correct"}
                            >
                              {ans.is_correct ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </button>
                            <input
                              type="text"
                              value={ans.text}
                              onChange={e => {
                                const newQ = [...quiz.questions];
                                newQ[qIdx].answers[aIdx].text = e.target.value;
                                setQuiz({...quiz, questions: newQ});
                              }}
                              className={`flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none ${
                                ans.is_correct 
                                  ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteAnswer(qIdx, aIdx)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                      >
                        <Trash2 size={16} /> Delete Question
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedQuestionIdx(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(qIdx)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          <Save size={16} /> Save Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {quiz.questions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                <p className="text-gray-500 mb-4">No questions added yet.</p>
                <button 
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  <Plus size={16} /> Add First Question
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
