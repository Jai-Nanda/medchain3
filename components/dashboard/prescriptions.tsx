"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPrescriptions } from "@/lib/ledger"
import type { Prescription } from "@/lib/types"
import { ClientDate } from "./ClientDate"

export default function PrescriptionsPanel({ patientId }: { patientId: string }) {
  const { data: prescriptions, mutate: refreshPrescriptions } = useSWR(
    ["prescriptions", patientId],
    async () => getPrescriptions(patientId)
  )

  return (
    <Card className="border-2 border-[#2596be]/20">
        <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle className="text-[#2596be]">My Prescriptions</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshPrescriptions()}
              className="text-[#2596be] hover:text-[#1a7a9e] hover:bg-blue-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
          <CardDescription>
            View and manage your prescription records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!prescriptions || prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No prescriptions yet. Add your first prescription to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border-2 border-[#2596be]/20 rounded-lg p-4 hover:border-[#2596be]/40 transition-colors bg-gradient-to-r from-blue-50/50 to-transparent"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-[#2596be]">{prescription.medication}</h3>
                        <Badge variant="secondary" className="bg-[#2596be]/10 text-[#2596be]">
                          {prescription.doctorName}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage:</span>
                          <span className="ml-2 font-medium">{prescription.dosage}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="ml-2 font-medium">{prescription.frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-2 font-medium">{prescription.duration}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Added:</span>
                          <span className="ml-2 font-medium">
                            <ClientDate timestamp={prescription.createdAt} />
                          </span>
                        </div>
                      </div>
                      {prescription.instructions && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Instructions:</span>
                          <p className="mt-1 text-sm bg-blue-50 p-2 rounded">{prescription.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
  )
}
