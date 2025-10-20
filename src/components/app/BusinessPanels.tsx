import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Briefcase, FileText, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from "lucide-react";

interface BusinessPanelsProps {
  userType: string;
}

const mockJobs = [
  { id: 1, title: "Software Developer", status: "Active", applicants: 12 },
  { id: 2, title: "Marketing Manager", status: "Active", applicants: 8 },
];

const mockPosts = [
  { id: 1, title: "New Product Launch", views: 234, likes: 45 },
  { id: 2, title: "Company Update", views: 156, likes: 32 },
];

const mockTransactions = [
  { id: 1, type: "deposit", amount: 500, date: "2025-01-15" },
  { id: 2, type: "purchase", amount: -50, date: "2025-01-14" },
  { id: 3, type: "withdrawal", amount: -200, date: "2025-01-13" },
];

export const BusinessPanels = ({ userType }: BusinessPanelsProps) => {
  if (userType === "personal") {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Business Dashboard
          </CardTitle>
          <CardDescription>
            Manage your {userType} account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-4">
              {mockJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{job.title}</CardTitle>
                        <CardDescription>{job.applicants} applicants</CardDescription>
                      </div>
                      <Badge>{job.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {mockPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardDescription>
                      {post.views} views • {post.likes} likes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {mockTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {transaction.type === "deposit" && (
                          <ArrowDownCircle className="w-5 h-5 text-green-500" />
                        )}
                        {transaction.type === "withdrawal" && (
                          <ArrowUpCircle className="w-5 h-5 text-red-500" />
                        )}
                        {transaction.type === "purchase" && (
                          <ShoppingCart className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <CardTitle className="text-base capitalize">
                            {transaction.type}
                          </CardTitle>
                          <CardDescription>{transaction.date}</CardDescription>
                        </div>
                      </div>
                      <span
                        className={`font-bold ${
                          transaction.amount > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount} coins
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
