"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";

// export const AVAILABLE_MODELS = [
//     // --- High-Volume Stable Production (Gemini 2.5) ---
//     "gemini-2.5-flash",          // High reliability default production balance
//     "gemini-2.5-flash-lite",     // Fast, budget-friendly multimodal classification/tagging
//     "gemini-2.5-pro",            // Stable workhorse for multi-step tasks and document analysis

//     "gemini-3.5-flash",          // Recommended: Fast default for agentic loops & code execution
//     "gemini-3.1-pro-preview",    // Highest pure reasoning, deep analysis, and heavy agents
//     "gemini-3.1-flash-lite",     // Ultra-fast, highly cost-efficient version of Flash
//     "gemini-3-flash-preview",    // Still active if using Experimental Computer Use / tools

//     // --- Dynamic Stable Aliases (Google updates these automatically) ---
//     "gemini-flash-latest",       // Currently automatically aliases to gemini-3-flash-preview
//     "gemini-pro-latest"
// ] as const;

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message:
                "Variable name must start with letters or underscores and must contain only letters, numbers or underscores",
        }),
    credentialId: z.string().min(2, "Credential is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(2, "user prompt is required"),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (value: GeminiFormValues) => void;
    defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const { data: credentials, isLoading: isCredentialsLoading } =
        useCredentialsByType(CredentialType.GEMINI);

    const form = useForm<GeminiFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            credentialId: defaultValues.credentialId || "",
            variableName: defaultValues.variableName || "",
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                credentialId: defaultValues.credentialId || "",
                variableName: defaultValues.variableName || "",
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "variableName";

    const handleSubmit = (values: GeminiFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Gemini</DialogTitle>
                    <DialogDescription>Gemini Configuration</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                            <FormField
                                control={form.control}
                                name={"variableName"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variable Name</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="variableName" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Use this name to reference the result in other nodes:{" "}
                                            {`{{${watchVariableName}.aiResponse}}`}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="credentialId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gemini Credential</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            disabled={isCredentialsLoading || credentials?.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="select a type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentials?.map((cred) => (
                                                    <SelectItem key={cred.id} value={cred.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={"/logos/gemini.svg"}
                                                                alt={"Gemini"}
                                                                width={16}
                                                                height={16}
                                                            />
                                                            {cred.name}
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
                                control={form.control}
                                name="systemPrompt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>System Prompt (Optional)</FormLabel>
                                        <FormControl className="w-full">
                                            <Textarea
                                                {...field}
                                                placeholder="You are a helpful assistant"
                                                className="min-h-[80px] font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Sets the behaviour of the assistant. Use {"{{variables}}"}{" "}
                                            for simple values or {"{{json variables}}"} to stringify
                                            objects
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="userPrompt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Prompt</FormLabel>
                                        <FormControl className="w-full">
                                            <Textarea
                                                {...field}
                                                placeholder="Summarize this text: {{json httpResponse.data}}"
                                                className="min-h-[120px] font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The prompt to send to the AI. Use {"{{variables}}"} for
                                            simple values or {"{{json variables}}"} to stringify
                                            objects
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="p-6 pt-4 border-t bg-muted/30">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
