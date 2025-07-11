"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"

export function TermsAndConditions({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl ${isDarkTheme ? "bg-gray-900 text-white" : "bg-white"}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            Terms and Conditions
          </DialogTitle>
          <DialogDescription>Please read these terms carefully before using Deriv Analysis</DialogDescription>
        </DialogHeader>

        <div className={`border-t ${isDarkTheme ? "border-gray-700" : "border-gray-200"} my-2`}></div>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm">
                Please read these Terms and Conditions ("Terms") carefully before using Deriv Analysis Software ("Deriv
                Analysis"). These Terms outline the terms of use, limitations, and legal responsibilities associated
                with using Deriv Analysis. By accessing or using Deriv Analysis, you agree to comply with these Terms.
                If you do not agree with these Terms, please refrain from using Deriv Analysis.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-purple-500 dark:text-purple-400">Risk Acknowledgment</h3>
              <p className="text-sm">
                Trading binary options involves significant risk and may not be suitable for all investors. Users of
                Deriv Analysis acknowledge that trading activities are subject to market fluctuations, financial risks,
                and potential loss of funds. It is essential to understand the risks associated with trading and to seek
                professional advice before engaging in any trading activities.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-400">No Investment Advice</h3>
              <p className="text-sm">
                Deriv Analysis does not provide investment advice, recommendations, or endorsements. The software is
                designed for binary analysis and informational purposes only. Users are solely responsible for their
                trading decisions and should not rely solely on Deriv Analysis's analysis for making trading choices.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-500 dark:text-red-400">Illegal Distribution</h3>
              <p className="text-sm">
                The distribution of Deriv Analysis, including its software, documentation, or any associated materials,
                without explicit authorization from the rightful owner is illegal and strictly prohibited. Unauthorized
                distribution may result in legal action, including but not limited to criminal prosecution, with
                penalties that may include fines and imprisonment.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-teal-500 dark:text-teal-400">Intellectual Property</h3>
              <p className="text-sm">
                Deriv Analysis, its logo, software, documentation, and any other related materials are protected by
                intellectual property laws and regulations. Users may not modify, copy, reproduce, distribute, or create
                derivative works from Deriv Analysis's materials without the prior written consent of the rightful
                owner.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-500 dark:text-amber-400">No Warranty</h3>
              <p className="text-sm">
                Deriv Analysis is provided "as is" without any warranties, representations, or guarantees of any kind,
                either express or implied. The creators of Deriv Analysis disclaim all warranties, including but not
                limited to the accuracy, reliability, and fitness for a particular purpose of the software and its
                analysis.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-indigo-500 dark:text-indigo-400">Limitation of Liability</h3>
              <p className="text-sm">
                To the extent permitted by law, the creators of Deriv Analysis shall not be liable for any direct,
                indirect, incidental, special, or consequential damages arising from the use or inability to use Deriv
                Analysis, including but not limited to trading losses, data loss, or financial damages.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-pink-500 dark:text-pink-400">Indemnification</h3>
              <p className="text-sm">
                Users agree to indemnify, defend, and hold harmless the creators of Deriv Analysis from any claims,
                losses, liabilities, damages, costs, and expenses (including legal fees) arising out of or related to
                the use or misuse of Deriv Analysis.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-500 dark:text-green-400">
                Governing Law and Jurisdiction
              </h3>
              <p className="text-sm">
                These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising
                from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of
                Kenya.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-orange-500 dark:text-orange-400">Changes to Terms</h3>
              <p className="text-sm">
                The creators of Deriv Analysis reserve the right to modify or revise these Terms at any time without
                prior notice. It is the user's responsibility to regularly review these Terms for any updates.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium">
                By using Deriv Analysis, you acknowledge that you have read, understood, and agreed to these Terms and
                Conditions. If you do not agree with any part of these Terms, please refrain from using Deriv Analysis.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            I Understand and Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
