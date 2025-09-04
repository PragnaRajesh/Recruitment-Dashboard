// Data Service for managing API calls and data fetching
export interface RecruiterData {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  territory: string;
  hired: number;
  revenue: number;
  joinDate: string;
  status: "active" | "inactive" | "pending";
  trend: "up" | "down";
  arpu: number;
  location: string;
}

export interface ClientData {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  totalHired: number;
  revenue: number;
  avgDaysToFill: number;
  status: "active" | "pending" | "inactive";
  location: string;
  arpu: number;
  lastActivity: string;
}

export interface CandidateData {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string[];
  status: "hired" | "interview" | "pending" | "rejected";
  salary: number;
  recruiter: string;
  client: string;
  appliedDate: string;
  location: string;
}

export interface PerformanceData {
  month: string;
  recruiters: number;
  hired: number;
  target: number;
  revenue: number;
}

// Sample Indian recruitment data
export const sampleRecruiters: RecruiterData[] = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@company.com",
    phone: "+91 98765 43210",
    department: "Technology",
    territory: "Mumbai",
    hired: 25,
    revenue: 1250000,
    joinDate: "2023-01-15",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "Mumbai, Maharashtra",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    email: "rahul.kumar@company.com",
    phone: "+91 98765 43211",
    department: "Finance",
    territory: "Delhi",
    hired: 18,
    revenue: 900000,
    joinDate: "2022-11-08",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "New Delhi",
  },
  {
    id: 3,
    name: "Anita Patel",
    email: "anita.patel@company.com",
    phone: "+91 98765 43212",
    department: "Healthcare",
    territory: "Ahmedabad",
    hired: 22,
    revenue: 1100000,
    joinDate: "2023-03-22",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "Ahmedabad, Gujarat",
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram.singh@company.com",
    phone: "+91 98765 43213",
    department: "Manufacturing",
    territory: "Pune",
    hired: 15,
    revenue: 750000,
    joinDate: "2022-08-14",
    status: "active",
    trend: "down",
    arpu: 50000,
    location: "Pune, Maharashtra",
  },
  {
    id: 5,
    name: "Deepika Reddy",
    email: "deepika.reddy@company.com",
    phone: "+91 98765 43214",
    department: "IT Services",
    territory: "Hyderabad",
    hired: 28,
    revenue: 1400000,
    joinDate: "2023-02-10",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "Hyderabad, Telangana",
  },
  {
    id: 6,
    name: "Arjun Nair",
    email: "arjun.nair@company.com",
    phone: "+91 98765 43215",
    department: "Banking",
    territory: "Kochi",
    hired: 12,
    revenue: 600000,
    joinDate: "2022-12-05",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "Kochi, Kerala",
  },
  {
    id: 7,
    name: "Sneha Gupta",
    email: "sneha.gupta@company.com",
    phone: "+91 98765 43216",
    department: "Consulting",
    territory: "Gurgaon",
    hired: 20,
    revenue: 1000000,
    joinDate: "2023-04-18",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "Gurgaon, Haryana",
  },
  {
    id: 8,
    name: "Karthik Krishnan",
    email: "karthik.krishnan@company.com",
    phone: "+91 98765 43217",
    department: "Technology",
    territory: "Bangalore",
    hired: 30,
    revenue: 1500000,
    joinDate: "2022-09-30",
    status: "active",
    trend: "up",
    arpu: 50000,
    location: "Bangalore, Karnataka",
  },
];

export const sampleClients: ClientData[] = [
  {
    id: 1,
    name: "Rajesh Mehta",
    company: "Tata Consultancy Services",
    email: "rajesh.mehta@tcs.com",
    phone: "+91 98765 55101",
    industry: "IT Services",
    totalHired: 45,
    revenue: 2250000,
    avgDaysToFill: 18,
    status: "active",
    location: "Mumbai, Maharashtra",
    arpu: 50000,
    lastActivity: "2024-01-15",
  },
  {
    id: 2,
    name: "Sunita Agarwal",
    company: "HDFC Bank",
    email: "sunita.agarwal@hdfcbank.com",
    phone: "+91 98765 55102",
    industry: "Banking",
    totalHired: 32,
    revenue: 1600000,
    avgDaysToFill: 15,
    status: "active",
    location: "Mumbai, Maharashtra",
    arpu: 50000,
    lastActivity: "2024-01-14",
  },
  {
    id: 3,
    name: "Amit Kumar",
    company: "Apollo Hospitals",
    email: "amit.kumar@apollohospitals.com",
    phone: "+91 98765 55103",
    industry: "Healthcare",
    totalHired: 28,
    revenue: 1400000,
    avgDaysToFill: 25,
    status: "pending",
    location: "Chennai, Tamil Nadu",
    arpu: 50000,
    lastActivity: "2024-01-10",
  },
  {
    id: 4,
    name: "Pooja Sharma",
    company: "Reliance Industries",
    email: "pooja.sharma@ril.com",
    phone: "+91 98765 55104",
    industry: "Oil & Gas",
    totalHired: 22,
    revenue: 1100000,
    avgDaysToFill: 20,
    status: "active",
    location: "Mumbai, Maharashtra",
    arpu: 50000,
    lastActivity: "2024-01-13",
  },
  {
    id: 5,
    name: "Manish Gupta",
    company: "Flipkart",
    email: "manish.gupta@flipkart.com",
    phone: "+91 98765 55105",
    industry: "E-commerce",
    totalHired: 38,
    revenue: 1900000,
    avgDaysToFill: 22,
    status: "active",
    location: "Bangalore, Karnataka",
    arpu: 50000,
    lastActivity: "2024-01-12",
  },
];

export const sampleCandidates: CandidateData[] = [
  {
    id: 1,
    name: "Aarav Joshi",
    email: "aarav.joshi@gmail.com",
    phone: "+91 98765 77001",
    position: "Software Engineer",
    experience: "3 years",
    skills: ["React", "Node.js", "JavaScript", "MongoDB"],
    status: "hired",
    salary: 800000,
    recruiter: "Priya Sharma",
    client: "Tata Consultancy Services",
    appliedDate: "2024-01-10",
    location: "Mumbai, Maharashtra",
  },
  {
    id: 2,
    name: "Diya Patel",
    email: "diya.patel@gmail.com",
    phone: "+91 98765 77002",
    position: "Data Analyst",
    experience: "2 years",
    skills: ["Python", "SQL", "Power BI", "Excel"],
    status: "interview",
    salary: 600000,
    recruiter: "Rahul Kumar",
    client: "HDFC Bank",
    appliedDate: "2024-01-08",
    location: "Mumbai, Maharashtra",
  },
  {
    id: 3,
    name: "Aryan Sharma",
    email: "aryan.sharma@gmail.com",
    phone: "+91 98765 77003",
    position: "Marketing Manager",
    experience: "5 years",
    skills: ["Digital Marketing", "SEO", "Google Ads", "Analytics"],
    status: "pending",
    salary: 1200000,
    recruiter: "Anita Patel",
    client: "Flipkart",
    appliedDate: "2024-01-05",
    location: "Bangalore, Karnataka",
  },
];

export const samplePerformanceData: PerformanceData[] = [
  { month: "Jan", recruiters: 45, hired: 123, target: 150, revenue: 6150000 },
  { month: "Feb", recruiters: 52, hired: 145, target: 150, revenue: 7250000 },
  { month: "Mar", recruiters: 48, hired: 132, target: 150, revenue: 6600000 },
  { month: "Apr", recruiters: 61, hired: 168, target: 150, revenue: 8400000 },
  { month: "May", recruiters: 55, hired: 155, target: 150, revenue: 7750000 },
  { month: "Jun", recruiters: 58, hired: 172, target: 150, revenue: 8600000 },
];

// API Service Class
class DataService {
  private baseUrl = "/api";

  async fetchRecruiters(): Promise<RecruiterData[]> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In real app, this would be:
      // const response = await fetch(`${this.baseUrl}/recruiters`);
      // return await response.json();

      return sampleRecruiters;
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      throw error;
    }
  }

  async fetchClients(): Promise<ClientData[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return sampleClients;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  async fetchCandidates(): Promise<CandidateData[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return sampleCandidates;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw error;
    }
  }

  async fetchPerformanceData(): Promise<PerformanceData[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return samplePerformanceData;
    } catch (error) {
      console.error("Error fetching performance data:", error);
      throw error;
    }
  }

  // Calculate ARPU (Average Revenue Per User)
  calculateARPU(totalRevenue: number, totalUsers: number): number {
    return totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;
  }

  // Get filtered recruiters by various criteria
  getFilteredRecruiters(filters: {
    department?: string;
    location?: string;
    status?: string;
  }): RecruiterData[] {
    let filtered = [...sampleRecruiters];

    if (filters.department) {
      filtered = filtered.filter((r) =>
        r.department.toLowerCase().includes(filters.department!.toLowerCase()),
      );
    }

    if (filters.location) {
      filtered = filtered.filter((r) =>
        r.location.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    }

    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    return filtered;
  }
}

export const dataService = new DataService();
