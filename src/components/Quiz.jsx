import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import questions from '../data/question'; // Assuming you have a questions.js file with your quiz data
export const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);

  

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, isAnswered, showResult]);

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(15);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "Excellent! You're a true gaming master!";
    if (percentage >= 60) return "Great job! You know your stuff!";
    if (percentage >= 40) return "Not bad! Room for improvement!";
    return "Keep practicing! You'll get better!";
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(15);
    setIsAnswered(false);
  };

  const exitToMainMenu = () => {
    setGameComplete(true);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full border border-white/20">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Thanks for Playing!</h2>
          <p className="text-gray-300 mb-6">Hope you enjoyed the game and quiz!</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full border border-white/20">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
          
          <div className="mb-6">
            <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
              {score}/{questions.length}
            </div>
            <div className="text-xl text-gray-300 mb-4">
              {Math.round((score / questions.length) * 100)}% Correct
            </div>
            <p className="text-gray-300 text-lg">{getScoreMessage()}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={restartQuiz}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Quiz
            </button>
            <button
              onClick={exitToMainMenu}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <span className="text-lg font-semibold">Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-yellow-400 font-bold text-lg">
              Score: {score}/{questions.length}
            </div>
            <div className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-green-400'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {questions[currentQuestion].question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {questions[currentQuestion].options.map((option, index) => {
            let buttonClass = "p-4 rounded-lg border border-white/30 text-white font-semibold transition-all duration-300 transform hover:scale-105 ";
            
            if (isAnswered) {
              if (index === questions[currentQuestion].correct) {
                buttonClass += "bg-green-500/50 border-green-400 ";
              } else if (index === selectedAnswer && index !== questions[currentQuestion].correct) {
                buttonClass += "bg-red-500/50 border-red-400 ";
              } else {
                buttonClass += "bg-white/10 hover:bg-white/20 ";
              }
            } else {
              buttonClass += "bg-white/10 hover:bg-white/20 cursor-pointer ";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswered && index === questions[currentQuestion].correct && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  {isAnswered && index === selectedAnswer && index !== questions[currentQuestion].correct && (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Timer Bar */}
        <div className="w-full bg-white/20 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

