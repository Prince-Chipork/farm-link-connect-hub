import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ArrowLeft,
  Upload,
  X,
  Scale,
} from "lucide-react";

import { toast } from "sonner";

/*
 * ---------------------------------------------------------
 * PRODUCT CATEGORIES
 * ---------------------------------------------------------
 */

const categories = [
  "Crops",
  "Poultry",
  "Fishery",
  "Processed",
  "Other",
];

/*
 * ---------------------------------------------------------
 * UNITS BY CATEGORY
 * ---------------------------------------------------------
 */

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
    "tuber",
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

/*
 * ---------------------------------------------------------
 * WEIGHT SOURCES
 * ---------------------------------------------------------
 *
 * standard:
 * A standard/typical weight is being used.
 *
 * estimated:
 * Farmer estimates the weight.
 *
 * scale:
 * Product was actually weighed.
 */

const weightSources = [
  {
    value: "standard",
    label: "Standard Estimate",
  },
  {
    value: "estimated",
    label: "Farmer Estimate",
  },
  {
    value: "scale",
    label: "Weighed on Scale",
  },
];

/*
 * ---------------------------------------------------------
 * CREATE PRODUCT
 * ---------------------------------------------------------
 */

export default function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  /*
   * Product images
   */
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  /*
   * Product form
   */
  const [formData, setFormData] = useState({
    name: "",
    category: "Crops",
    description: "",
    price: "",
    quantity: "",
    unit: categoryUnits["Crops"][0],

    /*
     * Weight of ONE unit of the product.
     *
     * Example:
     *
     * Quantity = 20
     * Unit = 50kg bag
     * Weight = 50kg
     *
     * Checkout can then calculate:
     *
     * 20 × 50kg = 1,000kg
     */
    weight_kg: "",

    /*
     * How the weight was determined.
     */
    weight_source: "standard",

    harvestDate: "",
    location: user?.farmLocation || "",
  });

  /*
   * ---------------------------------------------------------
   * IMAGE SELECTION
   * ---------------------------------------------------------
   */

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    setImages((prev) => [
      ...prev,
      ...newFiles,
    ]);

    const newPreviews = newFiles.map(
      (file) =>
        URL.createObjectURL(file)
    );

    setPreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);
  };

  /*
   * ---------------------------------------------------------
   * REMOVE IMAGE
   * ---------------------------------------------------------
   */

  const removeImage = (index: number) => {
    /*
     * Release the browser object URL
     * before removing the preview.
     */
    const preview = previews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setPreviews((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT PRODUCT
   * ---------------------------------------------------------
   */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      toast.error(
        "You must be logged in to create a product."
      );
      return;
    }

    /*
     * -----------------------------------------------------
     * BASIC VALIDATION
     * -----------------------------------------------------
     */

    if (!formData.name.trim()) {
      toast.error(
        "Enter a product name."
      );
      return;
    }

    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
      toast.error(
        "Enter a valid product price."
      );
      return;
    }

    if (
      !formData.quantity ||
      Number(formData.quantity) <= 0
    ) {
      toast.error(
        "Enter a valid product quantity."
      );
      return;
    }

    if (
      !formData.weight_kg ||
      Number(formData.weight_kg) <= 0
    ) {
      toast.error(
        "Enter a valid weight per unit."
      );
      return;
    }

    if (!formData.location.trim()) {
      toast.error(
        "Enter the farm or product location."
      );
      return;
    }

    /*
     * -----------------------------------------------------
     * START
     * -----------------------------------------------------
     */

    setLoading(true);

    try {
      /*
       * ---------------------------------------------------
       * UPLOAD PRODUCT IMAGES
       * ---------------------------------------------------
       */

      const imageUrls: string[] = [];

      for (const file of images) {
        const fileExt =
          file.name
            .split(".")
            .pop();

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

        const filePath =
          `${user.id}/${fileName}`;

        const {
          data: uploadData,
          error: uploadError,
        } =
          await supabase.storage
            .from("product-images")
            .upload(
              filePath,
              file
            );

        if (uploadError) {
          console.error(
            "Image upload error:",
            uploadError
          );

          throw uploadError;
        }

        console.log(
          "Image uploaded:",
          uploadData
        );

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from("product-images")
            .getPublicUrl(
              filePath
            );

        imageUrls.push(
          publicUrlData.publicUrl
        );
      }

      /*
       * ---------------------------------------------------
       * CREATE PRODUCT
       * ---------------------------------------------------
       *
       * IMPORTANT:
       *
       * There is NO delivery_options insertion here.
       *
       * Delivery pricing is now handled by the FarmLink
       * delivery pricing engine at checkout.
       */

      const {
        data: product,
        error,
      } = await supabase
        .from("products")
        .insert({
          farmer_id: user.id,

          name: formData.name.trim(),

          category:
            formData.category,

          description:
            formData.description.trim(),

          price:
            parseFloat(
              formData.price
            ),

          quantity:
            parseInt(
              formData.quantity,
              10
            ),

          unit:
            formData.unit,

          /*
           * Weight of one unit.
           */
          weight_kg:
            parseFloat(
              formData.weight_kg
            ),

          /*
           * standard
           * estimated
           * scale
           */
          weight_source:
            formData.weight_source,

          harvest_date:
            formData.harvestDate ||
            null,

          location:
            formData.location.trim(),

          images:
            imageUrls,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Product creation error:",
          error
        );

        throw error;
      }

      /*
       * ---------------------------------------------------
       * SUCCESS
       * ---------------------------------------------------
       */

      console.log(
        "Product created:",
        product
      );

      toast.success(
        "Product created successfully!"
      );

      /*
       * Navigate back to farmer products.
       */
      navigate(
        "/farmer/products"
      );

    } catch (error: any) {
      console.error(
        "Create product error:",
        error
      );

      /*
       * Supabase errors normally have:
       * message
       * details
       * hint
       * code
       */

      const message =
        error?.message ||
        "Unable to create product.";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">

      {/* BACK BUTTON */}

      <Button
        variant="ghost"
        onClick={() =>
          navigate(-1)
        }
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />

        Back
      </Button>

      <Card>

        <CardHeader>

          <CardTitle className="text-2xl">
            Add New Product
          </CardTitle>

        </CardHeader>

        <CardContent>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >

            {/* =================================================
                BASIC PRODUCT INFORMATION
                ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* PRODUCT NAME */}

              <div className="space-y-2">

                <Label htmlFor="name">
                  Product Name
                </Label>

                <Input
                  id="name"
                  value={
                    formData.name
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Fresh Tomatoes"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="space-y-2">

                <Label htmlFor="category">
                  Category
                </Label>

                <Select
                  value={
                    formData.category
                  }
                  onValueChange={(
                    value
                  ) =>
                    setFormData({
                      ...formData,

                      category:
                        value,

                      /*
                       * Automatically select
                       * the first valid unit
                       * for the new category.
                       */
                      unit:
                        categoryUnits[
                          value
                        ][0],
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>

                  <SelectContent>

                    {categories.map(
                      (category) => (
                        <SelectItem
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

              {/* DESCRIPTION */}

              <div className="space-y-2 md:col-span-2">

                <Label htmlFor="description">
                  Description
                </Label>

                <Textarea
                  id="description"
                  value={
                    formData.description
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe your product, its quality, etc."
                  rows={4}
                />

              </div>

              {/* PRICE */}

              <div className="space-y-2">

                <Label htmlFor="price">
                  Price (per unit)
                </Label>

                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData.price
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price:
                        e.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />

              </div>

              {/* QUANTITY + UNIT */}

              <div className="space-y-2">

                <div className="flex gap-4">

                  <div className="flex-1 space-y-2">

                    <Label htmlFor="quantity">
                      Quantity
                    </Label>

                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formData.quantity
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity:
                            e.target.value,
                        })
                      }
                      placeholder="0"
                      required
                    />

                  </div>

                  <div className="w-32 space-y-2">

                    <Label htmlFor="unit">
                      Unit
                    </Label>

                    <Select
                      value={
                        formData.unit
                      }
                      onValueChange={(
                        value
                      ) =>
                        setFormData({
                          ...formData,
                          unit:
                            value,
                        })
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        {(
                          categoryUnits[
                            formData.category
                          ] || []
                        ).map(
                          (unit) => (
                            <SelectItem
                              key={
                                unit
                              }
                              value={
                                unit
                              }
                            >
                              {unit}
                            </SelectItem>
                          )
                        )}

                      </SelectContent>

                    </Select>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PRODUCT WEIGHT
                  ================================================= */}

              <div className="space-y-2">

                <Label
                  htmlFor="weight_kg"
                  className="flex items-center gap-2"
                >

                  <Scale className="h-4 w-4" />

                  Weight per Unit (kg)

                </Label>

                <Input
                  id="weight_kg"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    formData.weight_kg
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight_kg:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. 50"
                  required
                />

                <p className="text-xs text-muted-foreground">

                  Enter the estimated weight
                  of one unit of this product.

                </p>

              </div>

              {/* WEIGHT SOURCE */}

              <div className="space-y-2">

                <Label htmlFor="weight_source">
                  Weight Source
                </Label>

                <Select
                  value={
                    formData.weight_source
                  }
                  onValueChange={(
                    value
                  ) =>
                    setFormData({
                      ...formData,
                      weight_source:
                        value,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue placeholder="Select weight source" />
                  </SelectTrigger>

                  <SelectContent>

                    {weightSources.map(
                      (source) => (
                        <SelectItem
                          key={
                            source.value
                          }
                          value={
                            source.value
                          }
                        >
                          {
                            source.label
                          }
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

                <p className="text-xs text-muted-foreground">

                  No weighing scale?
                  You can use a standard
                  or estimated weight.

                </p>

              </div>

              {/* HARVEST DATE */}

              <div className="space-y-2">

                <Label htmlFor="harvestDate">
                  Harvest Date
                </Label>

                <Input
                  id="harvestDate"
                  type="date"
                  value={
                    formData.harvestDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harvestDate:
                        e.target.value,
                    })
                  }
                />

              </div>

              {/* LOCATION */}

              <div className="space-y-2">

                <Label htmlFor="location">
                  Location
                </Label>

                <Input
                  id="location"
                  value={
                    formData.location
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location:
                        e.target.value,
                    })
                  }
                  placeholder="Farm location"
                  required
                />

              </div>

            </div>

            {/* =================================================
                WEIGHT EXPLANATION
                ================================================= */}

            <div className="rounded-lg border border-dashed p-4">

              <div className="flex items-start gap-3">

                <Scale className="mt-0.5 h-5 w-5 text-primary" />

                <div className="space-y-1">

                  <p className="font-medium">
                    Why do we need product weight?
                  </p>

                  <p className="text-sm text-muted-foreground">

                    FarmLink uses product weight
                    to select an appropriate
                    delivery method and calculate
                    delivery charges automatically.

                  </p>

                  <p className="text-sm text-muted-foreground">

                    For example, if you have
                    20 bags weighing 50 kg each,
                    FarmLink calculates the total
                    shipment weight as 1,000 kg.

                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                PRODUCT IMAGES
                ================================================= */}

            <div className="space-y-4">

              <Label>
                Product Images
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                {previews.map(
                  (
                    preview,
                    index
                  ) => (

                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >

                      <img
                        src={
                          preview
                        }
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >

                        <X className="h-3 w-3" />

                      </button>

                    </div>

                  )
                )}

                {/* IMAGE UPLOAD */}

                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">

                  <Upload className="h-6 w-6 mb-2" />

                  <span className="text-xs">
                    Upload
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImageChange
                    }
                  />

                </label>

              </div>

            </div>

            {/* =================================================
                SUBMIT
                ================================================= */}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >

              {loading
                ? "Creating Product..."
                : "Create Product"}

            </Button>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}
