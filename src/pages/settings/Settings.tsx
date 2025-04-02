import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  UserCog,
  Lock,
  Bell,
  Mail,
  MailCheck,
  Shield,
  Settings as SettingsIcon,
  Database,
  Brush,
  Eye,
  LogOut,
  UserCircle,
  RefreshCw,
  Save,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Profile settings saved');
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSaveNotifications = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Notification preferences saved');
      setIsLoading(false);
    }, 1500);
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Password changed successfully');
      setIsLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Brush className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Settings</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
                  <UserCircle className="w-16 h-16 text-muted-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Upload Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size of 2MB.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={user?.user_metadata?.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" defaultValue="Project Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select defaultValue="product">
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue="Project manager with 5+ years of experience in software development." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="america_los_angeles">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america_new_york">America/New York (EDT)</SelectItem>
                        <SelectItem value="america_chicago">America/Chicago (CDT)</SelectItem>
                        <SelectItem value="america_denver">America/Denver (MDT)</SelectItem>
                        <SelectItem value="america_los_angeles">America/Los Angeles (PDT)</SelectItem>
                        <SelectItem value="europe_london">Europe/London (BST)</SelectItem>
                        <SelectItem value="asia_tokyo">Asia/Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en-US">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" /> Change Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app like Google Authenticator, Authy, or 1Password
                    </p>
                  </div>
                  <Button variant="outline">Set Up</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-medium">SMS Recovery</h4>
                    <p className="text-sm text-muted-foreground">
                      Get verification codes via text message (SMS)
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>
                  Manage your active sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Current Session</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        macOS • Chrome • San Francisco, USA
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Active Now
                    </Badge>
                  </div>
                </div>
                
                <div className="rounded-md border p-4 opacity-80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Windows PC</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Windows • Firefox • San Francisco, USA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                      <Button size="sm" variant="outline">Sign Out</Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4 opacity-80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">iPhone 15</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        iOS • Safari • New York, USA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">5 days ago</p>
                      <Button size="sm" variant="outline">Sign Out</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="text-red-500" onClick={() => {
                  toast.success('Signed out of all other devices');
                }}>
                  Sign Out All Other Devices
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-destructive/50 p-4">
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Permanently delete your account and all of your data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={() => toast.error('Account deletion requires additional confirmation')}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you'll receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailCheck className="h-4 w-4" />
                      <Label htmlFor="email_project">Project Updates</Label>
                    </div>
                    <Switch id="email_project" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailCheck className="h-4 w-4" />
                      <Label htmlFor="email_tasks">Task Assignments</Label>
                    </div>
                    <Switch id="email_tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailCheck className="h-4 w-4" />
                      <Label htmlFor="email_client">Client Communications</Label>
                    </div>
                    <Switch id="email_client" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailCheck className="h-4 w-4" />
                      <Label htmlFor="email_reminders">Reminders &amp; Follow-ups</Label>
                    </div>
                    <Switch id="email_reminders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailCheck className="h-4 w-4" />
                      <Label htmlFor="email_system">System Notifications</Label>
                    </div>
                    <Switch id="email_system" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium mb-4">In-App Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="app_project">Project Updates</Label>
                    </div>
                    <Switch id="app_project" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="app_tasks">Task Assignments</Label>
                    </div>
                    <Switch id="app_tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="app_client">Client Communications</Label>
                    </div>
                    <Switch id="app_client" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="app_reminders">Reminders &amp; Follow-ups</Label>
                    </div>
                    <Switch id="app_reminders" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium mb-4">Notification Digests</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Daily Digest</Label>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="end_of_day">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="morning">Morning (9:00 AM)</SelectItem>
                          <SelectItem value="end_of_day">End of Day (5:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Weekly Summary</Label>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="friday">
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/20 transition-colors bg-primary/10">
                    <div className="w-full h-20 flex">
                      <div className="w-1/4 bg-background border-r"></div>
                      <div className="w-3/4 bg-background dark:bg-slate-900"></div>
                    </div>
                    <span className="text-sm font-medium">Light</span>
                  </div>
                  <div className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/20 transition-colors">
                    <div className="w-full h-20 flex">
                      <div className="w-1/4 bg-background border-r"></div>
                      <div className="w-3/4 bg-slate-900"></div>
                    </div>
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                  <div className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/20 transition-colors">
                    <div className="w-full h-20 flex">
                      <div className="w-1/4 bg-background border-r"></div>
                      <div className="w-3/4 bg-gradient-to-b from-background to-slate-900"></div>
                    </div>
                    <span className="text-sm font-medium">System</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Layout &amp; Display</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sidebar_collapsed">Collapsed Sidebar</Label>
                    <p className="text-sm text-muted-foreground">
                      Start with a collapsed sidebar to maximize workspace
                    </p>
                  </div>
                  <Switch id="sidebar_collapsed" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Show animations and transitions in the interface
                    </p>
                  </div>
                  <Switch id="animations" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="density">Interface Density</Label>
                    <p className="text-sm text-muted-foreground">
                      Adjust the spacing and density of UI elements
                    </p>
                  </div>
                  <Select defaultValue="default">
                    <SelectTrigger id="density" className="w-[150px]">
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Dashboard Preferences</h3>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose which widgets to show on your dashboard
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widget_tasks" defaultChecked />
                      <label
                        htmlFor="widget_tasks"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tasks & Activities
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widget_calendar" defaultChecked />
                      <label
                        htmlFor="widget_calendar"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Calendar Events
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widget_pipeline" defaultChecked />
                      <label
                        htmlFor="widget_pipeline"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sales Pipeline
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widget_metrics" defaultChecked />
                      <label
                        htmlFor="widget_metrics"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Project Metrics
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widget_clients" defaultChecked />
                      <label
                        htmlFor="widget_clients"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recent Clients
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="widget_activity" defaultChecked />
                      <label
                        htmlFor="widget_activity"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Team Activity
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="landing">Default Landing Page</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose which page to show after login
                    </p>
                  </div>
                  <Select defaultValue="dashboard">
                    <SelectTrigger id="landing" className="w-[180px]">
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="sales">Sales Pipeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success('Appearance settings saved')}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* AI Settings Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI & Automation Settings</CardTitle>
              <CardDescription>
                Configure how AI and automation features work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">AI Assistants</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai_enabled">Enable AI Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on AI-powered assistants and automation
                    </p>
                  </div>
                  <Switch id="ai_enabled" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai_model">AI Model Preference</Label>
                    <p className="text-sm text-muted-foreground">
                      Select which AI model to use
                    </p>
                  </div>
                  <Select defaultValue="gpt4">
                    <SelectTrigger id="ai_model" className="w-[180px]">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4o (Recommended)</SelectItem>
                      <SelectItem value="gpt4mini">GPT-4o-mini (Faster)</SelectItem>
                      <SelectItem value="gpt35">GPT-3.5 (Economic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai_suggestions">AI Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show AI-generated suggestions and recommendations
                    </p>
                  </div>
                  <Switch id="ai_suggestions" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai_summarization">Meeting Summarization</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically summarize meeting transcripts
                    </p>
                  </div>
                  <Switch id="ai_summarization" defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Agent Behavior</h3>
                
                <div className="space-y-2">
                  <Label>Agent Proactivity Level</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/20 transition-colors">
                      <Eye className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Passive</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Only shows information when explicitly requested
                      </p>
                    </div>
                    <div className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/20 transition-colors bg-primary/10">
                      <Sparkles className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm font-medium">Balanced</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Suggests actions when likely to be helpful
                      </p>
                    </div>
                    <div className="border rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/20 transition-colors">
                      <RefreshCw className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Proactive</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Actively recommends actions and automation
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Data Usage Permissions</Label>
                  <div className="rounded-md border p-4 space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="data_analytics" defaultChecked />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="data_analytics"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Analytics & Insights
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow AI to analyze your data to provide insights and recommendations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="data_suggestions" defaultChecked />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="data_suggestions"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Content Suggestions
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow AI to suggest content for emails, proposals, and other documents
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="data_automation" defaultChecked />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor="data_automation"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Workflow Automation
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow AI to automate repetitive tasks and workflows
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success('AI settings saved')}>
                <Sparkles className="mr-2 h-4 w-4" />
                Save AI Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Sign out or access account details
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <Button variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
          <Button variant="outline" onClick={() => toast.success('Account support request sent')}>
            <Shield className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}