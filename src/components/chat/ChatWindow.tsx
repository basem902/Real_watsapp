'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useOrg } from '@/components/providers/OrgProvider'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import MessageBubble from '@/components/chat/MessageBubble'
import toast from 'react-hot-toast'
import type { Conversation, Message, OrgMember, ConversationStatus } from '@/types'

interface ChatWindowProps {
  conversationId: string
}

const statusBadgeVariant = (status: ConversationStatus): 'success' | 'default' | 'warning' => {
  switch (status) {
    case 'نشطة':
      return 'success'
    case 'منتهية':
      return 'default'
    case 'تحتاج_متابعة':
      return 'warning'
    default:
      return 'default'
  }
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { organization, loading: orgLoading } = useOrg()
  const orgId = organization?.id

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [botEnabled, setBotEnabled] = useState(true)
  const [togglingBot, setTogglingBot] = useState(false)
  const [teamMembers, setTeamMembers] = useState<OrgMember[]>([])
  const [assigningTo, setAssigningTo] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Fetch conversation details and messages
  const fetchConversationData = useCallback(async () => {
    if (!orgId || !conversationId) return

    const supabase = createClient()

    try {
      const [convRes, msgsRes] = await Promise.all([
        supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('organization_id', orgId)
          .single(),
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('organization_id', orgId)
          .order('created_at', { ascending: true }),
      ])

      if (convRes.data) {
        setConversation(convRes.data)
        setBotEnabled(convRes.data.bot_enabled)
      }
      if (msgsRes.data) {
        setMessages(msgsRes.data)
      }
    } catch {
      toast.error('حدث خطأ في تحميل المحادثة')
    } finally {
      setLoading(false)
    }
  }, [orgId, conversationId])

  // Fetch team members for assign dropdown
  const fetchTeamMembers = useCallback(async () => {
    if (!orgId) return

    const supabase = createClient()
    const { data } = await supabase
      .from('org_members')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('display_name', { ascending: true })

    if (data) {
      setTeamMembers(data)
    }
  }, [orgId])

  // Load data on mount and when conversationId changes
  useEffect(() => {
    if (orgLoading) return
    if (!orgId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setMessages([])
    setConversation(null)
    fetchConversationData()
    fetchTeamMembers()
  }, [orgId, orgLoading, conversationId, fetchConversationData, fetchTeamMembers])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId || !orgId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates
            const exists = prev.some((m) => m.id === (payload.new as Message).id)
            if (exists) return prev
            return [...prev, payload.new as Message]
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId, orgId])

  // Send message
  const handleSendMessage = async () => {
    const trimmed = messageText.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: trimmed,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'فشل إرسال الرسالة')
      }

      setMessageText('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في إرسال الرسالة'
      toast.error(message)
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Toggle bot
  const handleToggleBot = async () => {
    if (!conversationId || togglingBot) return

    setTogglingBot(true)
    const newValue = !botEnabled

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('conversations')
        .update({ bot_enabled: newValue })
        .eq('id', conversationId)

      if (error) throw error

      setBotEnabled(newValue)
      toast.success(newValue ? 'تم تفعيل البوت' : 'تم إيقاف البوت')
    } catch {
      toast.error('حدث خطأ في تحديث حالة البوت')
    } finally {
      setTogglingBot(false)
    }
  }

  // Assign conversation to agent
  const handleAssign = async (memberId: string) => {
    if (!conversationId || assigningTo) return

    setAssigningTo(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('conversations')
        .update({ assigned_to: memberId || null })
        .eq('id', conversationId)

      if (error) throw error

      setConversation((prev) =>
        prev ? { ...prev, assigned_to: memberId || null } : prev
      )
      toast.success('تم تحديث المسؤول')
    } catch {
      toast.error('حدث خطأ في تعيين المسؤول')
    } finally {
      setAssigningTo(false)
    }
  }

  // Loading state
  if (loading || orgLoading) {
    return (
      <div className="flex h-full flex-col rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-12 w-2/3" count={5} />
        </div>
        <div className="border-t p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border bg-white">
        <p className="text-gray-400">لم يتم العثور على المحادثة</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-white shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {(conversation.customer_name || conversation.whatsapp_number).charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {conversation.customer_name || conversation.whatsapp_number}
            </h3>
            {conversation.customer_name && (
              <p className="text-xs text-gray-500">{conversation.whatsapp_number}</p>
            )}
          </div>
          <Badge variant={statusBadgeVariant(conversation.status)}>
            {conversation.status === 'تحتاج_متابعة' ? 'متابعة' : conversation.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Bot Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">البوت</span>
            <button
              onClick={handleToggleBot}
              disabled={togglingBot}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                botEnabled ? 'bg-green-500' : 'bg-gray-300'
              } ${togglingBot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={botEnabled}
              aria-label="تفعيل/إيقاف البوت"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  botEnabled ? '-translate-x-6' : '-translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Assign Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">المسؤول</span>
            <select
              value={conversation.assigned_to || ''}
              onChange={(e) => handleAssign(e.target.value)}
              disabled={assigningTo}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 bg-white"
            >
              <option value="">غير معين</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.display_name || member.user_id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400 text-sm">لا توجد رسائل بعد</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                sender={msg.sender}
                content={msg.content}
                timestamp={msg.created_at}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Send Input */}
      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            loading={sending}
            disabled={!messageText.trim() || sending}
            size="md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 rotate-180"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
            <span>إرسال</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
