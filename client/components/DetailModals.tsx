import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Building2,
  Star,
  Edit,
  Save,
  X,
  Award,
  Target,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Types
interface Recruiter {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  territory: string;
  hired: number;
  revenue: number;
  joinDate: string;
  status: string;
  arpu: number;
  location: string;
  avatar?: string;
}

interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  totalPlacements: number;
  revenue: number;
  avgDaysToFill: number;
  status: string;
}

// Sample performance data
const monthlyPerformance = [
  { month: "Jan", placements: 5, revenue: 12000 },
  { month: "Feb", placements: 8, revenue: 18000 },
  { month: "Mar", placements: 6, revenue: 15000 },
  { month: "Apr", placements: 12, revenue: 28000 },
  { month: "May", placements: 10, revenue: 22000 },
  { month: "Jun", placements: 14, revenue: 32000 },
];

// Recruiter Detail Modal
export function RecruiterDetailModal({
  recruiter,
  isOpen,
  onClose,
}: {
  recruiter: Recruiter | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Recruiter>>({});

  if (!recruiter) return null;

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    console.log("Saving recruiter data:", editData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {recruiter.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-2xl text-white">
                  {recruiter.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {recruiter.department} • {recruiter.territory} territories
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-slate-600 text-slate-300"
              >
                {isEditing ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Edit className="w-4 h-4" />
                )}
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-emerald-600"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="placements"
              className="data-[state=active]:bg-emerald-600"
            >
              Placements
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-emerald-600"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{recruiter.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{recruiter.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">
                      Joined {recruiter.joinDate}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Placements</span>
                    <span className="text-emerald-400 font-bold">
                      {recruiter.placements}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue Generated</span>
                    <span className="text-emerald-400 font-bold">
                      ${recruiter.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg. Per Placement</span>
                    <span className="text-white font-bold">
                      $
                      {Math.round(
                        recruiter.revenue / recruiter.placements,
                      ).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Achievements */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Status & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge
                      variant={
                        recruiter.status === "active" ? "default" : "secondary"
                      }
                      className={
                        recruiter.status === "active" ? "bg-emerald-600" : ""
                      }
                    >
                      {recruiter.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">Top Performer Q2</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">
                      95% Target Achievement
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">
                  Monthly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="placements"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="placements" className="space-y-6">
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">
                Recent placements and candidate history will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">
                      Name
                    </Label>
                    <Input
                      id="name"
                      defaultValue={recruiter.name}
                      className="bg-slate-700 border-slate-600 text-white"
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      defaultValue={recruiter.email}
                      className="bg-slate-700 border-slate-600 text-white"
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-slate-300">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      defaultValue={recruiter.phone}
                      className="bg-slate-700 border-slate-600 text-white"
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="department" className="text-slate-300">
                      Department
                    </Label>
                    <Input
                      id="department"
                      defaultValue={recruiter.department}
                      className="bg-slate-700 border-slate-600 text-white"
                      onChange={(e) =>
                        setEditData({ ...editData, department: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="territory" className="text-slate-300">
                      Territory Count
                    </Label>
                    <Input
                      id="territory"
                      type="number"
                      defaultValue={recruiter.territory}
                      className="bg-slate-700 border-slate-600 text-white"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          territory: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-4">
                  Click "Edit" to modify recruiter settings
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Client Detail Modal
export function ClientDetailModal({
  client,
  isOpen,
  onClose,
}: {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {client.name.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-2xl text-white">
                {client.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {client.company} • {client.industry}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{client.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{client.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{client.industry}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Business Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Placements</span>
                <span className="text-emerald-400 font-bold">
                  {client.totalPlacements}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Revenue</span>
                <span className="text-emerald-400 font-bold">
                  ${client.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg. Days to Fill</span>
                <span className="text-white font-bold">
                  {client.avgDaysToFill} days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
