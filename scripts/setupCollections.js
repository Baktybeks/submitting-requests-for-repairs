// scripts/setupMaintenanceCollections.js
const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
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
  },
};

const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    role: {
      type: "enum",
      required: true,
      elements: ["SUPER_ADMIN", "MANAGER", "TECHNICIAN", "REQUESTER"],
    },
    isActive: { type: "boolean", required: false, default: false },
    specialization: { type: "string", required: false, size: 255 },
    phone: { type: "string", required: false, size: 50 },
    createdAt: { type: "datetime", required: true },
    createdBy: { type: "string", required: false },
  },

  maintenanceRequests: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 2000 },
    category: {
      type: "enum",
      required: true,
      elements: [
        "ELECTRICAL",
        "PLUMBING",
        "HVAC",
        "CARPENTRY",
        "PAINTING",
        "CLEANING",
        "OTHER",
      ],
    },
    priority: {
      type: "enum",
      required: true,
      elements: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    },
    status: {
      type: "enum",
      required: true,
      elements: ["NEW", "IN_PROGRESS", "COMPLETED", "CLOSED"],
      default: "NEW",
    },
    location: { type: "string", required: true, size: 500 },
    requesterId: { type: "string", required: true, size: 36 },
    assignedTechnicianId: { type: "string", required: false, size: 36 },
    managerId: { type: "string", required: false, size: 36 },
    attachments: { type: "string", required: false, array: true },
    estimatedCompletionDate: { type: "datetime", required: false },
    actualCompletionDate: { type: "datetime", required: false },
    notes: { type: "string", required: false, size: 2000 },
    cost: { type: "integer", required: false, min: 0 },
    createdAt: { type: "datetime", required: true },
  },

  requestComments: {
    requestId: { type: "string", required: true, size: 36 },
    authorId: { type: "string", required: true, size: 36 },
    text: { type: "string", required: true, size: 2000 },
    isInternal: { type: "boolean", required: false, default: false },
    createdAt: { type: "datetime", required: true },
  },

  requestHistory: {
    requestId: { type: "string", required: true, size: 36 },
    userId: { type: "string", required: true, size: 36 },
    action: { type: "string", required: true, size: 255 },
    oldValue: { type: "string", required: false, size: 500 },
    newValue: { type: "string", required: false, size: 500 },
    description: { type: "string", required: true, size: 1000 },
    createdAt: { type: "datetime", required: true },
  },

  requestAttachments: {
    requestId: { type: "string", required: true, size: 36 },
    fileName: { type: "string", required: true, size: 255 },
    fileUrl: { type: "url", required: true, size: 500 },
    fileSize: { type: "integer", required: false, min: 0 },
    mimeType: { type: "string", required: false, size: 100 },
    uploadedBy: { type: "string", required: true, size: 36 },
    createdAt: { type: "datetime", required: true },
  },
};

const COLLECTION_INDEXES = {
  users: [
    { key: "email", type: "unique" },
    { key: "role", type: "key" },
    { key: "isActive", type: "key" },
    { key: "specialization", type: "key" },
  ],

  maintenanceRequests: [
    { key: "status", type: "key" },
    { key: "category", type: "key" },
    { key: "priority", type: "key" },
    { key: "requesterId", type: "key" },
    { key: "assignedTechnicianId", type: "key" },
    { key: "managerId", type: "key" },
    { key: "createdAt", type: "key" },
    { key: "estimatedCompletionDate", type: "key" },
    { key: "actualCompletionDate", type: "key" },
  ],

  requestComments: [
    { key: "requestId", type: "key" },
    { key: "authorId", type: "key" },
    { key: "isInternal", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  requestHistory: [
    { key: "requestId", type: "key" },
    { key: "userId", type: "key" },
    { key: "action", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  requestAttachments: [
    { key: "requestId", type: "key" },
    { key: "uploadedBy", type: "key" },
    { key: "createdAt", type: "key" },
  ],
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const createAttribute = async (databaseId, collectionId, key, schema) => {
  try {
    const attributeType = schema.type;

    let isRequired = schema.required || false;
    let defaultValue = schema.default;

    if (isRequired && defaultValue !== null && defaultValue !== undefined) {
      console.log(
        `    ⚠️ Исправление ${key}: required=true с default значением -> required=false`
      );
      isRequired = false;
    }

    switch (attributeType) {
      case "string":
        return await databases.createStringAttribute(
          databaseId,
          collectionId,
          key,
          schema.size || 255,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "email":
        return await databases.createEmailAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "enum":
        return await databases.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          schema.elements,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "boolean":
        return await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue !== null && defaultValue !== undefined
            ? defaultValue
            : null,
          schema.array || false
        );

      case "datetime":
        return await databases.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "integer":
        return await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "url":
        return await databases.createUrlAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      default:
        throw new Error(`Неподдерживаемый тип атрибута: ${attributeType}`);
    }
  } catch (error) {
    console.error(`Ошибка создания атрибута ${key}:`, error.message);
    throw error;
  }
};

const createIndex = async (databaseId, collectionId, indexConfig) => {
  try {
    return await databases.createIndex(
      databaseId,
      collectionId,
      indexConfig.key,
      indexConfig.type,
      indexConfig.attributes || [indexConfig.key],
      indexConfig.orders || ["ASC"]
    );
  } catch (error) {
    console.error(`Ошибка создания индекса ${indexConfig.key}:`, error.message);
    throw error;
  }
};

const setupCollections = async () => {
  try {
    console.log("🚀 Начинаем создание коллекций для системы заявок...");
    console.log(
      "📋 Всего коллекций для создания:",
      Object.keys(COLLECTION_SCHEMAS).length
    );

    const databaseId = appwriteConfig.databaseId;

    if (!databaseId) {
      throw new Error("Database ID не найден! Проверьте переменные окружения.");
    }

    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      console.log(`\n📁 Создание коллекции: ${collectionName}`);

      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          collectionName,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          false
        );

        console.log(
          `  ✅ Коллекция ${collectionName} создана (ID: ${collectionId})`
        );

        console.log(`  📝 Добавление атрибутов...`);
        let attributeCount = 0;

        for (const [attributeKey, attributeSchema] of Object.entries(schema)) {
          try {
            await createAttribute(
              databaseId,
              collectionId,
              attributeKey,
              attributeSchema
            );
            attributeCount++;
            console.log(`    ✅ ${attributeKey} (${attributeSchema.type})`);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`    ❌ ${attributeKey}: ${error.message}`);
          }
        }

        console.log(
          `  📊 Создано атрибутов: ${attributeCount}/${
            Object.keys(schema).length
          }`
        );

        if (COLLECTION_INDEXES[collectionName]) {
          console.log(`  🔍 Создание индексов...`);
          let indexCount = 0;

          for (const indexConfig of COLLECTION_INDEXES[collectionName]) {
            try {
              await createIndex(databaseId, collectionId, indexConfig);
              indexCount++;
              console.log(`    ✅ Индекс: ${indexConfig.key}`);

              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(
                `    ❌ Индекс ${indexConfig.key}: ${error.message}`
              );
            }
          }

          console.log(
            `  📈 Создано индексов: ${indexCount}/${COLLECTION_INDEXES[collectionName].length}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Ошибка создания коллекции ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка коллекций завершена!");
    console.log("🔗 Откройте консоль Appwrite для проверки результата.");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("- Переменные окружения в .env.local");
    console.log("- Права доступа API ключа");
    console.log("- Подключение к интернету");
  }
};

const resetCollections = async () => {
  try {
    console.log("🗑️ Удаление существующих коллекций...");

    const databaseId = appwriteConfig.databaseId;
    let deletedCount = 0;

    for (const [collectionName] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];
        await databases.deleteCollection(databaseId, collectionId);
        deletedCount++;
        console.log(`✅ ${collectionName} удалена`);
      } catch (error) {
        console.log(`⚠️ ${collectionName} не найдена или уже удалена`);
      }
    }

    console.log(`🧹 Удалено коллекций: ${deletedCount}`);
  } catch (error) {
    console.error("Ошибка при удалении коллекций:", error.message);
  }
};

const checkEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Отсутствуют переменные окружения:");
    missing.forEach((env) => console.error(`  - ${env}`));
    console.log("\n💡 Создайте файл .env.local с необходимыми переменными");
    process.exit(1);
  }

  console.log("✅ Все переменные окружения найдены");
};

const main = async () => {
  console.log("🔧 Maintenance Requests System - Настройка базы данных\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "setup":
      await setupCollections();
      break;
    case "reset":
      await resetCollections();
      break;
    case "reset-setup":
      await resetCollections();
      console.log("\n⏳ Ожидание 3 секунды перед созданием...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await setupCollections();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupMaintenanceCollections.js reset        - Удалить коллекции"
      );
      console.log(
        "  node scripts/setupMaintenanceCollections.js reset-setup  - Пересоздать коллекции"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupCollections,
  resetCollections,
  COLLECTION_SCHEMAS,
  COLLECTION_INDEXES,
  appwriteConfig,
};
