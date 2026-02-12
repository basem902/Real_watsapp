'use client'

import { useState } from 'react'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation List — 30% width */}
      <div className="w-[30%] min-w-[280px]">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Chat Window — 70% width */}
      <div className="flex-1">
        {selectedId ? (
          <ChatWindow conversationId={selectedId} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border bg-white">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-400 text-lg">اختر محادثة للبدء</p>
              <p className="text-gray-300 text-sm mt-1">اختر محادثة من القائمة لعرض الرسائل</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
