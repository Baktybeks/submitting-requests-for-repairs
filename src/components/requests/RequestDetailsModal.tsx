// src/components/requests/RequestDetailsModal.tsx

"use client";

import React, { useState } from "react";
import {
  useRequest,
  useComments,
  useHistory,
  useAddComment,
} from "@/services/maintenanceService";
import { useAuth } from "@/hooks/useAuth";
import {
  MaintenanceRequest,
  RequestComment,
  RequestHistory,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
  getPriorityLabel,
  getPriorityColor,
} from "@/types";
import { formatLocalDateTime } from "@/utils/dateUtils";
import { toast } from "react-toastify";
import {
  X,
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  Wrench,
  MessageSquare,
  History,
  FileText,
  Clock,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";

interface RequestDetailsModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDetailsModal({
  requestId,
  isOpen,
  onClose,
}: RequestDetailsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "details" | "comments" | "history"
  >("details");
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: request, isLoading: requestLoading } = useRequest(requestId);
  const { data: comments = [], isLoading: commentsLoading } =
    useComments(requestId);
  const { data: history = [], isLoading: historyLoading } =
    useHistory(requestId);
  const addCommentMutation = useAddComment();

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await addCommentMutation.mutateAsync({
        data: {
          requestId,
          text: newComment.trim(),
          isInternal,
        },
        authorId: user.$id,
      });

      setNewComment("");
      toast.success("✅ Комментарий добавлен", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(`❌ Ошибка при добавлении комментария: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const canViewInternalComments = user?.role !== "REQUESTER";
  const canAddComments = !!user;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок модального окна */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Детали заявки #{requestId.slice(-8)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Навигационные вкладки */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "details"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Детали
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "comments"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquare className="inline h-4 w-4 mr-2" />
              Комментарии ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="inline h-4 w-4 mr-2" />
              История ({history.length})
            </button>
          </nav>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {requestLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Загрузка...</span>
            </div>
          ) : !request ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Заявка не найдена
              </h3>
              <p className="text-gray-600">
                Не удалось загрузить информацию о заявке
              </p>
            </div>
          ) : (
            <>
              {activeTab === "details" && <RequestDetails request={request} />}
              {activeTab === "comments" && (
                <CommentsTab
                  comments={comments}
                  isLoading={commentsLoading}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  isInternal={isInternal}
                  setIsInternal={setIsInternal}
                  onAddComment={handleAddComment}
                  canViewInternal={canViewInternalComments}
                  canAddComments={canAddComments}
                  isAddingComment={addCommentMutation.isPending}
                />
              )}
              {activeTab === "history" && (
                <HistoryTab history={history} isLoading={historyLoading} />
              )}
            </>
          )}
        </div>

        {/* Подвал модального окна */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент деталей заявки
function RequestDetails({ request }: { request: any }) {
  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Основная информация
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-900">
              {request.title}
            </h4>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                  request.status
                )}`}
              >
                {getStatusLabel(request.status)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                  request.priority
                )}`}
              >
                {getPriorityLabel(request.priority)}
              </span>
              <span className="text-sm text-gray-600">
                {getCategoryLabel(request.category)}
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Описание</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{request.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                Создана: {formatLocalDateTime(request.$createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Участники */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Участники</h3>
        <div className="space-y-3">
          {request.requester && (
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {request.requester.name}
                </p>
                <p className="text-xs text-gray-500">
                  Заявитель • {request.requester.email}
                </p>
              </div>
            </div>
          )}

          {request.assignedTechnician ? (
            <div className="flex items-center">
              <Wrench className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {request.assignedTechnician.name}
                </p>
                <p className="text-xs text-gray-500">
                  Техник •{" "}
                  {request.assignedTechnician.specialization ||
                    request.assignedTechnician.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Wrench className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Техник не назначен</p>
              </div>
            </div>
          )}

          {request.manager && (
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {request.manager.name}
                </p>
                <p className="text-xs text-gray-500">
                  Менеджер • {request.manager.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Дополнительная информация */}
      {(request.estimatedCompletionDate ||
        request.actualCompletionDate ||
        request.notes ||
        request.cost) && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Дополнительная информация
          </h3>
          <div className="space-y-3">
            {request.estimatedCompletionDate && (
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Планируемая дата завершения:
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {formatLocalDateTime(request.estimatedCompletionDate)}
                </span>
              </div>
            )}

            {request.actualCompletionDate && (
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Фактическая дата завершения:
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {formatLocalDateTime(request.actualCompletionDate)}
                </span>
              </div>
            )}

            {request.cost && (
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Стоимость:
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  {request.cost} ₽
                </span>
              </div>
            )}

            {request.notes && (
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Заметки:
                </span>
                <p className="mt-1 text-sm text-gray-600">{request.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент вкладки комментариев
interface CommentsTabProps {
  comments: RequestComment[];
  isLoading: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  isInternal: boolean;
  setIsInternal: (value: boolean) => void;
  onAddComment: () => void;
  canViewInternal: boolean;
  canAddComments: boolean;
  isAddingComment: boolean;
}

function CommentsTab({
  comments,
  isLoading,
  newComment,
  setNewComment,
  isInternal,
  setIsInternal,
  onAddComment,
  canViewInternal,
  canAddComments,
  isAddingComment,
}: CommentsTabProps) {
  const visibleComments = comments.filter(
    (comment) => canViewInternal || !comment.isInternal
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Загрузка комментариев...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Форма добавления комментария */}
      {canAddComments && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Добавить комментарий
          </h4>
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />

            {canViewInternal && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isInternal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isInternal"
                  className="ml-2 flex items-center text-sm text-gray-700"
                >
                  {isInternal ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  Внутренний комментарий (только для персонала)
                </label>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onAddComment}
                disabled={!newComment.trim() || isAddingComment}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isAddingComment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список комментариев */}
      <div className="space-y-4">
        {visibleComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Пока нет комментариев</p>
          </div>
        ) : (
          visibleComments.map((comment) => (
            <div
              key={comment.$id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {comment.authorId} {/* TODO: Заменить на имя автора */}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatLocalDateTime(comment.$createdAt)}
                    </p>
                  </div>
                </div>
                {comment.isInternal && canViewInternal && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Внутренний
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Компонент вкладки истории
function HistoryTab({
  history,
  isLoading,
}: {
  history: RequestHistory[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Загрузка истории...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">История изменений пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={entry.$id} className="flex">
          <div className="flex flex-col items-center mr-4">
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 bg-gray-300 flex-1 mt-2"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">
                {entry.description}
              </p>
              <span className="text-xs text-gray-500">
                {formatLocalDateTime(entry.$createdAt)}
              </span>
            </div>
            {(entry.oldValue || entry.newValue) && (
              <div className="text-xs text-gray-600">
                {entry.oldValue && (
                  <span className="line-through text-red-600">
                    {entry.oldValue}
                  </span>
                )}
                {entry.oldValue && entry.newValue && " → "}
                {entry.newValue && (
                  <span className="text-green-600">{entry.newValue}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
