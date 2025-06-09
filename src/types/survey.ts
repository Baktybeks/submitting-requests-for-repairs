// src/types/survey.ts

import { BaseDocument } from "./index";

// Опросник
export interface Survey extends BaseDocument {
  title: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

// Вопрос опросника
export interface SurveyQuestion extends BaseDocument {
  surveyId: string;
  text: string;
  order: number;
  createdAt: string;
}

// Период проведения опроса
export interface SurveyPeriod extends BaseDocument {
  surveyId: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

// Ответ пользователя на опрос
export interface SurveyResponse extends BaseDocument {
  surveyId: string;
  periodId: string;
  userId: string;
  submittedAt: string;
  isCompleted: boolean;
}

// Ответ на конкретный вопрос
export interface SurveyQuestionAnswer extends BaseDocument {
  responseId: string;
  questionId: string;
  rating: number; // Оценка от 1 до 10
  comment?: string; // Необязательный комментарий
}

// DTO для создания опросника
export interface CreateSurveyDto {
  title: string;
  description: string;
  createdBy: string;
  isActive?: boolean;
}

// DTO для создания вопроса
export interface CreateSurveyQuestionDto {
  surveyId: string;
  text: string;
  order?: number;
}

// DTO для создания периода опроса
export interface CreateSurveyPeriodDto {
  surveyId: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  createdBy: string;
}

// DTO для создания ответа на опрос
export interface CreateSurveyResponseDto {
  surveyId: string;
  periodId: string;
  userId: string;
  answers: CreateSurveyQuestionAnswerDto[];
}

// DTO для создания ответа на вопрос
export interface CreateSurveyQuestionAnswerDto {
  questionId: string;
  rating: number;
  comment?: string;
}

// Расширенная информация об опроснике с вопросами
export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
  questionsCount: number;
}

// Расширенная информация о периоде с опросником
export interface SurveyPeriodWithDetails extends SurveyPeriod {
  survey: Survey;
  responsesCount: number;
  completionRate: number; // Процент завершенных ответов
}

// Расширенная информация об ответе
export interface SurveyResponseWithDetails extends SurveyResponse {
  survey: Survey;
  period: SurveyPeriod;
  answers: SurveyQuestionAnswerWithDetails[];
  user?: {
    $id: string;
    name: string;
    email: string;
  };
}

// Ответ на вопрос с деталями
export interface SurveyQuestionAnswerWithDetails extends SurveyQuestionAnswer {
  question: SurveyQuestion;
}

// Статистика опросника
export interface SurveyStats {
  totalQuestions: number;
  totalResponses: number;
  activePeriodsCount: number;
  averageRating: number;
  completionRate: number;
  ratingDistribution: Record<number, number>; // Распределение оценок
}

// Статистика периода опроса
export interface SurveyPeriodStats {
  totalInvited: number;
  totalResponses: number;
  completedResponses: number;
  averageRating: number;
  completionRate: number;
  responseRate: number;
  ratingsByQuestion: Record<
    string,
    {
      questionText: string;
      averageRating: number;
      responsesCount: number;
      ratingDistribution: Record<number, number>;
    }
  >;
}

// Фильтры для опросников
export interface SurveyFilters {
  isActive?: boolean;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

// Фильтры для периодов опросов
export interface SurveyPeriodFilters {
  surveyId?: string;
  isActive?: boolean;
  createdBy?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

// Фильтры для ответов
export interface SurveyResponseFilters {
  surveyId?: string;
  periodId?: string;
  userId?: string;
  isCompleted?: boolean;
  submittedFrom?: string;
  submittedTo?: string;
}

// Утилитарные функции

export const getSurveyStatusLabel = (isActive: boolean): string => {
  return isActive ? "Активный" : "Неактивный";
};

export const getSurveyStatusColor = (isActive: boolean): string => {
  return isActive
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-gray-100 text-gray-800 border-gray-200";
};

export const getPeriodStatusLabel = (period: SurveyPeriod): string => {
  const now = new Date();
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  if (!period.isActive) {
    return "Неактивный";
  }

  if (now < startDate) {
    return "Запланирован";
  } else if (now > endDate) {
    return "Завершен";
  } else {
    return "Активный";
  }
};

export const getPeriodStatusColor = (period: SurveyPeriod): string => {
  const status = getPeriodStatusLabel(period);

  switch (status) {
    case "Активный":
      return "bg-green-100 text-green-800 border-green-200";
    case "Запланирован":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Завершен":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Неактивный":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)}/10`;
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 8) {
    return "text-green-600";
  } else if (rating >= 6) {
    return "text-yellow-600";
  } else if (rating >= 4) {
    return "text-orange-600";
  } else {
    return "text-red-600";
  }
};

export const calculateCompletionRate = (
  completedResponses: number,
  totalResponses: number
): number => {
  if (totalResponses === 0) return 0;
  return Math.round((completedResponses / totalResponses) * 100);
};

export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 10 && Number.isInteger(rating);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ru-RU");
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("ru-RU");
};
