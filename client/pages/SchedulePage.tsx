import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Sample schedule data
const todaySchedule = [
  {
    id: 1,
    type: "interview",
    title: "Technical Interview - Aarav Joshi",
    candidate: "Aarav Joshi",
    position: "Software Engineer",
    interviewer: "Priya Sharma",
    time: "10:00 AM",
    duration: "1 hour",
    mode: "video",
    status: "scheduled",
    client: "TCS",
  },
  {
    id: 2,
    type: "meeting",
    title: "Client Meeting - HDFC Bank",
    candidate: null,
    position: null,
    interviewer: "Rahul Kumar",
    time: "2:00 PM",
    duration: "45 minutes",
    mode: "office",
    status: "confirmed",
    client: "HDFC Bank",
  },
  {
    id: 3,
    type: "interview",
    title: "HR Round - Diya Patel",
    candidate: "Diya Patel",
    position: "Data Analyst",
    interviewer: "Anita Patel",
    time: "4:30 PM",
    duration: "30 minutes",
    mode: "video",
    status: "pending",
    client: "HDFC Bank",
  },
];

const upcomingInterviews = [
  {
    id: 4,
    date: "Tomorrow",
    interviews: [
      {
        candidate: "Aryan Sharma",
        position: "Marketing Manager",
        time: "11:00 AM",
        interviewer: "Vikram Singh",
        client: "Flipkart",
      },
      {
        candidate: "Sneha Gupta",
        position: "Business Analyst",
        time: "3:00 PM",
        interviewer: "Deepika Reddy",
        client: "Reliance",
      },
    ],
  },
  {
    id: 5,
    date: "Day After Tomorrow",
    interviews: [
      {
        candidate: "Karthik Nair",
        position: "DevOps Engineer",
        time: "10:30 AM",
        interviewer: "Priya Sharma",
        client: "TCS",
      },
    ],
  },
];

const interviewStats = {
  totalToday: 8,
  completed: 3,
  upcoming: 5,
  cancelled: 0,
  successRate: 87,
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("day");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState("all");

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Schedule data refreshed");
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScheduleInterview = () => {
    console.log("Schedule new interview");
    // Schedule interview functionality would be implemented here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-emerald-600";
      case "confirmed":
        return "bg-blue-600";
      case "pending":
        return "bg-yellow-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-slate-600";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "office":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Schedule Management
          </h1>
          <p className="text-slate-400">
            Manage interviews, meetings, and appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedRecruiter}
            onValueChange={setSelectedRecruiter}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="All Recruiters" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Recruiters</SelectItem>
              <SelectItem value="priya">Priya Sharma</SelectItem>
              <SelectItem value="rahul">Rahul Kumar</SelectItem>
              <SelectItem value="anita">Anita Patel</SelectItem>
              <SelectItem value="vikram">Vikram Singh</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleScheduleInterview}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">
                  Today's Schedule
                </p>
                <p className="text-2xl font-bold text-white">
                  {interviewStats.totalToday}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">
                  Completed
                </p>
                <p className="text-2xl font-bold text-white">
                  {interviewStats.completed}
                </p>
              </div>
              <Clock className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-white">
                  {interviewStats.upcoming}
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-white">
                  {interviewStats.cancelled}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-white">
                  {interviewStats.successRate}%
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Today's Schedule</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-slate-300 text-sm">
                  {selectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <span className="text-emerald-400 font-bold text-lg">
                        {item.time}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {item.duration}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <Badge
                          variant="default"
                          className={`${getStatusColor(item.status)} text-white text-xs`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      {item.candidate && (
                        <p className="text-slate-400 text-sm">
                          Candidate: {item.candidate} • Position:{" "}
                          {item.position}
                        </p>
                      )}
                      <p className="text-slate-400 text-sm">
                        Interviewer: {item.interviewer} • Client: {item.client}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-slate-400">
                      {getModeIcon(item.mode)}
                      <span className="ml-1 text-xs capitalize">
                        {item.mode}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((day) => (
                <div key={day.id} className="space-y-3">
                  <h4 className="text-emerald-400 font-medium text-sm border-b border-slate-700 pb-1">
                    {day.date}
                  </h4>
                  {day.interviews.map((interview, index) => (
                    <div key={index} className="p-3 bg-slate-700/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          {interview.candidate}
                        </span>
                        <span className="text-emerald-400 text-xs">
                          {interview.time}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-1">
                        {interview.position}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          By: {interview.interviewer}
                        </span>
                        <span className="text-blue-400">
                          {interview.client}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View Placeholder */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-slate-400 text-sm font-medium"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="aspect-square p-2 border border-slate-700 rounded hover:bg-slate-700/30 cursor-pointer flex flex-col items-center justify-center"
              >
                <span className="text-slate-300 text-sm">{(i % 30) + 1}</span>
                {i % 7 === 2 && (
                  <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
