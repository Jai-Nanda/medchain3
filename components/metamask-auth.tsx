'use client'

import React from 'react'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { ClientOnly } from "@/components/client-only"
import detectEthereumProvider from '@metamask/detect-provider'

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: Array<any> }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
      removeAllListeners: (event?: string) => void
      selectedAddress?: string | null
      chainId?: string
    }
  }
}

interface MetaMaskAuthProps {
  role: "patient" | "doctor"
  onSuccess: (address: string) => void
  disabled?: boolean
}

function MetaMaskAuthContent({ role, onSuccess, disabled }: MetaMaskAuthProps): React.ReactElement {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for MetaMask on mount
    const checkMetaMask = async () => {
      try {
        const provider = await detectEthereumProvider({ mustBeMetaMask: true, timeout: 1000, silent: true })
        if (provider) {
          setHasMetaMask(true)

          // Handle account changes
          const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
              toast({
                title: "Account disconnected",
                description: "Please reconnect your MetaMask wallet",
                variant: "destructive"
              })
            }
          }

          // Handle chain changes
          const handleChainChanged = (_chainId: string) => {
            window.location.reload()
          }

          const ethereum = provider as any
          ethereum.on('accountsChanged', handleAccountsChanged)
          ethereum.on('chainChanged', handleChainChanged)

          return () => {
            // Only remove the specific listeners we added
            try {
              ethereum.removeListener('accountsChanged', handleAccountsChanged)
              ethereum.removeListener('chainChanged', handleChainChanged)
            } catch (err) {
              // Ignore cleanup errors
            }
          }
        }
      } catch (err) {
        // Silent fail - MetaMask not installed
      }
    }

    checkMetaMask()
  }, [toast])

  const connectWallet = async () => {
    if (loading) return; // Prevent multiple clicks
    
    console.log('🦊 Starting MetaMask connection...')
    setLoading(true)
    setError(null)
    
    try {
      // Detect MetaMask provider properly with error handling for message channel issues
      let detectedProvider: any
      try {
        detectedProvider = await detectEthereumProvider({ mustBeMetaMask: true, timeout: 3000 })
      } catch (detectError: any) {
        // Handle message channel errors during detection
        if (detectError.message?.includes('message channel')) {
          console.warn('⚠️ Message channel error during detection, using window.ethereum')
          detectedProvider = (window as any).ethereum
        } else {
          throw detectError
        }
      }
      
      if (!detectedProvider) {
        console.error('❌ MetaMask not found')
        toast({ 
          title: "MetaMask not found",
          description: (
            <div className="flex flex-col gap-2">
              <p>Please install MetaMask browser extension</p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Download MetaMask
              </a>
            </div>
          ),
          duration: 5000,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Use the detected provider
      const provider = detectedProvider
      console.log('✅ MetaMask provider found:', provider.isMetaMask)
      
      if (!provider.isMetaMask) {
        console.error('❌ Provider is not MetaMask')
        toast({ 
          title: "MetaMask not detected",
          description: "Please use the MetaMask browser extension",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Skip network checks to avoid message channel errors
      // The app works on any Ethereum-compatible network

      // First check if already connected
      let accounts: string[] = []
      try {
        accounts = await provider.request({ method: 'eth_accounts' }) as string[]
        console.log('📋 Existing accounts:', accounts.length)
      } catch (err) {
        console.log('No existing accounts, will request access')
      }
      
      // If no accounts, request access - this should trigger MetaMask popup
      if (!accounts || accounts.length === 0) {
        console.log('🔐 Requesting account access...')
        
        // Show toast before request to inform user
        toast({
          title: "Check MetaMask",
          description: "Please check your browser for the MetaMask popup and approve the connection request.",
          duration: 8000
        })
        
        // Request accounts - this MUST be triggered by user interaction
        try {
          accounts = await provider.request({ 
            method: 'eth_requestAccounts'
          }) as string[]
          console.log('✅ Accounts received:', accounts.length)
        } catch (requestError: any) {
          // Handle specific MetaMask errors
          if (requestError.code === 4001) {
            throw new Error('User rejected the connection request')
          } else if (requestError.code === -32002) {
            throw new Error('A connection request is already pending. Please check MetaMask.')
          } else if (requestError.message?.includes('popup')) {
            throw new Error('MetaMask popup was blocked. Please allow popups for this site and try again.')
          }
          throw requestError
        }
      } else {
        console.log('✅ Using existing connected accounts')
      }

      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("No accounts found. Please make sure your wallet is unlocked.")
      }

      // Get the connected wallet address
      const address = accounts[0]
      console.log('👛 Connected address:', address)

      // Create a message to sign
      const message = `Sign this message to authenticate with MedChain as ${role}\nTimestamp: ${Date.now()}`
      
      // Request signature from user
      console.log('✍️ Requesting signature...')
      toast({
        title: "Sign the message",
        description: "Please sign the authentication message in MetaMask.",
        duration: 8000
      })
      
      let signature: string
      try {
        signature = await provider.request({
          method: 'personal_sign',
          params: [message, address]
        }) as string
      } catch (signError: any) {
        if (signError.code === 4001) {
          throw new Error('User rejected the signature request')
        } else if (signError.message?.includes('popup')) {
          throw new Error('MetaMask popup was blocked. Please allow popups for this site and try again.')
        }
        throw signError
      }

      if (!signature) {
        console.error('❌ No signature received')
        throw new Error("Failed to sign message")
      }
      
      console.log('✅ Signature received')

      // Verify signature
      console.log('🔍 Verifying signature...')
      const signerAddr = ethers.utils.verifyMessage(message, signature)
      console.log('✅ Signature verified, signer:', signerAddr)

      // Verify the recovered address matches the connected address
      if (signerAddr.toLowerCase() !== address.toLowerCase()) {
        console.error('❌ Address mismatch:', signerAddr, 'vs', address)
        throw new Error("Signature verification failed")
      }
    
      // Success - verified signature matches the address
      console.log('🎉 Authentication successful!')
      onSuccess(address)
    } catch (error: any) {
      console.error('❌ Connection error:', error)
      const errorMessage = error.message || "An unknown error occurred"
      setError(errorMessage)
      
      // Check for user rejection
      if (error.code === 4001) {
        toast({ 
          title: "Connection cancelled",
          description: "You cancelled the MetaMask connection request.",
          variant: "destructive"
        })
      } else if (error.code === -32002) {
        toast({ 
          title: "Request pending",
          description: "Please check MetaMask - there's already a pending connection request.",
          variant: "destructive",
          duration: 10000
        })
      } else if (errorMessage.includes('popup')) {
        toast({ 
          title: "Popup blocked",
          description: "Please allow popups for this site in your browser settings and try again.",
          variant: "destructive",
          duration: 10000
        })
      } else {
        toast({ 
          title: "Connection failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Reset error state when starting a new connection attempt
  useEffect(() => {
    if (loading) {
      setError(null)
    }
  }, [loading])

  if (!hasMetaMask) {
    return (
      <a 
        href="https://metamask.io/download/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full"
      >
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34.0125 1L19.7625 10.7833L22.1958 5.03333L34.0125 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 1L15.1583 10.8667L12.8167 5.03333L1 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M29.0792 23.5833L25.4125 28.9333L33.2625 31L35.4875 23.75L29.0792 23.5833Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M0.5625 23.75L2.77917 31L10.6292 28.9333L6.97083 23.5833L0.5625 23.75Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Install MetaMask
        </Button>
      </a>
    )
  }

  return (
    <Button 
      onClick={connectWallet} 
      disabled={loading}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Connecting...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34.0125 1L19.7625 10.7833L22.1958 5.03333L34.0125 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 1L15.1583 10.8667L12.8167 5.03333L1 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M29.0792 23.5833L25.4125 28.9333L33.2625 31L35.4875 23.75L29.0792 23.5833Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M0.5625 23.75L2.77917 31L10.6292 28.9333L6.97083 23.5833L0.5625 23.75Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Connect with MetaMask
        </>
      )}
    </Button>
  )
}

export function MetaMaskAuth(props: MetaMaskAuthProps) {
  return (
    <ClientOnly>
      <MetaMaskAuthContent {...props} />
    </ClientOnly>
  )
}