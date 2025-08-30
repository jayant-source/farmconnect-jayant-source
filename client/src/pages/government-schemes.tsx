import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  ExternalLink, 
  IndianRupee, 
  Users, 
  Tractor, 
  Leaf,
  Shield,
  Award,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Scheme {
  id: string;
  name: string;
  description: string;
  benefits: string;
  eligibility: string;
  category: string;
  amount: string;
  icon: any;
  applyLink: string;
}

const schemes: Scheme[] = [
  {
    id: "pmkisan",
    name: "PM-KISAN",
    description: "Direct income support to farmers families",
    benefits: "₹6,000 per year in three equal installments",
    eligibility: "Small and marginal farmers with cultivable land",
    category: "Financial Support",
    amount: "₹6,000/year",
    icon: IndianRupee,
    applyLink: "https://pmkisan.gov.in/"
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme for farmers",
    benefits: "Insurance coverage against crop loss due to natural disasters",
    eligibility: "All farmers growing notified crops in notified areas",
    category: "Insurance",
    amount: "Based on sum insured",
    icon: Shield,
    applyLink: "https://pmfby.gov.in/"
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    description: "Credit support for agricultural and allied activities",
    benefits: "Easy access to credit at subsidized interest rates",
    eligibility: "All farmers including tenant farmers, oral lessees",
    category: "Credit",
    amount: "Based on crop area & type",
    icon: Award,
    applyLink: "https://www.india.gov.in/spotlight/kisan-credit-card-kcc-scheme"
  },
  {
    id: "pmksny",
    name: "PM Kisan Samman Nidhi Yojana",
    description: "Income support scheme for farmer families",
    benefits: "Direct benefit transfer to bank accounts",
    eligibility: "Small and marginal farmer families",
    category: "Financial Support",
    amount: "₹6,000/year",
    icon: Users,
    applyLink: "https://pmkisan.gov.in/"
  },
  {
    id: "mssp",
    name: "Minimum Support Price",
    description: "Price support mechanism for agricultural products",
    benefits: "Guaranteed minimum price for crops",
    eligibility: "Farmers selling notified crops",
    category: "Price Support",
    amount: "Varies by crop",
    icon: Leaf,
    applyLink: "https://cacp.dacnet.nic.in/"
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization",
    description: "Financial assistance for farm equipment",
    benefits: "Subsidy on purchase of farm machinery",
    eligibility: "Individual farmers and farmer groups",
    category: "Equipment",
    amount: "Up to 50% subsidy",
    icon: Tractor,
    applyLink: "https://agrimachinery.nic.in/"
  }
];

const categories = ["All", "Financial Support", "Insurance", "Credit", "Price Support", "Equipment"];

export default function GovernmentSchemes() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      "Financial Support": "bg-green-500/10 text-green-600 border-green-200",
      "Insurance": "bg-blue-500/10 text-blue-600 border-blue-200",
      "Credit": "bg-purple-500/10 text-purple-600 border-purple-200",
      "Price Support": "bg-orange-500/10 text-orange-600 border-orange-200",
      "Equipment": "bg-indigo-500/10 text-indigo-600 border-indigo-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/10 text-gray-600 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-center flex-1" data-testid="schemes-title">
          Government Schemes
        </h1>
        <div className="w-10"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Search and Filter */}
        <Card className="glass-enhanced shadow-lg border border-white/20" data-testid="search-filter-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-schemes"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 pl-10" data-testid="filter-category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchemes.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card 
                className="glass-enhanced shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full" 
                data-testid={`scheme-${scheme.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <scheme.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2" data-testid={`scheme-name-${scheme.id}`}>
                        {scheme.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(scheme.category)}
                        data-testid={`scheme-category-${scheme.id}`}
                      >
                        {scheme.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600" data-testid={`scheme-description-${scheme.id}`}>
                    {scheme.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Benefits:</p>
                      <p className="text-sm text-gray-600" data-testid={`scheme-benefits-${scheme.id}`}>
                        {scheme.benefits}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Amount:</p>
                      <p className="text-sm font-bold text-emerald-600" data-testid={`scheme-amount-${scheme.id}`}>
                        {scheme.amount}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Eligibility:</p>
                      <p className="text-xs text-gray-600" data-testid={`scheme-eligibility-${scheme.id}`}>
                        {scheme.eligibility}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => window.open(scheme.applyLink, '_blank')}
                    data-testid={`button-apply-${scheme.id}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <Card className="glass-enhanced shadow-lg border border-white/20">
            <CardContent className="p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schemes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="glass-enhanced shadow-lg border border-white/20 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Important Note</p>
                <p className="text-xs text-blue-800">
                  Please verify eligibility criteria and application procedures on official government websites. 
                  Scheme details may change periodically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}