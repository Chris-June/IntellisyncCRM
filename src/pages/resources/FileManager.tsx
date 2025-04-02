import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { File } from '@/types/resources';
import { resourceService } from '@/services/resource-service';
import { 
  Upload, 
  Search, 
  Filter, 
  Plus, 
  FolderPlus, 
  Grid2X2, 
  List, 
  FolderIcon,
  Image,
  FileText,
  FileCode,
  Video,
  Music,
  File as FileIcon,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Lock,
  Unlock,
  EyeIcon,
  Building2
} from 'lucide-react';

export default function FileManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadForm, setUploadForm] = useState({
    files: [] as any[],
    projectId: '',
    category: 'document',
    description: '',
    tags: ''
  });

  // Get project ID from URL query parameters if available
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');
  
  useEffect(() => {
    if (projectId) {
      setUploadForm(prev => ({ ...prev, projectId }));
    }
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      // For demo purposes, we'll create mock data
      setTimeout(() => {
        const mockFiles: File[] = [
          {
            id: 'file-1',
            projectId: projectId || 'project-123',
            originalFilename: 'project_proposal.pdf',
            size: 2500000,
            category: 'document',
            description: 'Final project proposal including scope, timeline, and budget',
            visibility: 'private',
            tags: ['proposal', 'client', 'planning'],
            uploadedAt: new Date('2025-02-10'),
            downloadUrl: '/files/project_proposal.pdf'
          },
          {
            id: 'file-2',
            projectId: projectId || 'project-123',
            originalFilename: 'wireframes.png',
            size: 3800000,
            category: 'image',
            description: 'Initial wireframes for the application UI',
            visibility: 'shared',
            tags: ['design', 'wireframes', 'ui'],
            uploadedAt: new Date('2025-02-15'),
            downloadUrl: '/files/wireframes.png'
          },
          {
            id: 'file-3',
            projectId: projectId || 'project-123',
            originalFilename: 'requirements.docx',
            size: 1200000,
            category: 'document',
            description: 'Detailed requirements document',
            visibility: 'private',
            tags: ['requirements', 'documentation'],
            uploadedAt: new Date('2025-02-05'),
            downloadUrl: '/files/requirements.docx'
          },
          {
            id: 'file-4',
            projectId: projectId || 'project-123',
            originalFilename: 'prototype_demo.mp4',
            size: 15000000,
            category: 'video',
            description: 'Demo video of the working prototype',
            visibility: 'shared',
            tags: ['demo', 'prototype', 'video'],
            uploadedAt: new Date('2025-02-20'),
            downloadUrl: '/files/prototype_demo.mp4'
          },
          {
            id: 'file-5',
            projectId: projectId || 'project-123',
            originalFilename: 'database_schema.sql',
            size: 500000,
            category: 'code',
            description: 'SQL database schema definition',
            visibility: 'private',
            tags: ['database', 'sql', 'development'],
            uploadedAt: new Date('2025-02-12'),
            downloadUrl: '/files/database_schema.sql'
          }
        ];
        
        setFiles(mockFiles);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error('Failed to load files');
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploadForm(prev => ({
      ...prev,
      files: [...Array.from(e.target.files || [])]
    }));
  };

  const handleUpload = async () => {
    if (!uploadForm.projectId || uploadForm.files.length === 0) {
      toast.error('Please select files and a project');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would upload the files
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Files uploaded successfully');
      setIsUploadDialogOpen(false);
      
      // Reset form
      setUploadForm({
        files: [],
        projectId: projectId || '',
        category: 'document',
        description: '',
        tags: ''
      });
      
      // Refresh files list
      fetchFiles();
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectFile = (file: File) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleDownload = (file: File) => {
    // In a real implementation, this would download the file
    toast.success(`Downloading ${file.originalFilename}`);
  };

  const handleShare = (file: File) => {
    // In a real implementation, this would share the file
    toast.success(`Sharing options for ${file.originalFilename}`);
  };

  const handleDelete = (file: File) => {
    // In a real implementation, this would delete the file
    toast.success(`${file.originalFilename} deleted`);
    setFiles(files.filter(f => f.id !== file.id));
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <Image className="h-10 w-10 text-blue-500" />;
      case 'document':
        return <FileText className="h-10 w-10 text-amber-500" />;
      case 'code':
        return <FileCode className="h-10 w-10 text-green-500" />;
      case 'video':
        return <Video className="h-10 w-10 text-purple-500" />;
      case 'audio':
        return <Music className="h-10 w-10 text-red-500" />;
      default:
        return <FileIcon className="h-10 w-10 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Filter files based on search and category
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery.trim() === '' || 
      file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || file.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Manager</h1>
        <p className="text-muted-foreground mt-1">
          Upload, organize, and share project files
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={categoryFilter || 'all'}
            onValueChange={(value) => setCategoryFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-r-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-l-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          
          <Button variant="outline" disabled>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="p-4 flex justify-center">
                      <Skeleton className="h-16 w-16 rounded" />
                    </div>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center p-3 rounded-md border">
                    <Skeleton className="h-10 w-10 rounded mr-3" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                ))}
              </div>
            )
          ) : filteredFiles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id}
                    className={`overflow-hidden cursor-pointer transition-colors ${
                      selectedFiles.some(f => f.id === file.id) ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <div className="p-6 flex justify-center">
                      {getFileIcon(file.category)}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{file.originalFilename}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(file)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(file)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Badge variant="outline" className="mr-2">
                          {file.category}
                        </Badge>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className={`flex items-center p-3 rounded-md border hover:bg-accent/20 cursor-pointer ${
                      selectedFiles.some(f => f.id === file.id) ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <div className="mr-3">
                      {getFileIcon(file.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="font-medium truncate mr-2">{file.originalFilename}</h3>
                        {file.visibility === 'private' ? (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Share2 className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="truncate">{file.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {file.tags.length > 0 && (
                        <div className="hidden md:flex gap-1 mr-4">
                          {file.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{file.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(file)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="mx-auto mb-4 bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery || categoryFilter 
                    ? "No files match your search criteria. Try adjusting your filters."
                    : "You haven't uploaded any files yet. Upload your first file to get started."}
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Files you've recently uploaded or modified</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-3 rounded-md border">
                      <Skeleton className="h-10 w-10 rounded mr-3" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {files
                    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                    .slice(0, 5)
                    .map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center p-3 rounded-md border hover:bg-accent/20 cursor-pointer"
                        onClick={() => handleSelectFile(file)}
                      >
                        <div className="mr-3">
                          {getFileIcon(file.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium truncate mr-2">{file.originalFilename}</h3>
                            {file.visibility === 'private' ? (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Share2 className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(file)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(file)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <CardTitle>Shared Files</CardTitle>
              <CardDescription>Files you've shared with others or that have been shared with you</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center p-3 rounded-md border">
                      <Skeleton className="h-10 w-10 rounded mr-3" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {files
                    .filter(file => file.visibility === 'shared')
                    .map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center p-3 rounded-md border hover:bg-accent/20 cursor-pointer"
                        onClick={() => handleSelectFile(file)}
                      >
                        <div className="mr-3">
                          {getFileIcon(file.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="font-medium truncate mr-2">{file.originalFilename}</h3>
                            <Share2 className="h-3 w-3 text-blue-500" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="truncate">{file.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShare(file)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Manage Sharing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(file)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  
                  {files.filter(file => file.visibility === 'shared').length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="mb-2">No shared files found</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Add files to your project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="files">Files</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop files, or{' '}
                  <label className="text-primary cursor-pointer hover:underline">
                    browse
                    <Input 
                      id="files"
                      type="file" 
                      multiple 
                      className="sr-only" 
                      onChange={handleFileChange}
                    />
                  </label>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 50MB per file
                </p>
              </div>
              
              {uploadForm.files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                  <ul className="text-sm space-y-1">
                    {Array.from(uploadForm.files).map((file, index) => (
                      <li key={index} className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        {file.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                value={uploadForm.projectId}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-123">Website Redesign</SelectItem>
                  <SelectItem value="project-124">Mobile App Development</SelectItem>
                  <SelectItem value="project-125">E-commerce Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">File Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={uploadForm.description}
                onChange={handleFormChange}
                placeholder="Briefly describe these files"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={uploadForm.tags}
                onChange={handleFormChange}
                placeholder="e.g., documentation, design, client"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="visibility" 
                className="rounded text-primary" 
              />
              <Label htmlFor="visibility" className="text-sm">Share with client</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isSubmitting || uploadForm.files.length === 0}>
              {isSubmitting ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}