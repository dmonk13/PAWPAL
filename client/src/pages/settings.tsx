import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Shield, Heart, MapPin } from "lucide-react";
import BottomNav from "@/components/bottom-nav";
import { Link } from "wouter";

export default function Settings() {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/discover">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Push Notifications</span>
                  <span className="text-sm text-gray-500">Get notified about new matches</span>
                </Label>
                <Switch id="push-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="text-sm text-gray-500">Receive updates via email</span>
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="message-notifications" className="flex flex-col space-y-1">
                  <span>Message Notifications</span>
                  <span className="text-sm text-gray-500">Get notified about new messages</span>
                </Label>
                <Switch id="message-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Safety */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <CardTitle>Privacy & Safety</CardTitle>
              </div>
              <CardDescription>
                Control your privacy and safety settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="location-sharing" className="flex flex-col space-y-1">
                  <span>Location Sharing</span>
                  <span className="text-sm text-gray-500">Allow location-based matching</span>
                </Label>
                <Switch id="location-sharing" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility" className="flex flex-col space-y-1">
                  <span>Profile Visibility</span>
                  <span className="text-sm text-gray-500">Show your profile to other users</span>
                </Label>
                <Switch id="profile-visibility" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="incognito-mode" className="flex flex-col space-y-1">
                  <span>Incognito Mode</span>
                  <span className="text-sm text-gray-500">Browse without being seen</span>
                </Label>
                <Switch id="incognito-mode" />
              </div>
            </CardContent>
          </Card>

          {/* Matching Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <CardTitle>Matching Preferences</CardTitle>
              </div>
              <CardDescription>
                Customize your matching experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-match" className="flex flex-col space-y-1">
                  <span>Auto-Match</span>
                  <span className="text-sm text-gray-500">Automatically match with compatible dogs</span>
                </Label>
                <Switch id="auto-match" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-distance" className="flex flex-col space-y-1">
                  <span>Show Distance</span>
                  <span className="text-sm text-gray-500">Display distance in profiles</span>
                </Label>
                <Switch id="show-distance" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <CardTitle>Location Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your location preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Radius</Label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">25 miles</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Location</Label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">New York, NY</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Delete Account
              </Button>
              <Separator />
              <div className="text-xs text-gray-500 text-center">
                PupMatch v1.0.0
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}