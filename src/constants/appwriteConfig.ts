// src/constants/appwriteConfig.ts (обновленная версия с опросами)

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    // Существующие коллекции для системы заявок
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    maintenanceRequests:
      process.env.NEXT_PUBLIC_MAINTENANCE_REQUESTS_COLLECTION_ID ||
      "maintenance_requests",
    requestComments:
      process.env.NEXT_PUBLIC_REQUEST_COMMENTS_COLLECTION_ID ||
      "request_comments",
    requestHistory:
      process.env.NEXT_PUBLIC_REQUEST_HISTORY_COLLECTION_ID ||
      "request_history",
    requestAttachments:
      process.env.NEXT_PUBLIC_REQUEST_ATTACHMENTS_COLLECTION_ID ||
      "request_attachments",

    // Новые коллекции для системы опросов
    surveys: process.env.NEXT_PUBLIC_SURVEYS_COLLECTION_ID || "surveys",
    surveyQuestions:
      process.env.NEXT_PUBLIC_SURVEY_QUESTIONS_COLLECTION_ID ||
      "survey_questions",
    surveyPeriods:
      process.env.NEXT_PUBLIC_SURVEY_PERIODS_COLLECTION_ID || "survey_periods",
    surveyResponses:
      process.env.NEXT_PUBLIC_SURVEY_RESPONSES_COLLECTION_ID ||
      "survey_responses",
    surveyQuestionAnswers:
      process.env.NEXT_PUBLIC_SURVEY_QUESTION_ANSWERS_COLLECTION_ID ||
      "survey_question_answers",
  },
} as const;

// Типы для TypeScript
export type CollectionName = keyof typeof appwriteConfig.collections;

// Валидация переменных окружения
const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  // Collection IDs для заявок
  "NEXT_PUBLIC_USERS_COLLECTION_ID",
  "NEXT_PUBLIC_MAINTENANCE_REQUESTS_COLLECTION_ID",
  "NEXT_PUBLIC_REQUEST_COMMENTS_COLLECTION_ID",
  "NEXT_PUBLIC_REQUEST_HISTORY_COLLECTION_ID",
  "NEXT_PUBLIC_REQUEST_ATTACHMENTS_COLLECTION_ID",
  // Collection IDs для опросов
  "NEXT_PUBLIC_SURVEYS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_QUESTIONS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_PERIODS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_RESPONSES_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_QUESTION_ANSWERS_COLLECTION_ID",
] as const;

// Проверка отсутствующих переменных
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️ Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(
      ", "
    )}`
  );

  if (process.env.NODE_ENV !== "development") {
    console.error(
      "❌ В production режиме все переменные окружения обязательны!"
    );
  }
}

// Функция для получения ID коллекции с валидацией
export const getCollectionId = (collectionName: CollectionName): string => {
  const id = appwriteConfig.collections[collectionName];
  if (!id) {
    throw new Error(`ID коллекции ${collectionName} не найден в конфигурации`);
  }
  return id;
};

// Вспомогательная функция для проверки конфигурации
export const validateAppwriteConfig = (): boolean => {
  const { endpoint, projectId, databaseId } = appwriteConfig;

  if (!endpoint || !projectId || !databaseId) {
    console.error("❌ Основные параметры Appwrite не настроены");
    return false;
  }

  const emptyCollections = Object.entries(appwriteConfig.collections)
    .filter(([_, id]) => !id)
    .map(([name]) => name);

  if (emptyCollections.length > 0) {
    console.error(
      `❌ Не настроены ID коллекций: ${emptyCollections.join(", ")}`
    );
    return false;
  }

  console.log("✅ Конфигурация Appwrite валидна");
  return true;
};

// Проверка доступности коллекций опросов
export const isSurveySystemEnabled = (): boolean => {
  const surveyCollections = [
    "surveys",
    "surveyQuestions",
    "surveyPeriods",
    "surveyResponses",
    "surveyQuestionAnswers",
  ] as const;

  return surveyCollections.every(
    (collection) => appwriteConfig.collections[collection] !== ""
  );
};

// Экспорт для использования в других частях приложения
export default appwriteConfig;
