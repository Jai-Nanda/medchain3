"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { createAccount, login, getCurrentUser, getUserByEmail } from "@/lib/ledger"
import { MetaMaskAuth } from "@/components/metamask-auth"
import { ClientOnly } from "@/components/client-only"

// Main home component
export default function Home() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const me = getCurrentUser()
    if (me) router.replace("/dashboard")
  }, [router])

  return (
    <ClientOnly>
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Card className="w-full max-w-xl shadow-2xl border-2 border-[#2596be]/20">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <CardTitle className="text-balance text-3xl font-bold bg-gradient-to-r from-[#2596be] to-[#1a7a9e] bg-clip-text text-transparent">
                MedChain
              </CardTitle>
            </div>
            <CardDescription className="text-pretty text-base">
              Secure medical records on blockchain. Patients own their data, doctors add verified updates with tamper-evident history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid grid-cols-2 bg-blue-50/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white">Sign in</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="pt-4">
                <SigninForm
                  onSuccess={() => {
                    // Use window.location to force a full page reload
                    // This ensures the dashboard properly loads with user data
                    window.location.href = "/dashboard"
                  }}
                />
              </TabsContent>
              <TabsContent value="signup" className="pt-4">
                <SignupForm
                  onSuccess={() => {
                    toast({ title: "Account created" })
                    // Use window.location to force a full page reload
                    window.location.href = "/dashboard"
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </ClientOnly>
  )
}

function SigninForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>I am a</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={role === "patient" ? "default" : "outline"}
            onClick={() => setRole("patient")}
            className={role === "patient" ? "bg-gradient-to-r from-[#2596be] to-[#1a7a9e] text-white" : "border-[#2596be] text-[#2596be] hover:bg-blue-50"}
          >
            Patient
          </Button>
          <Button 
            type="button" 
            variant={role === "doctor" ? "default" : "outline"}
            onClick={() => setRole("doctor")}
            className={role === "doctor" ? "bg-gradient-to-r from-[#2596be] to-[#1a7a9e] text-white" : "border-[#2596be] text-[#2596be] hover:bg-blue-50"}
          >
            Doctor
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="metamask-email">Email for MetaMask login</Label>
        <Input 
          id="metamask-email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email to connect with MetaMask"
          className="mb-2"
        />
        <MetaMaskAuth 
          role={role}
          disabled={!email.trim()}
          onSuccess={async (address) => {
            if (!email) {
              toast({ 
                title: "Email required", 
                description: "Please enter your email address",
                variant: "destructive" 
              })
              return
            }
            try {
              console.log("Attempting login with:", { email: email.trim(), address });
              const ok = await login(email.trim(), undefined, address)
              console.log("Login result:", ok);
              if (!ok) {
                toast({ 
                  title: "Authentication failed", 
                  description: "No account found with this email and wallet combination",
                  variant: "destructive" 
                })
              } else {
                // Wait a bit to ensure localStorage is fully written
                await new Promise(resolve => setTimeout(resolve, 150));
                
                const user = getCurrentUser()
                console.log("Current user after login:", user);
                toast({ 
                  title: "Welcome back!", 
                  description: `Logged in as ${user?.name || 'User'}`,
                })
                
                // Force navigation to dashboard
                onSuccess()
              }
            } catch (error: any) {
              toast({ 
                title: "Sign in failed", 
                description: error.message || "Please try again",
                variant: "destructive" 
              })
            }
          }} 
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          try {
            const ok = await login(email.trim(), password)
            if (!ok) {
              toast({ title: "Invalid credentials", variant: "destructive" })
            } else {
              onSuccess()
            }
          } catch {
            toast({ title: "Sign in failed", variant: "destructive" })
          } finally {
            setLoading(false)
          }
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Signing in..." : "Sign in with Email"}
        </Button>
      </form>
    </div>
  )
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [loading, setLoading] = useState(false)
  const [useMetaMask, setUseMetaMask] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Role</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={role === "patient" ? "default" : "secondary"}
            onClick={() => setRole("patient")}
          >
            Patient
          </Button>
          <Button 
            type="button" 
            variant={role === "doctor" ? "default" : "secondary"} 
            onClick={() => setRole("doctor")}
          >
            Doctor
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Authentication Method</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={!useMetaMask ? "default" : "secondary"}
            onClick={() => setUseMetaMask(false)}
          >
            Password
          </Button>
          <Button 
            type="button" 
            variant={useMetaMask ? "default" : "secondary"} 
            onClick={() => setUseMetaMask(true)}
          >
            MetaMask
          </Button>
        </div>
      </div>

      {useMetaMask ? (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email2">Email</Label>
            <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <MetaMaskAuth 
            role={role}
            disabled={!(name.trim() && email.trim())}
            onSuccess={async (address) => {
              setLoading(true)
              try {
                // Validate inputs
                if (!name.trim() || !email.trim() || !address) {
                  throw new Error("Please fill in all required fields")
                }

                console.log("Creating account with:", {
                  name: name.trim(),
                  email: email.trim(),
                  role,
                  walletAddress: address
                });

                // Create account
                await createAccount({ 
                  name: name.trim(), 
                  email: email.trim(), 
                  role,
                  walletAddress: address 
                })

                // Verify account was created
                const user = await getUserByEmail(email.trim())
                console.log("Newly created user:", user);

                if (!user || user.authMethod !== 'metamask' || !user.walletAddress) {
                  throw new Error("Account creation failed - MetaMask data missing")
                }

                // Store the user data
                localStorage.setItem('medchain-user-data', JSON.stringify({
                  name: name.trim(),
                  email: email.trim(),
                  role,
                  walletAddress: address
                }));

                // Wait for localStorage to be written
                await new Promise(resolve => setTimeout(resolve, 150));
                
                // Show success message
                toast({ 
                  title: "Account created successfully!", 
                  description: `Welcome ${name.trim()}! You are registered as a ${role}.`
                })
                
                // Force full page reload to dashboard
                window.location.href = "/dashboard"
              } catch (err: any) {
                const msg = err?.message || "Sign up failed"
                toast({ title: msg, variant: "destructive" })
              } finally {
                setLoading(false)
              }
            }} 
          />
        </div>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            try {
              await createAccount({ 
                name: name.trim(), 
                email: email.trim(), 
                password: password!, 
                role 
              })
              onSuccess()
            } catch (err: any) {
              const msg = err?.message || "Sign up failed"
              toast({ title: msg, variant: "destructive" })
            } finally {
              setLoading(false)
            }
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email2">Email</Label>
            <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password2">Password</Label>
            <Input id="password2" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
      )}
    </div>
  )
}
