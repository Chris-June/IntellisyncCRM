import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClient } from '@/context/client-context';
import { Client } from '@/types/client';

export default function ClientList() {
  const { clients, loadClients, isLoading, updateClient } = useClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Client>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleIndustryFilter = (value: string) => {
    setIndustryFilter(value === 'all' ? null : value);
  };

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredClients = clients
    .filter((client) => {
      const matchesQuery =
        searchQuery.trim() === '' ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry =
        !industryFilter || client.industry.toLowerCase() === industryFilter.toLowerCase();

      return matchesQuery && matchesIndustry;
    })
    .sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];

      // Convert dates to timestamps for comparison
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        fieldA = new Date(fieldA).getTime();
        fieldB = new Date(fieldB).getTime();
      }

      // Convert strings to lowercase for comparison
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }

      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getIndustryOptions = () => {
    const industries = [...new Set(clients.map((client) => client.industry))];
    return industries.sort();
  };

  const toggleClientStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    try {
      await updateClient(client.id, { status: newStatus });
      toast.success(`Client status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update client status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage and view all client accounts.</p>
        </div>
        <Button onClick={() => navigate('/clients/intake')}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-[200px]">
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select onValueChange={handleIndustryFilter} defaultValue="all">
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {getIndustryOptions().map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>
                Showing {filteredClients.length} of {clients.length} total clients
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleSort('updatedAt')}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 bg-muted/50 py-3 px-4 text-sm font-medium">
              <div className="col-span-4 md:col-span-3">Client / Company</div>
              <div className="col-span-3 md:col-span-2">Industry</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 md:col-span-3">Last Updated</div>
              <div className="col-span-1 md:col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 py-3 px-4 text-sm items-center">
                    <div className="col-span-4 md:col-span-3">
                      <Skeleton className="h-5 w-full max-w-[180px]" />
                      <Skeleton className="h-4 w-full max-w-[120px] mt-1" />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="col-span-1 md:col-span-2 text-right">
                      <Skeleton className="h-9 w-9 ml-auto rounded-md" />
                    </div>
                  </div>
                ))
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="grid grid-cols-12 gap-4 py-3 px-4 text-sm items-center hover:bg-muted/30"
                  >
                    <div className="col-span-4 md:col-span-3">
                      <Link 
                        to={`/clients/${client.id}`}
                        className="font-medium hover:underline"
                      >
                        {client.name}
                      </Link>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{client.company}</span>
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-2 capitalize">{client.industry}</div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="col-span-2 md:col-span-3 text-muted-foreground">
                      {new Date(client.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-1 md:col-span-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/sales/leads/new?client=${client.id}`)}>
                            Create lead
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleClientStatus(client)}>
                            {client.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 px-4 text-center text-muted-foreground">
                  No clients found. Try adjusting your search or filters.
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}