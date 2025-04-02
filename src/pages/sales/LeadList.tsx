import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Lead } from '@/types/sales';
import { salesService } from '@/services/sales-service';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  ArrowUpDown, DollarSign, ChevronRight, 
  Timer, Building2, AlertTriangle 
} from 'lucide-react';

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Lead>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const data = await salesService.getLeads(stageFilter || undefined);
        setLeads(data);
      } catch (error) {
        console.error('Failed to load leads:', error);
        toast.error('Failed to load leads');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [stageFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStageFilter = (value: string) => {
    setStageFilter(value === 'all' ? null : value);
  };

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'won':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'stalled':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'discovery':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'proposal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'negotiation':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Filter and sort leads
  const filteredLeads = leads
    .filter((lead) => {
      const matchesQuery = searchQuery.trim() === '' ||
        (lead.opportunities[0]?.title?.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesQuery;
    })
    .sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];

      // Convert dates to timestamps for comparison
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        fieldA = new Date(fieldA).getTime();
        fieldB = new Date(fieldB).getTime();
      }

      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Group leads by stage for the kanban view
  const leadsByStage = {
    discovery: filteredLeads.filter(lead => lead.stage === 'discovery'),
    proposal: filteredLeads.filter(lead => lead.stage === 'proposal'),
    negotiation: filteredLeads.filter(lead => lead.stage === 'negotiation'),
    closed: filteredLeads.filter(lead => lead.stage === 'closed'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage and track your sales leads and opportunities.</p>
        </div>
        <Button onClick={() => navigate('/sales/leads/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-[200px]">
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select onValueChange={handleStageFilter} defaultValue="all">
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="discovery">Discovery</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full md:w-[180px]">
          <Button variant="outline" className="w-full" onClick={() => handleSort('updatedAt')}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortField === 'updatedAt' 
              ? `Last Updated ${sortDirection === 'asc' ? '(↑)' : '(↓)'}`
              : 'Last Updated'
            }
          </Button>
        </div>
      </div>

      {/* Leads Table/Kanban View */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>
        
        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                {filteredLeads.length} leads found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-4">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredLeads.length > 0 ? (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => {
                    const leadTitle = lead.opportunities[0]?.title || 'Untitled Lead';
                    
                    return (
                      <div 
                        key={lead.id} 
                        className="flex flex-col md:flex-row md:justify-between md:items-start border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Link 
                              to={`/sales/leads/${lead.id}`} 
                              className="font-medium hover:underline mr-2"
                            >
                              {leadTitle}
                            </Link>
                            {lead.status === 'stalled' && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className={getStageBadgeVariant(lead.stage)}>
                              {lead.stage}
                            </Badge>
                            <Badge variant="outline" className={getStatusBadgeVariant(lead.status)}>
                              {lead.status}
                            </Badge>
                            <span className="flex items-center text-sm text-muted-foreground">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {lead.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3 mr-1" />
                              Client: {lead.clientId}
                            </span>
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Timer className="h-3 w-3 mr-1" />
                              Updated: {new Date(lead.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => navigate(`/sales/leads/${lead.id}`)}
                              >
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/sales/proposals/generate?lead=${lead.id}`)}
                              >
                                Generate proposal
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Update lead stage logic would go here
                                  toast.success('Lead stage updated');
                                }}
                              >
                                Update stage
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/sales/leads/${lead.id}`)}
                          >
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-2">No leads found.</div>
                  <Button 
                    onClick={() => navigate('/sales/leads/new')}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Lead
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Kanban Board View */}
        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Discovery Column */}
            <KanbanColumn 
              title="Discovery" 
              count={leadsByStage.discovery.length}
              isLoading={isLoading}
              leads={leadsByStage.discovery}
              onAdd={() => navigate('/sales/leads/new?stage=discovery')}
              getStatusBadgeVariant={getStatusBadgeVariant}
              navigate={navigate}
            />
            
            {/* Proposal Column */}
            <KanbanColumn 
              title="Proposal" 
              count={leadsByStage.proposal.length}
              isLoading={isLoading}
              leads={leadsByStage.proposal}
              onAdd={() => navigate('/sales/leads/new?stage=proposal')}
              getStatusBadgeVariant={getStatusBadgeVariant}
              navigate={navigate}
            />
            
            {/* Negotiation Column */}
            <KanbanColumn 
              title="Negotiation" 
              count={leadsByStage.negotiation.length}
              isLoading={isLoading}
              leads={leadsByStage.negotiation}
              onAdd={() => navigate('/sales/leads/new?stage=negotiation')}
              getStatusBadgeVariant={getStatusBadgeVariant}
              navigate={navigate}
            />
            
            {/* Closed Column */}
            <KanbanColumn 
              title="Closed" 
              count={leadsByStage.closed.length}
              isLoading={isLoading}
              leads={leadsByStage.closed}
              onAdd={() => navigate('/sales/leads/new?stage=closed')}
              getStatusBadgeVariant={getStatusBadgeVariant}
              navigate={navigate}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  count: number;
  isLoading: boolean;
  leads: Lead[];
  onAdd: () => void;
  getStatusBadgeVariant: (status: string) => string;
  navigate: (path: string) => void;
}

function KanbanColumn({ 
  title, 
  count, 
  isLoading, 
  leads, 
  onAdd, 
  getStatusBadgeVariant,
  navigate
}: KanbanColumnProps) {
  return (
    <div className="rounded-md border bg-card">
      <div className="p-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{count} leads</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-3">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex gap-2 mb-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
            </Card>
          ))
        ) : leads.length > 0 ? (
          leads.map((lead) => {
            const leadTitle = lead.opportunities[0]?.title || 'Untitled Lead';
            
            return (
              <Card 
                key={lead.id} 
                className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/sales/leads/${lead.id}`)}
              >
                <div className="font-medium line-clamp-2 mb-2">{leadTitle}</div>
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className={getStatusBadgeVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {lead.value.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Building2 className="h-3 w-3 mr-1" />
                  Client: {lead.clientId}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 px-2 text-xs text-muted-foreground">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
}