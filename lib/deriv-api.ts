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

  // Multiple endpoints for better reliability
  private endpoints = [
    "wss://ws.derivws.com/websockets/v3?app_id=1089",
    "wss://ws.binaryws.com/websockets/v3?app_id=1089",
  ]
  private currentEndpointIndex = 0

  // Event handlers
  private onOpenHandler: (() => void) | null = null
  private onCloseHandler: (() => void) | null = null
  private onErrorHandler: ((error: any) => void) | null = null
  private onLoginHandler: ((info: any) => void) | null = null
  private onBalanceHandler: ((balance: any) => void) | null = null

  constructor() {
    this.connect()
  }

  // Public event handler setters
  onOpen(handler: () => void) {
    this.onOpenHandler = handler
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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return this.connect()
  }

  // Connect to WebSocket
  private async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const endpoint = this.endpoints[this.currentEndpointIndex]
        console.log(`🔗 Connecting to Deriv API: ${endpoint}`)

        this.ws = new WebSocket(endpoint)

        const connectionTimeout = setTimeout(() => {
          console.log("⏰ Connection timeout")
          this.ws?.close()
          reject(new Error("Connection timeout"))
        }, 10000)

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log("✅ Connected to Deriv API")
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
          clearTimeout(connectionTimeout)
          console.log("❌ Disconnected from Deriv API", event.code, event.reason)
          this.isConnected = false
          this.stopPing()

          if (this.onCloseHandler) {
            this.onCloseHandler()
          }

          // Auto-reconnect if not manually closed
          if (!this.forceOffline && event.code !== 1000) {
            this.scheduleReconnect()
          }

          this.connectionPromise = null
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error("🔥 WebSocket error:", error)

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

  // Schedule reconnection with exponential backoff
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached")
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    setTimeout(() => {
      this.reconnectAttempts++

      // Try next endpoint if available
      if (this.reconnectAttempts > 2) {
        this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length
      }

      this.connect().catch((error) => {
        console.error("❌ Reconnection failed:", error)
      })
    }, delay)
  }

  // Start ping mechanism
  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({ ping: 1 })
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

    // Handle other responses
    console.log("📨 Received message:", data)
  }

  // Send message
  private send(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
        // Queue message for later
        this.messageQueue.push({ message, resolve, reject })
        return
      }

      try {
        this.ws.send(JSON.stringify(message))
        resolve(message)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Process queued messages
  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { message, resolve, reject } = this.messageQueue.shift()
      this.send(message).then(resolve).catch(reject)
    }
  }

  // Get tick history
  async getTickHistory(symbol: string, count = 1000): Promise<any> {
    const message = {
      ticks_history: symbol,
      adjust_start_time: 1,
      count: count,
      end: "latest",
      start: 1,
      style: "ticks",
    }

    try {
      await this.send(message)

      // Wait for response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for tick history"))
        }, 15000)

        const originalOnMessage = this.ws?.onmessage
        this.ws!.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.history) {
              clearTimeout(timeout)
              this.ws!.onmessage = originalOnMessage
              resolve(data)
            } else if (data.error) {
              clearTimeout(timeout)
              this.ws!.onmessage = originalOnMessage
              reject(new Error(data.error.message))
            } else {
              // Call original handler for other messages
              if (originalOnMessage) {
                originalOnMessage.call(this.ws, event)
              }
            }
          } catch (error) {
            clearTimeout(timeout)
            this.ws!.onmessage = originalOnMessage
            reject(error)
          }
        }
      })
    } catch (error) {
      console.error("❌ Error getting tick history:", error)
      throw error
    }
  }

  // Subscribe to ticks
  async subscribeTicks(symbol: string, callback: (data: any) => void): Promise<void> {
    this.subscriptions.set(symbol, callback)

    const message = {
      ticks: symbol,
      subscribe: 1,
    }

    try {
      await this.send(message)
      console.log(`✅ Subscribed to ${symbol}`)
    } catch (error) {
      console.error(`❌ Error subscribing to ${symbol}:`, error)
      throw error
    }
  }

  // Unsubscribe from ticks
  async unsubscribeTicks(symbol: string): Promise<void> {
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

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect")
      this.ws = null
    }

    this.isConnected = false
  }
}

// Create singleton instance
const derivAPI = new DerivAPI()

export default derivAPI
