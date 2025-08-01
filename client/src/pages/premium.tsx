import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Heart, Shield, Undo2, Infinity, Percent, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Premium() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Simulate creating subscription and redirect to checkout
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 500);
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Unable to process upgrade. Please try again.",
        variant: "destructive",
      });
      setIsUpgrading(false);
    }
  };

  const freemiumFeatures = [
    { icon: Heart, text: "Basic swipes (10 per day)", included: true },
    { icon: Heart, text: "Basic chat with matches", included: true },
    { icon: Shield, text: "View basic dog profiles", included: true },
    { icon: X, text: "Vet connect access", included: false },
    { icon: X, text: "Priority visibility", included: false },
    { icon: X, text: "Vet clearance badge", included: false },
    { icon: X, text: "Undo swipe", included: false },
    { icon: X, text: "Unlimited swipes", included: false },
    { icon: X, text: "Partner discounts", included: false },
  ];

  const proFeatures = [
    { icon: Heart, text: "Basic swipes & chat", included: true },
    { icon: Shield, text: "Vet connect access", included: true },
    { icon: Star, text: "Priority swipe visibility", included: true },
    { icon: Badge, text: "Vet clearance badge", included: true },
    { icon: Undo2, text: "Undo swipe", included: true },
    { icon: Infinity, text: "Unlimited swipes", included: true },
    { icon: Percent, text: "Partner service discounts", included: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock premium features to find the perfect match for your furry friend and access professional veterinary care
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Freemium Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Basic Plan
            </CardTitle>
            <CardDescription>Perfect for casual matching</CardDescription>
            <div className="text-3xl font-bold">Free</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {freemiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={feature.included ? "" : "text-gray-400"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-2 border-purple-500">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-purple-500 hover:bg-purple-600">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              Pro Plan
            </CardTitle>
            <CardDescription>Ultimate dog dating experience</CardDescription>
            <div className="text-3xl font-bold">
              $9.99
              <span className="text-base font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full mt-6 bg-purple-500 hover:bg-purple-600" 
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : "Upgrade to Pro"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center p-4">
          <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Vet Connect</h3>
          <p className="text-sm text-muted-foreground">
            Direct access to certified veterinarians for health consultations
          </p>
        </Card>
        
        <Card className="text-center p-4">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Priority Visibility</h3>
          <p className="text-sm text-muted-foreground">
            Your dog appears first in swipe stacks for better matches
          </p>
        </Card>
        
        <Card className="text-center p-4">
          <Percent className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Partner Discounts</h3>
          <p className="text-sm text-muted-foreground">
            Exclusive discounts on pet supplies, grooming, and vet services
          </p>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">What happens to my matches if I downgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Your existing matches and conversations remain intact. You'll just return to the basic swipe limits.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How does the vet clearance badge work?</h4>
            <p className="text-sm text-muted-foreground">
              Pro users get a verified badge showing their dog has current vet clearance, building trust with potential matches.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}