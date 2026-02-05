"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAllDoctors, getAllPatients, grantAccess, revokeAccess, listMyPermissions } from "@/lib/ledger"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function PermissionsPanel({
  me,
  onChanged,
}: {
  me: User
  onChanged?: () => void
}) {
  const { toast } = useToast()
  const { data: perms, mutate: refreshPerms } = useSWR(["perms", me.id], async () => listMyPermissions())
  const [query, setQuery] = useState("")

  const { data: list } = useSWR(me.role === "patient" ? ["doctors", query] : ["patients", query], async () => {
    const q = query.trim().toLowerCase()
    if (me.role === "patient") {
      const all = await getAllDoctors()
      return all.filter((d) => d.email.toLowerCase().includes(q) || d.name.toLowerCase().includes(q))
    } else {
      const all = await getAllPatients()
      return all.filter((p) => p.email.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-2 border-[#2596be]/20">
        <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <CardTitle className="text-[#2596be]">Current Access</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refreshPerms()
                toast({
                  title: "Refreshed",
                  description: "Access list updated"
                })
              }}
              className="text-[#2596be] hover:text-[#1a7a9e] hover:bg-blue-50"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
          <CardDescription>
            {me.role === "patient"
              ? "Doctors with blockchain-verified access to your medical records."
              : "Patients who granted you access via smart contract."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!perms || (me.role === "patient" ? perms?.doctors : perms?.patients)?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                {me.role === "patient" ? "No doctors have access yet" : "No patients granted access yet"}
              </p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {(me.role === "patient" ? perms?.doctors : perms?.patients)?.map((u: any) => (
                <li key={u.id} className="border-2 border-[#2596be]/20 rounded-lg p-3 hover:border-[#2596be]/40 transition-colors bg-gradient-to-r from-blue-50/50 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-sm">{u.name}</div>
                          <Badge variant="secondary" className="bg-[#2596be]/10 text-[#2596be] text-xs">
                            {u.role === "doctor" ? "Doctor" : "Patient"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{u.email}</div>
                        {u.walletAddress && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="truncate">{u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {me.role === "patient" ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          toast({
                            title: "Revoking access...",
                            description: "Processing blockchain transaction"
                          })
                          await revokeAccess(me.id, u.id)
                          mutate(["perms", me.id])
                          onChanged?.()
                          toast({
                            title: "Access revoked",
                            description: `${u.name} can no longer view your records`
                          })
                        }}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        ✓ Active
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-[#2596be]/20">
        <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <CardTitle className="text-[#2596be]">{me.role === "patient" ? "Grant Access" : "Available Patients"}</CardTitle>
          </div>
          <CardDescription>
            {me.role === "patient" 
              ? "Search and grant blockchain-verified access to doctors" 
              : "Search patients by name or email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder={me.role === "patient" ? "Search doctors by name or email..." : "Search patients..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 border-[#2596be]/30 focus:border-[#2596be]"
              />
            </div>
          </div>
          {!list || list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No {me.role === "patient" ? "doctors" : "patients"} found</p>
            </div>
          ) : (
            <ul className="grid gap-3 max-h-[400px] overflow-y-auto">
              {list?.map((u: any) => {
                const hasAccess = me.role === "patient" 
                  ? perms?.doctors?.some((d: any) => d.id === u.id)
                  : perms?.patients?.some((p: any) => p.id === u.id)
                
                return (
                  <li key={u.id} className="border-2 border-[#2596be]/20 rounded-lg p-3 hover:border-[#2596be]/40 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-sm">{u.name}</div>
                            <Badge variant="secondary" className="bg-[#2596be]/10 text-[#2596be] text-xs">
                              {u.role === "doctor" ? "Doctor" : "Patient"}
                            </Badge>
                            {hasAccess && (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                ✓ Has Access
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{u.email}</div>
                          {u.walletAddress && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <span className="truncate">{u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {me.role === "patient" ? (
                        hasAccess ? (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            ✓ Granted
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#2596be] to-[#1a7a9e] hover:from-[#1a7a9e] hover:to-[#2596be] text-white"
                            onClick={async () => {
                              toast({
                                title: "Granting access...",
                                description: "Creating blockchain transaction"
                              })
                              await grantAccess(me.id, u.id)
                              mutate(["perms", me.id])
                              onChanged?.()
                              toast({
                                title: "Access granted!",
                                description: `${u.name} can now view your medical records and profile via smart contract`
                              })
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Grant Access
                          </Button>
                        )
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          View Only
                        </Badge>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
