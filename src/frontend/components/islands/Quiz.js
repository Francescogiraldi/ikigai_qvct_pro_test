import React from 'react';
import Button from '../ui/Button';
import ScaleQuestion from './questions/ScaleQuestion';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import CheckboxQuestion from './questions/CheckboxQuestion';
import TextQuestion from './questions/TextQuestion';

const Quiz = ({ questions, responses, onChangeResponse, onSubmit, onBack, currentStep, totalSteps, color, isCompleted }) => {
  const currentQuestion = questions[currentStep];
  
  const isLastQuestion = currentStep === questions.length - 1;
  const canContinue = currentQuestion ? getIsQuestionAnswered(currentQuestion, responses[currentQuestion.id]) : true;
  
  function getIsQuestionAnswered(question, response) {
    if (!question.required) return true;
    
    switch (question.type) {
      case 'scale':
      case 'multiple_choice':
        return response !== undefined;
      case 'checkbox':
        return response && response.length > 0;
      case 'text':
        return response && response.trim() !== '';
      default:
        return false;
    }
  }
  
  const renderQuestion = () => {
    const response = responses[currentQuestion.id];
    
    switch (currentQuestion.type) {
      case 'scale':
        return (
          <ScaleQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
          />
        );
      case 'checkbox':
        return (
          <CheckboxQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
            maxSelect={currentQuestion.maxSelect}
          />
        );
      case 'text':
        return (
          <TextQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
          />
        );
      default:
        return <p>Type de question non pris en charge</p>;
    }
  };
  
  const renderProgress = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {questions.map((_, idx) => (
        <div 
          key={idx}
          className={`h-2 rounded-full transition-all ${idx === currentStep ? 'w-8' : 'w-2'}`}
          style={{ backgroundColor: idx <= currentStep ? color : "#e5e5e5" }}
        />
      ))}
    </div>
  );
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {renderProgress()}
      
      <h3 className="text-xl font-bold mb-6 text-center">
        {currentQuestion.question}
        {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      
      {renderQuestion()}
      
      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <Button 
            variant="secondary"
            onClick={onBack}
            size="md"
          >
            Précédent
          </Button>
        ) : (
          <div></div> // Empty div for spacing
        )}
        
        {isLastQuestion ? (
          <Button
            color={color}
            onClick={onSubmit}
            disabled={!canContinue || isCompleted}
            size="md"
          >
            {isCompleted ? "Déjà complété" : "Terminer"}
          </Button>
        ) : (
          <Button
            color={color}
            onClick={() => onSubmit(false)}
            disabled={!canContinue}
            size="md"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;