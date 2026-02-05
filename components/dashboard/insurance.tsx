"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InsuranceCompany {
  id: string
  name: string
  logo: string
  description: string
  ageGroups: string[]
  coverage: string
  premium: string
  rating: number
  features: string[]
  contactEmail: string
  contactPhone: string
}

const insuranceCompanies: InsuranceCompany[] = [
  {
    id: "1",
    name: "HealthGuard Plus",
    logo: "🏥",
    description: "Comprehensive health coverage for all ages with 24/7 support",
    ageGroups: ["0-18", "19-35", "36-50", "51-65", "65+"],
    coverage: "Up to ₹50 Lakhs",
    premium: "₹8,500/year",
    rating: 4.8,
    features: ["Cashless hospitalization", "Pre & post hospitalization", "Ambulance coverage", "No claim bonus"],
    contactEmail: "support@healthguardplus.com",
    contactPhone: "+91-1800-123-4567"
  },
  {
    id: "2",
    name: "MediCare Shield",
    logo: "🛡️",
    description: "Affordable insurance plans for young professionals",
    ageGroups: ["19-35", "36-50"],
    coverage: "Up to ₹25 Lakhs",
    premium: "₹5,200/year",
    rating: 4.5,
    features: ["OPD coverage", "Mental health support", "Wellness programs", "Telemedicine"],
    contactEmail: "care@medicareshield.com",
    contactPhone: "+91-1800-234-5678"
  },
  {
    id: "3",
    name: "Senior Care Insurance",
    logo: "👴",
    description: "Specialized coverage for senior citizens with chronic disease management",
    ageGroups: ["51-65", "65+"],
    coverage: "Up to ₹30 Lakhs",
    premium: "₹12,000/year",
    rating: 4.7,
    features: ["Chronic disease cover", "Home healthcare", "Nursing care", "Pharmacy benefits"],
    contactEmail: "seniors@seniorcare.com",
    contactPhone: "+91-1800-345-6789"
  },
  {
    id: "4",
    name: "Family Health Assure",
    logo: "👨‍👩‍👧‍👦",
    description: "Complete family floater plans with maternity benefits",
    ageGroups: ["0-18", "19-35", "36-50"],
    coverage: "Up to ₹75 Lakhs",
    premium: "₹15,000/year",
    rating: 4.9,
    features: ["Maternity coverage", "Newborn care", "Vaccination coverage", "Family floater"],
    contactEmail: "family@healthassure.com",
    contactPhone: "+91-1800-456-7890"
  },
  {
    id: "5",
    name: "LifeSecure Health",
    logo: "💚",
    description: "Budget-friendly plans with essential coverage",
    ageGroups: ["19-35", "36-50", "51-65"],
    coverage: "Up to ₹15 Lakhs",
    premium: "₹3,800/year",
    rating: 4.3,
    features: ["Basic hospitalization", "Emergency care", "Day care procedures", "Annual health checkup"],
    contactEmail: "info@lifesecure.com",
    contactPhone: "+91-1800-567-8901"
  },
  {
    id: "6",
    name: "Premium Health Elite",
    logo: "⭐",
    description: "Premium coverage with international treatment options",
    ageGroups: ["19-35", "36-50", "51-65"],
    coverage: "Up to ₹1 Crore",
    premium: "₹25,000/year",
    rating: 4.9,
    features: ["International coverage", "Cancer care", "Organ transplant", "Private room"],
    contactEmail: "elite@premiumhealth.com",
    contactPhone: "+91-1800-678-9012"
  },
  {
    id: "7",
    name: "Kids Care Insurance",
    logo: "🧒",
    description: "Specialized health insurance for children and teenagers",
    ageGroups: ["0-18"],
    coverage: "Up to ₹20 Lakhs",
    premium: "₹4,500/year",
    rating: 4.6,
    features: ["Vaccination cover", "Dental care", "Vision care", "Sports injury"],
    contactEmail: "kids@kidscare.com",
    contactPhone: "+91-1800-789-0123"
  },
  {
    id: "8",
    name: "WellnessFirst Insurance",
    logo: "🌟",
    description: "Holistic health plans with preventive care focus",
    ageGroups: ["19-35", "36-50"],
    coverage: "Up to ₹40 Lakhs",
    premium: "₹9,500/year",
    rating: 4.7,
    features: ["Preventive care", "Gym membership", "Nutrition counseling", "Mental wellness"],
    contactEmail: "wellness@wellnessfirst.com",
    contactPhone: "+91-1800-890-1234"
  },
  {
    id: "9",
    name: "CriticalCare Plus",
    logo: "🚑",
    description: "Specialized coverage for critical illnesses and emergencies",
    ageGroups: ["36-50", "51-65", "65+"],
    coverage: "Up to ₹60 Lakhs",
    premium: "₹18,000/year",
    rating: 4.8,
    features: ["Critical illness cover", "ICU coverage", "Emergency evacuation", "Second opinion"],
    contactEmail: "critical@criticalcareplus.com",
    contactPhone: "+91-1800-901-2345"
  },
  {
    id: "10",
    name: "GlobalHealth Connect",
    logo: "🌍",
    description: "International health insurance for frequent travelers",
    ageGroups: ["19-35", "36-50", "51-65"],
    coverage: "Up to ₹2 Crores",
    premium: "₹35,000/year",
    rating: 4.9,
    features: ["Worldwide coverage", "Travel insurance", "Repatriation", "Multi-currency claims"],
    contactEmail: "global@globalhealthconnect.com",
    contactPhone: "+91-1800-012-3456"
  }
]

const ageGroupOptions = [
  { value: "all", label: "All Age Groups" },
  { value: "0-18", label: "Children (0-18)" },
  { value: "19-35", label: "Young Adults (19-35)" },
  { value: "36-50", label: "Adults (36-50)" },
  { value: "51-65", label: "Middle Age (51-65)" },
  { value: "65+", label: "Seniors (65+)" }
]

export default function InsuranceListing() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCompanies = insuranceCompanies.filter((company) => {
    const matchesAgeGroup = selectedAgeGroup === "all" || company.ageGroups.includes(selectedAgeGroup)
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAgeGroup && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#2596be] to-[#1a7a9e] flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2596be] to-[#1a7a9e] bg-clip-text text-transparent">
              Insurance Plans
            </h2>
            <p className="text-sm text-muted-foreground">Find the perfect health insurance plan for you</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search insurance companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-[#2596be]/30 focus:border-[#2596be]"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-[#2596be]/30 bg-background focus:border-[#2596be] focus:outline-none focus:ring-2 focus:ring-[#2596be]/20"
            >
              {ageGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCompanies.length} of {insuranceCompanies.length} insurance plans
          </p>
          {selectedAgeGroup !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAgeGroup("all")}
              className="text-[#2596be] hover:text-[#1a7a9e] hover:bg-blue-50"
            >
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {/* Insurance Cards Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">No insurance plans found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-xl transition-all duration-300 border-2 border-[#2596be]/20 hover:border-[#2596be]/40">
              <CardHeader className="bg-gradient-to-r from-[#2596be]/5 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{company.logo}</div>
                    <div>
                      <CardTitle className="text-xl text-[#2596be]">{company.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-semibold">{company.rating}</span>
                        <span className="text-xs text-muted-foreground">/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{company.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coverage & Premium */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                    <p className="font-bold text-[#2596be]">{company.coverage}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Premium</p>
                    <p className="font-bold text-[#2596be]">{company.premium}</p>
                  </div>
                </div>

                {/* Age Groups */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Age Groups Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {company.ageGroups.map((age) => (
                      <Badge
                        key={age}
                        variant="secondary"
                        className="bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/20"
                      >
                        {age}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Key Features:</p>
                  <ul className="space-y-1">
                    {company.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-[#2596be] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-muted-foreground">{company.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-muted-foreground">{company.contactPhone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-gradient-to-r from-[#2596be] to-[#1a7a9e] hover:from-[#1a7a9e] hover:to-[#2596be] text-white">
                    Get Quote
                  </Button>
                  <Button variant="outline" className="flex-1 border-[#2596be] text-[#2596be] hover:bg-blue-50">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}