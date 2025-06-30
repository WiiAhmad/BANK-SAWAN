"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, Info, FileText, Search, RefreshCw, ArrowLeft } from "lucide-react";
import { useAdminLogs } from "@/hooks/SuperHooks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SystemLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  category: "SYSTEM" | "USER" | "TRANSACTION" | "SECURITY" | "API";
  message: string;
  details?: string;
  userId?: string;
  userName?: string;
}

export default function SystemLogPage() {
  const router = useRouter();
  const { logs, loading: isLoading, error } = useAdminLogs();
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [logSearch, setLogSearch] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/superadmin");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh by reloading the page (or you can refetch via SWR/mutate if using SWR)
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2000);
    }, 1000);
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "SUCCESS":
        return CheckCircle;
      case "WARNING":
        return AlertTriangle;
      case "ERROR":
        return XCircle;
      default:
        return Info;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "SUCCESS":
        return "text-green-600 bg-green-100";
      case "WARNING":
        return "text-orange-600 bg-orange-100";
      case "ERROR":
        return "text-red-600 bg-red-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SYSTEM":
        return "bg-purple-500";
      case "USER":
        return "bg-blue-500";
      case "TRANSACTION":
        return "bg-green-500";
      case "SECURITY":
        return "bg-red-500";
      case "API":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const filteredLogs = logs.filter((log: any) => {
    const levelMatch = logFilter === "ALL" || log.level === logFilter;
    const searchMatch =
      !logSearch ||
      (log.action && log.action.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.user && log.user.name && log.user.name.toLowerCase().includes(logSearch.toLowerCase()));
    return levelMatch && searchMatch;
  });

  // Skeleton for page-level loading (styled like dashboard superadmin)
  const PageSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-purple-200 to-blue-200">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <div className="neo-brutal bg-white p-2 sm:p-3 animate-pulse rounded">
            <Skeleton className="h-6 w-6" />
          </div>
          <div className="flex-1 flex justify-center">
            <Skeleton className="h-8 w-48 sm:w-72 rounded" />
          </div>
          <div className="neo-brutal bg-blue-500 p-2 sm:p-3 animate-pulse rounded">
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
        {/* Success Message Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-full rounded" />
        </div>
        {/* Card Skeleton */}
        <Card className="neo-brutal-card mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="p-4 border-2 border-gray-200 rounded">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-16 h-5" />
                        <Skeleton className="w-12 h-5" />
                      </div>
                      <Skeleton className="w-16 h-3" />
                    </div>
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-3/4 h-3 mb-1" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    isLoading ? <PageSkeleton /> : (
      <div className="min-h-screen bg-gradient-to-br from-red-200 via-purple-200 to-blue-200 p-4">
        <div className="max-w-4xl mx-auto mt-5">
          <div className="flex items-center justify-between mb-6 gap-2">
            <Button onClick={handleBack} className="neo-brutal p-2 sm:p-3">
              <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <h1 className="text-3xl sm:text-4xl font-black uppercase flex items-center gap-3">
              <FileText className="h-7 w-7 text-purple-600" />
              System Logs
            </h1>
            <Button onClick={handleRefresh} disabled={isRefreshing} className="neo-brutal bg-blue-500 text-white font-bold py-2 px-4 text-xs sm:text-sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {refreshSuccess && (
            <Card className="neo-brutal-card neo-brutal-green mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <p className="font-black uppercase text-sm sm:text-base">System logs refreshed successfully!</p>
              </div>
            </Card>
          )}
          <Card className="neo-brutal-card mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="neo-brutal h-10 sm:h-12 font-semibold pl-10 text-sm"
                  placeholder="Search logs..."
                  disabled={isLoading}
                />
              </div>
              <Select value={logFilter} onValueChange={setLogFilter} disabled={isLoading}>
                <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <>
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="p-4 border-2 border-gray-200 rounded">
                      <div className="flex items-start space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-16 h-5" />
                              <Skeleton className="w-12 h-5" />
                            </div>
                            <Skeleton className="w-16 h-3" />
                          </div>
                          <Skeleton className="w-full h-4 mb-2" />
                          <Skeleton className="w-3/4 h-3 mb-1" />
                          <Skeleton className="w-1/2 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : error ? (
                <div className="text-center py-8 text-red-500 font-bold">{error}</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-black uppercase mb-2">No Logs Found</h3>
                  <p className="font-semibold text-gray-600 text-sm">No logs available.</p>
                </div>
              ) : (
                filteredLogs.map((log: any) => {
                  const LogIcon = getLogIcon(log.level);
                  return (
                    <div key={log.id} className="p-4 border-2 border-gray-200 hover:bg-gray-50 transition-colors rounded">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getLogColor(log.level)}`}>
                          <LogIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getCategoryColor(log.entity || log.category)} text-white text-xs font-bold`}>{log.entity || log.category}</Badge>
                              <Badge variant="outline" className="text-xs font-bold">{log.level}</Badge>
                            </div>
                            <span className="text-xs font-semibold text-gray-500">{formatTimestamp(log.timestamp)}</span>
                          </div>
                          <p className="font-bold text-sm mb-1">{log.action || log.message}</p>
                          {log.details && <p className="font-semibold text-xs text-gray-600 mb-1">{log.details}</p>}
                          {log.user && log.user.name && (
                            <p className="font-semibold text-xs text-blue-600">User: {log.user.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  );
}
