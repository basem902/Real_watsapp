import { ParsedMessage } from '@/types'

export function parseIncomingMessage(body: any): ParsedMessage | null {
  // Format 1: data.data.messages (Wasender v2 format)
  if (body?.data?.data?.messages) {
    try {
      const msg = body.data.data.messages[0]
      if (!msg) return null
      const senderNumber = (msg.cleanedSenderPn || msg.senderPn || '').replace(/[^0-9]/g, '')
      const content = msg.messageBody || msg.conversation || msg.extendedTextMessage?.text || ''

      return {
        senderNumber,
        senderName: msg.pushName || msg.senderName || senderNumber,
        messageId: msg.key?.id || msg.id || `msg-${Date.now()}`,
        messageType: getMessageType(msg),
        content,
        mediaUrl: msg.imageMessage?.url || msg.documentMessage?.url,
        latitude: msg.locationMessage?.degreesLatitude,
        longitude: msg.locationMessage?.degreesLongitude,
        interactiveType: msg.listResponseMessage ? 'list' : msg.buttonsResponseMessage ? 'buttons' : undefined,
        interactiveId: msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
                       msg.buttonsResponseMessage?.selectedButtonId,
        timestamp: msg.messageTimestamp || Math.floor(Date.now() / 1000),
      }
    } catch (err) {
      console.error('[Parser] Format 1 (Wasender v2) parse error:', err)
    }
  }

  // Format 2: data.key + data.message (Baileys/raw format)
  if (body?.data?.key && body?.data?.message) {
    try {
      const { key, message, pushName } = body.data
      const senderNumber = (key.remoteJid || '').replace(/@.*$/, '').replace(/[^0-9]/g, '')
      const content = message.conversation ||
                      message.extendedTextMessage?.text ||
                      message.imageMessage?.caption || ''

      return {
        senderNumber,
        senderName: pushName || senderNumber,
        messageId: key.id || `msg-${Date.now()}`,
        messageType: message.imageMessage ? 'image' :
                     message.locationMessage ? 'location' :
                     message.documentMessage ? 'document' : 'text',
        content,
        mediaUrl: message.imageMessage?.url || message.documentMessage?.url,
        latitude: message.locationMessage?.degreesLatitude,
        longitude: message.locationMessage?.degreesLongitude,
        interactiveType: message.listResponseMessage ? 'list' : message.buttonsResponseMessage ? 'buttons' : undefined,
        interactiveId: message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                       message.buttonsResponseMessage?.selectedButtonId,
        timestamp: body.data.messageTimestamp || Math.floor(Date.now() / 1000),
      }
    } catch (err) {
      console.error('[Parser] Format 2 (Baileys/raw) parse error:', err)
    }
  }

  // Format 3: Flat format (simple webhooks)
  const d = body?.data || body
  if (d?.from || d?.sender || d?.phone) {
    try {
      const senderNumber = (d.from || d.sender || d.phone || '').replace(/[^0-9]/g, '')
      const content = d.body || d.message || d.text || ''
      if (!senderNumber || !content) return null

      return {
        senderNumber,
        senderName: d.pushName || d.name || d.senderName || senderNumber,
        messageId: d.id || d.messageId || `msg-${Date.now()}`,
        messageType: d.type === 'image' ? 'image' :
                     d.type === 'location' ? 'location' :
                     d.type === 'document' ? 'document' : 'text',
        content,
        mediaUrl: d.mediaUrl || d.media,
        latitude: d.latitude || d.lat,
        longitude: d.longitude || d.lng,
        timestamp: d.timestamp || Math.floor(Date.now() / 1000),
      }
    } catch (err) {
      console.error('[Parser] Format 3 (flat) parse error:', err)
      return null
    }
  }

  return null
}

function getMessageType(msg: any): ParsedMessage['messageType'] {
  if (msg.imageMessage) return 'image'
  if (msg.locationMessage) return 'location'
  if (msg.documentMessage) return 'document'
  if (msg.listResponseMessage || msg.buttonsResponseMessage) return 'interactive'
  return 'text'
}

export function extractInstanceId(body: any): string | null {
  return body?.instance_id || body?.instanceId || body?.data?.instance_id || null
}
