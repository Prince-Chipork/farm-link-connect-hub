import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

const categories = ["Crops", "Poultry", "Fishery", "Processed", "Other"];
const categoryUnits: Record<string, string[]> = {
  Crops: [
    "kg",
    "g",
    "ton",
    "25kg bag",
    "50kg bag",
    "100kg bag",
    "sack",
    "basket",
    "bundle",
    "crate",
    "bunch",
  ],

  Poultry: [
    "bird",
    "dozen",
    "tray",
    "crate",
    "kg",
  ],

  Fishery: [
    "kg",
    "g",
    "basket",
    "crate",
    "piece",
  ],

  Processed: [
    "L",
    "mL",
    "bottle",
    "carton",
    "pack",
    "box",
    "sachet",
  ],

  Other: [
    "piece",
    "head",
    "kg",
    "bundle",
    "box",
    "pack",
    "crate",
    "basket",
  ],
};

export default function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "Crops",
    description: "",
    price: "",
    quantity: "",
    unit: categoryUnits["Crops"][0],
    harvestDate: "",
    location: user?.farmLocation || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const imageUrls: string[] = [];
      
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        imageUrls.push(data.publicUrl);
      }

      const { error } = await supabase.from('products').insert({
        farmer_id: user.id,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        harvest_date: formData.harvestDate || null,
        location: formData.location,
        images: imageUrls,
      });

      if (error) throw error;

      toast.success("Product created successfully!");
      navigate("/farmer/products");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Fresh Tomatoes" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your product, its quality, etc." 
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (per unit)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder="0" 
                      required 
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
  value={formData.category}
  onValueChange={(value) =>
    setFormData({
      ...formData,
      category: value,
      unit: categoryUnits[value][0], // automatically select the first valid unit
    })
  }
>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
  {(categoryUnits[formData.category] || []).map((u) => (
    <SelectItem key={u} value={u}>
      {u}
    </SelectItem>
  ))}
</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date</Label>
                <Input 
                  id="harvestDate" 
                  type="date" 
                  value={formData.harvestDate} 
                  onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Farm location" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Product Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-xs">Upload</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Product..." : "Create Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
