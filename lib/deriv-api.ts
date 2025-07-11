// Deriv WebSocket API client
export class DerivAPI {
  private socket: WebSocket | null = null
  private requestId = 1
  private callbacks: Map<number, (response: any) => void> = new Map()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private onOpenCallbacks: (() => void)[] = []
  private onCloseCallbacks: (() => void)[] = []
  private onErrorCallbacks: ((error: any) => void)[] = []
  private subscriptions: Map<string, number> = new Map()
  private app_id = 1089 // Demo app_id for Deriv API
  private hasLoggedFirstTick = false
  private token: string | null = null
  private accountInfo: any = null
  private balances: any[] = [{ balance: 10000, currency: "USD" }]
  private onLoginCallbacks: ((accountInfo: any) => void)[] = []
  private onBalanceCallbacks: ((balances: any[]) => void)[] = []
  private connectionState: "disconnected" | "connecting" | "connected" | "reconnecting" = "disconnected"
  private isBrowser = typeof window !== "undefined"

  constructor() {
    if (this.isBrowser) {
      this.connect()
      this.restoreSession()
    }
  }

  private connect() {
    try {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log("Already connected to Deriv WebSocket API")
        return
      }

      if (this.connectionState === "connecting") {
        console.log("Already attempting to connect to Deriv WebSocket API")
        return
      }

      this.connectionState = "connecting"

      if (this.socket) {
        try {
          this.socket.onopen = null
          this.socket.onmessage = null
          this.socket.onclose = null
          this.socket.onerror = null
          this.socket.close()
        } catch (e) {
          console.error("Error closing existing socket:", e)
        }
      }

      console.log("Attempting to connect to Deriv WebSocket API...")

      try {
        this.socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${this.app_id}`)
      } catch (err) {
        console.error("Error creating WebSocket:", err)
        this.connectionState = "disconnected"
        this.attemptReconnect()
        return
      }

      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.error("Connection timeout - closing socket and retrying")
          if (this.socket) {
            this.socket.close()
          }
          this.connectionState = "disconnected"
          this.attemptReconnect()
        }
      }, 10000)

      this.socket.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log("✅ Successfully connected to Deriv WebSocket API")
        this.isConnected = true
        this.connectionState = "connected"
        this.reconnectAttempts = 0
        this.onOpenCallbacks.forEach((onOpen) => onOpen())

        this.send({ ping: 1 })
          .then((response) => {
            console.log("Ping response:", response)
            if (this.token) {
              this.authorize(this.token).catch((err) => {
                console.error("Auto-authorization failed:", err)
              })
            }
          })
          .catch((error) => {
            console.error("Ping failed:", error)
          })
      }

      this.socket.onmessage = (msg) => {
        try {
          const response = JSON.parse(msg.data)

          if (response.msg_type !== "tick" || !this.hasLoggedFirstTick) {
            if (response.msg_type !== "ping" && response.msg_type !== "pong") {
              console.log("Received response:", response)
            }
            if (response.msg_type === "tick") {
              this.hasLoggedFirstTick = true
            }
          }

          if (response.msg_type === "tick") {
            const symbol = response.tick?.symbol
            const requestId = this.subscriptions.get(symbol || "")
            if (requestId && this.callbacks.has(requestId)) {
              this.callbacks.get(requestId)?.(response)
            }
            return
          }

          if (response.msg_type === "authorize") {
            this.accountInfo = response.authorize
            this.onLoginCallbacks.forEach((callback) => callback(this.accountInfo))
            this.getAccountBalance().catch((err) => {
              console.error("Failed to get account balance:", err)
            })
            return
          }

          if (response.msg_type === "balance") {
            this.balances = [response.balance]
            this.onBalanceCallbacks.forEach((callback) => callback(this.balances))
            return
          }

          if (response.req_id && this.callbacks.has(response.req_id)) {
            this.callbacks.get(response.req_id)?.(response)
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log(
          `Disconnected from Deriv WebSocket API. Code: ${event.code}, Reason: ${event.reason || "No reason provided"}`,
        )
        this.isConnected = false
        this.connectionState = "disconnected"
        this.onCloseCallbacks.forEach((onClose) => onClose())
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error("Deriv WebSocket API error:", error)
        this.onErrorCallbacks.forEach((callback) => callback(error))
      }
    } catch (error) {
      console.error("Error connecting to Deriv WebSocket API:", error)
      this.connectionState = "disconnected"
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts (${this.maxReconnectAttempts}) reached`)
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    )

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.connectionState = "reconnecting"
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  public onOpen(callback: () => void) {
    this.onOpenCallbacks.push(callback)
    if (this.isConnected) {
      callback()
    }
    return this
  }

  public onClose(callback: () => void) {
    this.onCloseCallbacks.push(callback)
    return this
  }

  public onError(callback: (error: any) => void) {
    this.onErrorCallbacks.push(callback)
    return this
  }

  public onLogin(callback: (accountInfo: any) => void) {
    this.onLoginCallbacks.push(callback)
    if (this.accountInfo) {
      callback(this.accountInfo)
    }
    return this
  }

  public onBalance(callback: (balances: any[]) => void) {
    this.onBalanceCallbacks.push(callback)
    if (this.balances.length > 0) {
      callback(this.balances)
    }
    return this
  }

  public send(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.connect()
        console.log("WebSocket not initialized, connecting...")

        const connectionTimeout = setTimeout(() => {
          reject(new Error("Connection attempt timed out"))
        }, 10000)

        const waitForConnection = () => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            clearTimeout(connectionTimeout)
            this.send(request).then(resolve).catch(reject)
          } else if (this.connectionState === "disconnected") {
            clearTimeout(connectionTimeout)
            reject(new Error("Failed to connect to Deriv WebSocket API"))
          } else {
            setTimeout(waitForConnection, 200)
          }
        }

        waitForConnection()
        return
      }

      if (this.socket.readyState !== WebSocket.OPEN) {
        console.log(`WebSocket not ready (state: ${this.socket.readyState}), waiting...`)

        const maxWaitTime = 10000
        const startTime = Date.now()

        const checkConnection = () => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.send(request).then(resolve).catch(reject)
            return
          }

          if (Date.now() - startTime > maxWaitTime) {
            if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
              setTimeout(checkConnection, 500)
            } else {
              this.disconnect()
              this.connect()
              reject(new Error("WebSocket connection timed out, attempting to reconnect"))
            }
            return
          }

          setTimeout(checkConnection, 300)
        }

        checkConnection()
        return
      }

      const id = this.requestId++
      request.req_id = id

      const timeoutId = setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id)
          reject(new Error("Request timed out"))
        }
      }, 30000)

      this.callbacks.set(id, (response) => {
        clearTimeout(timeoutId)
        if (response.error) {
          console.error("API error:", response.error)
          reject(response)
        } else {
          resolve(response)
        }
        this.callbacks.delete(id)
      })

      try {
        this.socket.send(JSON.stringify(request))
      } catch (error) {
        clearTimeout(timeoutId)
        console.error("Error sending WebSocket message:", error)
        this.callbacks.delete(id)
        reject(error)
      }
    })
  }

  public async subscribeTicks(symbol: string, callback: (tick: any) => void): Promise<number> {
    try {
      if (this.subscriptions.has(symbol)) {
        const existingId = this.subscriptions.get(symbol) || 0
        return existingId
      }

      if (!this.isConnected) {
        console.log("Not connected, attempting to connect before subscribing to ticks")
        await new Promise<void>((resolve) => {
          const onOpenHandler = () => {
            this.onOpenCallbacks = this.onOpenCallbacks.filter((cb) => cb !== onOpenHandler)
            resolve()
          }
          this.onOpenCallbacks.push(onOpenHandler)
          this.connect()
        })
      }

      const id = this.requestId++
      this.callbacks.set(id, callback)
      this.subscriptions.set(symbol, id)

      const request = {
        ticks: symbol,
        subscribe: 1,
        req_id: id,
      }

      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected")
      }

      this.socket.send(JSON.stringify(request))
      return id
    } catch (error) {
      console.error("Error subscribing to ticks:", error)
      throw error
    }
  }

  public unsubscribeTicks(symbol: string) {
    if (!this.subscriptions.has(symbol)) return

    const id = this.subscriptions.get(symbol)
    if (id) {
      this.callbacks.delete(id)
      this.subscriptions.delete(symbol)

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const request = {
          forget: id,
        }
        this.socket.send(JSON.stringify(request))
      }
    }
  }

  public async getServerTime(): Promise<any> {
    return this.send({
      time: 1,
    })
  }

  public async getTradableAssets(): Promise<any> {
    return this.send({
      active_symbols: "brief",
      product_type: "basic",
    })
  }

  public async getTickHistory(symbol: string, count = 500, style = "ticks", endTime = "latest"): Promise<any> {
    return this.send({
      ticks_history: symbol,
      count: count,
      end: endTime,
      style: style,
    })
  }

  public async getDiagnosticInfo(): Promise<any> {
    const info: any = {
      connected: this.isConnected,
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys()),
      timestamp: new Date().toISOString(),
      isLoggedIn: !!this.token,
      socketState: this.socket ? this.socket.readyState : "no socket",
    }

    try {
      if (this.isConnected) {
        const serverTime = await this.getServerTime()
        if (serverTime) {
          info.serverTime = serverTime.time
        }
      }
    } catch (error) {
      info.serverTimeError = error
    }

    return info
  }

  public async authorize(token: string): Promise<any> {
    try {
      this.token = token

      if (this.isBrowser) {
        localStorage.setItem("deriv_token", token)
      }

      const response = await this.send({
        authorize: token,
      })

      if (response.authorize) {
        this.accountInfo = response.authorize
        this.onLoginCallbacks.forEach((callback) => callback(this.accountInfo))
        return response
      } else {
        throw new Error("Authorization failed")
      }
    } catch (error) {
      console.error("Authorization error:", error)
      this.token = null
      if (this.isBrowser) {
        localStorage.removeItem("deriv_token")
      }
      throw error
    }
  }

  private restoreSession() {
    if (this.isBrowser) {
      const token = localStorage.getItem("deriv_token")
      if (token) {
        console.log("Restoring session from saved token")
        this.onOpen(() => {
          this.authorize(token).catch((error) => {
            console.error("Failed to restore session:", error)
            localStorage.removeItem("deriv_token")
          })
        })
      }

      try {
        const savedBalance = localStorage.getItem("deriv_balance")
        if (savedBalance) {
          const parsedBalance = JSON.parse(savedBalance)
          if (Array.isArray(parsedBalance) && parsedBalance.length > 0) {
            this.balances = parsedBalance
            this.onBalanceCallbacks.forEach((callback) => callback(this.balances))
          }
        }
      } catch (e) {
        console.error("Failed to restore balance from localStorage:", e)
      }
    }
  }

  public logout(): void {
    this.token = null
    this.accountInfo = null
    this.balances = [{ balance: 10000, currency: "USD" }]

    if (this.isBrowser) {
      localStorage.removeItem("deriv_token")
      localStorage.removeItem("deriv_balance")
    }

    this.onLoginCallbacks.forEach((callback) => callback(null))
    this.onBalanceCallbacks.forEach((callback) => callback(this.balances))
  }

  public async getAccountBalance(): Promise<any> {
    try {
      const response = await this.send({
        balance: 1,
        subscribe: 1,
      })

      if (response.balance) {
        this.balances = [response.balance]
        this.onBalanceCallbacks.forEach((callback) => callback(this.balances))

        if (this.isBrowser) {
          try {
            localStorage.setItem("deriv_balance", JSON.stringify(this.balances))
          } catch (e) {
            console.error("Failed to save balance to localStorage:", e)
          }
        }

        return response
      }
      return response
    } catch (error) {
      console.error("Error getting account balance:", error)
      throw error
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      try {
        this.socket.onopen = null
        this.socket.onmessage = null
        this.socket.onclose = null
        this.socket.onerror = null
        this.socket.close()
      } catch (e) {
        console.error("Error during disconnect:", e)
      }
      this.socket = null
    }

    this.isConnected = false
    this.connectionState = "disconnected"
    this.callbacks.clear()
    this.subscriptions.clear()
  }
}

const derivAPI = new DerivAPI()
export default derivAPI
