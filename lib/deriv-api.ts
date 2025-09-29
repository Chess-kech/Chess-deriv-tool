class DerivAPI {
  private ws: WebSocket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private subscriptions = new Map<string, (data: any) => void>()
  private messageQueue: any[] = []
  private pingInterval: NodeJS.Timeout | null = null
  private connectionPromise: Promise<void> | null = null
  private forceOffline = false
  private messageId = 1
  private connectionTimeout: NodeJS.Timeout | null = null

  // Updated endpoints with better reliability
  private endpoints = [
    "wss://ws.derivws.com/websockets/v3?app_id=1089",
    "wss://ws.binaryws.com/websockets/v3?app_id=1089",
    "wss://frontend.derivws.com/websockets/v3?app_id=1089",
  ]
  private currentEndpointIndex = 0

  // Event handlers
  private onOpenHandler: (() => void) | null = null
  private onCloseHandler: (() => void) | null = null
  private onErrorHandler: ((error: any) => void) | null = null
  private onLoginHandler: ((info: any) => void) | null = null
  private onBalanceHandler: ((balance: any) => void) | null = null

  constructor() {
    // Don't auto-connect in constructor, let components control connection
  }

  // Public event handler setters
  onOpen(handler: () => void) {
    this.onOpenHandler = handler
    // If already connected, call immediately
    if (this.isConnected) {
      handler()
    }
  }

  onClose(handler: () => void) {
    this.onCloseHandler = handler
  }

  onError(handler: (error: any) => void) {
    this.onErrorHandler = handler
  }

  onLogin(handler: (info: any) => void) {
    this.onLoginHandler = handler
  }

  onBalance(handler: (balance: any) => void) {
    this.onBalanceHandler = handler
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  // Force reconnection
  async forceReconnect(): Promise<void> {
    console.log("🔄 Forcing reconnection...")
    this.disconnect()
    this.reconnectAttempts = 0
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return this.connect()
  }

  // Connect to WebSocket
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      console.log("✅ Already connected")
      return Promise.resolve()
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const endpoint = this.endpoints[this.currentEndpointIndex]
        console.log(`🔗 Connecting to Deriv API: ${endpoint}`)

        // Clear any existing connection
        if (this.ws) {
          this.ws.close()
          this.ws = null
        }

        this.ws = new WebSocket(endpoint)

        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          console.log("⏰ Connection timeout")
          if (this.ws) {
            this.ws.close()
          }
          this.tryNextEndpoint()
          reject(new Error("Connection timeout"))
        }, 15000) // 15 second timeout

        this.ws.onopen = () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }

          console.log("✅ Connected to Deriv API successfully")
          this.isConnected = true
          this.reconnectAttempts = 0
          this.currentEndpointIndex = 0 // Reset to primary endpoint

          // Start ping mechanism
          this.startPing()

          // Process queued messages
          this.processMessageQueue()

          if (this.onOpenHandler) {
            this.onOpenHandler()
          }

          resolve()
        }

        this.ws.onclose = (event) => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }

          console.log("❌ Disconnected from Deriv API", event.code, event.reason)
          this.isConnected = false
          this.stopPing()

          if (this.onCloseHandler) {
            this.onCloseHandler()
          }

          // Auto-reconnect if not manually closed and not at max attempts
          if (!this.forceOffline && event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }

          this.connectionPromise = null
        }

        this.ws.onerror = (error) => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }

          console.error("🔥 WebSocket error:", error)
          this.isConnected = false

          if (this.onErrorHandler) {
            this.onErrorHandler(error)
          }

          reject(error)
          this.connectionPromise = null
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error("❌ Error parsing message:", error)
          }
        }
      } catch (error) {
        console.error("❌ Error creating WebSocket:", error)
        reject(error)
        this.connectionPromise = null
      }
    })

    return this.connectionPromise
  }

  private tryNextEndpoint() {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length
    console.log(`🔄 Trying next endpoint: ${this.endpoints[this.currentEndpointIndex]}`)
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached")
      return
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000)
    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    setTimeout(() => {
      this.reconnectAttempts++
      this.tryNextEndpoint()
      this.connect().catch((error) => {
        console.error("❌ Reconnection failed:", error)
      })
    }, delay)
  }

  // Start ping mechanism
  private startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }

    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({ ping: 1 }).catch(() => {
          console.log("❌ Ping failed")
        })
      }
    }, 30000) // Ping every 30 seconds
  }

  // Stop ping mechanism
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // Handle incoming messages
  private handleMessage(data: any) {
    // Handle pong
    if (data.pong) {
      console.log("📡 Pong received - connection alive")
      return
    }

    // Handle tick data
    if (data.tick) {
      const callback = this.subscriptions.get(data.tick.symbol)
      if (callback) {
        callback(data)
      }
      return
    }

    // Handle history data
    if (data.history) {
      const callback = this.subscriptions.get(`history_${data.req_id}`)
      if (callback) {
        callback(data)
        this.subscriptions.delete(`history_${data.req_id}`)
      }
      return
    }

    // Handle authorization response
    if (data.authorize) {
      console.log("✅ Authorization successful")
      if (this.onLoginHandler) {
        this.onLoginHandler(data.authorize)
      }
      return
    }

    // Handle balance updates
    if (data.balance) {
      if (this.onBalanceHandler) {
        this.onBalanceHandler([data.balance])
      }
      return
    }

    // Handle errors
    if (data.error) {
      console.error("❌ API Error:", data.error)
      if (this.onErrorHandler) {
        this.onErrorHandler(data.error)
      }
      return
    }

    // Handle other responses
    console.log("📨 Received message:", data)
  }

  // Send message
  private send(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
        // Queue message for later
        this.messageQueue.push({ message, resolve, reject })
        console.log("📤 Message queued (not connected)")
        return
      }

      try {
        // Add message ID for tracking
        if (!message.req_id) {
          message.req_id = this.messageId++
        }

        const messageStr = JSON.stringify(message)
        console.log("📤 Sending message:", messageStr)
        this.ws.send(messageStr)
        resolve(message)
      } catch (error) {
        console.error("❌ Error sending message:", error)
        reject(error)
      }
    })
  }

  // Process queued messages
  private processMessageQueue() {
    console.log(`📦 Processing ${this.messageQueue.length} queued messages`)
    while (this.messageQueue.length > 0) {
      const { message, resolve, reject } = this.messageQueue.shift()
      this.send(message).then(resolve).catch(reject)
    }
  }

  // Get tick history with proper error handling
  async getTickHistory(symbol: string, count = 1000): Promise<any> {
    const reqId = this.messageId++
    const message = {
      ticks_history: symbol,
      adjust_start_time: 1,
      count: count,
      end: "latest",
      start: 1,
      style: "ticks",
      req_id: reqId,
    }

    console.log(`📊 Requesting tick history for ${symbol} (${count} ticks)`)

    try {
      await this.send(message)

      // Wait for response with timeout
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.subscriptions.delete(`history_${reqId}`)
          reject(new Error("Timeout waiting for tick history"))
        }, 20000) // 20 second timeout

        // Set up response handler
        this.subscriptions.set(`history_${reqId}`, (data) => {
          clearTimeout(timeout)
          if (data.error) {
            console.error("❌ History error:", data.error)
            reject(new Error(data.error.message))
          } else {
            console.log(`✅ Received ${data.history?.prices?.length || 0} price points for ${symbol}`)
            resolve(data)
          }
        })
      })
    } catch (error) {
      console.error("❌ Error getting tick history:", error)
      throw error
    }
  }

  // Subscribe to ticks with proper error handling
  async subscribeTicks(symbol: string, callback: (data: any) => void): Promise<void> {
    console.log(`🔔 Subscribing to ticks for ${symbol}`)
    this.subscriptions.set(symbol, callback)

    const message = {
      ticks: symbol,
      subscribe: 1,
    }

    try {
      await this.send(message)
      console.log(`✅ Successfully subscribed to ${symbol}`)
    } catch (error) {
      console.error(`❌ Error subscribing to ${symbol}:`, error)
      this.subscriptions.delete(symbol)
      throw error
    }
  }

  // Unsubscribe from ticks
  async unsubscribeTicks(symbol: string): Promise<void> {
    console.log(`🔕 Unsubscribing from ${symbol}`)
    this.subscriptions.delete(symbol)

    const message = {
      forget_all: "ticks",
    }

    try {
      await this.send(message)
      console.log(`✅ Unsubscribed from ${symbol}`)
    } catch (error) {
      console.error(`❌ Error unsubscribing from ${symbol}:`, error)
    }
  }

  // Authorize with token
  async authorize(token: string): Promise<any> {
    const message = {
      authorize: token,
    }

    try {
      return await this.send(message)
    } catch (error) {
      console.error("❌ Authorization error:", error)
      throw error
    }
  }

  // Get account balance
  async getAccountBalance(): Promise<any> {
    const message = {
      balance: 1,
      subscribe: 1,
    }

    try {
      return await this.send(message)
    } catch (error) {
      console.error("❌ Error getting balance:", error)
      throw error
    }
  }

  // Get diagnostic info
  async getDiagnosticInfo(): Promise<any> {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      currentEndpoint: this.endpoints[this.currentEndpointIndex],
      subscriptions: Array.from(this.subscriptions.keys()),
      wsReadyState: this.ws?.readyState,
      wsReadyStateText: this.getReadyStateText(),
      messageQueueLength: this.messageQueue.length,
    }
  }

  private getReadyStateText(): string {
    if (!this.ws) return "No WebSocket"
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING"
      case WebSocket.OPEN:
        return "OPEN"
      case WebSocket.CLOSING:
        return "CLOSING"
      case WebSocket.CLOSED:
        return "CLOSED"
      default:
        return "UNKNOWN"
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect()
      }

      // Send a ping to test
      await this.send({ ping: 1 })
      return true
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      return false
    }
  }

  // Logout
  logout() {
    console.log("👋 Logging out")
    if (this.onLoginHandler) {
      this.onLoginHandler(null)
    }
    if (this.onBalanceHandler) {
      this.onBalanceHandler([])
    }
  }

  // Disconnect
  disconnect() {
    console.log("🔌 Disconnecting from Deriv API")
    this.forceOffline = true
    this.stopPing()
    this.subscriptions.clear()
    this.messageQueue.length = 0

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect")
      this.ws = null
    }

    this.isConnected = false
    this.connectionPromise = null
  }
}

// Create singleton instance
const derivAPI = new DerivAPI()

export default derivAPI
