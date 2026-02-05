"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { addPrescription, getPrescriptions, removePrescription } from "@/lib/ledger"
import { getUserById } from "@/lib/db"
import type { Prescription, User } from "@/lib/types"
import { ClientDate } from "./ClientDate"

export default function DoctorPrescriptionsPanel({ 
  doctorId, 
  patientId 
}: { 
  doctorId: string
  patientId: string 
}) {
  const { toast } = useToast()
  const { data: prescriptions, mutate: refreshPrescriptions } = useSWR(
    patientId ? ["prescriptions", patientId] : null,
    async () => patientId ? getPrescriptions(patientId) : []
  )

  const { data: patient } = useSWR(
    patientId ? ["patient", patientId] : null,
    async () => patientId ? getUserById(patientId) : null
  )

  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.medication || !formData.dosage || !formData.frequency || !formData.duration) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await addPrescription(doctorId, patientId, formData)
      toast({
        title: "Prescription added",
        description: "Prescription has been saved successfully",
      })
      setFormData({
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      })
      setIsAdding(false)
      refreshPrescriptions()
      mutate(["ledger", patientId])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add prescription",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (prescriptionId: string) => {
    try {
      await removePrescription(prescriptionId, patientId)
      toast({
        title: "Prescription removed",
        description: "The prescription has been deleted",
      })
      refreshPrescriptions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove prescription",
        variant: "destructive",
      })
    }
  }

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Please select a patient to manage prescriptions</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {/* Patient Info Card */}
      {patient && (
        <Card className="border-2 border-[#2596be]/20 bg-gradient-to-r from-blue-50/50 to-transparent">
          <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center text-white font-semibold text-lg">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <CardTitle className="text-[#2596be]">{patient.name}</CardTitle>
                <CardDescription>Patient Information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#2596be]/20">
                  <svg className="w-4 h-4 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">{patient.email}</span>
                </div>
              </div>
              
              {patient.walletAddress && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">MetaMask Wallet Address</Label>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#2596be]/20">
                    <svg className="w-4 h-4 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm font-mono truncate">{patient.walletAddress}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Add Prescription Form */}
        <Card className="border-2 border-[#2596be]/20">
          <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <CardTitle className="text-[#2596be]">Add Prescription</CardTitle>
            </div>
            <CardDescription>
              Create a new prescription for {patient?.name || "this patient"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAdding ? (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full bg-gradient-to-r from-[#2596be] to-[#1a7a9e] hover:from-[#1a7a9e] hover:to-[#2596be] text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Prescription
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication Name *</Label>
                  <Input
                    id="medication"
                    placeholder="e.g., Amoxicillin"
                    value={formData.medication}
                    onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                    className="border-[#2596be]/30 focus:border-[#2596be]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="border-[#2596be]/30 focus:border-[#2596be]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., 3 times daily"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="border-[#2596be]/30 focus:border-[#2596be]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 7 days"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="border-[#2596be]/30 focus:border-[#2596be]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g., Take after meals"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="border-[#2596be]/30 focus:border-[#2596be] min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#2596be] to-[#1a7a9e] hover:from-[#1a7a9e] hover:to-[#2596be] text-white"
                  >
                    Save Prescription
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setFormData({
                        medication: "",
                        dosage: "",
                        frequency: "",
                        duration: "",
                        instructions: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Card className="border-2 border-[#2596be]/20">
          <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-[#2596be]">Patient Prescriptions</CardTitle>
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
              View and manage prescriptions for this patient
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
                <p className="text-sm text-muted-foreground">No prescriptions yet. Add the first prescription for this patient.</p>
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
                            Dr. {prescription.doctorName}
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
                            <span className="text-muted-foreground">Prescribed:</span>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(prescription.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
