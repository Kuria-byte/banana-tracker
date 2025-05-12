// // File: /app/assistant/page.tsx
// import { Suspense } from "react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { AlertCircle, HelpCircle, InfoIcon, MessageSquare } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// // 
// // Import client components (note we're importing directly)
// import SimpleFarmAssistant from "@/components/ai/SimpleFarmAssistant";
// import SuggestedQueries from "@/components/ai/SuggestedQueries";

// export default function AssistantPage() {
//   return (
//     <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">Farm Assistant</h1>
//           <p className="text-muted-foreground text-lg">Get instant answers about your farm operations</p>
//         </div>
//       </div>
      
//       <Tabs defaultValue="chat" className="space-y-8">
//         <TabsList className="grid w-full max-w-md grid-cols-2">
//           <TabsTrigger value="chat" className="flex items-center gap-2 py-3">
//             <MessageSquare className="h-4 w-4" />
//             Chat
//           </TabsTrigger>
//           <TabsTrigger value="help" className="flex items-center gap-2 py-3">
//             <HelpCircle className="h-4 w-4" />
//             Help & Tips
//           </TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="chat" className="space-y-8">
//           <Suspense fallback={<AssistantSkeleton />}>
//             <AssistantContainer />
//           </Suspense>
//         </TabsContent>
        
//         <TabsContent value="help" className="space-y-8">
//           <HelpContent />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // Server component to get the user ID
// function AssistantContainer() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       <div className="md:col-span-2">
//         <SimpleFarmAssistant />
//       </div>
//       <div className="hidden md:block">
//         <SuggestedQueriesContainer />
//       </div>
//     </div>
//   );
// }

// function SuggestedQueriesContainer() {
//   return (
//     <div className="sticky top-8">
//       <SuggestedQueries onSelect={(query) => {
//         // This will be handled by client-side JavaScript
//         const event = new CustomEvent('suggestionSelected', { detail: { query } });
//         window.dispatchEvent(event);
//       }} />
//     </div>
//   );
// }

// // Loading skeleton
// function AssistantSkeleton() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       <div className="md:col-span-2">
//         <div className="w-full h-[600px] rounded-lg border shadow-sm bg-card p-8">
//           <div className="space-y-2 mb-6">
//             <Skeleton className="h-8 w-48" />
//           </div>
//           <div className="space-y-6 my-6">
//             <Skeleton className="h-16 w-3/4" />
//             <Skeleton className="h-16 w-3/4 ml-auto" />
//             <Skeleton className="h-16 w-3/4" />
//           </div>
//           <div className="mt-auto pt-6">
//             <Skeleton className="h-12 w-full" />
//           </div>
//         </div>
//       </div>
//       <div className="hidden md:block">
//         <Skeleton className="h-[400px] w-full rounded-lg" />
//       </div>
//     </div>
//   );
// }

// // Help content component 
// function HelpContent() {
//   const questionTypes = [
//     {
//       title: "Harvest Information",
//       description: "Ask about upcoming harvests, past yields, and harvest schedules",
//       examples: [
//         "When is my next harvest due?",
//         "When will plot 28 be ready for harvest?",
//         "Which plots are ready for harvesting?",
//       ]
//     },
//     {
//       title: "Task Management",
//       description: "Inquire about pending tasks, deadlines, and assignments",
//       examples: [
//         "What tasks are due in Kirinyaga?",
//         "Show my pending tasks for this week",
//         "Which high-priority tasks need attention?",
//       ]
//     },
//     {
//       title: "Plot and Farm Status",
//       description: "Get information about the condition and health of your plots",
//       examples: [
//         "What is the status of plot 28?",
//         "How healthy are the plants in Eastlands Farm?",
//         "Which plots need more attention?",
//       ]
//     },
//     {
//       title: "Forecasts and Projections",
//       description: "Get forecasts for harvests, revenue, and weather",
//       examples: [
//         "What is the forecast for the next 3 months?",
//         "What's our projected yield for the next quarter?",
//         "When should I schedule the next irrigation?",
//       ]
//     },
//   ];

//   return (
//     <div className="space-y-8">
//       <Alert variant="default" className="p-6">
//         <AlertCircle className="h-5 w-5" />
//         <AlertTitle className="text-lg">About the Farm Assistant</AlertTitle>
//         <AlertDescription className="mt-2 text-base">
//           The Farm Assistant uses AI to help you manage your banana farm by answering questions about your farm data. 
//           It processes your questions directly in your browser without sending data to external services.
//         </AlertDescription>
//       </Alert>
      
//       <Card className="shadow-sm">
//         <CardHeader className="pb-3">
//           <CardTitle className="text-xl">What You Can Ask</CardTitle>
//           <CardDescription className="text-base">
//             The assistant can answer a variety of questions about your farm operations
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {questionTypes.map((type) => (
//               <div key={type.title} className="space-y-4">
//                 <h3 className="font-semibold text-lg flex items-center gap-2">
//                   <InfoIcon className="h-5 w-5 text-primary" />
//                   {type.title}
//                 </h3>
//                 <p className="text-muted-foreground">{type.description}</p>
//                 <div className="space-y-2">
//                   {type.examples.map((example) => (
//                     <div key={example} className="text-sm bg-muted p-3 rounded-md">
//                       "{example}"
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
      
//       <Card className="shadow-sm">
//         <CardHeader className="pb-3">
//           <CardTitle className="text-xl">Technical Details</CardTitle>
//           <CardDescription className="text-base">
//             How the Farm Assistant works behind the scenes
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div>
//             <h3 className="font-semibold text-lg mb-3">Rule-Based Processing</h3>
//             <p className="text-muted-foreground">
//               The Farm Assistant uses a pattern matching system to understand your questions and extract relevant information
//               such as farm IDs, plot IDs, locations, and time periods. This approach ensures fast and reliable responses
//               without the complexity of large AI models.
//             </p>
//           </div>
          
//           <div>
//             <h3 className="font-semibold text-lg mb-3">Data Retrieval</h3>
//             <p className="text-muted-foreground">
//               Once your question is understood, the assistant retrieves the relevant data from your farm database,
//               including information about farms, plots, tasks, harvests, growth records, and health metrics.
//             </p>
//           </div>
          
//           <div>
//             <h3 className="font-semibold text-lg mb-3">Response Generation</h3>
//             <p className="text-muted-foreground">
//               The assistant formats the retrieved data into a natural language response that directly answers your question.
//               For complex questions, it can combine multiple data points to provide a comprehensive answer.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }