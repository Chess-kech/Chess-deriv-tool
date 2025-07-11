"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import derivAPI from "@/lib/deriv-api"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import AmericanFlag from "@/components/american-flag"

interface TradeFormProps {
  symbol: string
  predictedDigit: number | null
  tradingType: string
}

export default function TradeForm({ symbol, predictedDigit, tradingType }: TradeFormProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [amount, setAmount] = useState("10")
  const [duration, setDuration] = useState("5")
  const [durationUnit, setDurationUnit] = useState("t")
  const [contractType, setContractType] = useState("")
  const [barrier, setBarrier] = useState<string | null>(null)
  const [isPlacingTrade, setIsPlacingTrade] = useState(false)
  const [tradeResult, setTradeResult] = useState<any>(null)
  const [tradeError, setTradeError] = useState<string | null>(null)
  const [balances, setBalances] = useState<any[]>([{ balance: 10000, currency: "USD" }]) // Initialize with default balance
  const [useRecommendation, setUseRecommendation] = useState(true)
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Set up event listeners for Deriv API
  useEffect(() => {
    // Handle login events
    derivAPI.onLogin((info) => {
      setIsLoggedIn(!!info)
    })

    // Handle balance updates
    derivAPI.onBalance((balanceData) => {
      if (balanceData && Array.isArray(balanceData) && balanceData.length > 0) {
        setBalances(balanceData)
      }
    })

    // Check if already logged in
    derivAPI.getDiagnosticInfo().then((info) => {
      if (info.isLoggedIn) {
        setIsLoggedIn(true)
      }
    })

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Update contract type based on trading type and predicted digit
  useEffect(() => {
    if (tradingType === "matches-differs") {
      if (predictedDigit !== null) {
        setContractType("DIGITMATCH")
        setBarrier(predictedDigit.toString())
      }
    } else if (tradingType === "over-under") {
      setContractType("DIGITOVER")
      setBarrier(predictedDigit !== null ? predictedDigit.toString() : "5")
    } else if (tradingType === "even-odd") {
      if (predictedDigit !== null) {
        const isEven = predictedDigit % 2 === 0
        setContractType(isEven ? "DIGITEVEN" : "DIGITODD")
        setBarrier(null)
      }
    }
  }, [tradingType, predictedDigit])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setDuration(value)
    }
  }

  const handleContractTypeChange = (value: string) => {
    setContractType(value)

    // Reset barrier for certain contract types
    if (["DIGITEVEN", "DIGITODD"].includes(value)) {
      setBarrier(null)
    } else if (value === "DIGITOVER" || value === "DIGITUNDER") {
      setBarrier("5")
    }
  }

  const handleBarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[0-9]$/.test(value) || value === "") {
      setBarrier(value)
    }
  }

  // Update the placeTrade function to ensure balance updates are properly reflected
  const placeTrade = async () => {
    if (!isLoggedIn) {
      setTradeError("Please log in to your Deriv account first")
      return
    }

    if (!contractType) {
      setTradeError("Please select a contract type")
      return
    }

    if (["DIGITMATCH", "DIGITDIFF", "DIGITOVER", "DIGITUNDER"].includes(contractType) && !barrier) {
      setTradeError("Please enter a digit for your prediction")
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      setTradeError("Please enter a valid amount")
      return
    }

    const durationValue = Number.parseInt(duration)
    if (isNaN(durationValue) || durationValue <= 0) {
      setTradeError("Please enter a valid duration")
      return
    }

    setIsPlacingTrade(true)
    setTradeError(null)
    setTradeResult(null)

    try {
      // Add a delay to simulate API call and prevent race conditions
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Improved error handling with more specific messages
      const response = await derivAPI.placeTrade({
        contract_type: contractType,
        symbol: symbol,
        duration: durationValue,
        duration_unit: durationUnit,
        amount: amountValue,
        basis: "stake",
        barrier: barrier || undefined,
      })

      if (response.error) {
        // More descriptive error message
        setTradeError(response.error.message || "Failed to place trade. Please check your parameters and try again.")
      } else {
        setTradeResult(response.buy)

        // Update the balance immediately to reflect the trade
        if (response.buy && balances.length > 0 && balances[0]) {
          // Create a copy of the current balances
          const updatedBalances = [...balances]
          // Deduct the trade amount from the balance
          const newBalance = updatedBalances[0].balance - amountValue
          updatedBalances[0] = {
            ...updatedBalances[0],
            balance: newBalance,
          }
          // Update the balances state
          setBalances(updatedBalances)

          console.log(`Trade placed: ${amountValue} ${updatedBalances[0].currency}. New balance: ${newBalance}`)
        }

        // Reset form after successful trade
        setAmount("10")
      }
    } catch (error: any) {
      console.error("Trade error:", error)
      // More user-friendly error message
      setTradeError(
        error.error?.message || "Unable to process your trade request. Please try again later or contact support.",
      )
    } finally {
      setIsPlacingTrade(false)
    }
  }

  const formatMoney = (amount: number | undefined, currency: string | undefined) => {
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

  if (!isLoggedIn) {
    return (
      <Card className={isDarkTheme ? "bg-[#131722] border-gray-800" : "bg-white"}>
        <CardHeader>
          <CardTitle className="text-center">Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please log in to your Deriv account to place trades</AlertDescription>
          </Alert>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              // Scroll to account section
              document.getElementById("account-section")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isDarkTheme ? "bg-[#131722] border-gray-800" : "bg-white"}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Place Trade</span>
          {balances.length > 0 && balances[0] ? (
            <div className="text-sm font-normal flex items-center">
              <AmericanFlag className="h-4 w-4 mr-1" />
              Balance: {formatMoney(balances[0].balance, balances[0].currency)}
            </div>
          ) : (
            <div className="text-sm font-normal flex items-center">
              <AmericanFlag className="h-4 w-4 mr-1" />
              Balance: {formatMoney(0, "USD")}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Use Recommendation Switch */}
        <div className="flex items-center justify-between">
          <Label htmlFor="use-recommendation" className="cursor-pointer">
            Use prediction recommendation
          </Label>
          <Switch id="use-recommendation" checked={useRecommendation} onCheckedChange={setUseRecommendation} />
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contract-type">Contract Type</Label>
          <Select value={contractType} onValueChange={handleContractTypeChange} disabled={useRecommendation}>
            <SelectTrigger id="contract-type">
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIGITMATCH">Digit Matches</SelectItem>
              <SelectItem value="DIGITDIFF">Digit Differs</SelectItem>
              <SelectItem value="DIGITOVER">Digit Over</SelectItem>
              <SelectItem value="DIGITUNDER">Digit Under</SelectItem>
              <SelectItem value="DIGITEVEN">Digit Even</SelectItem>
              <SelectItem value="DIGITODD">Digit Odd</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Barrier (for digit contracts) */}
        {["DIGITMATCH", "DIGITDIFF", "DIGITOVER", "DIGITUNDER"].includes(contractType) && (
          <div className="space-y-2">
            <Label htmlFor="barrier">Digit</Label>
            <Input
              id="barrier"
              type="text"
              value={barrier || ""}
              onChange={handleBarrierChange}
              disabled={useRecommendation}
              maxLength={1}
              className={isDarkTheme ? "bg-[#0E0F15] border-gray-700" : ""}
            />
          </div>
        )}

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="duration">Duration</Label>
            <span className="text-sm text-gray-500">
              {duration} {durationUnit === "t" ? "ticks" : "seconds"}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              id="duration"
              type="text"
              value={duration}
              onChange={handleDurationChange}
              className={isDarkTheme ? "bg-[#0E0F15] border-gray-700" : ""}
            />
            <Select value={durationUnit} onValueChange={setDurationUnit}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t">Ticks</SelectItem>
                <SelectItem value="s">Seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stake Amount */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="amount">Stake Amount</Label>
            <span className="text-sm text-gray-500">
              {balances.length > 0 && balances[0] ? balances[0].currency : "USD"} {amount}
            </span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[Number.parseFloat(amount) || 0]}
              min={1}
              max={100}
              step={1}
              onValueChange={(value) => setAmount(value[0].toString())}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("10")}>
                10
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("25")}>
                25
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("50")}>
                50
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setAmount("100")}>
                100
              </Button>
            </div>
          </div>
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className={isDarkTheme ? "bg-[#0E0F15] border-gray-700" : ""}
          />
        </div>

        {/* Trade Button */}
        <Button className="w-full" onClick={placeTrade} disabled={isPlacingTrade}>
          {isPlacingTrade ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Trade...
            </>
          ) : (
            `Buy ${contractType.replace("DIGIT", "")} Contract`
          )}
        </Button>

        {/* Trade Result */}
        {tradeResult && (
          <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Trade placed successfully! Contract ID: {tradeResult.contract_id}</AlertDescription>
          </Alert>
        )}

        {/* Trade Error */}
        {tradeError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{tradeError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
