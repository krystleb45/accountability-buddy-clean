import type { SupportResource } from "@/api/military-support/military-support-api"

export const DEFAULT_MILITARY_RESOURCES: SupportResource[] = [
  // Mental Health & Wellness
  {
    _id: "va-mental-health",
    title: "VA Mental Health Services",
    description:
      "Comprehensive mental health care including PTSD treatment, counseling, and therapy through the Department of Veterans Affairs.",
    url: "https://www.va.gov/health-care/health-needs-conditions/mental-health/",
    category: "Mental Health",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "military-family-counseling",
    title: "Military Family Life Counselors",
    description:
      "Free, confidential counseling services for military families dealing with deployment, relationships, and stress.",
    url: "https://www.militaryfamilylife.org/",
    category: "Mental Health",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "real-warriors",
    title: "Real Warriors Campaign",
    description:
      "Resources to help overcome stigma and barriers to seeking mental health care, with real stories from service members.",
    url: "https://www.realwarriors.net/",
    category: "Mental Health",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Crisis Hotlines
  {
    _id: "veterans-crisis-line",
    title: "Veterans Crisis Line",
    description:
      "24/7 free, confidential crisis support for veterans and their families. Call 988 and press 1, or text 838255.",
    url: "https://www.veteranscrisisline.net/",
    category: "Crisis Support",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Benefits & Claims
  {
    _id: "va-benefits",
    title: "VA Benefits Portal",
    description:
      "Apply for disability compensation, healthcare, education benefits, and manage your VA claims online.",
    url: "https://www.va.gov/disability/",
    category: "Benefits",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "ebenefits",
    title: "eBenefits Portal",
    description:
      "Access your military personnel records, upload claim documents, and track the status of your VA benefits.",
    url: "https://www.ebenefits.va.gov/",
    category: "Benefits",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "dav-assistance",
    title: "Disabled American Veterans (DAV)",
    description:
      "Free claims assistance and advocacy services to help veterans navigate the VA benefits process.",
    url: "https://www.dav.org/veterans/resources/",
    category: "Benefits",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Career & Education
  {
    _id: "gi-bill",
    title: "GI Bill Education Benefits",
    description:
      "Learn about education benefits including the Post-9/11 GI Bill, tuition assistance, and approved schools.",
    url: "https://www.va.gov/education/",
    category: "Education",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "vre-program",
    title: "Vocational Rehabilitation & Employment",
    description:
      "Career counseling, education training, and job placement assistance for veterans with service-connected disabilities.",
    url: "https://www.va.gov/careers-employment/vocational-rehabilitation/",
    category: "Career",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "usajobs-veterans",
    title: "USAJOBS Veterans Preference",
    description:
      "Federal employment opportunities with veterans preference and hiring authorities for military personnel.",
    url: "https://www.usajobs.gov/Help/working-in-government/unique-hiring-paths/veterans/",
    category: "Career",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Financial & Family Support
  {
    _id: "military-onesource",
    title: "Military OneSource",
    description:
      "Free financial counseling, tax services, and emergency assistance for military families and veterans.",
    url: "https://www.militaryonesource.mil/",
    category: "Family Support",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "operation-homefront",
    title: "Operation Homefront",
    description:
      "Emergency financial assistance, transitional housing, and permanent housing solutions for military families.",
    url: "https://www.operationhomefront.org/",
    category: "Family Support",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "blue-star-families",
    title: "Blue Star Families",
    description:
      "Military family support, career development, and advocacy programs to strengthen military communities.",
    url: "https://www.bluestarfam.org/",
    category: "Family Support",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Fallback disclaimer if API fails
export const DEFAULT_DISCLAIMER =
  "This service provides peer support and resource information only. It is not a substitute for professional medical care, mental health treatment, or crisis intervention. If you are experiencing a mental health emergency, please call 988 or go to your nearest emergency room."
