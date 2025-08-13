import React, { useState } from "react";
import { Crown, Star, Heart, Shield, Calendar, X, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "wouter";

interface PremiumUpsellSheetProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  context: string;
}

export default function PremiumUpsellSheet({ 
  isOpen, 
  onClose, 
  feature, 
  context 
}: PremiumUpsellSheetProps) {
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  // Track analytics for upsell view
  React.useEffect(() => {
    if (isOpen && typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'upsell_view', {
        feature: feature,
        context: context
      });
    }
  }, [isOpen, feature, context]);

  const handleStartTrial = () => {
    setIsStartingTrial(true);
    
    // Track trial start analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'upsell_start', {
        feature: feature,
        context: context,
        action: 'trial_start'
      });
    }

    // Simulate trial activation
    setTimeout(() => {
      setIsStartingTrial(false);
      onClose();
      // In real app, this would redirect to payment/subscription flow
    }, 2000);
  };

  const premiumFeatures = [
    {
      icon: Shield,
      title: "Vet Connect Premium",
      description: "Direct scheduling with verified veterinarians",
      highlight: true
    },
    {
      icon: Calendar,
      title: "Priority Booking",
      description: "Get first access to appointment slots"
    },
    {
      icon: Heart,
      title: "Unlimited Health Records",
      description: "Store complete medical history for all pets"
    },
    {
      icon: Star,
      title: "24/7 Virtual Consultations",
      description: "Chat with vets anytime for quick questions"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Unlock {feature}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Upgrade to Premium for the complete PupMatch experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Feature Highlight */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{feature}</h3>
                  <p className="text-sm text-gray-600">
                    {feature === "Vet Connect Premium" 
                      ? "Schedule appointments directly with trusted veterinarians in your area"
                      : "Access premium features designed for your pet's health and wellbeing"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">What's included with Premium:</h4>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      feature.highlight ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      feature.highlight ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    {feature.highlight && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Popular
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">$19.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  First 7 days free, then $19.99/month
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartTrial}
              disabled={isStartingTrial}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              data-testid="button-start-trial"
            >
              {isStartingTrial ? (
                "Starting Free Trial..."
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Start 7-Day Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <Link href="/premium" className="block">
              <Button
                variant="outline"
                className="w-full border-2"
                data-testid="button-view-plans"
              >
                View All Plans
              </Button>
            </Link>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-700"
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>No commitment</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>Loved by 10k+ pet parents</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}