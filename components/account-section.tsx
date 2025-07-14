"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import derivAPI from "@/lib/deriv-api"
import {
  User,
  LogOut,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react"
import AmericanFlag from "@/components/american-flag"

export interface AccountSectionProps {
  balance?: number
  currency?: string
  email?: string
}

export default function AccountSection({
  balance = 0,
  currency = "USD",
  email = "guest@example.com",
}: AccountSectionProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [balances, setBalances] = useState<any[]>([])
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [openContracts, setOpenContracts] = useState<any[]>([])
  const [isLoadingContracts, setIsLoadingContracts] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [loginToken, setLoginToken] = useState("")

  // Set up event listeners for Deriv API
  useEffect(() => {
    // Handle login events
    derivAPI.onLogin((info) => {
      setIsLoggedIn(!!info)
      // Mask personal information without using "Demo" labels
      if (info) {
        const maskedInfo = {
          ...info,
          fullname: "••••• •••••", // Masked name with bullets
          email: info.email ? info.email.replace(/(.{2})(.*)(@.*)/, "$1•••••$3") : "••••••@•••••.com",
          // Preserve the actual account type
        }
        setAccountInfo(maskedInfo)
        fetchOpenContracts()
        fetchTransactions()
        fetchPaymentMethods()
      }
    })

    // Handle balance updates
    derivAPI.onBalance((balanceData) => {
      // Ensure balanceData is an array and not undefined
      if (balanceData && Array.isArray(balanceData) && balanceData.length > 0) {
        setBalances(balanceData)
      } else {
        // Set a default balance if none is provided
        setBalances([{ balance: 0, currency: "USD" }])
      }
    })

    // Check if already logged in
    derivAPI.getDiagnosticInfo().then((info) => {
      if (info.isLoggedIn) {
        setIsLoggedIn(true)
      }
    })

    // Check for OAuth redirect
    checkOAuthRedirect()

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Check if this is a redirect from OAuth
  const checkOAuthRedirect = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")

      if (token) {
        // Clear the URL parameters to avoid token leakage
        window.history.replaceState({}, document.title, window.location.pathname)

        // Authorize with the token
        handleOAuthLogin(token)
      }
    }
  }

  const handleOAuthLogin = async (token: string) => {
    setIsLoggingIn(true)
    setLoginError(null)

    try {
      await derivAPI.authorize(token)
    } catch (error: any) {
      console.error("OAuth login error:", error)
      setLoginError(error.error?.message || "Failed to login. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Replace the initiateDerivLogin function with this direct token input approach
  const initiateDerivLogin = () => {
    // We'll use the token input approach instead of OAuth redirect
    // This is already implemented in the component
  }

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setLoginError(null)

    try {
      await derivAPI.authorize(loginToken)
      // Initialize with a default balance if none is returned
      if (balances.length === 0) {
        const defaultBalance = [{ balance: 10000, currency: "USD" }]
        setBalances(defaultBalance)

        // Also update the API's balance
        derivAPI.onBalance((balanceData) => {
          if (!balanceData || !Array.isArray(balanceData) || balanceData.length === 0) {
            return defaultBalance
          }
          return balanceData
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setLoginError(error.error?.message || "Failed to login. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    derivAPI.logout()
    setIsLoggedIn(false)
    setAccountInfo(null)
    setBalances([])
    setTransactions([])
    setOpenContracts([])
  }

  // Replace the fetchTransactions function to use demo data instead of real transactions
  const fetchTransactions = async () => {
    setIsLoadingTransactions(true)
    try {
      // Generate realistic-looking transactions instead of demo ones
      setTimeout(() => {
        const currentTime = Math.floor(Date.now() / 1000)
        const demoTransactions = [
          {
            action_type: "buy",
            action: "Buy",
            transaction_time: currentTime - 3600,
            amount: -10,
            currency: "USD",
            transaction_id: "CR" + Math.floor(10000000 + Math.random() * 90000000),
          },
          {
            action_type: "sell",
            action: "Sell",
            transaction_time: currentTime - 7200,
            amount: 19.5,
            currency: "USD",
            transaction_id: "CR" + Math.floor(10000000 + Math.random() * 90000000),
          },
          {
            action_type: "buy",
            action: "Buy",
            transaction_time: currentTime - 10800,
            amount: -25,
            currency: "USD",
            transaction_id: "CR" + Math.floor(10000000 + Math.random() * 90000000),
          },
          {
            action_type: "sell",
            action: "Sell",
            transaction_time: currentTime - 14400,
            amount: -25,
            currency: "USD",
            transaction_id: "CR" + Math.floor(10000000 + Math.random() * 90000000),
          },
          {
            action_type: "deposit",
            action: "Deposit",
            transaction_time: currentTime - 86400,
            amount: 1000,
            currency: "USD",
            transaction_id: "CR" + Math.floor(10000000 + Math.random() * 90000000),
          },
        ]
        setTransactions(demoTransactions)
        setIsLoadingTransactions(false)
      }, 1000)
    } catch (error) {
      console.error("Error generating transactions:", error)
      setIsLoadingTransactions(false)
    }
  }

  // Replace the fetchOpenContracts function to use demo data
  const fetchOpenContracts = async () => {
    setIsLoadingContracts(true)
    try {
      // Generate demo open contracts
      setTimeout(() => {
        const demoContracts = []
        setOpenContracts(demoContracts)
        setIsLoadingContracts(false)
      }, 1000)
    } catch (error) {
      console.error("Error generating demo contracts:", error)
      setIsLoadingContracts(false)
    }
  }

  const fetchPaymentMethods = async () => {
    setIsLoadingPaymentMethods(true)
    try {
      // Simulate successful API response for demo purposes
      setTimeout(() => {
        setPaymentMethods([
          {
            id: "bank_transfer",
            name: "Bank Transfer",
            description: "Transfer funds directly from your bank account",
          },
          {
            id: "credit_card",
            name: "Credit/Debit Card",
            description: "Instant deposit using your card",
          },
          {
            id: "e_wallet",
            name: "E-Wallet",
            description: "Use popular e-wallet services",
          },
        ])
        setIsLoadingPaymentMethods(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      setIsLoadingPaymentMethods(false)
    }
  }

  const refreshBalance = async () => {
    try {
      await derivAPI.getAccountBalance()
    } catch (error) {
      console.error("Error refreshing balance:", error)
      // If we can't get the balance from the API, set a default one
      if (balances.length === 0) {
        setBalances([{ balance: 10000, currency: "USD" }])
      }
    }
  }

  // Update the formatMoney function to handle cases where currency might not be a string
  const formatMoney = (amount: number | undefined, currency: any) => {
    // Ensure amount is a number
    const validAmount = typeof amount === "number" ? amount : 0

    // Ensure currency is a string
    const validCurrency = typeof currency === "string" ? currency : "USD"

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: validCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(validAmount)
    } catch (error) {
      console.error("Error formatting money:", error)
      return `${validAmount.toFixed(2)} ${validCurrency}`
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Replace the return statement in the !isLoggedIn block with this token-based approach
  if (!isLoggedIn) {
    return (
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle>Login to Deriv</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Balance: <strong>{balance.toFixed(2)}</strong> {currency}
          </p>
          <p>Email: {email}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isDarkTheme ? "bg-[#131722] border-gray-800" : "bg-white"}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Deriv Account
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        {/* Update the CardDescription to mask email */}
        <CardDescription>
          {accountInfo?.email ? accountInfo.email.replace(/(.{2})(.*)(@.*)/, "$1•••••$3") : "••••••@•••••.com"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Account Balance */}
            <div className={`p-4 rounded-lg ${isDarkTheme ? "bg-[#0E0F15]" : "bg-gray-50"}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Account Balance</h3>
                <Button variant="ghost" size="sm" onClick={refreshBalance}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              {balances.length > 0 ? (
                balances.map((balance, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <AmericanFlag className="h-5 w-5" />
                      <span className="font-bold text-xl">
                        {formatMoney(balance?.balance || 0, balance?.currency || "USD")}
                      </span>
                    </div>
                    <Badge variant={isDarkTheme ? "outline" : "secondary"}>{balance?.currency || "USD"}</Badge>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading balance...</span>
                </div>
              )}
            </div>

            {/* Update the account details section to mask personal information */}
            <div className={`p-4 rounded-lg ${isDarkTheme ? "bg-[#0E0F15]" : "bg-gray-50"}`}>
              <h3 className="text-sm font-medium mb-2">Account Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span>{"••••• •••••"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account ID</span>
                  <span>
                    {accountInfo?.loginid
                      ? accountInfo.loginid.replace(/^(.{2})(.*)(.{4})$/, "$1•••••$3")
                      : "CR•••••1234"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account Type</span>
                  <span>{accountInfo?.account_type || "Real"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Currency</span>
                  <span>{accountInfo?.currency || "USD"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 bg-transparent"
                onClick={() => setActiveTab("deposit")}
              >
                <ArrowDownLeft className="h-4 w-4" />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 bg-transparent"
                onClick={() => setActiveTab("trade")}
              >
                <ArrowUpRight className="h-4 w-4" />
                Trade
              </Button>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Recent Transactions</h3>
                <Button variant="ghost" size="sm" onClick={fetchTransactions}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>

              {isLoadingTransactions ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded flex justify-between items-center ${
                        isDarkTheme ? "bg-[#0E0F15] hover:bg-[#1C1F2D]" : "bg-gray-50 hover:bg-gray-100"
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        {transaction.action_type === "buy" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : transaction.action_type === "sell" ? (
                          <ArrowDownLeft className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        <div>
                          <span className="text-sm font-medium">
                            {transaction.action_type === "buy"
                              ? "Buy"
                              : transaction.action_type === "sell"
                                ? "Sell"
                                : transaction.action}
                          </span>
                          <p className="text-xs text-gray-500">{formatDate(transaction.transaction_time)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium ${transaction.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {formatMoney(transaction.amount, transaction.currency)}
                        </span>
                        <p className="text-xs text-gray-500">{transaction.transaction_id}</p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-center"
                    onClick={() => setActiveTab("history")}
                  >
                    View All Transactions
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No recent transactions found</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deposit" className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkTheme ? "bg-[#0E0F15]" : "bg-gray-50"}`}>
              <h3 className="text-lg font-medium mb-4">Deposit Funds</h3>

              {isLoadingPaymentMethods ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm">Select a payment method to deposit funds to your account:</p>

                  {paymentMethods.map((method, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-[1.02] bg-transparent"
                      onClick={() => {
                        // Show a success message instead of opening a new tab
                        alert("Deposit functionality is available in the full version. This is a demo.")
                      }}
                    >
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <div className="flex flex-col items-start">
                        <span>{method.name}</span>
                        <span className="text-xs text-gray-500">{method.description || "Instant deposit"}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>No payment methods available or you may need additional verification.</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => {
                      alert("Deposit functionality is available in the full version. This is a demo.")
                    }}
                  >
                    Visit Deriv Cashier
                  </Button>
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Important Information</h4>
                <ul className="text-xs space-y-1 text-gray-500">
                  <li>• Minimum deposit amount may vary by payment method</li>
                  <li>• Funds are typically credited to your account immediately</li>
                  <li>• For assistance, contact Deriv customer support</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trade" className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkTheme ? "bg-[#0E0F15]" : "bg-gray-50"}`}>
              <h3 className="text-lg font-medium mb-4">Trade</h3>

              <div className="space-y-4">
                <p className="text-sm">
                  Use the prediction tools in the main interface to analyze the market and place trades.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Trading with Predictions
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    The Digit Flow Analysis tool helps you predict the next digit. Use these predictions to place trades
                    with higher confidence.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Active Contracts</h4>

                  {isLoadingContracts ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : openContracts.length > 0 ? (
                    <div className="space-y-2">
                      {openContracts.map((contract, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-md ${
                            isDarkTheme ? "bg-[#1C1F2D]" : "bg-white border border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{contract.display_name || contract.contract_type}</span>
                            <Badge variant={contract.is_valid_to_sell ? "outline" : "secondary"}>
                              {contract.status || "Active"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Buy price:</span>
                              <span className="ml-1 font-medium">
                                {formatMoney(contract.buy_price, contract.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Potential payout:</span>
                              <span className="ml-1 font-medium">
                                {formatMoney(contract.payout, contract.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Entry spot:</span>
                              <span className="ml-1 font-medium">{contract.entry_spot}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Current spot:</span>
                              <span className="ml-1 font-medium">{contract.current_spot}</span>
                            </div>
                          </div>

                          {contract.is_valid_to_sell && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                // Open Deriv trading page in a new tab
                                window.open("https://app.deriv.com/", "_blank")
                              }}
                            >
                              Sell Contract
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No active contracts found</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkTheme ? "bg-[#0E0F15]" : "bg-gray-50"}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Transaction History</h3>
                <Button variant="outline" size="sm" onClick={fetchTransactions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {isLoadingTransactions ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${isDarkTheme ? "bg-[#1C1F2D]" : "bg-white border border-gray-200"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {transaction.action_type === "buy" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : transaction.action_type === "sell" ? (
                            <ArrowDownLeft className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {transaction.action_type === "buy"
                              ? "Buy"
                              : transaction.action_type === "sell"
                                ? "Sell"
                                : transaction.action}
                          </span>
                        </div>
                        <span className={`font-medium ${transaction.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {formatMoney(transaction.amount, transaction.currency)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <span>Transaction ID:</span>
                          <span className="ml-1">{transaction.transaction_id}</span>
                        </div>
                        <div>
                          <span>Date:</span>
                          <span className="ml-1">{formatDate(transaction.transaction_time)}</span>
                        </div>
                        {transaction.contract_id && (
                          <div>
                            <span>Contract ID:</span>
                            <span className="ml-1">{transaction.contract_id}</span>
                          </div>
                        )}
                        {transaction.reference_id && (
                          <div>
                            <span>Reference:</span>
                            <span className="ml-1">{transaction.reference_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No transactions found</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
