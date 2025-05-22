"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  HelpCircle,
  Loader2,
  Sprout,
  ClipboardList,
  MapPin,
  CheckCircle2,
  Target,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { enhancedGrowthSchema } from "@/lib/validations/form-schemas";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GROWTH_STAGES } from "@/lib/utils/growth-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function GrowthForm({
  onSubmit,
  defaultValues,
  mode = "individual",
  bulkSummary,
  farms = [],
  plots = [],
  users = [],
  isLoading = false,
  isSubmitting = false,
  allowRowSelection = false,
  hole,
  onSuccess,
  onError,
}: {
  onSubmit: (
    values: z.infer<typeof enhancedGrowthSchema> & {
      selectedRow?: string;
      selectedHoles?: string[];
    }
  ) => Promise<{ success: boolean; message?: string; error?: string }> | void;
  defaultValues?: Partial<z.infer<typeof enhancedGrowthSchema>>;
  mode?: "individual" | "bulk";
  bulkSummary?: { plotName: string; plantCount: number; rowsInfo?: string };
  farms?: any[];
  plots?: any[];
  users?: any[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  allowRowSelection?: boolean;
  hole?: any;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [selectedHoles, setSelectedHoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>(
    defaultValues?.isNewPlant ? "new-plant" : "record-growth"
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Create separate forms for each tab to avoid state conflicts
  const growthForm = useForm<z.infer<typeof enhancedGrowthSchema>>({
    resolver: zodResolver(enhancedGrowthSchema) as any,
    defaultValues: {
      farmId: defaultValues?.farmId || "",
      plotId: defaultValues?.plotId || "",
      stage: defaultValues?.stage || "",
      date: defaultValues?.date || new Date(),
      isNewPlant: false, // Always false for growth recording
      notes: defaultValues?.notes || "",
      plantHealth: defaultValues?.plantHealth ?? undefined,
      currentSuckerCount: typeof defaultValues?.currentSuckerCount === "number"
        ? defaultValues.currentSuckerCount
        : 0,
    },
  });

  const newPlantForm = useForm<z.infer<typeof enhancedGrowthSchema>>({
    resolver: zodResolver(enhancedGrowthSchema) as any,
    defaultValues: {
      farmId: defaultValues?.farmId || "",
      plotId: defaultValues?.plotId || "",
      stage: "Early Growth", // Default for new plants
      date: defaultValues?.date || new Date(),
      isNewPlant: true, // Always true for new plants
      autoFillRows: defaultValues?.autoFillRows ?? false,
      plantCount: defaultValues?.plantCount || 1,
      notes: defaultValues?.notes || "",
      workerId: defaultValues?.workerId || "",
    },
  });

  // Sync forms when tab changes
  useEffect(() => {
    if (activeTab === "record-growth") {
      growthForm.setValue("farmId", newPlantForm.getValues("farmId"));
      growthForm.setValue("plotId", newPlantForm.getValues("plotId"));
    } else {
      newPlantForm.setValue("farmId", growthForm.getValues("farmId"));
      newPlantForm.setValue("plotId", growthForm.getValues("plotId"));
    }
  }, [activeTab]);

  // Get current form based on active tab
  const currentForm = activeTab === "record-growth" ? growthForm : newPlantForm;

  // Watch form values
  const selectedFarmId = currentForm.watch("farmId");
  const selectedPlotId = currentForm.watch("plotId");
  const autoFillRows = newPlantForm.watch("autoFillRows");
  const plantCount = newPlantForm.watch("plantCount");

  // Filter plots by farm
  const filteredPlots = selectedFarmId
    ? plots.filter((plot) => plot.farmId?.toString() === selectedFarmId)
    : plots;

  // Find rows and holes for selected plot
  const selectedPlot = filteredPlots.find(
    (plot) => plot.id?.toString() === selectedPlotId
  );
  const rows = selectedPlot?.layoutStructure || [];

  // For growth recording
  const holesInSelectedRow =
    rows.find((row: any) => row.rowNumber?.toString() === selectedRow)?.holes ||
    [];
  const plantedHoles = holesInSelectedRow.filter(
    (hole: any) => hole.status === "PLANTED"
  );

  // For new plant
  const emptyHoles = rows.flatMap((row: any) =>
    row.holes
      .filter((h: any) => h.status !== "PLANTED")
      .map((h: any) => ({ ...h, rowNumber: row.rowNumber }))
  );

  // Ensure plantCount is always a number (default 1)
  const safePlantCount =
    typeof plantCount === "number" && !isNaN(plantCount) ? plantCount : 1;

  // Calculate how many empty holes will be filled based on plant count
  const willFillHoles = Math.min(emptyHoles.length, safePlantCount);
  const notEnoughSpace = safePlantCount > emptyHoles.length;

  // Is the form submission ready?
  const isReadyToSubmit =
    !isSubmitting &&
    ((activeTab === "record-growth" &&
      (mode === "individual" ||
        (mode === "bulk" && selectedRow && selectedHoles.length > 0))) ||
      (activeTab === "new-plant" && selectedPlotId));

  const handleSubmit = async (values: any) => {
    setServerError(null);
    setPending(true);
    try {
      values.isNewPlant = activeTab === "new-plant";
      if (activeTab === "record-growth" && mode === "bulk") {
        values.selectedRow = selectedRow;
        values.selectedHoles = selectedHoles;
      }
      if (activeTab === "record-growth" && mode === "individual" && hole) {
        values.hole = {
          rowNumber: hole.rowNumber,
          holeNumber: hole.holeNumber,
        };
      }
      const result = await onSubmit(values);
      if (result && typeof result === "object") {
        if (result.success) {
          setServerError(null);
          if (onSuccess) onSuccess();
        } else {
          setServerError(result.error || result.message || "Failed to record growth.");
          if (onError) onError(result.error || result.message || "Failed to record growth.");
        }
      }
    } catch (e: any) {
      setServerError(e?.message || "Failed to record growth.");
      if (onError) onError(e?.message || "Failed to record growth.");
    } finally {
      setPending(false);
    }
  };

  return (
    <TooltipProvider>
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="record-growth"
            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
          >
            <Sprout className="mr-2 h-4 w-4" />
            Record Growth
          </TabsTrigger>
          <TabsTrigger
            value="new-plant"
            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Plant
          </TabsTrigger>
        </TabsList>

        {/* RECORD GROWTH TAB */}
        <TabsContent value="record-growth" className="mt-4">
          <Form {...growthForm}>
            <form
              onSubmit={growthForm.handleSubmit(handleSubmit)}
              className="space-y-6"
              aria-live="polite"
            >
              {/* Context Information */}
              {mode === "individual" && hole && <PlantInfoCard hole={hole} />}

              {mode === "bulk" && bulkSummary && (
                <BulkUpdateAlert
                  bulkSummary={bulkSummary}
                  selectedRow={selectedRow}
                  selectedHoles={selectedHoles}
                />
              )}

              {/* Location Section - Simplified for Record Growth */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={growthForm.control}
                    name="farmId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== field.value) {
                              growthForm.setValue("plotId", "");
                              setSelectedRow("");
                              setSelectedHoles([]);
                            }
                          }}
                          defaultValue={field.value}
                          disabled={isLoading || isSubmitting || !!hole}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a farm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            {isLoading ? (
                              <LoadingItem text="Loading farms..." />
                            ) : farms.length === 0 ? (
                              <EmptyItem text="No farms available" />
                            ) : (
                              farms.map((farm) => (
                                <SelectItem
                                  key={farm.id}
                                  value={farm.id.toString()}
                                >
                                  {farm.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={growthForm.control}
                    name="plotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plot</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== field.value) {
                              setSelectedRow("");
                              setSelectedHoles([]);
                            }
                          }}
                          defaultValue={field.value}
                          disabled={
                            !selectedFarmId ||
                            isLoading ||
                            isSubmitting ||
                            !!hole
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            {isLoading ? (
                              <LoadingItem text="Loading plots..." />
                            ) : filteredPlots.length === 0 ? (
                              <EmptyItem
                                text={
                                  selectedFarmId
                                    ? "No plots available for this farm"
                                    : "Select a farm first"
                                }
                              />
                            ) : (
                              filteredPlots.map((plot) => (
                                <SelectItem
                                  key={plot.id}
                                  value={plot.id.toString()}
                                >
                                  {plot.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Growth Information */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <Sprout className="mr-2 h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">Growth Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={growthForm.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Growth Stage</FormLabel>
                            <StageTooltip />
                          </div>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a growth stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[60]">
                              {GROWTH_STAGES.map((stage) => (
                                <SelectItem key={stage} value={stage}>
                                  {stage}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={growthForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <DatePickerField
                            field={field}
                            isSubmitting={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={growthForm.control}
                    name="plantHealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plant Health</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select health status">
                                {field.value && (
                                  <div className="flex items-center">
                                    <div
                                      className={`mr-2 w-2 h-2 rounded-full ${
                                        field.value === "Healthy"
                                          ? "bg-green-500"
                                          : field.value === "Diseased"
                                          ? "bg-yellow-500"
                                          : field.value === "Pest-affected"
                                          ? "bg-orange-500"
                                          : field.value === "Damaged"
                                          ? "bg-red-500"
                                          : ""
                                      }`}
                                    />
                                    {field.value}
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            {[
                              { value: "Healthy", color: "bg-green-500" },
                              { value: "Diseased", color: "bg-yellow-500" },
                              {
                                value: "Pest-affected",
                                color: "bg-orange-500",
                              },
                              { value: "Damaged", color: "bg-red-500" },
                            ].map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`mr-2 w-2 h-2 rounded-full ${status.color}`}
                                  />
                                  {status.value}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={growthForm.control}
                    name="currentSuckerCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sucker Count</FormLabel>
                        <div className="flex items-center border rounded-md">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-none rounded-l-md"
                            onClick={() =>
                              field.onChange(
                                Math.max(0, (field.value || 0) - 1)
                              )
                            }
                            disabled={isSubmitting || (field.value || 0) <= 0}
                          >
                            <span className="sr-only">Decrease</span>
                            <span className="text-lg">-</span>
                          </Button>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              className="h-9 text-center border-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Math.max(
                                    0,
                                    Number.parseInt(e.target.value) || 0
                                  )
                                )
                              }
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-none rounded-r-md"
                            onClick={() =>
                              field.onChange((field.value || 0) + 1)
                            }
                            disabled={isSubmitting}
                          >
                            <span className="sr-only">Increase</span>
                            <span className="text-lg">+</span>
                          </Button>
                        </div>
                        <FormDescription>
                          Number of active suckers for this plant
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={growthForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any observations about the plant's growth..."
                            className="resize-none"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Row & Hole Selection for Bulk Mode */}
              {mode === "bulk" && selectedPlot && rows.length > 0 && (
                <Card className="border-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <Target className="mr-2 h-4 w-4 text-blue-500" />
                      <CardTitle className="text-base">Select Plants</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Row selection */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Select a Row</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                        {rows.map((row: any) => {
                          const plantedCount = row.holes.filter(
                            (h: any) => h.status === "PLANTED"
                          ).length;
                          return (
                            <Tooltip key={row.rowNumber}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    selectedRow === row.rowNumber.toString()
                                      ? "default"
                                      : "outline"
                                  }
                                  className={cn(
                                    "justify-between",
                                    selectedRow === row.rowNumber.toString()
                                      ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                      : "border-gray-200",
                                    plantedCount === 0 && "opacity-50"
                                  )}
                                  onClick={() => {
                                    setSelectedRow(row.rowNumber.toString());
                                    setSelectedHoles([]);
                                  }}
                                  disabled={plantedCount === 0}
                                >
                                  <span>Row {row.rowNumber}</span>
                                  <Badge
                                    variant="outline"
                                    className="ml-1 px-1.5 h-4 min-w-4 text-xs"
                                  >
                                    {plantedCount}
                                  </Badge>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {plantedCount === 0
                                  ? "No plants in this row"
                                  : `${plantedCount} plant${
                                      plantedCount !== 1 ? "s" : ""
                                    } in this row`}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hole selection - only show if a row is selected */}
                    {selectedRow && plantedHoles.length > 0 && (
                      <PlantSelector
                        plantedHoles={plantedHoles}
                        selectedHoles={selectedHoles}
                        setSelectedHoles={setSelectedHoles}
                        selectedRow={selectedRow}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!isReadyToSubmit || pending}
              >
                {pending ? (
                  <LoadingButton text={activeTab === "new-plant" ? "Adding Plants..." : "Recording Growth..."} />
                ) : (
                  activeTab === "new-plant"
                    ? `Add ${safePlantCount > 1 ? `${safePlantCount} Plants` : "New Plant"}`
                    : "Record Growth Stage"
                )}
              </Button>
              {serverError && (
                <div className="mt-2 text-sm text-red-600" role="alert" aria-live="assertive">
                  {serverError}
                </div>
              )}
            </form>
          </Form>
        </TabsContent>

        {/* ADD NEW PLANT TAB */}
        <TabsContent value="new-plant" className="mt-4">
          <Form {...newPlantForm}>
            <form
              onSubmit={newPlantForm.handleSubmit(handleSubmit)}
              className="space-y-6"
              aria-live="polite"
            >
              {/* Location Section for New Plant */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-green-500" />
                    <CardTitle className="text-base">Where to Plant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={newPlantForm.control}
                    name="farmId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== field.value) {
                              newPlantForm.setValue("plotId", "");
                            }
                          }}
                          defaultValue={field.value}
                          disabled={isLoading || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a farm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            {isLoading ? (
                              <LoadingItem text="Loading farms..." />
                            ) : farms.length === 0 ? (
                              <EmptyItem text="No farms available" />
                            ) : (
                              farms.map((farm) => (
                                <SelectItem
                                  key={farm.id}
                                  value={farm.id.toString()}
                                >
                                  {farm.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={newPlantForm.control}
                    name="plotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plot</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={
                            !selectedFarmId || isLoading || isSubmitting
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            {isLoading ? (
                              <LoadingItem text="Loading plots..." />
                            ) : filteredPlots.length === 0 ? (
                              <EmptyItem
                                text={
                                  selectedFarmId
                                    ? "No plots available for this farm"
                                    : "Select a farm first"
                                }
                              />
                            ) : (
                              filteredPlots.map((plot) => (
                                <SelectItem
                                  key={plot.id}
                                  value={plot.id.toString()}
                                >
                                  {plot.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Plant Details */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <Sprout className="mr-2 h-4 w-4 text-green-500" />
                    <CardTitle className="text-base">
                      New Plant Details
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={newPlantForm.control}
                      name="plantCount"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Number of Plants</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                How many new plants would you like to add?
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Math.max(
                                    1,
                                    Number.parseInt(e.target.value) || 1
                                  )
                                )
                              }
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            {selectedPlotId && (
                              <span
                                className={
                                  emptyHoles.length === 0 ? "text-red-500" : ""
                                }
                              >
                                {emptyHoles.length} empty hole
                                {emptyHoles.length !== 1 ? "s" : ""} available
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={newPlantForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Planting Date</FormLabel>
                          <DatePickerField
                            field={field}
                            isSubmitting={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={newPlantForm.control}
                    name="autoFillRows"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 transition-colors duration-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          newPlantForm.setValue("autoFillRows", !field.value)
                        }
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <div className="flex items-center gap-2">
                            <FormLabel>Auto-fill Rows</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Automatically place new plants in available
                                empty holes
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <FormDescription>
                            System will place plants in available empty holes
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={newPlantForm.control}
                    name="workerId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Assigned Worker</FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Worker responsible for planting
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value
                                  ? users.find(
                                      (worker) => worker.id === field.value
                                    )?.name || "Worker not found"
                                  : "Select worker"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0 z-[60]">
                            <Command>
                              <CommandInput placeholder="Search worker..." />
                              <CommandList>
                                <CommandEmpty>No worker found.</CommandEmpty>
                                <CommandGroup>
                                  {isLoading ? (
                                    <LoadingItem text="Loading workers..." />
                                  ) : users.length === 0 ? (
                                    <EmptyItem text="No workers available" />
                                  ) : (
                                    users.map((worker) => (
                                      <CommandItem
                                        value={worker.name}
                                        key={worker.id}
                                        onSelect={() => {
                                          newPlantForm.setValue(
                                            "workerId",
                                            worker.id
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            worker.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {worker.name}
                                      </CommandItem>
                                    ))
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={newPlantForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about the new plants..."
                            className="resize-none"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Plant Placement Preview */}
              {selectedPlotId && (
                <Card className="border-green-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4 text-green-500" />
                      <CardTitle className="text-base">
                        Plant Placement
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {emptyHoles.length === 0 ? (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 border-red-200"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-red-700">
                          No Empty Holes
                        </AlertTitle>
                        <AlertDescription className="text-red-600">
                          This plot has no empty holes available for planting.
                          Please select a different plot.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {autoFillRows ? (
                            <div className="p-3 bg-green-50 rounded-md">
                              <div className="flex items-start">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium text-green-700">
                                    Auto-placement Active
                                  </p>
                                  <p className="text-sm text-green-600 mt-1">
                                    System will automatically place{" "}
                                    {willFillHoles} plant
                                    {willFillHoles !== 1 ? "s" : ""} in
                                    available holes
                                    {notEnoughSpace && (
                                      <span className="block mt-1 text-amber-600 font-medium">
                                        Note: Only {willFillHoles} out of{" "}
                                        {safePlantCount} plants can be placed
                                        due to space limitations
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 border rounded-md">
                              <p className="text-sm text-muted-foreground">
                                Plants will be placed in the first available
                                empty holes, or you can enable auto-fill above
                                to distribute them optimally.
                              </p>
                            </div>
                          )}

                          {/* Mini plot visualization */}
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-2">
                              Available Planting Locations:
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto p-2 border rounded-md">
                              {rows.map((row: any) => {
                                const emptyHolesInRow = row.holes.filter(
                                  (h: any) => h.status !== "PLANTED"
                                );
                                if (emptyHolesInRow.length === 0) return null;

                                return (
                                  <div
                                    key={row.rowNumber}
                                    className="flex items-center gap-2"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="min-w-10 text-center"
                                    >
                                      Row {row.rowNumber}
                                    </Badge>
                                    <div className="flex flex-wrap gap-1">
                                      {emptyHolesInRow.map((hole: any) => (
                                        <Badge
                                          key={hole.holeNumber}
                                          variant="outline"
                                          className="bg-green-50 border-green-200 text-green-700"
                                        >
                                          {hole.holeNumber}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!isReadyToSubmit || emptyHoles.length === 0}
              >
                {isSubmitting ? (
                  <LoadingButton text="Adding Plants..." />
                ) : (
                  `Add ${
                    safePlantCount > 1
                      ? `${safePlantCount} Plants`
                      : "New Plant"
                  }`
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}

// Helper Components

const LoadingItem = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center py-2">
    <Loader2 className="h-4 w-4 animate-spin mr-2" />
    <span>{text}</span>
  </div>
);

const EmptyItem = ({ text }: { text: string }) => (
  <div className="p-2 text-center text-sm text-muted-foreground">{text}</div>
);

const LoadingButton = ({ text }: { text: string }) => (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {text}
  </>
);

const DatePickerField = ({
  field,
  isSubmitting,
}: {
  field: any;
  isSubmitting: boolean;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <FormControl>
        <Button
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
          disabled={isSubmitting}
        >
          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </FormControl>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 z-[60]" align="start">
      <Calendar
        mode="single"
        selected={field.value}
        onSelect={field.onChange}
        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
        initialFocus
      />
    </PopoverContent>
  </Popover>
);

const StageTooltip = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-sm">
      <p>Select the current growth stage of the plant(s)</p>
      <ul className="mt-2 text-xs space-y-1">
        <li>
          <span className="font-medium">Early Growth:</span> Initial growth
          after planting
        </li>
        <li>
          <span className="font-medium">Vegetative:</span> Leaf development
          stage
        </li>
        <li>
          <span className="font-medium">Flower Emergence:</span> Beginning of
          flowering
        </li>
        <li>
          <span className="font-medium">Bunch Formation:</span> Fruit bunches
          start forming
        </li>
        <li>
          <span className="font-medium">Fruit Development:</span> Growing fruits
        </li>
        <li>
          <span className="font-medium">Ready for Harvest:</span> Fruits ready
          to harvest
        </li>
      </ul>
    </TooltipContent>
  </Tooltip>
);

const PlantInfoCard = ({ hole }: { hole: any }) => (
  <Card className="bg-gray-50 border-gray-200">
    <CardContent className="pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Sprout className="h-5 w-5 text-emerald-600" />
        <h3 className="font-medium">Current Plant Information</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <StatsItem label="Plant ID" value={hole.mainPlantId || 'Unknown'} />
        <StatsItem 
          label="Suckers" 
          value={`${hole.currentSuckerCount ?? (hole.suckerIds?.length ?? 0)} / ${hole.targetSuckerCount ?? '?'}`} 
        />
        <StatsItem 
          label="Health" 
          value={hole.plantHealth || 'Healthy'} 
          valueClass={
            hole.plantHealth === "Healthy" ? "text-green-600" :
            hole.plantHealth === "Diseased" ? "text-yellow-600" :
            hole.plantHealth === "Pest-affected" ? "text-orange-600" :
            hole.plantHealth === "Damaged" ? "text-red-600" : ""
          }
        />
        <StatsItem label="Location" value={`Row ${hole.rowNumber}, Hole ${hole.holeNumber}`} />
        <StatsItem 
          label="Plant Age" 
          value={hole.plantedDate ? 
            `${Math.floor((new Date().getTime() - new Date(hole.plantedDate).getTime()) / (1000 * 60 * 60 * 24))} days` : 
            'Unknown'
          } 
        />
      </div>
    </CardContent>
  </Card>
);

const StatsItem = ({ label, value, valueClass = "" }: { label: string, value: string, valueClass?: string }) => (
  <div className="p-2 rounded-md bg-white border">
    <span className="text-gray-500 text-xs block">{label}:</span>
    <div className={`font-medium ${valueClass}`}>{value}</div>
  </div>
);

const BulkUpdateAlert = ({
  bulkSummary,
  selectedRow,
  selectedHoles,
}: {
  bulkSummary: any;
  selectedRow: string;
  selectedHoles: string[];
}) => (
  <Alert className="bg-blue-50 border-blue-200">
    <Sprout className="h-4 w-4 stroke-blue-500" />
    <AlertTitle className="text-blue-700">Bulk Update</AlertTitle>
    <AlertDescription>
      <p>
        Recording growth in{" "}
        <span className="font-semibold">{bulkSummary.plotName}</span>
      </p>
      {selectedHoles.length > 0 && selectedRow && (
        <div className="text-sm mt-1">
          Updating <span className="font-semibold">{selectedHoles.length}</span>{" "}
          plant{selectedHoles.length !== 1 ? "s" : ""} in row{" "}
          <span className="font-semibold">{selectedRow}</span>
        </div>
      )}
    </AlertDescription>
  </Alert>
);

const PlantSelector = ({
  plantedHoles,
  selectedHoles,
  setSelectedHoles,
  selectedRow,
}: {
  plantedHoles: any[];
  selectedHoles: string[];
  setSelectedHoles: (holes: string[]) => void;
  selectedRow: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium">Select Holes to Update</h4>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => setSelectedHoles([])}
          disabled={selectedHoles.length === 0}
        >
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() =>
            setSelectedHoles(
              plantedHoles.map((h: any) => h.holeNumber.toString())
            )
          }
          disabled={selectedHoles.length === plantedHoles.length}
        >
          Select All
        </Button>
      </div>
    </div>

    <div className="border border-dashed rounded-md p-3 bg-gray-50">
      <div className="text-xs text-muted-foreground mb-2">
        {selectedHoles.length} of {plantedHoles.length} holes selected in Row{" "}
        {selectedRow}
      </div>

      <div className="flex flex-wrap gap-2">
        {plantedHoles.map((hole: any) => {
          const isSelected = selectedHoles.includes(hole.holeNumber.toString());
          return (
            <Tooltip key={hole.holeNumber}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className={
                    isSelected
                      ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-gray-200"
                  }
                  onClick={() => {
                    if (isSelected) {
                      setSelectedHoles(
                        selectedHoles.filter(
                          (hn) => hn !== hole.holeNumber.toString()
                        )
                      );
                    } else {
                      setSelectedHoles([
                        ...selectedHoles,
                        hole.holeNumber.toString(),
                      ]);
                    }
                  }}
                >
                  Hole {hole.holeNumber}
                  {isSelected && <Check className="ml-1 h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div>Plant ID: {hole.mainPlantId || "Unknown"}</div>
                  <div>Health: {hole.plantHealth || "Healthy"}</div>
                  <div>Suckers: {hole.currentSuckerCount ?? 0}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {selectedHoles.length === 0 && (
        <div className="text-xs text-amber-600 mt-2 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Select at least one hole to proceed
        </div>
      )}
    </div>

    {selectedHoles.length > 0 && (
      <Alert className="mt-2 bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700 text-sm">
          Ready to record
        </AlertTitle>
        <AlertDescription className="text-xs">
          You'll update plants in holes:{" "}
          {selectedHoles.sort((a, b) => Number(a) - Number(b)).join(", ")}
        </AlertDescription>
      </Alert>
    )}
  </div>
);
