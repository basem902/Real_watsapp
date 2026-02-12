'use client'

import type { MessageSender } from '@/types'
import { formatRelativeTime } from '@/lib/utils/formatters'

interface MessageBubbleProps {
  sender: MessageSender
  content: string
  timestamp: string
  senderName?: string
}

export default function MessageBubble({ sender, content, timestamp, senderName }: MessageBubbleProps) {
  // Customer messages: green, aligned right (start in RTL)
  // Bot messages: gray with robot icon, aligned left (end in RTL)
  // Agent messages: blue with person icon, aligned left (end in RTL)

  const isCustomer = sender === 'customer'
  const isBot = sender === 'bot'
  const isAgent = sender === 'agent'

  const alignmentClass = isCustomer ? 'justify-end' : 'justify-start'

  const bubbleColor = isCustomer
    ? 'bg-green-500 text-white'
    : isBot
      ? 'bg-gray-200 text-gray-900'
      : 'bg-blue-500 text-white'

  const timestampColor = isCustomer
    ? 'text-green-100'
    : isBot
      ? 'text-gray-500'
      : 'text-blue-100'

  return (
    <div className={`flex ${alignmentClass} mb-3`}>
      <div className="max-w-[75%]">
        {/* Sender label */}
        {!isCustomer && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-sm">
              {isBot ? '\uD83E\uDD16' : '\uD83D\uDC64'}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {senderName || (isBot ? 'البوت' : 'الوكيل')}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl ${bubbleColor} ${
            isCustomer
              ? 'rounded-tl-sm'
              : 'rounded-tr-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Timestamp */}
        <div className={`mt-1 px-1 ${isCustomer ? 'text-left' : 'text-right'}`}>
          <span className={`text-[10px] ${timestampColor}`}>
            {formatRelativeTime(timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}
