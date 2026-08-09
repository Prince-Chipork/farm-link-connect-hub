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
} from "lucide-react";

import { toast } from "sonner";

/* =========================================================
   TYPES
   ========================================================= */

type DeliveryOption = {
  option_name: string;
  delivery_fee: number;
  estimated_days: number;
};

type ProductFormData = {
  name: string;
  category: string;
  description: string;
  price: string;
  quantity: string;
  unit: string;
  weight_kg: string;
  weight_source: string;
  harvestDate: string;
  location: string;
};

/* =========================================================
   CATEGORIES
   ========================================================= */

const categories = [
  "Crops",
  "Poultry",
  "Fishery",
  "Processed",
  "Other",
];

/* =========================================================
   CATEGORY UNITS
   ========================================================= */

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

/* =========================================================
   WEIGHT SOURCES
   ========================================================= */

const weightSources = [
  {
    value: "weighed",
    label: "Weighed with a scale",
  },
  {
    value: "estimated",
    label: "Estimated by farmer",
  },
  {
    value: "standard",
    label: "Standard/known weight",
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  /* =======================================================
     DELIVERY OPTIONS

     Explicit type prevents the previous "never" error.
     ======================================================= */

  const [deliveryOptions, setDeliveryOptions] =
    useState<DeliveryOption[]>([
      {
        option_name: "Pickup",
        delivery_fee: 0,
        estimated_days: 0,
      },
    ]);

  /* =======================================================
     FORM DATA
     ======================================================= */

  const [formData, setFormData] =
    useState<ProductFormData>({
      name: "",
      category: "Crops",
      description: "",
      price: "",
      quantity: "",
      unit: categoryUnits["Crops"][0],
      weight_kg: "",
      weight_source: "standard",
      harvestDate: "",
      location: user?.farmLocation || "",
    });

  /* =========================================================
     IMAGE HANDLING
     ========================================================= */

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
      (file) => URL.createObjectURL(file)
    );

    setPreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);
  };

  const removeImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =========================================================
     ADD DELIVERY OPTION
     ========================================================= */

  const addDeliveryOption = () => {
    setDeliveryOptions((prev) => [
      ...prev,
      {
        option_name: "",
        delivery_fee: 0,
        estimated_days: 1,
      },
    ]);
  };

  /* =========================================================
     REMOVE DELIVERY OPTION
     ========================================================= */

  const removeDeliveryOption = (index: number) => {
    if (deliveryOptions.length === 1) {
      toast.error(
        "At least one delivery option is required."
      );
      return;
    }

    setDeliveryOptions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =========================================================
     SUBMIT
     ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      toast.error(
        "You must be logged in as a farmer."
      );
      return;
    }

    /* -------------------------------------------------------
       BASIC VALIDATION
       ------------------------------------------------------- */

    if (!formData.name.trim()) {
      toast.error(
        "Enter a product name."
      );
      return;
    }

    if (!formData.price) {
      toast.error(
        "Enter the product price."
      );
      return;
    }

    if (!formData.quantity) {
      toast.error(
        "Enter the product quantity."
      );
      return;
    }

    if (!formData.weight_kg) {
      toast.error(
        "Enter the estimated or actual product weight."
      );
      return;
    }

    const price = Number(
      formData.price
    );

    const quantity = Number(
      formData.quantity
    );

    const weightKg = Number(
      formData.weight_kg
    );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      toast.error(
        "Enter a valid product price."
      );
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      toast.error(
        "Enter a valid product quantity."
      );
      return;
    }

    if (
      !Number.isFinite(weightKg) ||
      weightKg <= 0
    ) {
      toast.error(
        "Enter a valid product weight."
      );
      return;
    }

    /* -------------------------------------------------------
       VALIDATE DELIVERY OPTIONS
       ------------------------------------------------------- */

    for (
      let i = 0;
      i < deliveryOptions.length;
      i++
    ) {
      const option =
        deliveryOptions[i];

      if (!option.option_name.trim()) {
        toast.error(
          `Enter a name for delivery option ${i + 1}.`
        );
        return;
      }

      if (
        !Number.isFinite(
          option.delivery_fee
        ) ||
        option.delivery_fee < 0
      ) {
        toast.error(
          `Enter a valid delivery fee for option ${i + 1}.`
        );
        return;
      }

      if (
        !Number.isFinite(
          option.estimated_days
        ) ||
        option.estimated_days < 0
      ) {
        toast.error(
          `Enter valid estimated delivery days for option ${i + 1}.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      /* =====================================================
         UPLOAD IMAGES
         ===================================================== */

      const imageUrls: string[] = [];

      for (const file of images) {
        const fileExt =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

        const filePath =
          `${user.id}/${fileName}`;

        const {
          data: uploadData,
          error: uploadError,
        } = await supabase.storage
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
          "Uploaded:",
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

      /* =====================================================
         CREATE PRODUCT
         ===================================================== */

      const {
        data: product,
        error: productError,
      } = await supabase
        .from("products")
        .insert({
          farmer_id: user.id,

          name:
            formData.name.trim(),

          category:
            formData.category,

          description:
            formData.description.trim(),

          price,

          quantity,

          unit:
            formData.unit,

          weight_kg:
            weightKg,

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

      if (productError) {
        console.error(
          "Product creation error:",
          productError
        );

        throw productError;
      }

      if (!product) {
        throw new Error(
          "Product was created but no product record was returned."
        );
      }

      /* =====================================================
         CREATE DELIVERY OPTIONS
         ===================================================== */

      const deliveryRows =
        deliveryOptions.map(
          (option) => ({
            product_id:
              product.id,

            option_name:
              option.option_name.trim(),

            delivery_fee:
              Number(
                option.delivery_fee
              ),

            estimated_days:
              Number(
                option.estimated_days
              ),
          })
        );

      const {
        error: deliveryError,
      } = await supabase
        .from("delivery_options")
        .insert(
          deliveryRows
        );

      if (deliveryError) {
        console.error(
          "Delivery option creation error:",
          deliveryError
        );

        /*
         * The product exists but its delivery
         * options failed. Remove the product so
         * we don't leave an incomplete listing.
         */

        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            product.id
          );

        throw deliveryError;
      }

      /* =====================================================
         SUCCESS
         ===================================================== */

      toast.success(
        "Product created successfully!"
      );

      navigate(
        "/farmer/products"
      );

    } catch (error: any) {
      console.error(
        "Create product error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to create product."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">

      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
        type="button"
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
            onSubmit={handleSubmit}
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
                            formData
                              .category
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
                  WEIGHT
                  ================================================= */}

              <div className="space-y-2">

                <Label htmlFor="weight_kg">
                  Estimated / Actual Weight (kg)
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
                  placeholder="e.g. 25"
                  required
                />

                <p className="text-xs text-muted-foreground">
                  You can estimate the weight if
                  you don't have a weighing scale.
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
                    <SelectValue />
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
    DELIVERY OPTIONS
    ================================================= */}

<div className="space-y-4">

  <div>
    <Label className="text-lg font-semibold">
      Delivery Options
    </Label>

    <p className="text-sm text-muted-foreground mt-1">
      These delivery options are currently used
      for product-level delivery information.
    </p>
  </div>

  {deliveryOptions.map((option, index) => (
    <div
      key={index}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 border rounded-lg p-4"
    >

      {/* OPTION NAME */}

      <div className="space-y-2">

        <Label>
          Option
        </Label>

        <Input
          placeholder="e.g. Pickup"
          value={option.option_name}
          onChange={(e) => {
            setDeliveryOptions((prev) =>
              prev.map((item, i) =>
                i === index
                  ? {
                      option_name:
                        e.target.value,
                      delivery_fee:
                        item.delivery_fee,
                      estimated_days:
                        item.estimated_days,
                    }
                  : item
              )
            );
          }}
        />

      </div>

      {/* DELIVERY FEE */}

      <div className="space-y-2">

        <Label>
          Delivery Fee
        </Label>

        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={option.delivery_fee}
          onChange={(e) => {
            setDeliveryOptions((prev) =>
              prev.map((item, i) =>
                i === index
                  ? {
                      option_name:
                        item.option_name,
                      delivery_fee:
                        Number(
                          e.target.value
                        ),
                      estimated_days:
                        item.estimated_days,
                    }
                  : item
              )
            );
          }}
        />

      </div>

      {/* ESTIMATED DAYS */}

      <div className="space-y-2">

        <Label>
          Estimated Days
        </Label>

        <Input
          type="number"
          min="0"
          step="1"
          placeholder="1"
          value={option.estimated_days}
          onChange={(e) => {
            setDeliveryOptions((prev) =>
              prev.map((item, i) =>
                i === index
                  ? {
                      option_name:
                        item.option_name,
                      delivery_fee:
                        item.delivery_fee,
                      estimated_days:
                        Number(
                          e.target.value
                        ),
                    }
                  : item
              )
            );
          }}
        />

      </div>

      {/* REMOVE */}

      <div className="flex items-end">

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            if (deliveryOptions.length === 1) {
              toast.error(
                "At least one delivery option is required."
              );
              return;
            }

            setDeliveryOptions((prev) =>
              prev.filter(
                (_, i) => i !== index
              )
            );
          }}
        >
          Remove
        </Button>

      </div>

    </div>
  ))}

  <Button
    type="button"
    variant="outline"
    onClick={() => {
      setDeliveryOptions((prev) => [
        ...prev,
        {
          option_name: "",
          delivery_fee: 0,
          estimated_days: 1,
        },
      ]);
    }}
  >
    + Add Delivery Option
  </Button>

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
                        src={preview}
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
