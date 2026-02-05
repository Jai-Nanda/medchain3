"use client"

import useSWR, { mutate } from "swr"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import TopNav from "@/components/top-nav"
import { getCurrentUser, logout, listMyPermissions, getPatientHistory, getLedger, verifyChain, getSessionUserHydrated } from "@/lib/ledger"
import RecordUpload from "@/components/dashboard/record-upload"
import DoctorUpdate from "@/components/dashboard/doctor-update"
import HistoryList from "@/components/dashboard/history-list"
import PermissionsPanel from "@/components/dashboard/permissions"
import LedgerView from "@/components/dashboard/ledger-view"
import Profile from "@/components/dashboard/profile"
import InsuranceListing from "@/components/dashboard/insurance"
import PrescriptionsPanel from "@/components/dashboard/prescriptions"
import DoctorPrescriptionsPanel from "@/components/dashboard/doctor-prescriptions"
import { useMemo, useState, useEffect } from "react"
import type { User } from "@/lib/types"

const fetcher = async (key: string, ...args: any[]) => {
  switch (key) {
    case "me":
      // Try to get hydrated user data from DB first
      const hydratedUser = await getSessionUserHydrated()
      if (hydratedUser) {
        console.log("Fetcher: Got hydrated user:", hydratedUser);
        return hydratedUser;
      }
      // Fall back to cached user
      const cachedUser = getCurrentUser()
      console.log("Fetcher: Got cached user:", cachedUser);
      return cachedUser
    default:
      return null
  }
}

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: me } = useSWR<User | null>("me", fetcher)
  const { data: perms } = useSWR<any>(me ? ["perms", me.id] : null, listMyPermissions)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Move all data fetching hooks to the top level
  const patients = useMemo(() => {
    if (!me || !perms) return []
    if (me?.role === "patient") return [me]
    return perms?.patients || []
  }, [me, perms])

  const activePatientId = useMemo(
    () => selectedPatientId || (patients[0]?.id ?? null),
    [selectedPatientId, patients],
  )

  const { data: history } = useSWR(
    activePatientId ? ["history", activePatientId] : null,
    async () => (activePatientId ? getPatientHistory(activePatientId) : null),
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Dashboard useEffect - me:", me);
      
      // Only redirect if we're certain there's no user (not just undefined/loading)
      if (me === null) {
        console.log("No user found, redirecting to home");
        router.replace("/")
      } else if (me) {
        console.log("User found in dashboard:", me);
        // Check for stored user data from signup
        const storedUserData = localStorage.getItem('medchain-user-data')
        if (storedUserData) {
          const userData = JSON.parse(storedUserData)
          toast({
            title: 'Welcome to your Dashboard!',
            description: `Name: ${userData.name}\nEmail: ${userData.email}\nRole: ${userData.role}${userData.walletAddress ? '\nWallet: ' + userData.walletAddress : ''}`,
            duration: 5000
          })
          // Clear the stored data after showing
          localStorage.removeItem('medchain-user-data')
        }
      }
    }
  }, [me, router, toast])
  const { data: ledger } = useSWR(
    activePatientId ? ["ledger", activePatientId] : null,
    async () => (activePatientId ? getLedger(activePatientId) : null),
  )
  const verified = useMemo(() => (ledger ? verifyChain(ledger) : null), [ledger])

  // Early return after all hooks
  if (me === undefined) return null
  if (!me) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TopNav
        me={me!}
        onLogout={() => {
          logout()
          mutate("me")
          router.replace("/")
        }}
      />

      <div className="mx-auto max-w-6xl p-6 grid gap-6">
        <div className="grid gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#2596be]/20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2596be] to-[#1a7a9e] bg-clip-text text-transparent">
                Welcome, {me.name}!
              </h1>
              <p className="text-muted-foreground text-sm">
                {me.role === "patient" 
                  ? "Manage your medical records securely on the blockchain" 
                  : "Access and update your patients' medical records securely"}
              </p>
            </div>
          </div>
        </div>
        <Card className="shadow-xl border-2 border-[#2596be]/20">
          <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
            <CardTitle className="text-balance text-2xl text-[#2596be]">Dashboard</CardTitle>
            <CardDescription className="text-pretty">
              {me?.role === "patient"
                ? "Upload your reports, manage who can access them, and audit your tamper-evident history."
                : "View patients who granted access, add verified updates, and audit their history."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Enable patient selector for doctors */}
            {me?.role === "doctor" && (
              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm">Select patient:</label>
                <select
                  className="border rounded-md px-2 py-1 bg-background"
                  value={activePatientId ?? ""}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Tabs defaultValue="records" className="w-full">
              <TabsList className="flex flex-wrap bg-blue-50/50 p-1">
                <TabsTrigger value="records" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Records
                </TabsTrigger>
                <TabsTrigger value="permissions" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Access
                </TabsTrigger>
                <TabsTrigger value="ledger" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Ledger
                </TabsTrigger>
                {me?.role === "doctor" && (
                  <TabsTrigger value="prescriptions" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Prescriptions
                  </TabsTrigger>
                )}
                {me?.role === "patient" && (
                  <>
                    <TabsTrigger value="prescriptions" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=active]:shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Insurance
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="records" className="pt-4 grid gap-4 md:grid-cols-2">
                <Card className="order-2 md:order-1">
                  <CardHeader>
                    <CardTitle>History</CardTitle>
                    <CardDescription>
                      {me?.role === "patient" 
                        ? "All reports and updates" 
                        : "Patient-uploaded reports you have access to"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HistoryList items={history ?? []} />
                  </CardContent>
                </Card>

                <Card className="order-1 md:order-2">
                  <CardHeader>
                    <CardTitle>{me?.role === "patient" ? "Upload report" : "Add doctor update"}</CardTitle>
                    <CardDescription>
                      {me?.role === "patient"
                        ? "Upload a medical report. A new ledger block will be appended."
                        : "Add a verified note/update for the selected patient."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {me?.role === "patient" ? (
                      <RecordUpload
                        patientId={me.id}
                        onDone={() => {
                          mutate(["history", me.id])
                          mutate(["ledger", me.id])
                        }}
                      />
                    ) : (
                      <DoctorUpdate
                        doctorId={me!.id}
                        patientId={activePatientId ?? ""}
                        canUpdate={Boolean(activePatientId)}
                        onDone={() => {
                          // Always use the latest activePatientId
                          if (activePatientId) {
                            mutate(["history", activePatientId])
                            mutate(["ledger", activePatientId])
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="pt-4">
                <PermissionsPanel
                  me={me!}
                  onChanged={() => {
                    mutate(["perms", me!.id])
                  }}
                />
              </TabsContent>

              <TabsContent value="ledger" className="pt-4">
                <LedgerView
                  blocks={ledger ?? []}
                  verified={verified?.ok ?? false}
                  failures={verified?.failures ?? []}
                />
              </TabsContent>

              {/* Prescriptions Tab - For Doctors */}
              {me?.role === "doctor" && (
                <TabsContent value="prescriptions" className="pt-4">
                  <DoctorPrescriptionsPanel 
                    doctorId={me.id} 
                    patientId={activePatientId ?? ""} 
                  />
                </TabsContent>
              )}

              {/* Prescriptions Tab - Only for Patients */}
              {me?.role === "patient" && (
                <TabsContent value="prescriptions" className="pt-4">
                  <PrescriptionsPanel patientId={me.id} />
                </TabsContent>
              )}

              {/* Profile Tab - Only for Patients */}
              {me?.role === "patient" && (
                <TabsContent value="profile" className="pt-4">
                  <Profile 
                    user={me!}
                    onUpdate={(updatedUser) => {
                      // Refresh user data after update
                      mutate("me")
                      toast({
                        title: "Profile updated",
                        description: "Your profile has been updated successfully."
                      })
                    }}
                  />
                </TabsContent>
              )}

              {/* Insurance Tab - Only for Patients */}
              {me?.role === "patient" && (
                <TabsContent value="insurance" className="pt-4">
                  <InsuranceListing />
                </TabsContent>
              )}

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
